interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  text?: string;
  error?: string;
}

class ElevenLabsService {
  private config: ElevenLabsConfig | null = null;
  private isInitialized = false;
  private conversationHistory: ConversationMessage[] = [];

  async initialize(apiKey: string): Promise<boolean> {
    try {
      this.config = {
        apiKey,
        voiceId: process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID || 'default-voice',
        modelId: process.env.EXPO_PUBLIC_ELEVENLABS_MODEL_ID || 'eleven_turbo_v2',
      };

      // Test the API connection
      const testResponse = await this.testConnection();
      if (testResponse.success) {
        this.isInitialized = true;
        console.log('✅ ElevenLabs service initialized successfully');
        return true;
      } else {
        console.error('❌ ElevenLabs initialization failed:', testResponse.error);
        return false;
      }
    } catch (error) {
      console.error('💥 ElevenLabs initialization error:', error);
      return false;
    }
  }

  private async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.config) {
      return { success: false, error: 'Configuration not set' };
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: `API test failed: ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async startConversation(context: {
    lessonType: string;
    userGoals: string[];
    focusAreas: string[];
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized || !this.config) {
      return { success: false, error: 'Service not initialized' };
    }

    // Initialize conversation with context
    const systemMessage: ConversationMessage = {
      role: 'assistant',
      content: `Hello! I'm your AI confidence coach. I understand you're working on ${context.lessonType} and focusing on ${context.focusAreas.join(', ')}. Let's begin this practice session. How are you feeling about today's lesson?`,
      timestamp: Date.now(),
    };

    this.conversationHistory = [systemMessage];
    return { success: true };
  }

  async sendMessage(userMessage: string, context?: {
    currentConfidence?: number;
    sessionProgress?: number;
    detectedEmotions?: any;
  }): Promise<ElevenLabsResponse> {
    if (!this.isInitialized || !this.config) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // Prepare conversation context for ElevenLabs
      const conversationContext = this.buildConversationContext(context);
      
      // Call ElevenLabs Conversational AI
      const response = await this.callElevenLabsAPI(userMessage, conversationContext);
      
      if (response.success && response.text) {
        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
        });
      }

      return response;
    } catch (error) {
      console.error('💥 ElevenLabs message error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  private buildConversationContext(context?: any): string {
    let contextString = "You are a supportive AI confidence coach helping with public speaking practice. ";
    
    if (context?.currentConfidence) {
      contextString += `The user's current confidence level is ${context.currentConfidence}%. `;
    }
    
    if (context?.sessionProgress) {
      contextString += `They are ${context.sessionProgress}% through their session. `;
    }
    
    if (context?.detectedEmotions) {
      const emotions = Object.entries(context.detectedEmotions)
        .filter(([_, value]) => (value as number) > 50)
        .map(([emotion, _]) => emotion);
      
      if (emotions.length > 0) {
        contextString += `I can see they're showing signs of ${emotions.join(', ')}. `;
      }
    }
    
    contextString += "Provide encouraging, specific feedback and coaching tips. Keep responses conversational and supportive.";
    
    return contextString;
  }

  private async callElevenLabsAPI(message: string, context: string): Promise<ElevenLabsResponse> {
    if (!this.config) {
      return { success: false, error: 'Configuration not available' };
    }

    try {
      // ElevenLabs Conversational AI endpoint
      const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          model_id: this.config.modelId,
          voice_id: this.config.voiceId,
          message: message,
          context: context,
          conversation_history: this.conversationHistory.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        text: data.text || data.message,
        audioUrl: data.audio_url,
      };
    } catch (error) {
      console.error('💥 ElevenLabs API call failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API call failed',
      };
    }
  }

  async generateSpeech(text: string): Promise<ElevenLabsResponse> {
    if (!this.isInitialized || !this.config) {
      return { success: false, error: 'Service not initialized' };
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: this.config.modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech generation failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        success: true,
        audioUrl,
        text,
      };
    } catch (error) {
      console.error('💥 Speech generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Speech generation failed',
      };
    }
  }

  getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  clearConversation(): void {
    this.conversationHistory = [];
  }

  isServiceReady(): boolean {
    return this.isInitialized && this.config !== null;
  }
}

export const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;