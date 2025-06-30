import React from 'react';
import { View, Image, Text, StyleSheet, useColorScheme } from 'react-native'; // Added Text
import Colors from '@/constants/Colors';

interface AICoachProps {
  cue?: string; // Optional cue message
}

export default function AICoach({ cue }: AICoachProps) { // Destructure cue from props
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.gray[100] }]}>
        <Image
          source={{ uri: 'https://www.socialinsider.io/blog/content/images/2024/05/social-media-metrics-article-cover.webp?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={styles.icon}
        />
        <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
      </View>
      <View style={[styles.pulseRing, { borderColor: colors.primary, opacity: cue ? 0.8 : 0.5, transform: [{ scale: cue ? 1.05 : 1}] }]} />
      {/*
        // Alternative: Display cue directly on/near avatar if the overlay in SessionScreen is not preferred
        cue && (
          <View style={[styles.cueBubble, { backgroundColor: colors.primary }]}>
            <Text style={styles.cueText}>{cue}</Text>
          </View>
        )
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 2px 3px rgba(0,0,0,0.1)',
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff', // Or colors.background for theme consistency
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60, // Should be half of width/height for a circle
    borderWidth: 2,
    // opacity: 0.5, // Now dynamically set
    // Added transition for smoother effect (requires reanimated or Animated API for true animation)
  },
  // Optional style for cue bubble if displayed within AICoach component
  /*
  cueBubble: {
    position: 'absolute',
    bottom: -20, // Adjust as needed
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: '150%',
  },
  cueText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  */
});