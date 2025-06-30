import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  onboarding_completed: boolean;
  preferences: {
    goals?: string[];
    experience?: string;
    focusAreas?: string[];
    notifications?: boolean;
    darkMode?: boolean;
    sound?: boolean;
  };
  subscription_plan: 'free' | 'pro_tier_1' | 'pro_tier_2' | 'pro_tier_3' | 'premium';
  ai_coach_time_remaining: number;
  elevenlabs_time_remaining: number;
  sessions_remaining: number;
  stats?: {
    sessionsCompleted: number;
    currentStreak: number;
    bestScore: number;
    totalTime: number;
    lastSessionDate?: string;
    averageConfidence: number;
    improvementRate: number;
  };
  created_at: string;
  updated_at: string;
}

class SupabaseProfileService {
  // Get user profile
  async getProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      if (error) {
        console.error('❌ Profile fetch error:', error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
          console.log('📝 Profile not found, creating new profile...');
          return await this.createProfile(userId);
        }
        
        return {
          profile: null,
          error: error.message,
        };
      }

      if (!data) {
        console.log('📝 No profile found, creating new profile...');
        return await this.createProfile(userId);
      }

      console.log('✅ Profile loaded successfully');
      return { profile: data };
    } catch (error) {
      console.error('💥 Profile service error:', error);
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Failed to get profile',
      };
    }
  }

  // Create a new user profile
  private async createProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
      // Get user info from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          profile: null,
          error: 'User not found',
        };
      }

      const newProfile = {
        id: userId,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        email: user.email || '',
        onboarding_completed: false,
        preferences: {
          notifications: true,
          darkMode: false,
          sound: true,
        },
        subscription_plan: 'free',
        ai_coach_time_remaining: 30,
        elevenlabs_time_remaining: 30,
        sessions_remaining: 60,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create profile:', error);
        return {
          profile: null,
          error: error.message,
        };
      }

      console.log('✅ Profile created successfully');
      return { profile: data };
    } catch (error) {
      console.error('💥 Create profile error:', error);
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Failed to create profile',
      };
    }
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          profile: null,
          error: error.message,
        };
      }

      return { profile: data };
    } catch (error) {
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  // Complete onboarding
  async completeOnboarding(
    userId: string,
    onboardingData: {
      goals: string[];
      experience: string;
      focusAreas: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          preferences: {
            goals: onboardingData.goals,
            experience: onboardingData.experience,
            focusAreas: onboardingData.focusAreas,
            notifications: true,
            darkMode: false,
            sound: true,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
      };
    }
  }

  // Update user stats
  async updateStats(
    userId: string,
    stats: Partial<UserProfile['stats']>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current profile to merge stats
      const { profile } = await this.getProfile(userId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const updatedStats = {
        ...profile.stats,
        ...stats,
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({
          stats: updatedStats,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update stats',
      };
    }
  }

  // Update time remaining for AI features
  async updateTimeRemaining(
    userId: string,
    updates: {
      ai_coach_time_remaining?: number;
      elevenlabs_time_remaining?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update time remaining',
      };
    }
  }

  // Upload avatar image
  async uploadAvatar(userId: string, imageUri: string): Promise<{ imageUrl: string | null; error?: string }> {
    try {
      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return {
          imageUrl: null,
          error: error.message,
        };
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new image URL
      await this.updateProfile(userId, {
        image_url: publicUrlData.publicUrl,
      });

      return { imageUrl: publicUrlData.publicUrl };
    } catch (error) {
      return {
        imageUrl: null,
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
      };
    }
  }

  // Subscribe to profile changes
  subscribeToProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    return supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as UserProfile);
        }
      )
      .subscribe();
  }
}

export const supabaseProfileService = new SupabaseProfileService();
export default supabaseProfileService;