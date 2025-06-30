import { useEffect, useRef, useCallback } from 'react';
import { router, useSegments } from 'expo-router';
// import { useAuth } from './useAuth';
import { useAuth } from '@/contexts/AuthContext';

export function useAppNavigation() {
  const { user, profile, isAuthenticated, isInitialized, initializeAuth } = useAuth();
  const segments = useSegments();
  const navigationRef = useRef<{
    lastNavigation: string;
    isNavigating: boolean;
    hasInitializedAuth: boolean;
    lastAuthState: string;
    navigationTimeout: ReturnType<typeof setTimeout> | null;
  }>({
    lastNavigation: '',
    isNavigating: false,
    hasInitializedAuth: false,
    lastAuthState: '',
    navigationTimeout: null,
  });

  const navigate = useCallback((path: string, force: boolean = false) => {
    // Clear any pending navigation
    if (navigationRef.current.navigationTimeout) {
      clearTimeout(navigationRef.current.navigationTimeout);
      navigationRef.current.navigationTimeout = null;
    }

    // Prevent duplicate navigation
    if (!force && navigationRef.current.lastNavigation === path) {
      console.log(`🚫 Skipping duplicate navigation to: ${path}`);
      return;
    }

    // Prevent navigation loops
    if (navigationRef.current.isNavigating) {
      console.log(`🔄 Navigation in progress, queuing: ${path}`);
      // Queue the navigation
      navigationRef.current.navigationTimeout = setTimeout(() => {
        navigate(path, force);
      }, 100);
      return;
    }

    navigationRef.current.isNavigating = true;
    navigationRef.current.lastNavigation = path;

    console.log(`🧭 Navigating to: ${path}`);
    
    try {
      router.replace(path as any);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    } finally {
      // Reset navigation flag after a short delay
      setTimeout(() => {
        navigationRef.current.isNavigating = false;
      }, 200);
    }
  }, []);

  // Check if user is trying to access protected routes
  const checkAuthRequired = useCallback(() => {
    const currentPath = segments.join('/');
    const isInAuthFlow = segments[0] === '(auth)';
    const isInMainApp = segments[0] === '(tabs)' || segments[0] === '(lesson)';

    console.log(`🔍 Route check - Current: ${currentPath}, Auth: ${isInAuthFlow}, Main: ${isInMainApp}`);

    // If user is trying to access main app, initialize auth
    if (isInMainApp && !navigationRef.current.hasInitializedAuth) {
      console.log('🔐 Protected route accessed, initializing auth...');
      navigationRef.current.hasInitializedAuth = true;
      initializeAuth();
      return;
    }

    // If user is in auth flow, don't initialize auth automatically
    if (isInAuthFlow) {
      console.log('🔓 In auth flow, skipping auto-initialization');
      return;
    }

    // For root path, don't auto-initialize
    if (currentPath === '' || currentPath === 'index') {
      console.log('🏠 At root, showing welcome screen');
      navigate('/(auth)/welcome');
      return;
    }
  }, [segments, initializeAuth, navigate]);

  // Handle navigation based on auth state (only after explicit initialization)
  const handleAuthStateNavigation = useCallback(() => {
    console.log(`🔄 Checking auth state navigation:`, {
      isInitialized,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed,
      currentSegments: segments,
    });

    if (!isInitialized) {
      console.log('⏳ Auth not initialized yet, waiting...');
      return;
    }

    const currentPath = segments.join('/');
    const isInAuthFlow = segments[0] === '(auth)';
    
    // Create a state signature to detect changes
    const authStateSignature = `${isAuthenticated}-${!!user}-${!!profile}-${profile?.onboarding_completed}-${currentPath}`;
    
    // Only process if auth state actually changed
    if (navigationRef.current.lastAuthState === authStateSignature) {
      console.log('🔄 Auth state unchanged, skipping navigation');
      return;
    }
    
    navigationRef.current.lastAuthState = authStateSignature;
    
    console.log(`✨ Processing auth state change:`, {
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed,
      currentPath,
      isInAuthFlow
    });
    
    if (!isAuthenticated || !user || user.id === '' ) {
      // User is not authenticated
      console.log('🚫 User not authenticated, redirecting to welcome');
      if (!isInAuthFlow) {
        navigate('/(auth)/welcome');
      }
      return;
    }

    // User is authenticated
    if (!profile) {
      // Profile not loaded yet, stay where we are
      console.log('⏳ Profile loading, waiting...');
      return;
    }

    // Check if user needs onboarding
    if (!profile.onboarding_completed) {
      console.log('🎯 User needs onboarding, current path:', currentPath);
      if (currentPath !== '(auth)/onboarding') {
        console.log('🧭 Navigating to onboarding from:', currentPath);
        navigate('/(auth)/onboarding', true); // Force navigation
      } else {
        console.log('✅ Already on onboarding page');
      }
      return;
    }

    // User is fully set up - go to main app
    if (isInAuthFlow) {
      console.log('✅ User fully authenticated, navigating to main app...');
      navigate('/(tabs)', true); // Force navigation
    } else {
      console.log('✅ User already in main app');
    }
  }, [isInitialized, isAuthenticated, user, profile, segments, navigate]);

  // Check auth requirements on route changes
  useEffect(() => {
    checkAuthRequired();
  }, [checkAuthRequired]);

  // Handle navigation when auth state changes
  useEffect(() => {
    // Add a small delay to ensure state is fully updated
    const timeout = setTimeout(() => {
      handleAuthStateNavigation();
    }, 50);

    return () => clearTimeout(timeout);
  }, [handleAuthStateNavigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationRef.current.navigationTimeout) {
        clearTimeout(navigationRef.current.navigationTimeout);
      }
    };
  }, []);

  return {
    navigate,
    currentSegments: segments,
    isInAuthFlow: segments[0] === '(auth)',
    isInMainApp: segments[0] === '(tabs)' || segments[0] === '(lesson)',
  };
}