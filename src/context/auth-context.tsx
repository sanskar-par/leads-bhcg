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
    let mounted = true;
    
    const checkUser = async () => {
      try {
        console.log('Checking user session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Session:', session ? 'Found' : 'Not found');
        
        if (session?.user) {
          console.log('Creating/updating user from session:', session.user.email);
          const googleUser = await createOrUpdateUserFromGoogle(session.user);
          if (mounted) {
            if (googleUser) {
              console.log('User loaded successfully:', googleUser.id);
              setUser(googleUser);
            } else {
              console.error("Failed to create/update user from Google session");
            }
            setLoading(false);
            return;
          }
        }
        
        // Fallback to manual login check
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId && mounted) {
          console.log('Checking manual login for:', storedUserId);
          const foundUser = await findUserById(storedUserId);
          if (mounted) {
            if (foundUser) {
              setUser(foundUser);
            } else {
              sessionStorage.removeItem('userId');
            }
          }
        }
      } catch (error) {
        console.error("Failed to check user session", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_IN' && session?.user) {
        const googleUser = await createOrUpdateUserFromGoogle(session.user);
        if (mounted && googleUser) {
          setUser(googleUser);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          sessionStorage.removeItem('userId');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed, updating user');
        const googleUser = await createOrUpdateUserFromGoogle(session.user);
        if (mounted && googleUser) {
          setUser(googleUser);
        }
      }
    });

    return () => {
      mounted = false;
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
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear all auth-related storage
      sessionStorage.removeItem('userId');
      localStorage.removeItem('bhcg-leads-auth');
      
      // Clear all localStorage keys that start with 'sb-'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      setUser(null);
      console.log('Logout complete, redirecting to login');
      router.push('/login');
    } catch (error) {
      console.error('Logout exception:', error);
      setUser(null);
      sessionStorage.removeItem('userId');
      router.push('/login');
    }
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
