import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Target, Users, Briefcase, GraduationCap, Mic, Video, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  options: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { completeOnboarding, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const steps: OnboardingStep[] = [
    {
      id: 'goals',
      title: 'What are your speaking goals?',
      subtitle: 'Help us personalize your coaching experience',
      options: [
        {
          id: 'presentations',
          label: 'Business Presentations',
          icon: <Briefcase size={24} color={colors.primary} />,
          description: 'Improve workplace presentations and meetings'
        },
        {
          id: 'interviews',
          label: 'Job Interviews',
          icon: <Users size={24} color={colors.primary} />,
          description: 'Build confidence for interview success'
        },
        {
          id: 'public-speaking',
          label: 'Public Speaking',
          icon: <Mic size={24} color={colors.primary} />,
          description: 'Master speaking to large audiences'
        },
        {
          id: 'academic',
          label: 'Academic Presentations',
          icon: <GraduationCap size={24} color={colors.primary} />,
          description: 'Excel in classroom and conference presentations'
        }
      ]
    },
    {
      id: 'experience',
      title: 'What\'s your speaking experience?',
      subtitle: 'This helps us adjust the coaching difficulty',
      options: [
        {
          id: 'beginner',
          label: 'Beginner',
          icon: <Target size={24} color={colors.success} />,
          description: 'New to public speaking or very nervous'
        },
        {
          id: 'intermediate',
          label: 'Intermediate',
          icon: <Target size={24} color={colors.warning} />,
          description: 'Some experience, looking to improve'
        },
        {
          id: 'advanced',
          label: 'Advanced',
          icon: <Target size={24} color={colors.error} />,
          description: 'Experienced speaker seeking refinement'
        }
      ]
    },
    {
      id: 'focus-areas',
      title: 'What would you like to focus on?',
      subtitle: 'Select areas where you want the most improvement',
      options: [
        {
          id: 'confidence',
          label: 'Building Confidence',
          icon: <CheckCircle size={24} color={colors.primary} />,
          description: 'Overcome nervousness and speak with assurance'
        },
        {
          id: 'clarity',
          label: 'Speech Clarity',
          icon: <Mic size={24} color={colors.primary} />,
          description: 'Improve articulation and pronunciation'
        },
        {
          id: 'body-language',
          label: 'Body Language',
          icon: <Video size={24} color={colors.primary} />,
          description: 'Master gestures and non-verbal communication'
        },
        {
          id: 'engagement',
          label: 'Audience Engagement',
          icon: <Users size={24} color={colors.primary} />,
          description: 'Connect better with your audience'
        }
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleOptionSelect = (optionId: string) => {
    const stepId = currentStepData.id;
    const currentSelections = selections[stepId] || [];
    
    if (stepId === 'experience') {
      // Single selection for experience level
      setSelections(prev => ({
        ...prev,
        [stepId]: [optionId]
      }));
    } else {
      // Multiple selections for other steps
      if (currentSelections.includes(optionId)) {
        setSelections(prev => ({
          ...prev,
          [stepId]: currentSelections.filter(id => id !== optionId)
        }));
      } else {
        setSelections(prev => ({
          ...prev,
          [stepId]: [...currentSelections, optionId]
        }));
      }
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      // Complete onboarding
      const onboardingData = {
        goals: selections.goals || [],
        experience: selections.experience?.[0] || '',
        focusAreas: selections['focus-areas'] || [],
      };

      console.log('Onboarding completed:', onboardingData);
      const response = await completeOnboarding(onboardingData);
      console.log('Onboarding response:', response);
      if (response.success) {
        console.log('Onboarding successful, navigating to home');
        // router.push('/home');
      } else {
        console.error('Onboarding failed:', response.error);
        // Handle error (e.g., show alert)
      }
      return;
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    const stepSelections = selections[currentStepData.id] || [];
    return stepSelections.length > 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '05', colors.secondary + '03']}
        style={styles.backgroundGradient}
      />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index <= currentStep ? colors.primary : colors.gray[300],
                  width: index <= currentStep ? 32 : 8,
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepIndicator, { color: colors.gray[600] }]}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentStepData.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.gray[600] }]}>
            {currentStepData.subtitle}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentStepData.options.map((option) => {
            const isSelected = (selections[currentStepData.id] || []).includes(option.id);
            
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: colors.gray[100],
                    borderColor: isSelected ? colors.primary : colors.gray[200],
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIcon, { backgroundColor: isSelected ? colors.primary + '20' : colors.gray[200] }]}>
                    {option.icon}
                  </View>
                  {isSelected && (
                    <CheckCircle size={20} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.optionDescription, { color: colors.gray[600] }]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed() ? colors.primary : colors.gray[300],
              opacity: isLoading ? 0.7 : 1,
            }
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: canProceed() ? '#fff' : colors.gray[500] }]}>
            {isLoading ? 'Setting up...' : isLastStep ? 'Get Started' : 'Continue'}
          </Text>
          {!isLoading && (
            <ArrowRight size={20} color={canProceed() ? '#fff' : colors.gray[500]} style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});