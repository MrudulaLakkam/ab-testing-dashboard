'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { User } from './types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for now
const MOCK_USER: User = {
  id: 'demo-user',
  email: 'demo@example.com',
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auth is disabled for now
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('Sign up disabled for now');
  };

  const signIn = async (email: string, password: string) => {
    console.log('Sign in disabled for now');
  };

  const signOut = async () => {
    console.log('Sign out disabled for now');
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
