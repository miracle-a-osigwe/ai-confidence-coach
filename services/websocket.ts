// services/websocket.ts

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmotionData {
  confidence: number;
  nervousness: number;
  joy: number;
  anxiety: number;
  clarity: number;
  engagement: number;
  timestamp: number;
}

export interface TranscriptionSegment {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
  confidence: number;
}

export interface CoachingCue {
  id: string;
  message: string;
  type: 'encouragement' | 'correction' | 'tip';
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface SessionMetrics {
  averageConfidence: number;
  speechRate: number;
  fillerWords: number;
  eyeContact: number;
  gestureVariety: number;
  volumeConsistency: number;
}

// The event interface remains the same, defining our contract
interface WebSocketEvents {
    // Outgoing events (Client -> Server)
    'authenticate': (payload: { token: string | null }) => void;
    'audio-data': (audioBlob: Blob) => void;
    'video-frame': (frameData: string) => void;
    'session-end': (payload: {}) => void;

    // Incoming events (Server -> Client)
    'emotion-update': (data: EmotionData) => void;
    'transcription-update': (data: TranscriptionSegment) => void;
    'coaching-cue': (data: CoachingCue) => void;
    'session-metrics': (data: SessionMetrics) => void;
    'error': (error: { message: string; code?: string }) => void;
    'session-ready': () => void;
    'session-ended': (summary: any) => void;
}

// --- Helper to get the correct WebSocket URL ---
const getWebSocketBaseURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'wss://api.confidenceupgrade.com/ws';
    }
    // For local dev, use the correct IP for the host machine
    return Platform.OS === 'android' ? 'ws://10.0.2.2:8086/ws' : 'wss://api.confidenceupgrade.com/ws'; //'ws://localhost:8086/ws';
};


class WebSocketService {
  private socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // The internal event bus. This part doesn't need to change!
  private listeners: Map<keyof WebSocketEvents, Function[]> = new Map();

  // --- Connection Management ---

  async connect(sessionId: string): Promise<boolean> {
    // If already connected, disconnect first
    if (this.socket) {
      this.disconnect();
    }
    const authToken = await AsyncStorage.getItem('auth_token');

    const baseURL = getWebSocketBaseURL();
    const url = `${baseURL}/${sessionId}`; // Connect directly to the FastAPI endpoint
    
    console.log(`Connecting to standard WebSocket at ${url}`);
    
    this.sessionId = sessionId;
    this.socket = new WebSocket(url);
    
    this.setupNativeEventHandlers();

    // The first message sent after connection MUST be authentication
    this.on('session-ready', () => {
        this.emit('authenticate', { token: authToken });
    });

    // Return a promise that resolves on connection or rejects on error/timeout
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.error("WebSocket connection timed out.");
            this.disconnect();
            resolve(false);
        }, 10000); // 10-second timeout

        this.on('session-ready', () => {
            clearTimeout(timeout);
            resolve(true);
        });

        this.on('error', (err) => {
            console.error("Received connection error", err);
            clearTimeout(timeout);
            this.disconnect();
            resolve(false);
        });
    });
  }

  private setupNativeEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connection opened. Ready to authenticate.');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      // We emit a 'session-ready' event internally to trigger authentication
      this.notifyListeners('session-ready');
    };

    this.socket.onmessage = (event) => {
      // All incoming messages are handled here
      try {
        const message = JSON.parse(event.data);
        if (message.event && this.listeners.has(message.event)) {
          // Notify all listeners for the specific event
          this.notifyListeners(message.event, message.payload);
        } else {
          console.warn('Received message with unknown event:', message.event);
        }
      } catch (e) {
        console.error('Failed to parse incoming WebSocket message:', event.data, e);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', { message: error instanceof ErrorEvent && error.message ? error.message : 'WebSocket error occurred.' });
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket disconnected: Code=${event.code}, Reason=${event.reason}`);
      this.isConnected = false;
      this.notifyListeners('session-ended', { reason: event.reason });
      // Here you can implement reconnection logic if desired
      // if (event.code !== 1000) { // 1000 is a normal closure
      //   this.attemptReconnect();
      // }
    };
  }
  
  disconnect() {
    if (this.socket) {
      // Use code 1000 for a normal, intentional closure
      this.socket.close(1000, "User disconnected");
      this.socket = null;
    }
    this.isConnected = false;
    this.sessionId = null;
    this.listeners.clear(); // Clear listeners on disconnect
    console.log("WebSocket disconnected and cleaned up.");
  }

  // --- Event System (Public API) ---

  emit<K extends keyof WebSocketEvents>(event: K, ...args: Parameters<WebSocketEvents[K]>) {
    if (!this.socket || !this.isConnected) {
      console.warn(`Cannot emit '${event}': WebSocket not connected.`);
      return;
    }

    // Handle binary data separately from JSON data
    if (event === 'audio-data' && args[0] instanceof Blob) {
        this.socket.send(args[0]);
        return;
    }

    // For all other events, use our JSON protocol
    const message = {
      event: event,
      payload: args[0] || {} // Assume first argument is the payload
    };
    
    this.socket.send(JSON.stringify(message));
  }

  // The on/off/notifyListeners methods remain IDENTICAL to your old code
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  private notifyListeners<K extends keyof WebSocketEvents>(
    event: K,
    ...args: Parameters<WebSocketEvents[K]>
  ) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in '${event}' listener:`, error);
        }
      });
    }
  }

  // Utility method
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  // Audio streaming
  sendAudioData(audioBlob: Blob) {
    if (this.isSocketConnected()) {
      this.emit('audio-data', audioBlob);
    }
  }

  // Video streaming
  sendVideoFrame(frameData: string) {
    if (this.isSocketConnected()) {
      this.emit('video-frame', frameData);
    }
  }

  // Session control
  endSession() {
    if (this.isSocketConnected()) {
      this.emit('session-end', {});
    }
  }
}

// Export a single instance for use across the app
export const webSocketService = new WebSocketService();
export default webSocketService;