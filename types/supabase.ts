export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          image_url: string | null;
          onboarding_completed: boolean;
          preferences: Json;
          subscription_plan: string;
          ai_coach_time_remaining: number;
          elevenlabs_time_remaining: number;
          stats: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          image_url?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json;
          subscription_plan?: string;
          ai_coach_time_remaining?: number;
          elevenlabs_time_remaining?: number;
          stats?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          image_url?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json;
          subscription_plan?: string;
          ai_coach_time_remaining?: number;
          elevenlabs_time_remaining?: number;
          stats?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];