import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import Colors from '@/constants/Colors';
import { Calendar, ChevronRight, Award, Clock, FileText, TrendingUp, Download, Share } from 'lucide-react-native';
import SessionMetricsChart from '@/components/reports/SessionMetricsChart';
import EmotionRadarChart from '@/components/reports/EmotionRadarChart';
import ProgressChart from '@/components/reports/ProgressChart';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const windowWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount and period change
  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load session history and analytics in parallel
      const [sessionsResponse, analyticsResponse] = await Promise.all([
        apiService.getSessionHistory(20, 0),
        apiService.getProgressAnalytics(selectedPeriod as 'week' | 'month' | 'all'),
      ]);

      if (sessionsResponse.success && sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      } else {
        console.warn('Failed to load sessions:', sessionsResponse.error);
      }

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      } else {
        console.warn('Failed to load analytics:', analyticsResponse.error);
      }

    } catch (error) {
      console.error('Failed to load reports data:', error);
      setError('Failed to load reports data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await apiService.exportUserData();
      if (response.success && response.data?.downloadUrl) {
        // Handle download URL - in a real app, you'd open this URL
        console.log('Export URL:', response.data.downloadUrl);
        // You could use expo-sharing or expo-file-system to handle the download
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const shareProgress = async () => {
    try {
      // Generate shareable progress summary
      const progressSummary = `I've completed ${profile?.stats?.sessionsCompleted || 0} confidence coaching sessions with an average score of ${profile?.stats?.averageConfidence || 0}%! 🎯`;
      
      // In a real app, you'd use expo-sharing
      console.log('Share:', progressSummary);
    } catch (error) {
      console.error('Failed to share progress:', error);
    }
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity 
        style={[
          styles.periodOption, 
          selectedPeriod === 'week' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedPeriod('week')}
      >
        <Text style={{ 
          color: selectedPeriod === 'week' ? '#fff' : colors.text,
          fontWeight: selectedPeriod === 'week' ? '600' : '400'
        }}>Week</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.periodOption, 
          selectedPeriod === 'month' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedPeriod('month')}
      >
        <Text style={{ 
          color: selectedPeriod === 'month' ? '#fff' : colors.text,
          fontWeight: selectedPeriod === 'month' ? '600' : '400'
        }}>Month</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.periodOption, 
          selectedPeriod === 'all' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedPeriod('all')}
      >
        <Text style={{ 
          color: selectedPeriod === 'all' ? '#fff' : colors.text,
          fontWeight: selectedPeriod === 'all' ? '600' : '400'
        }}>All Time</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your reports...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadReportsData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Use analytics data or fallback to profile stats
  const progressData = analytics?.progressData || {
    labels: sessions.slice(-7).map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        data: sessions.slice(-7).map(s => s.averageConfidence || 65),
        color: () => colors.primary,
        strokeWidth: 2
      }
    ]
  };

  const summaryStats = analytics?.summary || {
    currentScore: profile?.stats?.averageConfidence || 0,
    totalTime: formatDuration(profile?.stats?.totalTime || 0),
    sessionsCount: sessions.length || profile?.stats?.sessionsCompleted || 0,
    bestScore: profile?.stats?.bestScore || 0,
    improvement: analytics?.weeklyImprovement || 0,
  };

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Progress</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.gray[100] }]}
            onPress={shareProgress}
          >
            <Share size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.gray[100] }]}
            onPress={exportReport}
          >
            <Download size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.summaryIconContainer}>
            <TrendingUp size={20} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Average Score</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{summaryStats.currentScore}%</Text>
            {summaryStats.improvement !== 0 && (
              <Text style={[styles.summaryChange, { color: summaryStats.improvement > 0 ? colors.success : colors.error }]}>
                {summaryStats.improvement > 0 ? '+' : ''}{summaryStats.improvement}% vs last period
              </Text>
            )}
          </View>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.summaryIconContainer}>
            <Clock size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Total Time</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{summaryStats.totalTime}</Text>
          </View>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.summaryIconContainer}>
            <Award size={20} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Best Score</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{summaryStats.bestScore}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Confidence Progress</Text>
          {renderPeriodSelector()}
        </View>
        <View style={[styles.chartContainer, { backgroundColor: colors.gray[100] }]}>
          <ProgressChart data={progressData} colors={colors} />
          <View style={styles.insightsContainer}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>AI Analysis</Text>
            <Text style={[styles.insightText, { color: colors.text }]}>
              {analytics?.insights || `Your confidence has improved by ${summaryStats.improvement}% over the selected period. ${summaryStats.improvement > 0 ? 'Keep up the great work!' : 'Focus on consistent practice to see improvement.'}`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
        {sessions.length > 0 ? (
          sessions.slice(0, 10).map((session, index) => (
            <TouchableOpacity 
              key={session.id || index}
              style={[styles.sessionCard, { backgroundColor: colors.gray[100] }]}
              onPress={() => {
                // Navigate to session details
                console.log('Navigate to session:', session.id);
              }}
            >
              <View style={styles.sessionCardLeft}>
                <Text style={[styles.sessionDate, { color: colors.text }]}>
                  {new Date(session.createdAt || session.date || Date.now()).toLocaleDateString()}
                </Text>
                <View style={styles.sessionDetails}>
                  <Clock size={14} color={colors.gray[500]} style={{ marginRight: 4 }} />
                  <Text style={[styles.sessionDetail, { color: colors.gray[500] }]}>
                    {session.duration ? formatDuration(session.duration) : '5:23'}
                  </Text>
                  <Text style={[styles.sessionType, { color: colors.gray[500] }]}>
                    • {session.type || 'Practice'}
                  </Text>
                </View>
                {session.focusAreas && session.focusAreas.length > 0 && (
                  <Text style={[styles.sessionFocus, { color: colors.gray[600] }]}>
                    Focus: {session.focusAreas.join(', ')}
                  </Text>
                )}
              </View>
              <View style={styles.sessionCardRight}>
                <View style={styles.confidenceContainer}>
                  <Award size={16} color={colors.accent} />
                  <Text style={[styles.confidenceScore, { color: colors.accent }]}>
                    {session.averageConfidence || 72}%
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.gray[400]} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.gray[100] }]}>
            <FileText size={48} color={colors.gray[400]} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No sessions yet</Text>
            <Text style={[styles.emptyStateText, { color: colors.gray[500] }]}>
              Start practicing to see your progress reports here!
            </Text>
          </View>
        )}
      </View>

      {sessions.length > 0 && (
        <>
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Breakdown</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.gray[100] }]}>
              <View style={styles.chartRow}>
                <View style={styles.chartColumn}>
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Latest Session</Text>
                  <EmotionRadarChart 
                    data={sessions[0]?.emotions || sessions[0]?.visionAnalysis?.[0]?.emotions || {
                      confidence: 72, clarity: 68, engagement: 75, enthusiasm: 65, authenticity: 70
                    }} 
                    colors={colors} 
                  />
                </View>
                {sessions.length > 1 && (
                  <>
                    <View style={styles.chartDivider} />
                    <View style={styles.chartColumn}>
                      <Text style={[styles.chartTitle, { color: colors.text }]}>Previous</Text>
                      <EmotionRadarChart 
                        data={sessions[1]?.emotions || sessions[1]?.visionAnalysis?.[0]?.emotions || {
                          confidence: 68, clarity: 65, engagement: 70, enthusiasm: 62, authenticity: 73
                        }} 
                        colors={colors} 
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Trends</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.gray[100] }]}>
              <SessionMetricsChart colors={colors} />
            </View>
          </View>
        </>
      )}

      <View style={[styles.insightsSection, { backgroundColor: colors.gray[100] }]}>
        <Text style={[styles.insightsSectionTitle, { color: colors.text }]}>
          AI Coaching Insights
        </Text>
        {(analytics?.recommendations || [
          'Your eye contact has improved significantly over the past week',
          'Consider working on reducing filler words in your speech',
          'Your posture and body language show great confidence',
          'Try varying your speech pace for better engagement'
        ]).map((insight: string, index: number) => (
          <View key={index} style={styles.insightItem}>
            <View style={[styles.insightBullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.insightItemText, { color: colors.text }]}>{insight}</Text>
          </View>
        ))}
        
        <TouchableOpacity 
          style={[styles.fullReportButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // Navigate to detailed insights or generate new report
            console.log('Generate detailed report');
          }}
        >
          <Text style={styles.fullReportButtonText}>View Detailed Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryChange: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
  },
  periodOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  sessionCardLeft: {
    flex: 1,
  },
  sessionCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDetail: {
    fontSize: 14,
  },
  sessionType: {
    fontSize: 14,
    marginLeft: 4,
  },
  sessionFocus: {
    fontSize: 12,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  confidenceScore: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartRow: {
    flexDirection: 'row',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  insightsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightsSection: {
    borderRadius: 12,
    padding: 16,
  },
  insightsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  insightItemText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  fullReportButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  fullReportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  spacer: {
    height: 40,
  },
});