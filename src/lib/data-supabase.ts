import { Lead, User, LeaderboardEntry } from './types';
import { supabase, createDataClient } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Create a dedicated client for data operations to avoid auth conflicts
const dataClient = createDataClient();

// --- User Functions ---
export const findUserById = async (id: string): Promise<User | undefined> => {
  const { data, error } = await dataClient
    .from('users')
    .select('id, name')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return { id: data.id, name: data.name, avatarUrl: '' };
};

// Get all users at once (optimized for bulk fetching)
export const getAllUsers = async (): Promise<{ [id: string]: User }> => {
  const { data, error } = await dataClient
    .from('users')
    .select('id, name');
  
  if (error || !data) return {};
  
  const userMap: { [id: string]: User } = {};
  data.forEach(user => {
    userMap[user.id] = { id: user.id, name: user.name, avatarUrl: '' };
  });
  
  return userMap;
};

export const verifyUser = async (id: string, pass: string): Promise<User | undefined> => {
  const { data, error } = await dataClient
    .from('users')
    .select('id, name, password')
    .eq('id', id)
    .eq('password', pass)
    .single();
  
  if (error || !data) return undefined;
  return { id: data.id, name: data.name, avatarUrl: '' };
};

// Create or update user from Google OAuth
export const createOrUpdateUserFromGoogle = async (supabaseUser: SupabaseUser): Promise<User | undefined> => {
  const userId = supabaseUser.email?.split('@')[0] || supabaseUser.id.substring(0, 8);
  const userName = supabaseUser.user_metadata?.full_name || supabaseUser.email || 'Google User';
  const avatarUrl = supabaseUser.user_metadata?.avatar_url || '';

  console.log('Creating/updating Google user:', { userId, userName, email: supabaseUser.email });

  // Use upsert to create or update user atomically
  const { data: user, error } = await dataClient
    .from('users')
    .upsert({
      id: userId,
      name: userName,
      password: null, // NULL password for Google users
    }, {
      onConflict: 'id',
      ignoreDuplicates: false, // Update if exists
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('Error creating/updating user from Google:', {
      error,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorCode: error?.code,
      userId,
      userName,
      email: supabaseUser.email,
    });
    return undefined;
  }

  if (!user) {
    console.error('No user returned from upsert operation');
    return undefined;
  }

  console.log('Successfully created/updated Google user:', user);
  return { id: user.id, name: user.name, avatarUrl, email: supabaseUser.email };
};

// --- Lead Functions ---
export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await dataClient
    .from('leads')
    .select('*')
    .order('added_at', { ascending: false })
    .limit(50000);
  
  if (error || !data) return [];
  
  return data.map(lead => ({
    id: lead.id,
    linkedinUrl: lead.linkedin_url,
    name: lead.name,
    latestCompany: lead.latest_company,
    industry: lead.industry,
    roleType: lead.role_type,
    email: lead.email,
    alternateEmail: lead.alternate_email || undefined,
    phoneNumber: lead.phone_number || undefined,
    isBitsian: lead.is_bitsian,
    remarks: lead.remarks || undefined,
    addedBy: lead.added_by,
    addedAt: new Date(lead.added_at),
    status: lead.status as 'not_mailed' | 'mailed' | 'failed' | undefined,
    statusUpdatedAt: lead.status_updated_at ? new Date(lead.status_updated_at) : undefined,
  }));
};

export const getLeadsByUser = async (userId: string): Promise<Lead[]> => {
  const { data, error } = await dataClient
    .from('leads')
    .select('*')
    .eq('added_by', userId)
    .order('added_at', { ascending: false })
    .limit(50000);
  
  if (error || !data) return [];
  
  return data.map(lead => ({
    id: lead.id,
    linkedinUrl: lead.linkedin_url,
    name: lead.name,
    latestCompany: lead.latest_company,
    industry: lead.industry,
    roleType: lead.role_type,
    email: lead.email,
    alternateEmail: lead.alternate_email || undefined,
    phoneNumber: lead.phone_number || undefined,
    isBitsian: lead.is_bitsian,
    remarks: lead.remarks || undefined,
    addedBy: lead.added_by,
    addedAt: new Date(lead.added_at),
    status: lead.status as 'not_mailed' | 'mailed' | 'failed' | undefined,
    statusUpdatedAt: lead.status_updated_at ? new Date(lead.status_updated_at) : undefined,
  }));
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'addedAt'>): Promise<Lead | null> => {
  console.log('Adding lead:', { addedBy: leadData.addedBy, name: leadData.name });
  
  const { data, error } = await dataClient
    .from('leads')
    .insert({
      linkedin_url: leadData.linkedinUrl,
      name: leadData.name,
      latest_company: leadData.latestCompany,
      industry: leadData.industry,
      role_type: leadData.roleType,
      email: leadData.email,
      alternate_email: leadData.alternateEmail || null,
      phone_number: leadData.phoneNumber || null,
      is_bitsian: leadData.isBitsian,
      remarks: leadData.remarks || null,
      added_by: leadData.addedBy,
    })
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error adding lead:', {
      error,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorCode: error?.code,
      leadData: { name: leadData.name, addedBy: leadData.addedBy }
    });
    return null;
  }
  
  return {
    id: data.id,
    linkedinUrl: data.linkedin_url,
    name: data.name,
    latestCompany: data.latest_company,
    industry: data.industry,
    roleType: data.role_type,
    email: data.email,
    alternateEmail: data.alternate_email || undefined,
    phoneNumber: data.phone_number || undefined,
    isBitsian: data.is_bitsian,
    remarks: data.remarks || undefined,
    addedBy: data.added_by,
    addedAt: new Date(data.added_at),
  };
};

// --- Leaderboard Function ---
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  // Get all users
  const { data: users, error: usersError } = await dataClient
    .from('users')
    .select('id, name');
  
  if (usersError || !users) return [];
  
  // Get lead counts per user
  const { data: leadCounts, error: countsError } = await dataClient
    .from('leads')
    .select('added_by')
    .limit(50000);
  
  if (countsError || !leadCounts) return [];
  
  // Count leads per user
  const counts: { [key: string]: number } = leadCounts.reduce((acc, lead) => {
    acc[lead.added_by] = (acc[lead.added_by] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  // Create leaderboard
  const leaderboard: LeaderboardEntry[] = users.map(user => ({
    user: { id: user.id, name: user.name, avatarUrl: '' },
    leadCount: counts[user.id] || 0,
  }));
  
  return leaderboard.sort((a, b) => b.leadCount - a.leadCount);
};

// --- Form Data ---
export const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Retail", 
  "Consulting", "E-commerce", "Media", "Telecommunications", "Real Estate", "Other"
];

export const roleTypes = [
  "Management", "HR", "Talent Acquisition", "CEO", "CTO", "CFO", "COO",
  "Director", "VP", "Senior Management", "Middle Management", 
  "Recruitment", "Operations", "Sales", "Marketing", "Engineering", "Product", "Other"
];
