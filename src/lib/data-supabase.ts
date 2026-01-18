import { Lead, User, LeaderboardEntry } from './types';
import { supabase } from './supabase';

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
