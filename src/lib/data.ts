import { Lead, User, LeaderboardEntry } from './types';
import { PlaceHolderImages } from './placeholder-images';

// In-memory store
let users: (User & { password: string })[] = [
  { id: 'user1', name: 'Alex Johnson', password: 'password123', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '' },
  { id: 'user2', name: 'Maria Garcia', password: 'password123', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '' },
  { id: 'user3', name: 'Chen Wei', password: 'password123', avatarUrl: PlaceHolderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '' },
];

let leads: Lead[] = [
  { id: 'lead1', linkedinUrl: 'https://www.linkedin.com/in/johndoe', name: 'John Doe', latestCompany: 'TechCorp', industry: 'Technology', roleType: 'Management', email: 'john.d@techcorp.com', isBitsian: true, addedBy: 'user1', addedAt: new Date('2024-05-20T10:00:00Z') },
  { id: 'lead2', linkedinUrl: 'https://www.linkedin.com/in/janesmith', name: 'Jane Smith', latestCompany: 'Innovate LLC', industry: 'Healthcare', roleType: 'Senior Management', email: 'jane.s@innovate.com', isBitsian: false, addedBy: 'user1', addedAt: new Date('2024-05-21T11:30:00Z') },
  { id: 'lead3', linkedinUrl: 'https://www.linkedin.com/in/peterjones', name: 'Peter Jones', latestCompany: 'DataSys', industry: 'Finance', roleType: 'Engineering', email: 'peter.j@datasys.com', isBitsian: true, addedBy: 'user2', addedAt: new Date('2024-05-22T14:00:00Z') },
];

// --- User Functions ---
export const findUserById = (id: string): User | undefined => {
  const user = users.find(u => u.id === id)
  if (!user) return undefined
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const verifyUser = (id: string, pass: string): User | undefined => {
    const user = users.find(u => u.id === id && u.password === pass);
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// --- Lead Functions ---
export const getLeads = (): Lead[] => {
  return [...leads].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
};

export const getLeadsByUser = (userId: string): Lead[] => {
  return leads.filter(l => l.addedBy === userId).sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
};

export const addLead = (leadData: Omit<Lead, 'id' | 'addedAt'>): Lead => {
  const newLead: Lead = {
    ...leadData,
    id: `lead${Date.now()}`,
    addedAt: new Date(),
  };
  leads.unshift(newLead);
  return newLead;
};

// --- Leaderboard Function ---
export const getLeaderboard = (): LeaderboardEntry[] => {
  const leadCounts: { [key: string]: number } = leads.reduce((acc, lead) => {
    acc[lead.addedBy] = (acc[lead.addedBy] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const leaderboard: LeaderboardEntry[] = users.map(user => ({
    user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
    leadCount: leadCounts[user.id] || 0,
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
