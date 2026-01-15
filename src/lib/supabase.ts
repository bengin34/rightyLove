import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

// Environment variables - replace with your Supabase project credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Custom storage adapter for Supabase auth using MMKV
const supabaseStorage = {
  getItem: (key: string): string | null => {
    return storage.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    storage.set(key, value);
  },
  removeItem: (key: string): void => {
    storage.delete(key);
  },
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (generated from Supabase schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      couples: {
        Row: {
          id: string;
          member_a: string;
          member_b: string | null;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_a: string;
          member_b?: string | null;
          invite_code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_a?: string;
          member_b?: string | null;
          invite_code?: string;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          text: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          tags?: string[];
          created_at?: string;
        };
      };
      daily_prompts: {
        Row: {
          id: string;
          couple_id: string;
          date_key: string;
          question_id: string;
          created_at: string;
          unlocked_at: string | null;
        };
        Insert: {
          id?: string;
          couple_id: string;
          date_key: string;
          question_id: string;
          created_at?: string;
          unlocked_at?: string | null;
        };
        Update: {
          id?: string;
          couple_id?: string;
          date_key?: string;
          question_id?: string;
          created_at?: string;
          unlocked_at?: string | null;
        };
      };
      answers: {
        Row: {
          id: string;
          couple_id: string;
          date_key: string;
          user_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          date_key: string;
          user_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          date_key?: string;
          user_id?: string;
          text?: string;
          created_at?: string;
        };
      };
    };
  };
};
