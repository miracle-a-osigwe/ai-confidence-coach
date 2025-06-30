import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Play, Lock, CircleCheck as CheckCircle, Clock, Target, Users, Mic, Eye, Star, TrendingUp, Award, BookOpen, Filter, Grid, List } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import lessonsService, { Lesson, LessonProgress } from '@/services/lessons';
import AnimatedButton from '@/components/AnimatedButton';

const { width } = Dimensions.get('window');

export default function LessonsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user, hasProFeatures } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userStats, setUserStats] = useState<any>(null);
  const [lessonCounts, setLessonCounts] = useState({ free: 0, premium: 0, total: 0 });
  const preferences = user?.preferences || {};
  useEffect(() => {
    loadLessons();
    loadUserProgress();
    loadUserStats();
    loadLessonCounts();
  }, [hasProFeatures, user, selectedCategory, selectedDifficulty]);

  const loadLessons = () => {
    let availableLessons: Lesson[];

    if (preferences && Object.keys(preferences).length > 0) {
      // Get personalized lessons based on user preferences
      availableLessons = lessonsService.getPersonalizedLessons(preferences, hasProFeatures);
    } else {
      // Get all available lessons
      availableLessons = lessonsService.getAvailableLessons(hasProFeatures);
    }

    // Apply filters
    let filteredLessons = availableLessons;
    
    if (selectedCategory !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.difficulty === selectedDifficulty);
    }

    setLessons(filteredLessons);
  };

  const loadUserProgress = () => {
    if (user?.id) {
      const progress = lessonsService.getUserProgress(user.id);
      setUserProgress(progress);
    }
  };

  const loadUserStats = () => {
    if (user?.id) {
      const stats = lessonsService.getUserStats(user.id);
      setUserStats(stats);
    }
  };

  const loadLessonCounts = () => {
    const counts = lessonsService.getLessonCounts();
    setLessonCounts(counts);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'confidence': return <Target size={16} color={colors.primary} />;
      case 'clarity': return <Mic size={16} color={colors.primary} />;
      case 'body-language': return <Users size={16} color={colors.primary} />;
      case 'engagement': return <Eye size={16} color={colors.primary} />;
      default: return <BookOpen size={16} color={colors.primary} />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.success;
      case 'intermediate': return colors.warning;
      case 'advanced': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getLessonProgress = (lessonId: string): LessonProgress | null => {
    return userProgress.find(p => p.lessonId === lessonId) || null;
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.isPremium && !hasProFeatures) {
      // Show upgrade prompt
      router.push('/(tabs)/profile');
      return;
    }

    // Navigate to lesson detail/practice
    router.push({
      pathname: '/(lesson)/[id]',
      params: { id: lesson.id }
    });
  };

  const categories = [
    { id: 'all', label: 'All Lessons', icon: <BookOpen size={16} color={colors.primary} /> },
    { id: 'confidence', label: 'Confidence', icon: <Target size={16} color={colors.primary} /> },
    { id: 'clarity', label: 'Clarity', icon: <Mic size={16} color={colors.primary} /> },
    { id: 'body-language', label: 'Body Language', icon: <Users size={16} color={colors.primary} /> },
    { id: 'engagement', label: 'Engagement', icon: <Eye size={16} color={colors.primary} /> },
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const completedLessons = userProgress.filter(p => p.completed).length;
  const averageScore = userStats?.averageScore || 0;

  const renderLessonCard = (lesson: Lesson, index: number) => {
    const progress = getLessonProgress(lesson.id);
    const isLocked = lesson.isPremium && !hasProFeatures;
    const isCompleted = progress?.completed || false;
    const progressPercent = progress?.progress || 0;

    if (viewMode === 'list') {
      return (
        <AnimatedButton
          key={lesson.id}
          onPress={() => handleLessonPress(lesson)}
          style={[
            styles.lessonListItem,
            { 
              backgroundColor: colors.gray[100],
              opacity: isLocked ? 0.7 : 1,
            }
          ]}
        >
          <Image 
            source={{ uri: lesson.thumbnailUrl }}
            style={styles.lessonListThumbnail}
          />
          
          <View style={styles.lessonListInfo}>
            <View style={styles.lessonListHeader}>
              <Text style={[styles.lessonListTitle, { color: colors.text }]}>
                {lesson.title}
              </Text>
              <View style={styles.lessonListMeta}>
                {getCategoryIcon(lesson.category)}
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(lesson.difficulty) }
                ]}>
                  {lesson.difficulty}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.lessonListDescription, { color: colors.gray[600] }]} numberOfLines={2}>
              {lesson.description}
            </Text>
            
            <View style={styles.lessonListFooter}>
              <View style={styles.lessonDuration}>
                <Clock size={14} color={colors.gray[500]} />
                <Text style={[styles.durationText, { color: colors.gray[500] }]}>
                  {lesson.duration} min
                </Text>
              </View>
              
              {progress && progressPercent > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: colors.gray[300] }]}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          backgroundColor: isCompleted ? colors.success : colors.primary,
                          width: `${progressPercent}%`
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.gray[500] }]}>
                    {Math.round(progressPercent)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.lessonListAction}>
            {isLocked ? (
              <View style={[styles.lockIcon, { backgroundColor: colors.gray[300] }]}>
                <Lock size={20} color={colors.gray[500]} />
              </View>
            ) : isCompleted ? (
              <View style={[styles.completedIcon, { backgroundColor: colors.success }]}>
                <CheckCircle size={20} color="#fff" />
              </View>
            ) : (
              <View style={[styles.playIcon, { backgroundColor: colors.primary }]}>
                <Play size={20} color="#fff" />
              </View>
            )}
          </View>
          
          {lesson.isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.accent }]}>
              <Star size={12} color="#fff" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </AnimatedButton>
      );
    }

    // Grid view
    return (
      <AnimatedButton
        key={lesson.id}
        onPress={() => handleLessonPress(lesson)}
        style={[
          styles.lessonGridCard,
          { 
            backgroundColor: colors.gray[100],
            opacity: isLocked ? 0.7 : 1,
            // width: (width - 48) / 2,
          }
        ]}
      >
        <Image 
          source={{ uri: lesson.thumbnailUrl }}
          style={styles.lessonGridThumbnail}
        />
        
        <View style={styles.lessonGridContent}>
          <Text style={[styles.lessonGridTitle, { color: colors.text }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          
          <View style={styles.lessonGridMeta}>
            {getCategoryIcon(lesson.category)}
            <Text style={[
              styles.difficultyText,
              { color: getDifficultyColor(lesson.difficulty) }
            ]}>
              {lesson.difficulty}
            </Text>
          </View>
          
          <View style={styles.lessonGridFooter}>
            <View style={styles.lessonDuration}>
              <Clock size={12} color={colors.gray[500]} />
              <Text style={[styles.durationText, { color: colors.gray[500], fontSize: 12 }]}>
                {lesson.duration}m
              </Text>
            </View>
            
            <View style={styles.lessonGridAction}>
              {isLocked ? (
                <Lock size={16} color={colors.gray[500]} />
              ) : isCompleted ? (
                <CheckCircle size={16} color={colors.success} />
              ) : (
                <Play size={16} color={colors.primary} />
              )}
            </View>
          </View>
          
          {progress && progressPercent > 0 && (
            <View style={[styles.progressBar, { backgroundColor: colors.gray[300], marginTop: 8 }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: isCompleted ? colors.success : colors.primary,
                    width: `${progressPercent}%`
                  }
                ]}
              />
            </View>
          )}
        </View>
        
        {lesson.isPremium && (
          <View style={[styles.premiumBadgeGrid, { backgroundColor: colors.accent }]}>
            <Star size={10} color="#fff" />
            <Text style={[styles.premiumBadgeText, { fontSize: 10 }]}>Premium</Text>
          </View>
        )}
      </AnimatedButton>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
          <Award size={20} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{completedLessons}</Text>
          <Text style={[styles.statLabel, { color: colors.gray[600] }]}>Completed</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
          <TrendingUp size={20} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>{averageScore}%</Text>
          <Text style={[styles.statLabel, { color: colors.gray[600] }]}>Avg Score</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.gray[100] }]}>
          <Clock size={20} color={colors.accent} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {Math.round((userStats?.totalPracticeTime || 0) / 60)}m
          </Text>
          <Text style={[styles.statLabel, { color: colors.gray[600] }]}>Practice Time</Text>
        </View>
      </View>

      {/* Plan Status */}
      <View style={[styles.planStatus, { backgroundColor: hasProFeatures ? colors.primary + '20' : colors.warning + '20' }]}>
        <View style={styles.planStatusContent}>
          <Text style={[styles.planStatusTitle, { color: colors.text }]}>
            {hasProFeatures ? 'Premium Plan' : 'Free Plan'}
          </Text>
          <Text style={[styles.planStatusDesc, { color: colors.gray[600] }]}>
            {hasProFeatures 
              ? `Access to all ${lessonCounts.total} lessons with ElevenLabs AI coaching`
              : `${lessonCounts.free} free lessons available • ${lessonCounts.premium} premium lessons with upgrade`
            }
          </Text>
        </View>
        {!hasProFeatures && (
          <TouchableOpacity 
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Personalization Notice */}
      {preferences && Object.keys(preferences).length > 0 && (
        <View style={[styles.personalizationNotice, { backgroundColor: colors.success + '20' }]}>
          <Target size={16} color={colors.success} />
          <Text style={[styles.personalizationText, { color: colors.success }]}>
            Lessons personalized for your goals: {preferences.goals?.join(', ') || 'General improvement'}
          </Text>
        </View>
      )}

      {/* Filters and View Toggle */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedCategory === category.id ? colors.primary : colors.gray[100],
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              {React.cloneElement(category.icon, {
                color: selectedCategory === category.id ? '#fff' : colors.primary
              })}
              <Text style={[
                styles.filterButtonText,
                { color: selectedCategory === category.id ? '#fff' : colors.text }
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.secondaryFilters}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.difficultyFilterContent}
          >
            {difficulties.map(difficulty => (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyButton,
                  {
                    backgroundColor: selectedDifficulty === difficulty.id ? colors.secondary : colors.gray[200],
                  }
                ]}
                onPress={() => setSelectedDifficulty(difficulty.id)}
              >
                <Text style={[
                  styles.difficultyButtonText,
                  { color: selectedDifficulty === difficulty.id ? '#fff' : colors.text }
                ]}>
                  {difficulty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                { backgroundColor: viewMode === 'grid' ? colors.primary : colors.gray[200] }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={16} color={viewMode === 'grid' ? '#fff' : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                { backgroundColor: viewMode === 'list' ? colors.primary : colors.gray[200] }
              ]}
              onPress={() => setViewMode('list')}
            >
              <List size={16} color={viewMode === 'list' ? '#fff' : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Lessons List */}
      <View style={styles.lessonsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedCategory === 'all' ? 'All Lessons' : `${categories.find(c => c.id === selectedCategory)?.label} Lessons`}
          {selectedDifficulty !== 'all' && ` • ${difficulties.find(d => d.id === selectedDifficulty)?.label}`}
          <Text style={[styles.lessonCount, { color: colors.gray[500] }]}>
            {' '}({lessons.length})
          </Text>
        </Text>
        
        {lessons.length > 0 ? (
          <View style={viewMode === 'grid' ? styles.lessonsGrid : styles.lessonsList}>
            {lessons.map((lesson, index) => renderLessonCard(lesson, index))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.gray[100] }]}>
            <Filter size={48} color={colors.gray[400]} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No lessons found</Text>
            <Text style={[styles.emptyStateText, { color: colors.gray[500] }]}>
              Try adjusting your filters or {!hasProFeatures ? 'upgrade to access more lessons' : 'check back later for new content'}
            </Text>
            {!hasProFeatures && (
              <TouchableOpacity 
                style={[styles.upgradeButton, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Recommended Next Lesson */}
      {userStats && userStats.completedLessons > 0 && (
        <View style={styles.recommendationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Next</Text>
          {(() => {
            const nextLesson = lessonsService.getRecommendedNextLesson(
              user?.id || '', 
              hasProFeatures, 
              preferences
            );
            if (!nextLesson) return null;

            return (
              <AnimatedButton
                onPress={() => handleLessonPress(nextLesson)}
                style={[styles.recommendedCard, { backgroundColor: colors.primary + '10' }]}
              >
                <View style={styles.recommendedContent}>
                  <Text style={[styles.recommendedTitle, { color: colors.text }]}>
                    {nextLesson.title}
                  </Text>
                  <Text style={[styles.recommendedDesc, { color: colors.gray[600] }]}>
                    Based on your progress and preferences, this lesson will help you improve your {userStats.improvementArea}
                  </Text>
                  <View style={styles.recommendedAction}>
                    <Play size={16} color={colors.primary} />
                    <Text style={[styles.recommendedActionText, { color: colors.primary }]}>
                      Start Lesson
                    </Text>
                  </View>
                </View>
              </AnimatedButton>
            );
          })()}
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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  planStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  planStatusContent: {
    flex: 1,
  },
  planStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planStatusDesc: {
    fontSize: 14,
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  personalizationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  personalizationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryFilterContent: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  secondaryFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyFilterContent: {
    paddingRight: 16,
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  difficultyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleButton: {
    padding: 8,
  },
  lessonsContainer: {
    marginBottom: 24,
    
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  lessonCount: {
    fontSize: 16,
    fontWeight: '400',
  },
  lessonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lessonsList: {
    gap: 12,
  },
  lessonGridCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    maxWidth: (width - 48) / 2,
    flexWrap: 'wrap',
    overflow: 'hidden',
    position: 'relative',
  },
  lessonGridThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  lessonGridContent: {
    padding: 12,
    flex: 1,
  },
  lessonGridTitle: {
    fontSize: (width - 48) / 2 > 400 ? 16 : 14,
    maxWidth: (width - 80) / 2 - 24,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  lessonGridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonGridAction: {
    alignItems: 'center',
  },
  lessonListItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  lessonListThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  lessonListInfo: {
    flex: 1,
  },
  lessonListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonListTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  lessonListMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonListDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  lessonListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonListAction: {
    marginLeft: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  lessonDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  playIcon: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: "80%",
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeGrid: {
    position: 'absolute',
    top: "85%",
    right: "70%",
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 10,
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
  recommendationSection: {
    marginBottom: 24,
  },
  recommendedCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recommendedContent: {
    alignItems: 'center',
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  recommendedDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendedAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedActionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
});