import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Platform, Dimensions } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  // Set default web viewport size
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set default viewport meta tag for consistent sizing
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }

      // Set default container size for web
      const setWebContainerSize = () => {
        const body = document.body;
        const html = document.documentElement;
        
        // Set default dimensions (you can customize these)
        const defaultWidth = 454;
        const defaultHeight = 896;

        // Only apply if screen is larger than mobile size
        if (window.innerWidth > defaultWidth) {
          body.style.width = `${defaultWidth}px`;
          body.style.height = `${defaultHeight}px`;
          body.style.margin = '0 auto';
          body.style.border = '1px solid #e0e0e0';
          body.style.borderRadius = '20px';
          body.style.overflow = 'hidden';
          body.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
          body.style.marginTop = '20px';
          body.style.marginBottom = '20px';
          
          // Set background for the page
          html.style.backgroundColor = '#f5f5f5';
          html.style.padding = '0';
          html.style.margin = '0';
        } else {
          // Reset styles for mobile
          body.style.width = '100%';
          body.style.height = '100vh';
          body.style.margin = '0';
          body.style.border = 'none';
          body.style.borderRadius = '0';
          body.style.boxShadow = 'none';
          html.style.backgroundColor = 'white';
        }
      };

      // Apply on load
      setWebContainerSize();
      
      // Apply on resize
      window.addEventListener('resize', setWebContainerSize);
      
      return () => {
        window.removeEventListener('resize', setWebContainerSize);
      };
    }
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(lesson)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ErrorBoundary>
    </AuthProvider>
  );
}