import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session with robust error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            // Only clear user on auth errors, not network errors
            if (error.message?.includes('Auth') || error.message?.includes('JWT')) {
              setUser(null);
            }
          } else {
            setUser(session?.user ?? null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Enhanced auth state change handling with session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.id);
          
          // Handle different auth events with better session persistence
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setUser(session?.user ?? null);
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
          } else if (event === 'USER_UPDATED') {
            // Maintain session on user updates
            setUser(session?.user ?? null);
            setLoading(false);
          } else if (event === 'PASSWORD_RECOVERY') {
            // Handle password recovery without signing out
            console.log('Password recovery initiated');
          }
          
          // Additional resilience for local development
          if (!session && event !== 'SIGNED_OUT') {
            // Try to recover session if it exists in storage
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (storedSession) {
              console.log('Attempting session recovery...');
              try {
                await supabase.auth.getSession();
              } catch (error) {
                console.log('Session recovery failed:', error);
              }
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
