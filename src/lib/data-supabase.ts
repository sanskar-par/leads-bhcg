import { Lead, User, LeaderboardEntry } from './types';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// --- User Functions ---
export const findUserById = async (id: string): Promise<User | undefined> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', id)
    .single();
  
  if (error || !data) return undefined;
  return { id: data.id, name: data.name, avatarUrl: '' };
};

// Get all users at once (optimized for bulk fetching)
export const getAllUsers = async (): Promise<{ [id: string]: User }> => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', userId)
    .single();

  if (existingUser) {
    // User exists, return it
    return { id: existingUser.id, name: existingUser.name, avatarUrl };
  }

  // Create new user (without password since they use Google OAuth)
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      name: userName,
      password: null, // NULL password for Google users
    })
    .select('id, name')
    .single();

  if (error || !newUser) {
    console.error('Error creating user from Google:', error);
    return undefined;
  }

  return { id: newUser.id, name: newUser.name, avatarUrl };
};

// --- Lead Functions ---
export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('added_at', { ascending: false });
  
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
  }));
};

export const getLeadsByUser = async (userId: string): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('added_by', userId)
    .order('added_at', { ascending: false });
  
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
  }));
};

// Normalize LinkedIn URL by removing trailing slashes, query params, and converting to lowercase
const normalizeLinkedInUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash and query parameters/fragments
    return `${urlObj.origin}${urlObj.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    // If URL parsing fails, just remove trailing slash and lowercase
    return url.replace(/\/$/, '').toLowerCase();
  }
};

export const checkDuplicateLead = async (linkedinUrl?: string, email?: string): Promise<Lead | null> => {
  if (!linkedinUrl && !email) return null;

  // Normalize inputs
  const normalizedInputUrl = linkedinUrl ? normalizeLinkedInUrl(linkedinUrl) : '';
  const normalizedInputEmail = email ? email.toLowerCase().trim() : '';

  // Use database query instead of fetching all leads
  // Check LinkedIn URL first
  if (normalizedInputUrl) {
    const { data: urlMatches } = await supabase
      .from('leads')
      .select('*')
      .ilike('linkedin_url', `%${normalizedInputUrl.split('://')[1]}%`)
      .limit(10); // Get max 10 potential matches
    
    if (urlMatches && urlMatches.length > 0) {
      // Check exact match after normalization
      const exactMatch = urlMatches.find(lead => 
        normalizeLinkedInUrl(lead.linkedin_url) === normalizedInputUrl
      );
      
      if (exactMatch) {
        return {
          id: exactMatch.id,
          linkedinUrl: exactMatch.linkedin_url,
          name: exactMatch.name,
          latestCompany: exactMatch.latest_company,
          industry: exactMatch.industry,
          roleType: exactMatch.role_type,
          email: exactMatch.email,
          alternateEmail: exactMatch.alternate_email || undefined,
          phoneNumber: exactMatch.phone_number || undefined,
          isBitsian: exactMatch.is_bitsian,
          remarks: exactMatch.remarks || undefined,
          addedBy: exactMatch.added_by,
          addedAt: new Date(exactMatch.added_at),
        };
      }
    }
  }

  // Check email
  if (normalizedInputEmail) {
    const { data: emailMatch } = await supabase
      .from('leads')
      .select('*')
      .ilike('email', normalizedInputEmail)
      .limit(1)
      .single();
    
    if (emailMatch) {
      return {
        id: emailMatch.id,
        linkedinUrl: emailMatch.linkedin_url,
        name: emailMatch.name,
        latestCompany: emailMatch.latest_company,
        industry: emailMatch.industry,
        roleType: emailMatch.role_type,
        email: emailMatch.email,
        alternateEmail: emailMatch.alternate_email || undefined,
        phoneNumber: emailMatch.phone_number || undefined,
        isBitsian: emailMatch.is_bitsian,
        remarks: emailMatch.remarks || undefined,
        addedBy: emailMatch.added_by,
        addedAt: new Date(emailMatch.added_at),
      };
    }
  }

  return null;
};

export const addLead = async (leadData: Omit<Lead, 'id' | 'addedAt'>): Promise<Lead | null> => {
  const { data, error } = await supabase
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
    console.error('Error adding lead:', error);
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
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name');
  
  if (usersError || !users) return [];
  
  // Get lead counts per user
  const { data: leadCounts, error: countsError } = await supabase
    .from('leads')
    .select('added_by');
  
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
