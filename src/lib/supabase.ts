import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

// Create a browser-based client for auth operations using SSR package
// This stores PKCE verifier in cookies so it's accessible to server-side callback
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Create a separate client for data operations that bypasses auth state
// This prevents auth conflicts between multiple browser sessions
export const createDataClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist sessions for data operations
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          password: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          password: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          password?: string;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          linkedin_url: string;
          name: string;
          latest_company: string;
          industry: string;
          role_type: string;
          email: string;
          alternate_email: string | null;
          phone_number: string | null;
          is_bitsian: boolean;
          remarks: string | null;
          added_by: string;
          added_at: string;
          status: string | null;
          status_updated_at: string | null;
        };
        Insert: {
          id?: string;
          linkedin_url: string;
          name: string;
          latest_company: string;
          industry: string;
          role_type: string;
          email: string;
          alternate_email?: string | null;
          phone_number?: string | null;
          is_bitsian?: boolean;
          remarks?: string | null;
          added_by: string;
          added_at?: string;
          status?: string | null;
          status_updated_at?: string | null;
        };
        Update: {
          id?: string;
          linkedin_url?: string;
          name?: string;
          latest_company?: string;
          industry?: string;
          role_type?: string;
          email?: string;
          alternate_email?: string | null;
          phone_number?: string | null;
          is_bitsian?: boolean;
          remarks?: string | null;
          added_by?: string;
          added_at?: string;
          status?: string | null;
          status_updated_at?: string | null;
        };
          email?: string;
          alternate_email?: string | null;
          phone_number?: string | null;
          is_bitsian?: boolean;
          remarks?: string | null;
          added_by?: string;
          added_at?: string;
        };
      };
    };
  };

