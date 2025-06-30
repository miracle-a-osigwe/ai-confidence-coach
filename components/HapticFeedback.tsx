import { Platform } from 'react-native';

export const HapticFeedback = {
  light: () => {
    if (Platform.OS !== 'web') {
      // For native platforms, you would use Expo Haptics
      // import * as Haptics from 'expo-haptics';
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Web fallback - subtle visual feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  },

  medium: () => {
    if (Platform.OS !== 'web') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  },

  heavy: () => {
    if (Platform.OS !== 'web') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 10, 30]);
      }
    }
  },

  success: () => {
    if (Platform.OS !== 'web') {
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 25, 50]);
      }
    }
  },

  error: () => {
    if (Platform.OS !== 'web') {
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
  },
};