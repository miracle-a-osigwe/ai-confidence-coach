import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import elevenLabsService from '@/services/elevenlabs';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

interface ElevenLabsChatProps {
  isActive: boolean;
  userContext?: {
    currentConfidence?: number;
    sessionProgress?: number;
    detectedEmotions?: any;
  };
  onResponse?: (response: string) => void;
}

export default function ElevenLabsChat({ 
  isActive, 
  userContext, 
  onResponse 
}: ElevenLabsChatProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isActive && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hi! I'm your AI confidence coach. I'm here to help you practice and improve your speaking skills. How are you feeling about today's session?",
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isActive, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !elevenLabsService.isServiceReady()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await elevenLabsService.sendMessage(text.trim(), userContext);
      
      if (response.success && response.text) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
          audioUrl: response.audioUrl,
        };

        setMessages(prev => [...prev, assistantMessage]);
        onResponse?.(response.text);

        // Auto-play audio if available (web only)
        if (response.audioUrl && Platform.OS === 'web') {
          playAudio(response.audioUrl);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioUrl: string) => {
    if (Platform.OS === 'web') {
      try {
        setIsSpeaking(true);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => setIsSpeaking(false);
        
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
        setIsSpeaking(false);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
    // Voice input implementation would go here
    // For now, just toggle recording state
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      console.log('Starting voice recording...');
    } else {
      // Stop recording and process
      console.log('Stopping voice recording...');
      // Mock voice input
      sendMessage("I'm practicing my presentation and feeling a bit nervous.");
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isActive) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>AI Coach Chat</Text>
        {isSpeaking && (
          <TouchableOpacity onPress={stopAudio} style={styles.speakingButton}>
            <VolumeX size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                {
                  backgroundColor: message.role === 'user' 
                    ? colors.primary 
                    : colors.gray[100],
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  {
                    color: message.role === 'user' ? '#fff' : colors.text,
                  },
                ]}
              >
                {message.content}
              </Text>
              
              {message.audioUrl && Platform.OS === 'web' && (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => playAudio(message.audioUrl!)}
                >
                  <Volume2 size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={[styles.messageTime, { color: colors.gray[500] }]}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, { backgroundColor: colors.gray[100] }]}>
              <Text style={[styles.messageText, { color: colors.text }]}>
                Thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors.gray[100] }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask your AI coach anything..."
          placeholderTextColor={colors.gray[500]}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              {
                backgroundColor: isRecording ? colors.error : colors.gray[200],
              },
            ]}
            onPress={handleVoiceInput}
            disabled={isLoading}
          >
            {isRecording ? (
              <MicOff size={20} color="#fff" />
            ) : (
              <Mic size={20} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.gray[300],
              },
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  speakingButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  audioButton: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: '#fff',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});