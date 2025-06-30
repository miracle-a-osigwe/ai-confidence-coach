import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme, RefreshControl, ScrollView, Platform, Linking, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, TrendingUp, Video, Award, Calendar, Target, Trophy, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import OptimizedImage from '@/components/OptimizedImage';
import AnimatedButton from '@/components/AnimatedButton';
import Loader from '@/components/Loader';
import { HapticFeedback } from '@/components/HapticFeedback';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import apiService from '@/services/api';

interface RecentSession {
  id: string;
  date: string;
  duration: number;
  averageConfidence: number;
  type: string;
  focusAreas: string[];
}

interface UserInsights {
  weeklyProgress: number;
  strongestArea: string;
  improvementArea: string;
  nextGoal: string;
  streakDays: number;
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isLoading: authLoading, canStartSession, updateUserStats, initializeAuth, isAuthenticated } = useAuth();
  const { isConnected } = useNetworkStatus();

  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if ( user.id === '' && isAuthenticated ) initializeAuth();
    if ( !user || user.id === '' ) return;

    try {
      setIsLoading(true);

      // Load recent sessions and insights in parallel
      const [sessionsResponse, insightsResponse] = await Promise.all([
        apiService.getSessionHistory(5, 0),
        apiService.getUserInsights(),
      ]);

      if (sessionsResponse.success && sessionsResponse.data) {
        setRecentSessions(sessionsResponse.data);
        console.log("Recent sessions loaded:", sessionsResponse.data);
      }

      if (insightsResponse.success && insightsResponse.data) {
        setUserInsights(insightsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading, loadDashboardData]);

  const handleStartSession = useCallback(() => {
    HapticFeedback.medium();
    
    if (!canStartSession) {
      // Navigate to subscription upgrade
      router.push('/(tabs)/profile'); // Or dedicated subscription screen
      return;
    }
    
    router.push('/(tabs)/session');
  }, [canStartSession]);

  const handleBoltBadgePress = useCallback(async () => {
    try {
      await Linking.openURL('https://bolt.new/');
    } catch (error) {
      console.error('Failed to open Bolt.new URL:', error);
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Loader width={60} height={60} borderRadius={30} />
          <View style={styles.headerText}>
            <Loader width={120} height={16} />
            <Loader width={80} height={20} style={{ marginTop: 4 }} />
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
            <Loader width="100%" height={80} />
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
            <Loader width="100%" height={80} />
          </View>
        </View>
        
        <Loader width="100%" height={56} borderRadius={28} style={{ marginBottom: 24 }} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {!isConnected && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warning }]}>
          <Text style={styles.offlineText}>You're offline. Some features may be limited.</Text>
        </View>
      )}

      <View style={styles.header}>
        <OptimizedImage 
          source={{ 
            uri: user?.image || 'https://cdn-icons-png.flaticon.com/512/8608/8608769.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
          }} 
          style={styles.image}
        />
        <View style={styles.headerText}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome back,</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user?.firstName || 'User'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.streakContainer, { backgroundColor: colors.primary + '20' }]}
          onPress={() => router.push('/(tabs)/reports')}
        >
          <Text style={[styles.streakNumber, { color: colors.primary }]}>
            {user?.stats?.currentStreak || 0}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.primary }]}>day streak</Text>
        </TouchableOpacity>
        {/* Bolt.new Badge */}
        <TouchableOpacity 
          style={styles.boltBadge}
          onPress={handleBoltBadgePress}
          activeOpacity={0.8}
        >
          <Image 
            source={require('@/assets/images/white_circle_360x360.png')}
            style={styles.boltBadgeImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color={colors.success} />
          </View>
          <Text style={[styles.statTitle, { color: colors.text }]}>Best Score</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {user?.stats?.bestScore || 0}%
          </Text>
          <View style={styles.statTrend}>
            <Text style={{ color: colors.success, fontSize: 12 }}>
              {typeof userInsights?.weeklyProgress === 'number' && userInsights.weeklyProgress > 0 ? '+' : ''}
              {typeof userInsights?.weeklyProgress === 'number' ? userInsights.weeklyProgress : 0}% this week
            </Text>
          </View>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.statIcon}>
            <Trophy size={20} color={colors.accent} />
          </View>
          <Text style={[styles.statTitle, { color: colors.text }]}>Sessions</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {user?.stats?.sessionsCompleted || 0}
          </Text>
          <Text style={{ color: colors.gray[500], fontSize: 12 }}>
            {formatDuration(user?.stats?.totalTime || 0)} total
          </Text>
        </View>
      </View>

      {/* Insights Card */}
      {userInsights && (
        <View style={[styles.insightsCard, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>Your Progress Insights</Text>
          <View style={styles.insightsContent}>
            <View style={styles.insightItem}>
              <Target size={16} color={colors.success} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Strongest: {userInsights.strongestArea}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <TrendingUp size={16} color={colors.warning} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Focus on: {userInsights.improvementArea}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Award size={16} color={colors.primary} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Next goal: {userInsights.nextGoal}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Start Session Button */}
      <AnimatedButton
        onPress={handleStartSession}
        style={[
          styles.startButton, 
          { 
            backgroundColor: canStartSession ? colors.primary : colors.gray[400],
          }
        ]}
      >
        <Play size={24} color="#fff" />
        <Text style={styles.startButtonText}>
          {canStartSession ? 'Start New Session' : 'Upgrade to Continue'}
        </Text>
      </AnimatedButton>

      {/* Subscription Status */}
      {user?.subscription && (
        <View style={[styles.subscriptionCard, { backgroundColor: colors.gray[100] }]}>
          <View style={styles.subscriptionContent}>
            <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
              {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
            </Text>
            <Text style={[styles.subscriptionDesc, { color: colors.gray[600] }]}>
              {user.subscription.plan === 'free' 
                ? `${user.subscription.sessionsRemaining} sessions remaining this month`
                : 'Unlimited sessions'
              }
            </Text>
          </View>
          {user.subscription.plan === 'free' && (
            <AnimatedButton
              onPress={() => router.push('/(tabs)/profile')}
              style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </AnimatedButton>
          )}
        </View>
      )}

      {/* Recent Sessions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentSessions.length > 0 ? (
        recentSessions.map(session => (
          <AnimatedButton
            key={session.id}
            onPress={() => {
              HapticFeedback.light();
              router.push(`/(tabs)/reports?sessionId=${session.id}`);
            }}
            style={[styles.sessionCard, { backgroundColor: colors.gray[100] }]}
          >
            <View style={styles.sessionCardIcon}>
              <Video size={24} color={colors.primary} />
            </View>
            <View style={styles.sessionCardContent}>
              <Text style={[styles.sessionCardDate, { color: colors.text }]}>
                {formatDate(session.date)}
              </Text>
              <View style={styles.sessionCardDetails}>
                <Clock size={14} color={colors.gray[500]} />
                <Text style={[styles.sessionCardDuration, { color: colors.gray[500] }]}>
                  {formatDuration(session.duration)}
                </Text>
                <Text style={[styles.sessionCardType, { color: colors.gray[500] }]}>
                  • {session.type}
                </Text>
              </View>
              <Text style={[styles.sessionCardFocus, { color: colors.gray[600] }]}>
                Focus: {Array.isArray(session.focusAreas) && session.focusAreas.length > 0 
                  ? session.focusAreas.join(', ') 
                  : 'Confidence'}
              </Text>
            </View>
            <View style={styles.sessionCardScore}>
              <Award size={16} color={colors.accent} />
              <Text style={[styles.sessionCardScoreText, { color: colors.accent }]}>
                {session.averageConfidence}%
              </Text>
            </View>
          </AnimatedButton>
        ))
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.gray[100] }]}>
          <Video size={48} color={colors.gray[400]} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No sessions yet</Text>
          <Text style={[styles.emptyStateText, { color: colors.gray[500] }]}>
            Start your first practice session to begin tracking your progress
          </Text>
          <AnimatedButton
            onPress={handleStartSession}
            style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.emptyStateButtonText}>Start First Session</Text>
          </AnimatedButton>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  offlineBanner: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '600',
  },
  streakContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    right: 10,
  },
  boltBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boltBadgeImage: {
    width: 48,
    height: 48,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 0.48,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 3px rgba(0,0,0,0.05)',
  },
  statIcon: {
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightsContent: {
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 24,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionDesc: {
    fontSize: 14,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  sessionCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionCardContent: {
    flex: 1,
  },
  sessionCardDate: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionCardDuration: {
    fontSize: 14,
    marginLeft: 4,
  },
  sessionCardType: {
    fontSize: 14,
    marginLeft: 4,
  },
  sessionCardFocus: {
    fontSize: 12,
  },
  sessionCardScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionCardScoreText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
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
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});