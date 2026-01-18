export type User = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type Lead = {
  id: string;
  linkedinUrl: string;
  name: string;
  latestCompany: string;
  industry: string;
  roleType: string;
  email: string;
  alternateEmail?: string;
  phoneNumber?: string;
  isBitsian: boolean;
  remarks?: string;
  addedBy: string; // User ID
  addedAt: Date;
};

export type LeaderboardEntry = {
  user: User;
  leadCount: number;
};
