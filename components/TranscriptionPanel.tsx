import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface TranscriptionSegment {
  id: string;
  text: string;
  isFinal: boolean;
  timestamp: number; // Could be used for styling or ordering
}

interface TranscriptionPanelProps {
  lines: TranscriptionSegment[];
}

export default function TranscriptionPanel({ lines }: TranscriptionPanelProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when new lines are added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [lines]);

  if (lines.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.gray[500] }}>Waiting for transcription...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.gray[100] }]}>
      <Text style={[styles.title, { color: colors.text }]}>Live Transcription</Text>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, index) => (
          <Text
            key={line.id || index} // Use line.id if available and unique
            style={[
              styles.lineText,
              { color: line.isFinal ? colors.text : colors.gray[500] }, // Dim non-finalized text
              line.text.toLowerCase().includes("um") || line.text.toLowerCase().includes("uh") ? styles.fillerWord : {}
            ]}
          >
            {line.text}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.gray[200], // Static border color or use themed
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 10, // Ensure last line is not cut off
  },
  lineText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  fillerWord: {
    fontStyle: 'italic',
    backgroundColor: Colors.light.warning + '33', // Light warning background for filler words
  }
});