import React, { useState } from 'react';
import { ScrollView, RefreshControl, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  style?: any;
  contentContainerStyle?: any;
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  style,
  contentContainerStyle 
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}