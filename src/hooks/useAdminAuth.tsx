
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
      // Use RPC call to check admin status since the table might not be in types yet
      const { data, error } = await supabase.rpc('check_admin_status', { 
        user_id: user.id 
      });

      if (error) {
        console.log('User is not an admin or function not found');
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions({});
      } else if (data && data.length > 0) {
        const adminData = data[0];
        setIsAdmin(true);
        setAdminRole(adminData.role);
        setPermissions(adminData.permissions || {});
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
