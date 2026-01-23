"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { verifyUser, findUserById, createOrUpdateUserFromGoogle } from '@/lib/data-supabase';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check for Supabase session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User logged in with Google
          const googleUser = await createOrUpdateUserFromGoogle(session.user);
          if (googleUser) {
            setUser(googleUser);
            return;
          }
        }
        
        // Fallback to manual login check
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const googleUser = await createOrUpdateUserFromGoogle(session.user);
        if (googleUser) {
          setUser(googleUser);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        sessionStorage.removeItem('userId');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
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
