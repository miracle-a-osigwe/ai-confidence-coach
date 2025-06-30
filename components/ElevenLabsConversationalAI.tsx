"use dom";
import React, { useCallback, useState, useEffect } from "react";
import { useConversation } from "@11labs/react";
import { View, Pressable, StyleSheet, Text, Platform } from "react-native";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ElevenLabsConversationalAIProps {
  dom?: import("expo/dom").DOMProps;
  isActive: boolean;
  userContext?: {
    currentConfidence?: number;
    sessionProgress?: number;
    detectedEmotions?: any;
    focusAreas?: string[];
    lessonType?: string;
    exerciseTitle?: string;
    exerciseInstructions?: string;
    exercisePrompts?: string[];
    assessmentMode?: boolean;
  };
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
    } catch (error) {
        console.error("🎤 Microphone permission denied:", error);
        return false;
    }
}

export default function ElevenLabsConversationalAI({
  isActive,
  userContext,
  onMessage,
  onStatusChange,
}: ElevenLabsConversationalAIProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);

  useEffect(() => {
    // Check if we're in assessment mode based on context
    if (userContext?.assessmentMode) {
      setIsAssessmentMode(true);
    }
  }, [userContext]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("🎙️ ElevenLabs Conversational AI Connected");
      onStatusChange?.('connected');
      setError(null);
    },
    onDisconnect: () => {
      console.log("🔌 ElevenLabs Conversational AI Disconnected");
      onStatusChange?.('disconnected');
    },
    onMessage: (message) => {
      console.log("💬 ElevenLabs message received:", message);
      const formattedMessage: Message = {
        id: Date.now().toString(),
        role: message.source === 'ai' ? 'assistant' : 'user',
        content: message.message || '',
        timestamp: Date.now(),
      };
      onMessage?.(formattedMessage);
    },
    onError: (error) => {
      console.error("❌ ElevenLabs Conversational AI Error:", error);
      setError(typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : (typeof error === 'string' ? error : 'Connection failed'));
      onStatusChange?.('disconnected');
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      onStatusChange?.('connecting');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError("Microphone permission required for voice coaching");
        onStatusChange?.('disconnected');
        return;
      }

      console.log("🎙️ Starting ElevenLabs Conversational AI session...");
      
      // Get agent ID from environment
      const agentId = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        throw new Error("ElevenLabs Agent ID not configured");
      }

      // Build exercise context
      let exerciseContext = "";
      if (userContext?.exerciseTitle) {
        exerciseContext += `Current exercise: ${userContext.exerciseTitle}. `;
      }
      if (userContext?.exerciseInstructions) {
        exerciseContext += `Instructions: ${userContext.exerciseInstructions}. `;
      }
      if (userContext?.exercisePrompts && userContext.exercisePrompts.length > 0) {
        exerciseContext += `Key points: ${userContext.exercisePrompts.join(", ")}.`;
      }

      // Start the conversation with coaching context
      await conversation.startSession({
        agentId,
        dynamicVariables: {
          user_confidence_level: userContext?.currentConfidence?.toString() || "70",
          session_progress: userContext?.sessionProgress?.toString() || "0",
          focus_areas: userContext?.focusAreas?.join(", ") || "confidence, clarity",
          lesson_type: userContext?.lessonType || "general practice",
          coaching_mode: isAssessmentMode ? "assessment" : "real_time_feedback",
          exercise_context: exerciseContext,
          assessment_mode: isAssessmentMode ? "true" : "false",
        },
        clientTools: {
          // Tool for logging coaching insights
          logCoachingInsight: async ({ insight, confidence_score }) => {
            console.log("🧠 Coaching Insight:", insight, "Score:", confidence_score);
            return "success";
          },
          logMessage: async ({ message }) => {
            console.log(message);
          },
          // Tool for updating user confidence
          updateConfidence: async ({ new_confidence }) => {
            console.log("📈 Confidence updated to:", new_confidence);
            return `Confidence updated to ${new_confidence}%`;
          },
          
          // Tool for providing specific feedback
          provideFeedback: async ({ feedback_type, message }) => {
            console.log("💡 Feedback:", feedback_type, message);
            return "Feedback received";
          },
        },
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("💥 Failed to start ElevenLabs conversation:", error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      onStatusChange?.('disconnected');
    }
  }, [conversation, userContext, onStatusChange, isAssessmentMode]);

  const stopConversation = useCallback(async () => {
    try {
      console.log("🛑 Stopping ElevenLabs conversation...");
      await conversation.endSession();
      setIsInitialized(false);
    } catch (error) {
      console.error("❌ Failed to stop conversation:", error);
    }
  }, [conversation]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    // If mute/unmute functionality is needed, implement it here if supported by the API.
    // Currently, just toggling the local mute state.
  }, [conversation, isMuted]);

  const toggleAssessmentMode = useCallback(() => {
    setIsAssessmentMode(!isAssessmentMode);
    // If already connected, restart the conversation with new mode
    if (conversation.status === "connected") {
      stopConversation().then(() => {
        setTimeout(() => {
          startConversation();
        }, 500);
      });
    }
  }, [isAssessmentMode, conversation.status, stopConversation, startConversation]);

  // Auto-start conversation when component becomes active
  useEffect(() => {
    if (isActive && !isInitialized && conversation.status === "disconnected") {
      startConversation();
    } else if (!isActive && isInitialized) {
      stopConversation();
    }
  }, [isActive, isInitialized, conversation.status, startConversation, stopConversation]);

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  const getStatusColor = () => {
    switch (conversation.status) {
      case "connected": return colors.success;
      case "connecting": return colors.warning;
      default: return colors.error;
    }
  };

  const getStatusText = () => {
    switch (conversation.status) {
      case "connected": return isAssessmentMode ? "AI Assessment Mode" : "AI Coach Active";
      case "connecting": return "Connecting...";
      default: return error || "Disconnected";
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Indicator */}
      <View style={[styles.statusContainer, { backgroundColor: colors.gray[100] }]}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={[styles.statusText, { color: colors.text }]}>
          {getStatusText()}
        </Text>
        
        {conversation.status === "connected" && (
          <Pressable
            style={styles.modeToggle}
            onPress={toggleAssessmentMode}
          >
            <Text style={[styles.modeToggleText, { color: colors.primary }]}>
              {isAssessmentMode ? "Switch to Coaching" : "Switch to Assessment"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Control Button */}
      <Pressable
        style={[
          styles.callButton,
          { 
            backgroundColor: conversation.status === "connected" 
              ? (isAssessmentMode ? colors.accent + '20' : colors.error + '20') 
              : colors.primary + '20' 
          },
        ]}
        onPress={
          conversation.status === "disconnected"
            ? startConversation
            : stopConversation
        }
        disabled={conversation.status === "connecting"}
      >
        <View
          style={[
            styles.buttonInner,
            {
              backgroundColor: conversation.status === "connected" 
                ? (isAssessmentMode ? colors.accent : colors.error) 
                : colors.primary,
              opacity: conversation.status === "connecting" ? 0.7 : 1,
            },
          ]}
        >
          {conversation.status === "connected" ? (
            isAssessmentMode ? (
              <MessageSquare size={32} color="#fff" strokeWidth={1.5} style={styles.buttonIcon} />
            ) : (
              <MicOff size={32} color="#fff" strokeWidth={1.5} style={styles.buttonIcon} />
            )
          ) : (
            <Mic size={32} color="#fff" strokeWidth={1.5} style={styles.buttonIcon} />
          )}
        </View>
      </Pressable>

      {/* Audio Controls */}
      {conversation.status === "connected" && (
        <Pressable
          style={[
            styles.audioButton,
            { backgroundColor: isMuted ? colors.gray[300] : colors.primary }
          ]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <VolumeX size={20} color="#fff" />
          ) : (
            <Volume2 size={20} color="#fff" />
          )}
        </Pressable>
      )}

      {/* Instructions */}
      <Text style={[styles.instructionText, { color: colors.gray[600] }]}>
        {conversation.status === "connected" 
          ? isAssessmentMode
            ? "AI is evaluating your performance and will provide a detailed assessment"
            : "Speak naturally - your AI coach is listening and will provide real-time feedback"
          : conversation.status === "connecting"
          ? "Connecting to your AI coach..."
          : "Tap to start voice coaching with ElevenLabs AI"
        }
      </Text>

      {/* Error Display */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modeToggle: {
    marginLeft: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  callButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    transform: [{ translateY: 2 }],
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});