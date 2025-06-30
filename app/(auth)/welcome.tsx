import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Sparkles, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    router.push('/(auth)/signup');
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '10', colors.secondary + '05']}
        style={styles.backgroundGradient}
      />
      
      <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoBackground, { backgroundColor: colors.primary }]}>
              <Sparkles size={32} color="#fff" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Confidence Coach
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.gray[600] }]}>
            Master your public speaking with AI-powered coaching and real-time feedback
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.heroImage}
          />
          <View style={[styles.imageOverlay, { backgroundColor: colors.primary + '20' }]} />
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.success + '20' }]}>
              <Text style={styles.featureEmoji}>🎯</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Real-time confidence tracking
            </Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
              <Text style={styles.featureEmoji}>🧠</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>
              AI-powered coaching insights
            </Text>
          </View>
          
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={styles.featureEmoji}>📈</Text>
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>
              Progress tracking & reports
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.gray[300] }]}
          onPress={handleSignIn}
          activeOpacity={0.8}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
            Already have an account? Sign In
          </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuresContainer: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});