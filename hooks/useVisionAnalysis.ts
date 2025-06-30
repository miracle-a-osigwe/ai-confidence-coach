import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import visionAnalysisService, { VisionAnalysisResult } from '@/services/visionAnalysis';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

interface VisionAnalysisState {
  isInitialized: boolean;
  isAnalyzing: boolean;
  currentAnalysis: VisionAnalysisResult | null;
  analysisHistory: VisionAnalysisResult[];
  error: string | null;
  averageConfidence: number;
  sessionStats: {
    duration: number;
    peakConfidence: number;
    averageConfidence: number;
    improvementTrend: number;
  };
}

export function useVisionAnalysis() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VisionAnalysisState>({
    isInitialized: false,
    isAnalyzing: false,
    currentAnalysis: null,
    analysisHistory: [],
    error: null,
    averageConfidence: 0,
    sessionStats: {
      duration: 0,
      peakConfidence: 0,
      averageConfidence: 0,
      improvementTrend: 0,
    },
  });

  const sessionStartTime = useRef<number>(0);
  const analysisBuffer = useRef<VisionAnalysisResult[]>([]);

  // Update state helper
  const updateState = useCallback((updates: Partial<VisionAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize vision analysis
  const initialize = useCallback(async () => {
    try {
      updateState({ error: null });
      
      const success = await visionAnalysisService.initialize();
      if (success) {
        updateState({ isInitialized: true });
        return { success: true };
      } else {
        updateState({ error: 'Failed to initialize vision analysis' });
        return { success: false, error: 'Failed to initialize vision analysis' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  // Start analysis
  const startAnalysis = useCallback(async (
    videoStream: MediaStream | string,
    audioStream: MediaStream | string
  ) => {
    if (!state.isInitialized) {
      const initResult = await initialize();
      if (!initResult.success) {
        return initResult;
      }
    }

    try {
      const focusAreas = user?.preferences?.focusAreas || ['confidence', 'clarity'];
      
      const success = visionAnalysisService.startAnalysis(
        videoStream,
        audioStream,
        focusAreas,
        handleAnalysisResult
      );

      if (success) {
        sessionStartTime.current = Date.now();
        analysisBuffer.current = [];
        updateState({ 
          isAnalyzing: true, 
          error: null,
          analysisHistory: [],
          sessionStats: {
            duration: 0,
            peakConfidence: 0,
            averageConfidence: 0,
            improvementTrend: 0,
          },
        });
        return { success: true };
      } else {
        updateState({ error: 'Failed to start analysis' });
        return { success: false, error: 'Failed to start analysis' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start analysis';
      updateState({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.isInitialized, user?.preferences?.focusAreas, initialize]);

  // Handle analysis results
  const handleAnalysisResult = useCallback((result: VisionAnalysisResult) => {
    // Add to buffer
    analysisBuffer.current.push(result);
    
    // Keep only last 100 results for performance
    if (analysisBuffer.current.length > 100) {
      analysisBuffer.current = analysisBuffer.current.slice(-100);
    }

    // Calculate session statistics
    const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    const confidenceScores = analysisBuffer.current.map(r => r.confidence.realTimeScore);
    const averageConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
    const peakConfidence = Math.max(...confidenceScores);
    
    // Calculate improvement trend (last 10 vs first 10 scores)
    let improvementTrend = 0;
    if (confidenceScores.length >= 20) {
      const firstTen = confidenceScores.slice(0, 10);
      const lastTen = confidenceScores.slice(-10);
      const firstAvg = firstTen.reduce((sum, score) => sum + score, 0) / firstTen.length;
      const lastAvg = lastTen.reduce((sum, score) => sum + score, 0) / lastTen.length;
      improvementTrend = lastAvg - firstAvg;
    }

    updateState({
      currentAnalysis: result,
      analysisHistory: [...analysisBuffer.current],
      averageConfidence,
      sessionStats: {
        duration,
        peakConfidence,
        averageConfidence,
        improvementTrend,
      },
    });
  }, [updateState]);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    visionAnalysisService.stopAnalysis();
    updateState({ isAnalyzing: false });
    
    return {
      sessionData: {
        duration: state.sessionStats.duration,
        analysisHistory: analysisBuffer.current,
        finalStats: state.sessionStats,
      },
    };
  }, [state.sessionStats, updateState]);

  // Get real-time coaching recommendations
  const getCoachingRecommendations = useCallback(() => {
    if (!state.currentAnalysis) return [];
    
    const { recommendations } = state.currentAnalysis;
    const focusAreas = user?.preferences?.focusAreas || [];
    
    // Filter recommendations based on user's focus areas
    return recommendations.filter(rec => {
      return focusAreas.some((area: string) => {
        switch (area) {
          case 'confidence':
        return rec.toLowerCase().includes('confidence') || rec.toLowerCase().includes('conviction');
          case 'clarity':
        return rec.toLowerCase().includes('clear') || rec.toLowerCase().includes('pace');
          case 'body-language':
        return rec.toLowerCase().includes('posture') || rec.toLowerCase().includes('gesture');
          case 'engagement':
        return rec.toLowerCase().includes('eye contact') || rec.toLowerCase().includes('enthusiasm');
          default:
        return true;
        }
      });
    });
  }, [state.currentAnalysis, user?.preferences?.focusAreas]);

  // Get confidence trend
  const getConfidenceTrend = useCallback((timeWindow: number = 30) => {
    const recentAnalysis = analysisBuffer.current.slice(-timeWindow);
    if (recentAnalysis.length < 2) return 'stable';
    
    const scores = recentAnalysis.map(a => a.confidence.realTimeScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 3) return 'improving';
    if (difference < -3) return 'declining';
    return 'stable';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      visionAnalysisService.cleanup();
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initialize,
    startAnalysis,
    stopAnalysis,
    
    // Computed values
    coachingRecommendations: getCoachingRecommendations(),
    confidenceTrend: getConfidenceTrend(),
    
    // Utilities
    isWebPlatform: Platform.OS === 'web',
    hasValidAnalysis: !!state.currentAnalysis,
  };
}