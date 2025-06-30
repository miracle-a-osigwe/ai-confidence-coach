import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
  Dimensions,
  Alert
} from 'react-native';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, ChartBar as BarChart2, Mic, MicOff, Camera, CameraOff, MessageSquare, Eye, EyeOff } from 'lucide-react-native';
import type { Frame } from 'react-native-vision-camera';
import CameraView from '@/components/CameraView';
import EmotionChart from '@/components/EmotionChart';
import TranscriptionPanel from '@/components/TranscriptionPanel';
import AICoach from '@/components/AICoach';
import VisionAnalysisOverlay from '@/components/VisionAnalysisOverlay';
import { useSession } from '@/hooks/useSession';
import { useVisionAnalysis } from '@/hooks/useVisionAnalysis';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

const windowWidth = Dimensions.get('window').width;

export default function SessionScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Local UI state
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showTranscription, setShowTranscription] = useState(true);
  const [showVisionOverlay, setShowVisionOverlay] = useState(true);

  // Session hook
  const {
    isActive,
    isLoading,
    isConnected,
    error,
    duration,
    currentEmotions,
    transcription,
    latestCoachingCue,
    startSession,
    endSession,
    formatDuration,
  } = useSession();

  // Vision analysis hook
  const {
    isInitialized: visionInitialized,
    isAnalyzing,
    currentAnalysis,
    sessionStats,
    error: visionError,
    initialize: initializeVision,
    startAnalysis: startVisionAnalysis,
    stopAnalysis: stopVisionAnalysis,
    coachingRecommendations,
    confidenceTrend,
  } = useVisionAnalysis();

  const handleToggleSession = async () => {
    console.log('Session toggle button pressed, isActive:', isActive);
    
    if (isActive) {
      // End session
      console.log('Ending session...');
      const sessionResult = await endSession();
      const visionResult = stopVisionAnalysis();
      
      if (!sessionResult.success) {
        Alert.alert('Error', sessionResult.error || 'Failed to end session');
      }
    } else {
      // Start session
      console.log('Starting session...');
      const focusAreas = user?.preferences?.focusAreas || ['confidence', 'clarity'];
      console.log('Focus areas:', focusAreas);
      
      const sessionResult = await startSession({
        type: 'practice',
        goals: focusAreas,
        duration: 300, // 5 minutes default
      });
      
      if (sessionResult.success) {
        // Start vision analysis
        try {
          // For web, we'll use mock streams
          const mockVideoStream = 'mock-video-stream';
          const mockAudioStream = 'mock-audio-stream';
          
          const visionResult = await startVisionAnalysis(mockVideoStream, mockAudioStream);
          if (!visionResult.success) {
            console.warn('Vision analysis failed to start:', visionResult.error);
          }
        } catch (error) {
          console.warn('Vision analysis error:', error);
        }
      } else {
        Alert.alert('Error', sessionResult.error || 'Failed to start session');
      }
    }
  };

  const handleMicToggle = () => {
    console.log('Mic toggle pressed, current state:', micEnabled);
    setMicEnabled(!micEnabled);
  };

  const handleCameraToggle = () => {
    console.log('Camera toggle pressed, current state:', cameraEnabled);
    setCameraEnabled(!cameraEnabled);
  };

  const handleTranscriptionToggle = () => {
    console.log('Transcription toggle pressed, current state:', showTranscription);
    setShowTranscription(!showTranscription);
  };

  const handleVisionOverlayToggle = () => {
    console.log('Vision overlay toggle pressed, current state:', showVisionOverlay);
    setShowVisionOverlay(!showVisionOverlay);
  };

  // Initialize vision analysis on component mount
  useEffect(() => {
    if (!visionInitialized) {
      initializeVision();
    }
  }, [visionInitialized, initializeVision]);

  // Show error if any
  useEffect(() => {
    if (error) {
      Alert.alert('Session Error', error);
    }
    if (visionError) {
      console.warn('Vision Analysis Error:', visionError);
    }
  }, [error, visionError]);

  // Combine emotions from session and vision analysis
  const combinedEmotions = currentAnalysis ? {
    confidence: currentAnalysis.confidence.realTimeScore,
    nervousness: 100 - currentAnalysis.face.emotions.confidence,
    joy: currentAnalysis.face.emotions.joy,
    anxiety: currentAnalysis.face.emotions.fear + currentAnalysis.face.emotions.sadness,
    clarity: currentAnalysis.voice.clarity,
    engagement: currentAnalysis.face.eyeContact.eyeContactScore,
  } : currentEmotions;

  // Use vision analysis coaching cues if available, otherwise use session cues
  const displayCoachingCue = coachingRecommendations.length > 0 
    ? coachingRecommendations[0] 
    : latestCoachingCue;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        {isActive ? (
          <View style={styles.aiCoachContainer}>
            <AICoach cue={displayCoachingCue} />
            <View style={styles.sessionTimeContainer}>
              <Text style={[styles.sessionTimeLabel, { color: colors.gray[600] }]}>Session Time</Text>
              <Text style={[styles.sessionTime, { color: colors.text }]}>{formatDuration(duration)}</Text>
            </View>
            
            {/* Connection status indicator */}
            <View style={[styles.connectionStatus, { backgroundColor: isConnected ? colors.success : colors.error }]}>
              <Text style={styles.connectionStatusText}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Text>
            </View>

            {/* Vision analysis status */}
            {visionInitialized && (
              <View style={[styles.visionStatus, { backgroundColor: isAnalyzing ? colors.primary : colors.gray[400] }]}>
                <Text style={styles.visionStatusText}>
                  {isAnalyzing ? 'AI Vision Active' : 'Vision Ready'}
                </Text>
              </View>
            )}

            {/* Session stats overlay */}
            {sessionStats.duration > 0 && (
              <View style={[styles.statsOverlay, { backgroundColor: colors.gray[100] + 'E0' }]}>
                <Text style={[styles.statsText, { color: colors.text }]}>
                  Avg: {Math.round(sessionStats.averageConfidence)}% | 
                  Peak: {Math.round(sessionStats.peakConfidence)}% | 
                  Trend: {confidenceTrend}
                </Text>
              </View>
            )}

            {/* Coaching cue overlay */}
            {displayCoachingCue && (
              <View style={[styles.coachCueOverlay, { backgroundColor: colors.primary + '20' }]}>
                <MessageSquare size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.coachCueText, { color: colors.primary }]}>{displayCoachingCue}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.preSessionContainer}>
            <Image
              source={{ uri: 'https://myvoiceandpiano.com/wp-content/uploads/2020/03/IMG_2076.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
              style={styles.preSessionImage}
            />
            <Text style={[styles.preSessionText, { color: colors.text }]}>
              Start a session to receive real-time AI-powered confidence coaching
            </Text>
            <Text style={[styles.preSessionSubtext, { color: colors.gray[600] }]}>
              Your focus areas: {user?.preferences?.focusAreas?.join(', ') || 'confidence, clarity'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.middleSection}>
        {isActive && (
          <>
            <View style={styles.firstSection}>
              <View style={styles.statsPreviewContainer}>
                {/* <CameraView enabled={cameraEnabled} /> */}
                {/* Vision Analysis Overlay */}
                {showVisionOverlay && currentAnalysis && (
                  <VisionAnalysisOverlay
                    analysisData={currentAnalysis}
                    focusAreas={user?.preferences?.focusAreas || ['confidence']}
                    isVisible={showVisionOverlay}
                  />
                )}
              </View>
              <View style={styles.cameraPreviewContainer}>
                <CameraView enabled={cameraEnabled} />
              </View>
            </View>
            <View style={styles.emotionChartContainer}>
              <EmotionChart data={combinedEmotions} />
            </View>
          </>
        )}
      </View>

      <View style={styles.bottomSection}>
        {isActive && showTranscription && (
          <View style={styles.transcriptionPanelWrapper}>
            <TranscriptionPanel lines={transcription} />
          </View>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { 
                backgroundColor: isActive ? colors.error : colors.primary,
                opacity: isLoading ? 0.7 : 1,
              }
            ]}
            onPress={handleToggleSession}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <Text style={{ color: '#fff', fontSize: 12 }}>...</Text>
            ) : isActive ? (
              <Pause color="#fff" size={24} />
            ) : (
              <Play color="#fff" size={24} />
            )}
          </TouchableOpacity>

          <View style={styles.secondaryControls}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.gray[200] }]}
              onPress={handleMicToggle}
              disabled={!isActive}
              activeOpacity={0.7}
            >
              {micEnabled ? (
                <Mic color={isActive ? colors.text : colors.gray[400]} size={20} />
              ) : (
                <MicOff color={isActive ? colors.error : colors.gray[400]} size={20} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.gray[200] }]}
              onPress={handleCameraToggle}
              disabled={!isActive}
              activeOpacity={0.7}
            >
              {cameraEnabled ? (
                <Camera color={isActive ? colors.text : colors.gray[400]} size={20} />
              ) : (
                <CameraOff color={isActive ? colors.error : colors.gray[400]} size={20} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: showTranscription ? colors.primary : colors.gray[200] }
              ]}
              onPress={handleTranscriptionToggle}
              disabled={!isActive}
              activeOpacity={0.7}
            >
              <BarChart2 
                color={showTranscription ? "#fff" : (isActive ? colors.text : colors.gray[400])} 
                size={20} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: showVisionOverlay ? colors.accent : colors.gray[200] }
              ]}
              onPress={handleVisionOverlayToggle}
              disabled={!isActive}
              activeOpacity={0.7}
            >
              {showVisionOverlay ? (
                <Eye color="#fff" size={20} />
              ) : (
                <EyeOff color={isActive ? colors.text : colors.gray[400]} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    minHeight: '20%',
    maxHeight: '30%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  aiCoachContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  preSessionContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preSessionImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  preSessionText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  preSessionSubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  sessionTimeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(200,200,200,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionTimeLabel: {
    fontSize: 12,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectionStatus: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  connectionStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  visionStatus: {
    position: 'absolute',
    top: 30,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visionStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  statsOverlay: {
    position: 'absolute',
    top: -15,
    left: '40%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1000,
  },
  statsText: {
    fontSize: 10,
    fontWeight: '500',
  },
  coachCueOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 16,
    right: 16,
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  coachCueText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  middleSection: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  firstSection: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 8,
    // paddingBottom: 8,
  },
  statsPreviewContainer: {
    flex: 1,
    marginRight: 8,
    // height: '20%',
    borderRadius: 12,
    // overflow: 'hidden',
    position: 'relative',
  },
  cameraPreviewContainer: {
    flex: 1,
    marginRight: 8,
    height: '20%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  emotionChartContainer: {
    width: windowWidth > 600 ? 200 : 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomSection: {
    height: 'auto',
    maxHeight: '35%',
    padding: 8,
    justifyContent: 'flex-end',
  },
  transcriptionPanelWrapper: {
    flex: 1,
    marginBottom: 8,
    maxHeight: 150,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
    boxShadow: '0 2px 3px rgba(0,0,0,0.2)',
  },
  secondaryControls: {
    flexDirection: 'row',
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
});