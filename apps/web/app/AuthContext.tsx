'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from './types/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || '',
        });
        router.push('/');
      } else {
        setUser(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || '',
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    router.push('/');
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
