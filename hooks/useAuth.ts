import { useState, useEffect, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabaseAuthService, { SignUpData, SignInData } from '@/services/supabaseAuth';
import supabaseProfileService, { UserProfile } from '@/services/supabaseProfile';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    isInitialized: false,
  });

  const initializationRef = useRef(false);

  // Update state helper
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      console.log('🔄 Auth state updated:', {
        isAuthenticated: newState.isAuthenticated,
        hasUser: !!newState.user,
        hasProfile: !!newState.profile,
        onboardingCompleted: newState.profile?.onboarding_completed,
        isInitialized: newState.isInitialized,
      });
      return newState;
    });
  }, []);

  // Initialize auth state - only called when explicitly needed
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) {
      console.log('🔄 Auth already initializing...');
      return;
    }

    initializationRef.current = true;
    console.log('🔄 Initializing auth...');

    try {
      updateState({ isLoading: true, error: null });

      // Get current session
      const { session, error: sessionError } = await supabaseAuthService.getSession();
      
      if (sessionError) {
        console.log('❌ Session error:', sessionError);
        updateState({ 
          isLoading: false, 
          error: sessionError,
          isAuthenticated: false,
          isInitialized: true,
        });
        return;
      }

      if (session?.user) {
        console.log('✅ User session found:', session.user.id);
        
        // Get user profile
        const { profile, error: profileError } = await supabaseProfileService.getProfile(session.user.id);
        
        if (profileError) {
          console.warn('⚠️ Failed to load profile:', profileError);
        }

        updateState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          isInitialized: true,
        });
      } else {
        console.log('👋 No user session found');
        updateState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('💥 Auth initialization failed:', error);
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        isAuthenticated: false,
        isInitialized: true,
      });
    } finally {
      initializationRef.current = false;
    }
  }, [updateState]);

  // Sign up
  const signup = useCallback(async (userData: SignUpData) => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await supabaseAuthService.signUp(userData);
      
      if (response.success && response.user) {
        updateState({
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'Signup failed',
        });
        return { success: false, error: response.error || 'Signup failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  // Sign in
  const login = useCallback(async (credentials: SignInData) => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await supabaseAuthService.signIn(credentials);
      
      if (response.success && response.user) {
        console.log('🔐 Login successful, loading profile...');
        
        // Get user profile
        const { profile } = await supabaseProfileService.getProfile(response.user.id);
        
        updateState({
          user: response.user,
          profile,
          session: response.session,
          isLoading: false,
          isAuthenticated: true,
          error: null,
          isInitialized: true, // Mark as initialized after successful login
        });

        return { success: true };
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'Login failed',
        });
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  // Sign out
  const logout = useCallback(async () => {
    try {
      await supabaseAuthService.signOut();
      
      updateState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        isInitialized: false, // Reset initialization state
      });
      
      // Reset initialization ref
      initializationRef.current = false;
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      updateState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        isInitialized: false,
      });
      initializationRef.current = false;
    }
  }, [updateState]);

  // Update user profile
  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) return { success: false, error: 'No user logged in' };

      updateState({ isLoading: true, error: null });

      const { profile, error } = await supabaseProfileService.updateProfile(state.user.id, updates);
      
      if (profile) {
        updateState({
          profile,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        updateState({
          isLoading: false,
          error: error || 'Update failed',
        });
        return { success: false, error: error || 'Update failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.user, updateState]);

  // Complete onboarding
  const completeOnboarding = useCallback(async (onboardingData: any) => {
    try {
      if (!state.user) return { success: false, error: 'No user logged in' };

      updateState({ isLoading: true, error: null });

      const response = await supabaseProfileService.completeOnboarding(state.user.id, onboardingData);
      
      if (response.success) {
        // Refresh profile
        const { profile } = await supabaseProfileService.getProfile(state.user.id);
        
        updateState({
          profile,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } else {
        updateState({
          isLoading: false,
          error: response.error || 'Onboarding failed',
        });
        return { success: false, error: response.error || 'Onboarding failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Onboarding failed';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.user, updateState]);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await supabaseAuthService.resetPassword(email);
      updateState({ isLoading: false });

      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Failed to send reset email' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      updateState({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [updateState]);

  // Update user stats after session
  const updateUserStats = useCallback(async (sessionData: {
    duration: number;
    averageConfidence: number;
    peakConfidence: number;
    improvementFromPrevious: number;
  }) => {
    try {
      if (!state.user || !state.profile) return { success: false, error: 'No user logged in' };

      const currentStats = state.profile.stats || {
        sessionsCompleted: 0,
        currentStreak: 0,
        bestScore: 0,
        totalTime: 0,
        averageConfidence: 0,
        improvementRate: 0,
      };

      const newStats = {
        ...currentStats,
        sessionsCompleted: currentStats.sessionsCompleted + 1,
        totalTime: currentStats.totalTime + sessionData.duration,
        lastSessionDate: new Date().toISOString(),
        bestScore: Math.max(currentStats.bestScore, sessionData.peakConfidence),
        averageConfidence: Math.round(
          (currentStats.averageConfidence * currentStats.sessionsCompleted + sessionData.averageConfidence) /
          (currentStats.sessionsCompleted + 1)
        ),
        improvementRate: sessionData.improvementFromPrevious,
      };

      // Update streak
      const lastSession = currentStats.lastSessionDate ? new Date(currentStats.lastSessionDate) : null;
      const today = new Date();
      const daysDiff = lastSession ? Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysDiff <= 1) {
        newStats.currentStreak = currentStats.currentStreak + 1;
      } else {
        newStats.currentStreak = 1; // Reset streak
      }

      return await supabaseProfileService.updateStats(state.user.id, newStats);
    } catch (error) {
      console.error('Failed to update user stats:', error);
      return { success: false, error: 'Failed to update stats' };
    }
  }, [state.user, state.profile]);

  // Listen to auth state changes (only after initialization)
  useEffect(() => {
    if (!state.isInitialized) return;

    const { data: { subscription } } = supabaseAuthService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_OUT' || !session) {
          updateState({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } else if (event === 'SIGNED_IN' && session.user) {
          const { profile } = await supabaseProfileService.getProfile(session.user.id);
          updateState({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [state.isInitialized, updateState]);

  return {
    // State
    ...state,
    
    // Actions
    initializeAuth, // Explicit initialization
    login,
    signup,
    logout,
    updateUser,
    completeOnboarding,
    forgotPassword,
    updateUserStats,
    
    // Computed values
    isFreePlan: state.profile?.subscription_plan === 'free',
    canStartSession: (state.profile?.ai_coach_time_remaining || 0) > 0,
    hasProFeatures: state.profile?.subscription_plan !== 'free',
    
    // User display data
    user: {
      id: state.user?.id || '',
      firstName: state.profile?.first_name || '',
      lastName: state.profile?.last_name || '',
      email: state.profile?.email || '',
      image: state.profile?.image_url,
      preferences: state.profile?.preferences || {},
      stats: state.profile?.stats,
      subscription: {
        plan: state.profile?.subscription_plan || 'free',
        aiCoachTimeRemaining: state.profile?.ai_coach_time_remaining || 0,
        elevenlabsTimeRemaining: state.profile?.elevenlabs_time_remaining || 0,
        sessionsRemaining: state.profile?.sessions_remaining || 0,
      },
    }
  };
}