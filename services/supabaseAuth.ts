import { supabase } from './supabase';
import { AuthError, User, Session } from '@supabase/supabase-js';

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

class SupabaseAuthService {
  // Sign up new user
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      console.log('🔐 Supabase signup attempt for:', userData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
      }

      return {
        success: true,
        user: data.user ?? undefined,
        session: data.session ?? undefined,
      };
    } catch (error) {
      console.error('💥 Signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  // Sign in existing user
  async signIn(credentials: SignInData): Promise<AuthResponse> {
    try {
      console.log('🔐 Supabase signin attempt for:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ Supabase signin error:', error);
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      console.log('✅ User signed in successfully:', data.user?.id);
      return {
        success: true,
        user: data.user,
        session: data.session ?? undefined,
      };
    } catch (error) {
      console.error('💥 Signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  // Sign out user
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Signout error:', error);
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 Signout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔑 Password reset request for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'confidencecoach://reset-password',
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      console.log('✅ Password reset email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 Password reset error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Get session error:', error);
        return {
          session: null,
          error: this.formatAuthError(error),
        };
      }

      return { session: data.session };
    } catch (error) {
      console.error('💥 Get session error:', error);
      return {
        session: null,
        error: error instanceof Error ? error.message : 'Failed to get session',
      };
    }
  }

  // Get current user
  async getUser(): Promise<{ user: User | null; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Get user error:', error);
        return {
          user: null,
          error: this.formatAuthError(error),
        };
      }

      return { user: data.user };
    } catch (error) {
      console.error('💥 Get user error:', error);
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Format auth errors for user display
  private formatAuthError(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password';
      case 'Email not confirmed':
        return 'Please check your email and confirm your account';
      case 'User already registered':
        return 'An account with this email already exists';
      case 'Password should be at least 6 characters':
        return 'Password must be at least 6 characters long';
      case 'Invalid email':
        return 'Please enter a valid email address';
      case 'Signup requires a valid password':
        return 'Please enter a valid password';
      default:
        return error.message || 'An error occurred';
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;