import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        };
      };
    };
  };
};
