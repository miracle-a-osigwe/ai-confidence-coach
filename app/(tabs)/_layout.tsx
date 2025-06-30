import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Home, Video, BarChart2, User, BookOpen } from 'lucide-react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Initialize navigation management
  useAppNavigation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          height: 62,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          headerTitle: 'Confidence Coach',
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          headerTitle: 'Lessons',
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => <Video size={24} color={color} />,
          headerTitle: 'Practice Session',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
          headerTitle: 'Your Reports',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          headerTitle: 'Your Profile',
        }}
      />
    </Tabs>
  );
}