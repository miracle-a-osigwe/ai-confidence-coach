import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { CircleCheck as CheckCircle, Star, TrendingUp, Target, ArrowRight, Chrome as Home, BookOpen, Award } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import lessonsService, { Lesson, LessonProgress } from '@/services/lessons';
import AnimatedButton from '@/components/AnimatedButton';

export default function LessonCompleteScreen() {
  const { lessonId, score } = useLocalSearchParams<{ lessonId: string; score: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (lessonId && user?.id) {
      loadLessonData();
    }
  }, [lessonId, user]);

  const loadLessonData = () => {
    // Load lesson details
    const lessonData = lessonsService.getLessonById(lessonId!);
    setLesson(lessonData);

    // Load progress
    const progressData = lessonsService.getLessonProgress(lessonId!, user!.id);
    setProgress(progressData);

    // Load next recommended lesson
    const nextLessonData = lessonsService.getRecommendedNextLesson(
      user!.id, 
      user!.subscription.plan !== 'free',
      user!.preferences
    );
    setNextLesson(nextLessonData);

    // Load updated user stats
    const stats = lessonsService.getUserStats(user!.id);
    setUserStats(stats);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance! 🌟";
    if (score >= 80) return "Excellent work! 🎉";
    if (score >= 70) return "Great job! 👏";
    if (score >= 60) return "Good progress! 👍";
    return "Keep practicing! 💪";
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      router.replace({
        pathname: '/(lesson)/[id]',
        params: { id: nextLesson.id }
      });
    }
  };

  const handleBackToLessons = () => {
    router.replace('/(tabs)/lessons');
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  if (!lesson || !progress) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Loading results...</Text>
      </View>
    );
  }

  const finalScore = parseInt(score || '0');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '10', colors.secondary + '05']}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          
          <Text style={[styles.congratsText, { color: colors.text }]}>
            Lesson Complete!
          </Text>
          
          <Text style={[styles.lessonTitle, { color: colors.text }]}>
            {lesson.title}
          </Text>
          
          <Text style={[styles.scoreMessage, { color: colors.gray[600] }]}>
            {getScoreMessage(finalScore)}
          </Text>
        </View>

        {/* Score Display */}
        <View style={[styles.scoreCard, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.scoreLabel, { color: colors.text }]}>Your Score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(finalScore) }]}>
            {finalScore}%
          </Text>
          
          {/* Score Breakdown */}
          <View style={styles.scoreBreakdown}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreItemLabel, { color: colors.gray[600] }]}>Confidence</Text>
              <Text style={[styles.scoreItemValue, { color: colors.text }]}>
                {progress.scores.confidence}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreItemLabel, { color: colors.gray[600] }]}>Clarity</Text>
              <Text style={[styles.scoreItemValue, { color: colors.text }]}>
                {progress.scores.clarity}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreItemLabel, { color: colors.gray[600] }]}>Engagement</Text>
              <Text style={[styles.scoreItemValue, { color: colors.text }]}>
                {progress.scores.engagement}%
              </Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.achievementsCard, { backgroundColor: colors.gray[100] }]}>
          <Text style={[styles.achievementsTitle, { color: colors.text }]}>Achievements</Text>
          
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <Award size={20} color={colors.accent} />
              <Text style={[styles.achievementText, { color: colors.text }]}>
                Completed {lesson.title}
              </Text>
            </View>
            
            {finalScore >= 80 && (
              <View style={styles.achievementItem}>
                <Star size={20} color={colors.warning} />
                <Text style={[styles.achievementText, { color: colors.text }]}>
                  Excellent Performance
                </Text>
              </View>
            )}
            
            {userStats && userStats.completedLessons >= 3 && (
              <View style={styles.achievementItem}>
                <TrendingUp size={20} color={colors.success} />
                <Text style={[styles.achievementText, { color: colors.text }]}>
                  Consistent Learner
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Personalized Feedback (from ElevenLabs) */}
        {progress.personalizedFeedback && progress.personalizedFeedback.length > 0 && (
          <View style={[styles.feedbackCard, { backgroundColor: colors.accent + '10' }]}>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>AI Assessment</Text>
            {progress.personalizedFeedback.map((feedback, index) => (
              <Text key={index} style={[styles.feedbackText, { color: colors.text }]}>
                {feedback}
              </Text>
            ))}
          </View>
        )}

        {/* Standard Feedback */}
        {progress.feedback && progress.feedback.length > 0 && (
          <View style={[styles.feedbackCard, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>Key Insights</Text>
            {progress.feedback.map((feedback, index) => (
              <Text key={index} style={[styles.feedbackText, { color: colors.text }]}>
                • {feedback}
              </Text>
            ))}
          </View>
        )}

        {/* Progress Stats */}
        {userStats && (
          <View style={[styles.statsCard, { backgroundColor: colors.gray[100] }]}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>Your Progress</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {userStats.completedLessons}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray[600] }]}>
                  Lessons Completed
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {userStats.averageScore}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray[600] }]}>
                  Average Score
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {Math.round(userStats.totalPracticeTime / 60)}m
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray[600] }]}>
                  Practice Time
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 20 }]}>
        {nextLesson ? (
          <AnimatedButton
            onPress={handleNextLesson}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.primaryButtonText}>Next Lesson</Text>
            <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
          </AnimatedButton>
        ) : (
          <AnimatedButton
            onPress={handleBackToLessons}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <BookOpen size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Browse Lessons</Text>
          </AnimatedButton>
        )}

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.gray[200] }]}
            onPress={handleBackToLessons}
          >
            <BookOpen size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              All Lessons
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.gray[200] }]}
            onPress={handleBackToHome}
          >
            <Home size={20} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Home
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 20,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});