
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Key } from 'lucide-react';

const AdminSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);

  // Secret admin key for initial setup
  const ADMIN_SETUP_KEY = 'SPEEDYSPOON_ADMIN_2024';

  const createAdmin = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an admin account",
        variant: "destructive"
      });
      return;
    }

    if (adminKey !== ADMIN_SETUP_KEY) {
      toast({
        title: "Invalid Admin Key",
        description: "The admin setup key is incorrect",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Use RPC call to create admin user
      const { error } = await supabase.rpc('create_admin_user', {
        admin_user_id: user.id,
        admin_role: 'super_admin',
        admin_restaurant_id: 'speedyspoon-main',
        admin_permissions: {
          manage_orders: true,
          view_analytics: true,
          manage_menu: true,
          manage_users: true,
          manage_drivers: true
        }
      });

      if (error) throw error;

      toast({
        title: "Admin Account Created! 🎉",
        description: "You now have super admin access to the restaurant dashboard",
      });

      // Redirect to restaurant dashboard
      window.location.href = '/restaurant-dashboard';
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Admin Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please sign in first to set up admin access.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-orange-600" />
          Restaurant Admin Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Admin Setup Key</label>
          <Input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin setup key"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Contact system administrator for the setup key
          </p>
        </div>
        
        <Button
          onClick={createAdmin}
          disabled={loading || !adminKey}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <Key className="w-4 h-4 mr-2" />
          {loading ? 'Creating Admin...' : 'Create Admin Account'}
        </Button>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Setup Key:</strong> SPEEDYSPOON_ADMIN_2024<br />
          <em>For demonstration purposes only</em>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
