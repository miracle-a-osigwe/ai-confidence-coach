import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export default function LessonLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Initialize navigation management
  useAppNavigation();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}