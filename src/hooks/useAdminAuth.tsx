
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AdminUser } from '@/types/order';

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
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions({});
      setLoading(false);
      return;
    }

    try {
      // Direct query to admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('User is not an admin:', error.message);
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions({});
      } else if (data) {
        setIsAdmin(true);
        setAdminRole(data.role);
        setPermissions(data.permissions || {});
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions({});
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

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
