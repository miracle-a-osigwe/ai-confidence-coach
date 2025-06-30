import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Zap, Battery, Thermometer, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface DevicePerformanceIndicatorProps {
  deviceCapabilities: any;
  batteryLevel: number;
  thermalState: string;
  isOptimized: boolean;
}

export default function DevicePerformanceIndicator({
  deviceCapabilities,
  batteryLevel,
  thermalState,
  isOptimized,
}: DevicePerformanceIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!deviceCapabilities) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'high': return colors.success;
      case 'mid': return colors.warning;
      case 'low': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return colors.success;
    if (level > 20) return colors.warning;
    return colors.error;
  };

  const getThermalColor = (state: string) => {
    switch (state) {
      case 'normal': return colors.success;
      case 'warm': return colors.warning;
      case 'hot': return colors.error;
      default: return colors.gray[500];
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.gray[100] }]}>
      <Text style={[styles.title, { color: colors.text }]}>Device Performance</Text>
      
      <View style={styles.metricsContainer}>
        {/* Device Tier */}
        <View style={styles.metric}>
          <Smartphone size={16} color={getTierColor(deviceCapabilities.tier)} />
          <Text style={[styles.metricLabel, { color: colors.text }]}>
            {deviceCapabilities.tier.toUpperCase()}
          </Text>
          <Text style={[styles.metricValue, { color: colors.gray[600] }]}>
            {deviceCapabilities.maxFrameRate} FPS
          </Text>
        </View>

        {/* GPU Status */}
        <View style={styles.metric}>
          <Zap size={16} color={deviceCapabilities.useGPU ? colors.primary : colors.gray[400]} />
          <Text style={[styles.metricLabel, { color: colors.text }]}>
            {deviceCapabilities.useGPU ? 'GPU' : 'CPU'}
          </Text>
          <Text style={[styles.metricValue, { color: colors.gray[600] }]}>
            {deviceCapabilities.useGPU ? 'Accelerated' : 'Optimized'}
          </Text>
        </View>

        {/* Battery */}
        <View style={styles.metric}>
          <Battery size={16} color={getBatteryColor(batteryLevel)} />
          <Text style={[styles.metricLabel, { color: colors.text }]}>
            BATTERY
          </Text>
          <Text style={[styles.metricValue, { color: colors.gray[600] }]}>
            {Math.round(batteryLevel)}%
          </Text>
        </View>

        {/* Thermal */}
        <View style={styles.metric}>
          <Thermometer size={16} color={getThermalColor(thermalState)} />
          <Text style={[styles.metricLabel, { color: colors.text }]}>
            THERMAL
          </Text>
          <Text style={[styles.metricValue, { color: colors.gray[600] }]}>
            {thermalState.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Optimization Status */}
      {isOptimized && (
        <View style={[styles.optimizationBanner, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.optimizationText, { color: colors.warning }]}>
            ⚡ Power saving mode active
          </Text>
        </View>
      )}

      {/* Features Status */}
      <View style={styles.featuresContainer}>
        <Text style={[styles.featuresTitle, { color: colors.text }]}>Active Features:</Text>
        <Text style={[styles.featuresText, { color: colors.gray[600] }]}>
          {deviceCapabilities.enabledFeatures.join(', ')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  metricValue: {
    fontSize: 9,
    marginTop: 2,
  },
  optimizationBanner: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  optimizationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  featuresText: {
    fontSize: 10,
    textAlign: 'center',
  },
});