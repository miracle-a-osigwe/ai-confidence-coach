import { Platform } from 'react-native';

interface ConversationalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

interface ConversationalContext {
  lessonType: string;
  userGoals: string[];
  focusAreas: string[];
  currentConfidence?: number;
  sessionProgress?: number;
  detectedEmotions?: any;
  exerciseTitle?: string;
  exerciseInstructions?: string;
  exercisePrompts?: string[];
}

class ElevenLabsConversationalService {
  private isInitialized = false;
  private agentId: string | null = null;
  private conversationHistory: ConversationalMessage[] = [];
  private currentContext: ConversationalContext | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Check if we have the required environment variables
      this.agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID || null;
      
      if (!this.agentId) {
        console.warn('⚠️ ElevenLabs Agent ID not configured');
        return false;
      }

      console.log('✅ ElevenLabs Conversational AI service initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('💥 Failed to initialize ElevenLabs Conversational AI:', error);
      return false;
    }
  }

  setContext(context: ConversationalContext): void {
    this.currentContext = context;
    console.log('🎯 ElevenLabs context updated:', context);
  }

  addMessage(message: ConversationalMessage): void {
    this.conversationHistory.push(message);
    
    // Keep only last 20 messages for performance
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  getConversationHistory(): ConversationalMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  isServiceReady(): boolean {
    return this.isInitialized && this.agentId !== null;
  }

  getAgentId(): string | null {
    return this.agentId;
  }

  getCurrentContext(): ConversationalContext | null {
    return this.currentContext;
  }

  // Generate dynamic variables for ElevenLabs agent
  getDynamicVariables(): Record<string, string> {
    if (!this.currentContext) {
      return {
        coaching_mode: "general_practice",
        user_confidence_level: "70",
        focus_areas: "confidence, clarity",
        lesson_type: "general practice",
        session_progress: "0",
      };
    }

    const { 
      lessonType, 
      focusAreas, 
      currentConfidence, 
      sessionProgress,
      exerciseTitle,
      exerciseInstructions,
      exercisePrompts
    } = this.currentContext;
    
    // Build exercise context
    let exerciseContext = "";
    if (exerciseTitle) {
      exerciseContext += `Current exercise: ${exerciseTitle}. `;
    }
    if (exerciseInstructions) {
      exerciseContext += `Instructions: ${exerciseInstructions}. `;
    }
    if (exercisePrompts && exercisePrompts.length > 0) {
      exerciseContext += `Key points: ${exercisePrompts.join(", ")}.`;
    }

    return {
      coaching_mode: "real_time_feedback",
      user_confidence_level: (currentConfidence || 70).toString(),
      focus_areas: focusAreas.join(", "),
      lesson_type: lessonType,
      session_progress: (sessionProgress || 0).toString(),
      exercise_context: exerciseContext,
      assessment_mode: "true",
    };
  }

  // Generate coaching prompts based on context
  generateCoachingPrompt(): string {
    if (!this.currentContext) {
      return "I'm here to help you practice your speaking skills. How are you feeling today?";
    }

    const { 
      focusAreas, 
      currentConfidence, 
      sessionProgress, 
      lessonType,
      exerciseTitle
    } = this.currentContext;
    
    let prompt = `I'm your AI coach for the "${lessonType}" lesson. `;
    
    if (exerciseTitle) {
      prompt += `We're working on the "${exerciseTitle}" exercise. `;
    }
    
    if (currentConfidence !== undefined) {
      if (currentConfidence < 60) {
        prompt += "I can see you might be feeling a bit nervous - that's completely normal! ";
      } else if (currentConfidence > 80) {
        prompt += "You're showing great confidence! ";
      }
    }

    if (focusAreas.length > 0) {
      prompt += `We're focusing on ${focusAreas.join(' and ')}. `;
    }

    if (sessionProgress !== undefined && sessionProgress > 0) {
      prompt += `You're ${Math.round(sessionProgress)}% through your session. `;
    }

    prompt += "How can I help you improve your speaking today?";
    
    return prompt;
  }

  // Analyze user performance and generate feedback
  generatePerformanceFeedback(metrics: {
    confidence: number;
    clarity: number;
    engagement: number;
    bodyLanguage?: number;
  }): string {
    if (!this.currentContext) {
      return "You're doing well! Keep practicing and stay focused.";
    }

    const { confidence, clarity, engagement, bodyLanguage } = metrics;
    const { focusAreas, exerciseTitle, exercisePrompts } = this.currentContext;
    const feedback: string[] = [];

    // Add exercise-specific context
    if (exerciseTitle) {
      feedback.push(`I've been observing your performance on the "${exerciseTitle}" exercise.`);
    }

    // Confidence feedback (prioritize if it's a focus area)
    if (focusAreas.includes('confidence')) {
      if (confidence > 80) {
        feedback.push("Your confidence is excellent! You're speaking with conviction and authority.");
      } else if (confidence > 65) {
        feedback.push("Your confidence is good. Continue to project assurance in your delivery.");
      } else {
        feedback.push("Try to boost your confidence by standing taller and speaking with more conviction.");
      }
    } else if (confidence < 60) {
      feedback.push("I notice you could use a bit more confidence in your delivery.");
    }

    // Clarity feedback (prioritize if it's a focus area)
    if (focusAreas.includes('clarity')) {
      if (clarity > 80) {
        feedback.push("Your speech clarity is excellent! Very articulate and well-paced.");
      } else if (clarity > 65) {
        feedback.push("Your clarity is good. Continue focusing on clear articulation.");
      } else {
        feedback.push("Try to speak more clearly and at a steady pace for better understanding.");
      }
    } else if (clarity < 60) {
      feedback.push("I recommend focusing a bit more on your speech clarity.");
    }

    // Engagement feedback (prioritize if it's a focus area)
    if (focusAreas.includes('engagement')) {
      if (engagement > 80) {
        feedback.push("Your audience engagement is excellent! Great eye contact and energy.");
      } else if (engagement > 65) {
        feedback.push("You're engaging well with your audience. Keep maintaining that connection.");
      } else {
        feedback.push("Try to engage more with your audience through eye contact and energy.");
      }
    } else if (engagement < 60) {
      feedback.push("Consider working on your audience engagement for more impact.");
    }

    // Body language feedback (prioritize if it's a focus area)
    if (focusAreas.includes('body-language') && bodyLanguage !== undefined) {
      if (bodyLanguage > 80) {
        feedback.push("Your body language is excellent! Natural and supportive of your message.");
      } else if (bodyLanguage > 65) {
        feedback.push("Your body language is good. Continue using purposeful gestures.");
      } else {
        feedback.push("Work on your body language to better support your message.");
      }
    } else if (bodyLanguage !== undefined && bodyLanguage < 60) {
      feedback.push("Your body language could be more supportive of your message.");
    }

    // Add exercise-specific feedback if prompts are available
    if (exercisePrompts && exercisePrompts.length > 0) {
      const randomPrompt = exercisePrompts[Math.floor(Math.random() * exercisePrompts.length)];
      feedback.push(`Remember to focus on "${randomPrompt}" as mentioned in the exercise.`);
    }

    // Add encouragement
    feedback.push("Keep practicing and you'll continue to improve!");

    return feedback.join(' ');
  }

  // Generate assessment based on overall performance
  generateAssessment(metrics: {
    confidence: number;
    clarity: number;
    engagement: number;
    overall: number;
  }): string {
    if (!this.currentContext) {
      return "Based on your practice session, you're making good progress.";
    }

    const { confidence, clarity, engagement, overall } = metrics;
    const { lessonType, focusAreas } = this.currentContext;
    
    let assessment = `Here's my assessment of your performance in the "${lessonType}" lesson:\n\n`;
    
    // Overall score
    assessment += `Overall Score: ${overall}% - `;
    if (overall >= 85) {
      assessment += "Excellent performance! You've mastered many key speaking skills.\n\n";
    } else if (overall >= 70) {
      assessment += "Very good performance! You're showing strong speaking abilities.\n\n";
    } else if (overall >= 55) {
      assessment += "Good performance with clear areas for improvement.\n\n";
    } else {
      assessment += "You're making progress, but there's significant room for improvement.\n\n";
    }
    
    // Detailed breakdown
    assessment += "Detailed Breakdown:\n";
    assessment += `- Confidence: ${confidence}%\n`;
    assessment += `- Clarity: ${clarity}%\n`;
    assessment += `- Engagement: ${engagement}%\n\n`;
    
    // Strengths
    assessment += "Strengths: ";
    const strengths = [];
    if (confidence >= 75) strengths.push("confident delivery");
    if (clarity >= 75) strengths.push("clear articulation");
    if (engagement >= 75) strengths.push("audience engagement");
    
    if (strengths.length > 0) {
      assessment += strengths.join(", ") + ".\n\n";
    } else {
      assessment += "Still developing core speaking skills.\n\n";
    }
    
    // Areas for improvement
    assessment += "Areas for Improvement: ";
    const improvements = [];
    if (confidence < 70) improvements.push("building more confidence");
    if (clarity < 70) improvements.push("improving speech clarity");
    if (engagement < 70) improvements.push("enhancing audience engagement");
    
    if (improvements.length > 0) {
      assessment += improvements.join(", ") + ".\n\n";
    } else {
      assessment += "Continue refining your already strong skills.\n\n";
    }
    
    // Focus area specific feedback
    if (focusAreas.length > 0) {
      assessment += `Based on your focus areas (${focusAreas.join(", ")}), I recommend: `;
      
      const recommendations = focusAreas.map(area => {
        switch(area) {
          case 'confidence':
            return confidence < 75 
              ? "Practice power poses before speaking and use positive self-talk" 
              : "Continue building on your confident delivery";
          case 'clarity':
            return clarity < 75 
              ? "Practice vocal exercises and focus on pacing" 
              : "Continue refining your articulation";
          case 'body-language':
            return "Be mindful of your posture and use purposeful gestures";
          case 'engagement':
            return engagement < 75 
              ? "Practice maintaining eye contact and varying your vocal tone" 
              : "Continue developing your engaging presentation style";
          default:
            return "";
        }
      }).filter(r => r !== "");
      
      assessment += recommendations.join("; ") + ".\n\n";
    }
    
    // Final encouragement
    assessment += "Keep practicing consistently, and you'll continue to improve your speaking skills!";
    
    return assessment;
  }
}

export const elevenLabsConversationalService = new ElevenLabsConversationalService();
export default elevenLabsConversationalService;