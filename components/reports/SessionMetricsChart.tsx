import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export default function SessionMetricsChart({ colors }: { colors: any }) {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [65, 68, 70, 72, 75, 72, 78],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisSuffix="%"
        yAxisLabel="Days"
        verticalLabelRotation={30}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          labelColor: (opacity = 1) => colors.text,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});