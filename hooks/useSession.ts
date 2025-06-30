import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AudioRecorderPlayer, { AudioEncoderAndroidType, OutputFormatAndroidType } from 'react-native-audio-recorder-player';
// import RNFS from 'react-native-fs'; // For file reading if needed
import apiService from '@/services/api';
import webSocketService, { 
  EmotionData, 
  TranscriptionSegment, 
  CoachingCue, 
  SessionMetrics 
} from '@/services/websocket';
import storageService from '@/services/storage';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  emotions: EmotionData[];
  transcription: TranscriptionSegment[];
  coachingCues: CoachingCue[];
  metrics: SessionMetrics | null;
}

interface SessionConfig {
  type: 'practice' | 'presentation' | 'interview';
  goals: string[];
  duration?: number;
}

const audioRecorderPlayer = new AudioRecorderPlayer();
// audioRecorderPlayer.setSubscriptionDuration(1.0);
// .setSubscriptionDuration(0.1); // stream in near real-time (100ms)


export function useSession() {
  const { user, updateUserStats } = useAuth();
  const [state, setState] = useState<SessionState>({
    isActive: false,
    sessionId: null,
    isConnected: false,
    isLoading: false,
    error: null,
    duration: 0,
    emotions: [],
    transcription: [],
    coachingCues: [],
    metrics: null,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const sessionStartTime = useRef<number>(0);
  const sessionDataRef = useRef<{
    emotions: EmotionData[];
    transcription: TranscriptionSegment[];
    visionAnalysis: any[];
  }>({
    emotions: [],
    transcription: [],
    visionAnalysis: [],
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<SessionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Timer management
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    sessionStartTime.current = Date.now();
    timerRef.current = setInterval(() => {
      setState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // WebSocket event handlers
  const setupWebSocketListeners = useCallback(() => {
    webSocketService.on('emotion-update', (data: EmotionData) => {
      setState(prev => {
        const newEmotions = [...prev.emotions.slice(-50), data];
        sessionDataRef.current.emotions = newEmotions;
        return { ...prev, emotions: newEmotions };
      });
    });

    webSocketService.on('transcription-update', (data: TranscriptionSegment) => {
      setState(prev => {
        const existingIndex = prev.transcription.findIndex(t => t.id === data.id);
        let newTranscription;
        
        if (existingIndex > -1) {
          // Update existing segment
          newTranscription = [...prev.transcription];
          newTranscription[existingIndex] = data;
        } else {
          // Add new segment
          newTranscription = [...prev.transcription, data];
        }
        
        sessionDataRef.current.transcription = newTranscription;
        return { ...prev, transcription: newTranscription };
      });
    });

    webSocketService.on('coaching-cue', (data: CoachingCue) => {
      setState(prev => ({
        ...prev,
        coachingCues: [...prev.coachingCues.slice(-10), data],
      }));
    });

    webSocketService.on('session-metrics', (data: SessionMetrics) => {
      setState(prev => ({ ...prev, metrics: data }));
    });

    webSocketService.on('error', (error) => {
      console.error('WebSocket error:', error);
      updateState({ error: error.message });
    });

    webSocketService.on('session-ready', () => {
      updateState({ isConnected: true, error: null });
    });

    webSocketService.on('session-ended', async (summary) => {
      console.log('Session ended by server:', summary);
      await endSession();
    });
  }, [updateState]);

  // Audio streaming setup
  const setupAudioStreaming = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        });

        audioStreamRef.current = stream;

        const audioContext = new AudioContext({ sampleRate: 16000 });

        // ✅ Use AudioWorklet if supported
        if (audioContext.audioWorklet) {
          await audioContext.audioWorklet.addModule('/processors/audio-processor.js');

          const source = audioContext.createMediaStreamSource(stream);
          const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

          workletNode.port.onmessage = (event) => {
            const buffer = event.data;
            const audioBlob = new Blob([buffer], { type: 'application/octet-stream' });
            webSocketService.sendAudioData(audioBlob);
          };

          source.connect(workletNode);
          workletNode.connect(audioContext.destination);
        } else {
          // 👇 Fallback to deprecated method
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            const audioBlob = new Blob([inputData], { type: 'application/octet-stream' });
            webSocketService.sendAudioData(audioBlob);
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
        }

        return true;
      } catch (error) {
        console.error('Failed to setup audio streaming:', error);
        updateState({ error: 'Failed to access microphone' });
        return false;
      }
    } else if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // 👇 Native mobile (iOS/Android) handling via third-party package
      console.warn('Streaming audio on mobile requires a native module like react-native-audio-recorder-player');
      // try {
      //   await audioRecorderPlayer.startRecorder(undefined, {
      //     AVFormatIDKey: 'kAudioFormatLinearPCM',
      //     AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      //     AudioSourceAndroid: 6,
      //     OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
      //   });

      //   audioRecorderPlayer.addRecordBackListener(async (e) => {
      //     const base64Audio = e.isRecording ? await audioRecorderPlayer.getBase64EncodedData() : null;
      //     if (base64Audio) {
      //       const audioBuffer = Buffer.from(base64Audio, 'base64');
      //       const audioBlob = new Blob([audioBuffer], { type: 'application/octet-stream' });
      //       webSocketService.sendAudioData(audioBlob); // adjust this as needed
      //     }
      //   });

      //   console.log('Started audio recording...');
      // } catch (err) {
      //   console.error('Failed to start recorder:', err);
      // }
    }
  }, [updateState]);
  // Stop audio streaming
  const stopAudioStreaming = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  // Start session
  const startSession = useCallback(async (config: SessionConfig) => {
    try {
      console.log('Starting session with config:', config);
      updateState({ isLoading: true, error: null });
      console.log('User subscription:', user?.subscription);
      // Check if user can start session (subscription limits)
      if (user?.subscription.plan === 'free' && user.subscription.sessionsRemaining <= -1) {
        throw new Error('No sessions remaining. Please upgrade your plan.');
      }
      

      // Create session on backend
      const response = await apiService.createSession(config);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create session');
      }
      console.log('Session created successfully:', response.data);

      const { sessionId, websocketUrl } = response.data;
      console.log('WebSocket URL:', websocketUrl);

      // Connect to WebSocket
      const connected = await webSocketService.connect(sessionId);
      if (!connected) {
        throw new Error('Failed to connect to real-time service');
      }

      // Setup WebSocket listeners
      setupWebSocketListeners();

      // Setup audio streaming
      const audioReady = await setupAudioStreaming();
      if (!audioReady) {
        throw new Error('Failed to setup audio streaming');
      }

      // Reset session data
      sessionDataRef.current = {
        emotions: [],
        transcription: [],
        visionAnalysis: [],
      };

      // Update state and start timer
      updateState({
        isActive: true,
        sessionId,
        isConnected: true,
        isLoading: false,
        duration: 0,
        emotions: [],
        transcription: [],
        coachingCues: [],
        metrics: null,
      });

      startTimer();

      return { success: true, sessionId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start session';
      updateState({ 
        isLoading: false, 
        error: errorMessage,
        isActive: false,
        sessionId: null,
      });
      return { success: false, error: errorMessage };
    }
  }, [updateState, setupWebSocketListeners, setupAudioStreaming, startTimer, user]);

  // End session
  const endSession = useCallback(async () => {
    try {
      updateState({ isLoading: true });

      // Stop timer and audio
      stopTimer();
      stopAudioStreaming();

      const finalDuration = state.duration;
      const sessionData = {
        duration: finalDuration,
        transcription: sessionDataRef.current.transcription,
        emotions: sessionDataRef.current.emotions,
        metrics: state.metrics || {},
        visionAnalysis: sessionDataRef.current.visionAnalysis,
        averageConfidence: calculateAverageConfidence(sessionDataRef.current.emotions),
        peakConfidence: calculatePeakConfidence(sessionDataRef.current.emotions),
        focusAreas: user?.preferences?.focusAreas || [],
      };

      // Save offline first in case network fails
      if (state.sessionId) {
        await storageService.saveOfflineSession({
          sessionId: state.sessionId,
          ...sessionData,
        });

        // Try to send to backend
        try {
          const response = await apiService.endSession(state.sessionId, sessionData);
          if (response.success) {
            // Update user stats
            const improvementFromPrevious = calculateImprovement(sessionData.averageConfidence);
            await updateUserStats({
              duration: finalDuration,
              averageConfidence: sessionData.averageConfidence,
              peakConfidence: sessionData.peakConfidence,
              improvementFromPrevious,
            });
          }
        } catch (error) {
          console.warn('Failed to sync session to backend, saved offline');
        }
      }

      // Disconnect WebSocket
      webSocketService.endSession();
      webSocketService.disconnect();

      // Reset state
      updateState({
        isActive: false,
        sessionId: null,
        isConnected: false,
        isLoading: false,
        duration: 0,
        emotions: [],
        transcription: [],
        coachingCues: [],
        metrics: null,
      });

      return { success: true, sessionData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end session';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.sessionId, state.duration, state.metrics, updateState, stopTimer, stopAudioStreaming, user, updateUserStats]);

  // Helper functions
  const calculateAverageConfidence = (emotions: EmotionData[]): number => {
    if (emotions.length === 0) return 0;
    const sum = emotions.reduce((acc, emotion) => acc + emotion.confidence, 0);
    return Math.round(sum / emotions.length);
  };

  const calculatePeakConfidence = (emotions: EmotionData[]): number => {
    if (emotions.length === 0) return 0;
    return Math.round(Math.max(...emotions.map(e => e.confidence)));
  };

  const calculateImprovement = (currentScore: number): number => {
    const previousScore = user?.stats?.averageConfidence || 0;
    return Math.round(currentScore - previousScore);
  };

  // Add vision analysis data
  const addVisionAnalysis = useCallback((visionData: any) => {
    sessionDataRef.current.visionAnalysis.push(visionData);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopAudioStreaming();
      webSocketService.disconnect();
    };
  }, [stopTimer, stopAudioStreaming]);

  // Get current emotion data (latest or average)
  const getCurrentEmotions = useCallback(() => {
    if (state.emotions.length === 0) {
      return {
        confidence: 0,
        nervousness: 0,
        joy: 0,
        anxiety: 0,
        clarity: 0,
        engagement: 0,
      };
    }

    // Return latest emotion data
    return state.emotions[state.emotions.length - 1];
  }, [state.emotions]);

  // Get latest coaching cue
  const getLatestCoachingCue = useCallback(() => {
    return state.coachingCues.length > 0 
      ? state.coachingCues[state.coachingCues.length - 1].message 
      : '';
  }, [state.coachingCues]);

  return {
    // State
    ...state,
    
    // Actions
    startSession,
    endSession,
    addVisionAnalysis,
    
    // Computed values
    currentEmotions: getCurrentEmotions(),
    latestCoachingCue: getLatestCoachingCue(),
    
    // Utilities
    formatDuration: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
  };
}