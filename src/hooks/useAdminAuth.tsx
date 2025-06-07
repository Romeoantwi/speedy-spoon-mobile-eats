
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminContextType {
  isAdmin: boolean;
  adminRole: string | null;
  permissions: any;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  adminRole: null,
  permissions: {},
  loading: true,
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      if (!user) {
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setPermissions({});
          setLoading(false);
        }
        return;
      }

      try {
        // Check if user has admin role in profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .eq('user_type', 'admin')
          .single();

        if (mounted) {
          if (error) {
            console.log('User is not an admin:', error.message);
            setIsAdmin(false);
            setAdminRole(null);
            setPermissions({});
          } else if (data) {
            setIsAdmin(true);
            setAdminRole('admin');
            setPermissions({
              manage_orders: true,
              view_analytics: true,
              manage_menu: true,
              manage_users: true,
              manage_drivers: true
            });
          } else {
            setIsAdmin(false);
            setAdminRole(null);
            setPermissions({});
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (mounted) {
          setIsAdmin(false);
          setAdminRole(null);
          setPermissions({});
          setLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, adminRole, permissions, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminProvider');
  }
  return context;
};
