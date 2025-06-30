import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Eye, Users, Mic, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { VisionAnalysisResult, ConfidenceMetrics } from '@/services/visionAnalysis';

interface VisionAnalysisOverlayProps {
  analysisData: VisionAnalysisResult | null;
  focusAreas: string[];
  isVisible: boolean;
}

const { width } = Dimensions.get('window');

export default function VisionAnalysisOverlay({ 
  analysisData, 
  focusAreas, 
  isVisible 
}: VisionAnalysisOverlayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [previousScore, setPreviousScore] = useState<number>(0);

  useEffect(() => {
    if (analysisData?.confidence.realTimeScore) {
      setPreviousScore(analysisData.confidence.realTimeScore);
    }
  }, [analysisData?.confidence.realTimeScore]);

  if (!isVisible || !analysisData) {
    return null;
  }

  const { confidence, face, voice, posture, gestures } = analysisData;
  const scoreDiff = confidence.realTimeScore - previousScore;

  const getTrendIcon = () => {
    if (scoreDiff > 2) return <TrendingUp size={16} color={colors.success} />;
    if (scoreDiff < -2) return <TrendingDown size={16} color={colors.error} />;
    return <Minus size={16} color={colors.gray[500]} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getFocusAreaIcon = (area: string) => {
    switch (area) {
      case 'confidence':
        return <Zap size={16} color={colors.primary} />;
      case 'clarity':
        return <Mic size={16} color={colors.primary} />;
      case 'body-language':
        return <Users size={16} color={colors.primary} />;
      case 'engagement':
        return <Eye size={16} color={colors.primary} />;
      default:
        return <Zap size={16} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + 'F0' }]}>
      {/* Main Confidence Score */}
      <View style={[styles.mainScoreContainer, { backgroundColor: colors.gray[100] }]}>
        <View style={styles.scoreHeader}>
          <Text style={[styles.scoreLabel, { color: colors.text }]}>Confidence</Text>
          {getTrendIcon()}
        </View>
        <Text style={[styles.mainScore, { color: getScoreColor(confidence.realTimeScore) }]}>
          {confidence.realTimeScore}%
        </Text>
      </View>

      {/* Focus Areas */}
      <View style={styles.focusAreasContainer}>
        {focusAreas.map((area, index) => {
          const score = confidence.focusAreas[area] || 0;
          return (
            <View key={index} style={[styles.focusAreaCard, { backgroundColor: colors.gray[100] }]}>
              <View style={styles.focusAreaHeader}>
                {getFocusAreaIcon(area)}
                <Text style={[styles.focusAreaLabel, { color: colors.text }]}>
                  {area.charAt(0).toUpperCase() + area.slice(1).replace('-', ' ')}
                </Text>
              </View>
              <Text style={[styles.focusAreaScore, { color: getScoreColor(score) }]}>
                {Math.round(score)}%
              </Text>
            </View>
          );
        })}
      </View>

      {/* Real-time Metrics */}
      <View style={styles.metricsContainer}>
        <View style={[styles.metricItem, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Eye Contact</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(face.eyeContact.eyeContactScore) }]}>
            {Math.round(face.eyeContact.eyeContactScore)}%
          </Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Posture</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(posture.posture.overallPosture) }]}>
            {Math.round(posture.posture.overallPosture)}%
          </Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Voice</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(voice.clarity) }]}>
            {Math.round(voice.clarity)}%
          </Text>
        </View>

        <View style={[styles.metricItem, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.metricLabel, { color: colors.text }]}>Gestures</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(gestures.gestures.appropriateGestures) }]}>
            {Math.round(gestures.gestures.appropriateGestures)}%
          </Text>
        </View>
      </View>

      {/* Latest Recommendation */}
      {analysisData.recommendations.length > 0 && (
        <View style={[styles.recommendationContainer, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.recommendationText, { color: colors.primary }]}>
            💡 {analysisData.recommendations[0]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: -10,
    // left: 1/0,
    // right: 10,
    width: '100%',
    height: '100%',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mainScoreContainer: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  mainScore: {
    fontSize: 24,
    fontWeight: '700',
  },
  focusAreasContainer: {
    flexDirection: 'row',
    // width: '30%',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  focusAreaCard: {
    flex: 1,
    // minWidth: (width - 60) / 2,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  focusAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  focusAreaLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  focusAreaScore: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  metricItem: {
    flex: 1,
    minWidth: (width - 80) / 4,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationContainer: {
    borderRadius: 6,
    padding: 8,
  },
  recommendationText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});