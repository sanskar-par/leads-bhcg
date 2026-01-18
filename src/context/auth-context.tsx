"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { verifyUser, findUserById } from '@/lib/data-supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
          const foundUser = await findUserById(storedUserId);
          if (foundUser) {
            setUser(foundUser);
          } else {
             sessionStorage.removeItem('userId');
          }
        }
      } catch (error) {
        console.error("Failed to check user session", error);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (userId: string, pass: string): Promise<boolean> => {
    setLoading(true);
    const foundUser = await verifyUser(userId, pass);
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('userId', foundUser.id);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
