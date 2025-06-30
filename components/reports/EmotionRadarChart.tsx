import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface EmotionRadarChartProps {
  data: {
    confidence: number;
    clarity: number;
    engagement: number;
    enthusiasm: number;
    authenticity: number;
  };
  colors: any;
}

export default function EmotionRadarChart({ data, colors }: EmotionRadarChartProps) {
  const chartData = {
    labels: ['Confidence', 'Clarity', 'Engagement', 'Enthusiasm', 'Authenticity'],
    datasets: [
      {
        data: [
          data.confidence,
          data.clarity,
          data.engagement,
          data.enthusiasm,
          data.authenticity
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width * 0.4}
        height={180}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          style: {
            borderRadius: 16,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});