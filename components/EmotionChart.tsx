import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Smile, Frown, Meh, Zap, ShieldAlert, Brain } from 'lucide-react-native'; // Added more icons

interface EmotionChartProps {
  data: { // Expects data in the format: { confidence: number, nervousness: number, ... }
    confidence?: number;
    nervousness?: number;
    joy?: number;
    anxiety?: number;
    clarity?: number;
    engagement?: number;
    // Add other emotions as needed
  };
}

// Helper to select an icon based on emotion name and value
const getEmotionIcon = (name: string, value: number, colors: any) => {
  const defaultColor = colors.text;
  const positiveColor = colors.success;
  const negativeColor = colors.error;
  const neutralColor = colors.warning;

  switch (name.toLowerCase()) {
    case 'confidence': return <Smile size={16} color={value >= 70 ? positiveColor : (value >=40 ? neutralColor : negativeColor)} />;
    case 'nervousness': return <Frown size={16} color={value >= 60 ? negativeColor : (value >=30 ? neutralColor : positiveColor)} />; // Lower is better
    case 'joy': return <Smile size={16} color={value >= 60 ? positiveColor : neutralColor} />;
    case 'anxiety': return <ShieldAlert size={16} color={value >= 50 ? negativeColor : (value >= 25 ? neutralColor : positiveColor)} />; // Lower is better
    case 'clarity': return <Brain size={16} color={value >= 70 ? positiveColor : neutralColor} />;
    case 'engagement': return <Zap size={16} color={value >= 70 ? positiveColor : neutralColor} />;
    default: return <Meh size={16} color={defaultColor} />;
  }
};

export default function EmotionChart({ data }: EmotionChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Transform data object into an array for mapping, filtering out undefined/null values
  const emotions = Object.entries(data)
    .filter(([_, value]) => typeof value === 'number')
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize name
      value: value as number,
    }));

  if (emotions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.title, { color: colors.text, marginBottom: 0 }]}>Waiting for data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.gray[100] }]}>
      <Text style={[styles.title, { color: colors.text }]}>Live Emotions</Text>
      
      {emotions.map((emotion, index) => {
        const barWidth = `${Math.max(0, Math.min(100, emotion.value))}%`; // Ensure value is between 0 and 100
        const Icon = getEmotionIcon(emotion.name, emotion.value, colors);
        
        let barColor = colors.primary; // Default bar color
        if (emotion.name.toLowerCase() === 'confidence' || emotion.name.toLowerCase() === 'joy' || emotion.name.toLowerCase() === 'clarity' || emotion.name.toLowerCase() === 'engagement') {
            barColor = emotion.value >= 70 ? colors.success : emotion.value >= 40 ? colors.warning : colors.error;
        } else if (emotion.name.toLowerCase() === 'nervousness' || emotion.name.toLowerCase() === 'anxiety') {
            // For nervousness/anxiety, lower is better, so colors are inverted
            barColor = emotion.value >= 60 ? colors.error : emotion.value >= 30 ? colors.warning : colors.success;
        }
        
        return (
          <View key={index} style={styles.emotionRow}>
            <View style={styles.emotionHeader}>
              {Icon}
              <Text style={[styles.emotionName, { color: colors.text }]}>
                {emotion.name}
              </Text>
            </View>
            
            <View style={[styles.barContainer, { backgroundColor: colors.gray[200] }]}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    width: `${Math.max(0, Math.min(100, emotion.value))}%`,
                    backgroundColor: barColor
                  }
                ]} 
              />
            </View>
            
            <Text style={[styles.value, { color: colors.text }]}>
              {emotion.value.toFixed(0)}% 
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, // Reduced padding for more items
    borderRadius: 12,
  },
  title: {
    fontSize: 14, // Reduced size
    fontWeight: '600',
    marginBottom: 8, // Reduced margin
    textAlign: 'center',
  },
  emotionRow: {
    marginBottom: 6, // Reduced margin
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emotionName: {
    fontSize: 12, // Reduced size
    marginLeft: 4,
    flexShrink: 1, // Allow text to shrink if needed
  },
  barContainer: {
    height: 6, // Reduced height
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 2,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  value: {
    fontSize: 10, // Reduced size
    textAlign: 'right',
    fontWeight: '500',
  },
});