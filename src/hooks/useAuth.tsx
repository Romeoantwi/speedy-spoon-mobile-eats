import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout;

    // Get initial session with robust error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error);
            // Only clear user on auth errors, not network errors
            if (error.message?.includes('Auth') || error.message?.includes('JWT') || error.message?.includes('expired')) {
              setUser(null);
              setSession(null);
            }
          } else {
            setSession(session);
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

    // Periodic session validation to prevent timeouts
    const validateSession = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message?.includes('expired')) {
          console.log('Session expired, attempting refresh...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshedSession && mounted) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          } else if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else if (session && mounted) {
          setSession(session);
          setUser(session.user);
        }
      } catch (error) {
        console.log('Session validation error:', error);
      }
    };

    getInitialSession();

    // Validate session every 5 minutes to prevent timeouts
    sessionCheckInterval = setInterval(validateSession, 5 * 60 * 1000);

    // Enhanced auth state change handling with session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('Auth state changed:', event, session?.user?.id);
          
          // Handle different auth events with better session persistence
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            setLoading(false);
          } else if (event === 'USER_UPDATED') {
            // Maintain session on user updates
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          } else if (event === 'PASSWORD_RECOVERY') {
            // Handle password recovery without signing out
            console.log('Password recovery initiated');
          }
          
          // Additional resilience for local development and session recovery
          if (!session && event !== 'SIGNED_OUT' && event !== 'PASSWORD_RECOVERY') {
            // Try to recover session if it exists in storage
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (storedSession) {
              console.log('Attempting session recovery...');
              try {
                const { data: { session: recoveredSession } } = await supabase.auth.getSession();
                if (recoveredSession && mounted) {
                  setSession(recoveredSession);
                  setUser(recoveredSession.user);
                }
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
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Clear local state immediately
      setSession(null);
      setUser(null);
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Ensure complete cleanup
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
