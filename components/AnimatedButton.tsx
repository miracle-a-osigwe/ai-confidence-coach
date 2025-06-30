import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
  scaleValue?: number;
}

export default function AnimatedButton({ 
  children, 
  onPress, 
  style, 
  disabled = false,
  scaleValue = 0.95 
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={style}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}