import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { ArrowLeft, Play, Pause, CircleCheck as CheckCircle, Clock, Target, Mic, MicOff, Camera, CameraOff, MessageSquare } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import lessonsService, { Lesson, Exercise, LessonProgress } from '@/services/lessons';
import elevenLabsService from '@/services/elevenlabs';
import elevenLabsConversationalService from '@/services/elevenLabsConversational';
import mediaPipeService from '@/services/mediapipe';
import visionAnalysisService from '@/services/visionAnalysis';
import CameraView from '@/components/CameraView';
import ElevenLabsConversationalAI from '@/components/ElevenLabsConversationalAI';
import AnimatedButton from '@/components/AnimatedButton';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user, hasProFeatures } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationalAIStatus, setConversationalAIStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
  const [sessionScores, setSessionScores] = useState({
    confidence: 0,
    clarity: 0,
    engagement: 0,
    overall: 0,
  });

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleExerciseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  const loadLesson = () => {
    console.log('📚 Loading lesson:', id);
    const lessonData = lessonsService.getLessonById(id!);
    if (!lessonData) {
      console.error('❌ Lesson not found:', id);
      Alert.alert('Error', 'Lesson not found');
      router.back();
      return;
    }

    console.log('✅ Lesson loaded:', lessonData.title);
    setLesson(lessonData);
    setCurrentExercise(lessonData.exercises[0]);
    setTimeRemaining(lessonData.exercises[0].duration);

    // Load existing progress
    if (user?.id) {
      console.log('📊 Loading progress for user:', user.id);
      const existingProgress = lessonsService.getLessonProgress(id!, user.id);
      setProgress(existingProgress);
    } else {
      console.warn('⚠️ No user ID available for progress tracking');
    }
  };

  const initializeAI = async () => {
    if (!lesson || !user) {
      console.error('❌ Cannot initialize AI: missing lesson or user');
      return;
    }

    console.log('🤖 Initializing AI services...');

    const context = {
      lessonType: lesson.title,
      userGoals: user.preferences?.goals || [],
      focusAreas: user.preferences?.focusAreas || [],
      currentConfidence: sessionScores.confidence || 70,
      sessionProgress: ((exerciseIndex + 1) / lesson.exercises.length) * 100,
      exerciseTitle: currentExercise?.title,
      exerciseInstructions: currentExercise?.instructions,
      exercisePrompts: currentExercise?.prompts,
    };

    if (hasProFeatures && Platform.OS === 'web') {
      // Use ElevenLabs Conversational AI for premium users on web
      console.log('🎙️ Initializing ElevenLabs Conversational AI for premium user...');
      const initialized = await elevenLabsConversationalService.initialize();
      if (initialized) {
        elevenLabsConversationalService.setContext(context);
        setAiResponse("🎙️ ElevenLabs AI Coach is ready! Start speaking and I'll provide real-time feedback based on this lesson's objectives.");
      } else {
        console.warn('⚠️ ElevenLabs Conversational AI initialization failed, falling back to REST API');
        await initializeElevenLabsREST(context);
      }
    } else if (hasProFeatures) {
      // Use ElevenLabs REST API for premium users on mobile
      await initializeElevenLabsREST(context);
    } else {
      // Use MediaPipe for free users
      await initializeMediaPipe(context);
    }

    // Initialize vision analysis
    await visionAnalysisService.initialize();
  };

  const initializeElevenLabsREST = async (context: any) => {
    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    if (apiKey) {
      console.log('🎙️ Initializing ElevenLabs REST API...');
      const initialized = await elevenLabsService.initialize(apiKey);
      if (initialized) {
        await elevenLabsService.startConversation(context);
        setAiResponse(`Hello! I'm your AI coach for the "${lesson?.title}" lesson. We'll be working on "${currentExercise?.title}". I'll provide personalized feedback throughout this exercise. Let's begin!`);
      } else {
        console.warn('⚠️ ElevenLabs REST API initialization failed, falling back to MediaPipe');
        await initializeMediaPipe(context);
      }
    } else {
      console.warn('⚠️ ElevenLabs API key not found, falling back to MediaPipe');
      await initializeMediaPipe(context);
    }
  };

  const initializeMediaPipe = async (context: any) => {
    console.log('🤖 Initializing MediaPipe for free user...');
    const initialized = await mediaPipeService.initialize();
    if (initialized) {
      const result = await mediaPipeService.startCoachingSession(context);
      if (result.success) {
        setAiResponse(`Welcome to the "${lesson?.title}" lesson. We'll be working on "${currentExercise?.title}". ${result.message}`);
      }
    }
  };

  const handleStartExercise = async () => {
    console.log('🚀 Starting exercise...');
    
    if (!lesson || !user?.id) {
      console.error('❌ Cannot start exercise: missing lesson or user ID');
      Alert.alert('Error', 'Unable to start lesson. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Start lesson progress if not already started
      if (!progress) {
        console.log('📝 Creating new lesson progress...');
        const newProgress = lessonsService.startLesson(lesson.id, user.id);
        setProgress(newProgress);
      }

      // Initialize AI services
      await initializeAI();

      setIsActive(true);
      setIsPaused(false);
      console.log('✅ Exercise started successfully');
    } catch (error) {
      console.error('💥 Failed to start exercise:', error);
      Alert.alert('Error', 'Failed to start exercise. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseResume = () => {
    console.log('⏯️ Toggling pause state');
    setIsPaused(!isPaused);
  };

  const handleExerciseComplete = async () => {
    console.log('✅ Exercise completed');
    setIsActive(false);
    
    // Calculate scores for this exercise
    const exerciseScores = {
      confidence: 70 + Math.random() * 25,
      clarity: 65 + Math.random() * 30,
      engagement: 60 + Math.random() * 35,
      overall: 0,
    };
    exerciseScores.overall = (exerciseScores.confidence + exerciseScores.clarity + exerciseScores.engagement) / 3;

    // Update session scores (running average)
    setSessionScores(prev => ({
      confidence: Math.round((prev.confidence + exerciseScores.confidence) / 2),
      clarity: Math.round((prev.clarity + exerciseScores.clarity) / 2),
      engagement: Math.round((prev.engagement + exerciseScores.engagement) / 2),
      overall: Math.round((prev.overall + exerciseScores.overall) / 2),
    }));

    // Set assessment mode for final feedback
    setIsAssessmentMode(true);

    // Provide AI feedback
    await provideExerciseFeedback(exerciseScores);

    // Move to next exercise or complete lesson
    if (exerciseIndex < lesson!.exercises.length - 1) {
      setTimeout(() => {
        const nextIndex = exerciseIndex + 1;
        setExerciseIndex(nextIndex);
        setCurrentExercise(lesson!.exercises[nextIndex]);
        setTimeRemaining(lesson!.exercises[nextIndex].duration);
        setIsAssessmentMode(false); // Reset assessment mode for next exercise
      }, 5000); // Show feedback for 5 seconds
    } else {
      // Complete the lesson
      setTimeout(() => {
        handleLessonComplete();
      }, 5000);
    }
  };

  const provideExerciseFeedback = async (scores: any) => {
    if (hasProFeatures && Platform.OS === 'web' && elevenLabsConversationalService.isServiceReady()) {
      // ElevenLabs Conversational AI feedback (real-time, handled by the component)
      console.log('🎙️ ElevenLabs Conversational AI providing assessment feedback...');
      
      // Update context with assessment mode
      elevenLabsConversationalService.setContext({
        ...elevenLabsConversationalService.getCurrentContext()!,
        assessmentMode: true,
      });
      
      // For assessment mode, we'll let the component handle it
      // The feedback will come through the onMessage callback
    } else if (hasProFeatures && elevenLabsService.isServiceReady()) {
      // ElevenLabs REST API feedback
      console.log('🎙️ Getting ElevenLabs REST API feedback...');
      const context = {
        currentConfidence: scores.confidence,
        sessionProgress: ((exerciseIndex + 1) / lesson!.exercises.length) * 100,
        detectedEmotions: scores,
        exerciseTitle: currentExercise?.title,
        exerciseInstructions: currentExercise?.instructions,
        exercisePrompts: currentExercise?.prompts,
        assessmentMode: true,
      };

      const response = await elevenLabsService.sendMessage(
        `I just completed the ${currentExercise?.title} exercise. Please provide a detailed assessment of my performance.`,
        context
      );

      if (response.success && response.text) {
        setAiResponse(response.text);
        
        // If audio is available, play it
        if (response.audioUrl) {
          console.log('🔊 Playing ElevenLabs audio response');
          // In a real app, you'd play the audio here
          // const audio = new Audio(response.audioUrl);
          // audio.play();
        }
      }
    } else if (mediaPipeService.isServiceReady()) {
      // MediaPipe feedback
      console.log('🤖 Getting MediaPipe feedback...');
      const analysisData = {
        emotions: scores,
        faceAnalysis: { confidence: scores.confidence },
        poseAnalysis: { posture: scores.engagement },
        handAnalysis: { gestures: scores.clarity },
      };

      const response = await mediaPipeService.analyzeAndProvideCoaching(analysisData);
      if (response.success && response.message) {
        setAiResponse(response.message);
      }
    }
  };

  const handleLessonComplete = () => {
    console.log('🎉 Lesson completed');
    if (!lesson || !user?.id || !progress) return;

    // Complete the lesson
    const feedback = [
      `Completed ${lesson.title} with ${sessionScores.overall}% average score`,
      `Strongest area: ${sessionScores.confidence > sessionScores.clarity ? 'Confidence' : 'Clarity'}`,
      `Focus for improvement: ${sessionScores.confidence < sessionScores.clarity ? 'Confidence' : 'Clarity'}`,
    ];

    // Generate personalized feedback if using ElevenLabs
    let personalizedFeedback: string[] | undefined;
    if (hasProFeatures && elevenLabsConversationalService.isServiceReady()) {
      const assessment = elevenLabsConversationalService.generateAssessment(sessionScores);
      personalizedFeedback = assessment.split('\n\n');
    }

    lessonsService.completeLesson(lesson.id, user.id, sessionScores, feedback, personalizedFeedback);

    // Navigate to completion screen
    router.replace({
      pathname: '/(lesson)/complete',
      params: { 
        lessonId: lesson.id,
        score: sessionScores.overall.toString(),
      }
    });
  };

  const handleConversationalMessage = (message: any) => {
    console.log('💬 Conversational AI message:', message);
    if (message.role === 'assistant') {
      setAiResponse(message.content);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Debug: Log current state
  console.log('🔍 Lesson detail state:', {
    hasLesson: !!lesson,
    hasUser: !!user,
    userId: user?.id,
    hasCurrentExercise: !!currentExercise,
    isActive,
    isLoading,
  });

  if (!lesson || !currentExercise) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Loading lesson...</Text>
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Please log in to access lessons</Text>
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
          <Text style={[styles.exerciseTitle, { color: colors.gray[600] }]}>
            Exercise {exerciseIndex + 1}: {currentExercise.title}
          </Text>
        </View>
        <View style={styles.progressIndicator}>
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {exerciseIndex + 1}/{lesson.exercises.length}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>Instructions</Text>
          <Text style={[styles.instructionsText, { color: colors.gray[600] }]}>
            {currentExercise.instructions}
          </Text>
          
          {currentExercise.prompts && (
            <View style={styles.promptsContainer}>
              <Text style={[styles.promptsTitle, { color: colors.text }]}>Key Points:</Text>
              {currentExercise.prompts.map((prompt, index) => (
                <Text key={index} style={[styles.promptText, { color: colors.gray[600] }]}>
                  • {prompt}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* AI Coach Section */}
        {isActive && (
          <>
            {/* ElevenLabs Conversational AI for Premium Web Users */}
            {hasProFeatures && Platform.OS === 'web' && (
              <View style={styles.conversationalAIContainer}>
                <ElevenLabsConversationalAI
                  isActive={isActive}
                  userContext={{
                    currentConfidence: sessionScores.confidence,
                    sessionProgress: ((exerciseIndex + 1) / lesson.exercises.length) * 100,
                    detectedEmotions: sessionScores,
                    focusAreas: user?.preferences?.focusAreas || [],
                    lessonType: lesson.title,
                    exerciseTitle: currentExercise.title,
                    exerciseInstructions: currentExercise.instructions,
                    exercisePrompts: currentExercise.prompts,
                    assessmentMode: isAssessmentMode,
                  }}
                  onMessage={handleConversationalMessage}
                  onStatusChange={setConversationalAIStatus}
                />
              </View>
            )}

            {/* Camera/Practice Area */}
            <View style={styles.practiceArea}>
              <CameraView 
                enabled={cameraEnabled}
                onCameraReady={() => console.log('Camera ready for session')}
                onError={(error) => console.warn('Camera error:', error)}
              />
            </View>
          </>
        )}

        {/* AI Feedback */}
        {aiResponse && (
          <View style={[styles.aiResponseCard, { 
            backgroundColor: isAssessmentMode ? colors.accent + '10' : colors.primary + '10',
            padding: isAssessmentMode ? 20 : 16,
          }]}>
            <View style={styles.aiResponseHeader}>
              <MessageSquare size={20} color={isAssessmentMode ? colors.accent : colors.primary} />
              <Text style={[styles.aiResponseTitle, { 
                color: colors.text,
                fontWeight: isAssessmentMode ? '700' : '600',
              }]}>
                {isAssessmentMode ? 'Performance Assessment' : (
                  hasProFeatures && Platform.OS === 'web' && conversationalAIStatus === 'connected' 
                    ? 'ElevenLabs Conversational AI' 
                    : hasProFeatures && elevenLabsService.isServiceReady() 
                    ? 'ElevenLabs AI Coach' 
                    : 'AI Coach'
                )}
              </Text>
              {hasProFeatures && Platform.OS === 'web' && (
                <View style={[styles.statusIndicator, { backgroundColor: conversationalAIStatus === 'connected' ? colors.success : colors.gray[400] }]} />
              )}
            </View>
            <Text style={[styles.aiResponseText, { 
              color: colors.text,
              fontSize: isAssessmentMode ? 15 : 14,
              lineHeight: isAssessmentMode ? 22 : 20,
            }]}>
              {aiResponse}
            </Text>
          </View>
        )}

        {/* Timer */}
        {isActive && (
          <View style={[styles.timerCard, { backgroundColor: colors.gray[100] }]}>
            <Clock size={24} color={colors.primary} />
            <Text style={[styles.timerText, { color: colors.text }]}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={[styles.timerLabel, { color: colors.gray[600] }]}>
              remaining
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        {!isActive ? (
          <AnimatedButton
            onPress={handleStartExercise}
            style={[
              styles.startButton,
              { 
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            disabled={isLoading}
          >
            <Play size={24} color="#fff" />
            <Text style={styles.startButtonText}>
              {isLoading ? 'Starting...' : 'Start Exercise'}
            </Text>
          </AnimatedButton>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.gray[200] }]}
              onPress={() => setMicEnabled(!micEnabled)}
            >
              {micEnabled ? (
                <Mic size={20} color={colors.text} />
              ) : (
                <MicOff size={20} color={colors.error} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.gray[200] }]}
              onPress={() => setCameraEnabled(!cameraEnabled)}
            >
              {cameraEnabled ? (
                <Camera size={20} color={colors.text} />
              ) : (
                <CameraOff size={20} color={colors.error} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pauseButton,
                { backgroundColor: isPaused ? colors.success : colors.warning }
              ]}
              onPress={handlePauseResume}
            >
              {isPaused ? (
                <Play size={24} color="#fff" />
              ) : (
                <Pause size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.error }]}
              onPress={handleExerciseComplete}
            >
              <CheckCircle size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseTitle: {
    fontSize: 14,
  },
  progressIndicator: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  instructionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  promptsContainer: {
    marginTop: 8,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  conversationalAIContainer: {
    marginBottom: 16,
  },
  practiceArea: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  aiResponseCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResponseTitle: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiResponseText: {
    lineHeight: 20,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  timerLabel: {
    fontSize: 14,
  },
  controls: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});