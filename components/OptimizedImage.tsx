import React, { useState, useCallback } from 'react';
import { Image, View, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface OptimizedImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({ 
  source, 
  style, 
  placeholder,
  onLoad,
  onError 
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLoad = useCallback(() => {
    setLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    onError?.();
  }, [onError]);

  if (error) {
    return (
      <View style={[styles.container, style, { backgroundColor: colors.gray[200] }]}>
        <View style={styles.errorPlaceholder}>
          {placeholder || <View style={[styles.defaultPlaceholder, { backgroundColor: colors.gray[300] }]} />}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[StyleSheet.absoluteFill, style]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer, { backgroundColor: colors.gray[100] }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultPlaceholder: {
    width: '60%',
    height: '60%',
    borderRadius: 8,
  },
});