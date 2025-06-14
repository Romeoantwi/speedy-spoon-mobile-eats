
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
      // First, try to upsert the profile to ensure it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          user_type: 'admin',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User'
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        throw new Error('Failed to create/update profile: ' + profileError.message);
      }

      toast({
        title: "Admin Account Created! 🎉",
        description: "You now have admin access to the restaurant dashboard",
      });

      // Redirect to restaurant dashboard with a small delay
      setTimeout(() => {
        window.location.href = '/restaurant-dashboard';
      }, 1000);

    } catch (error: any) {
      console.error('Admin setup error:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Admin Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please sign in first to set up admin access.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto">
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

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
