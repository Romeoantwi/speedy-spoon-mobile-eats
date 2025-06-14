
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: ''
  });

  // Secret admin codes - in production, these should be env variables
  const VALID_ADMIN_CODES = ['SPEEDYSPOON_ADMIN_2024', 'RESTAURANT_OWNER_2024'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate admin code first
      if (!VALID_ADMIN_CODES.includes(formData.adminCode)) {
        throw new Error('Invalid admin access code');
      }

      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Update user profile to admin type
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            user_type: 'admin',
            full_name: data.user.user_metadata?.full_name || formData.email.split('@')[0]
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        toast({
          title: "Admin Access Granted! 🔐",
          description: "Welcome to the restaurant management dashboard",
        });

        // Redirect to restaurant dashboard
        navigate('/restaurant-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Access Denied",
        description: error.message || "Invalid credentials or admin code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!VALID_ADMIN_CODES.includes(formData.adminCode)) {
      toast({
        title: "Invalid Admin Code",
        description: "Please enter a valid admin access code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.email.split('@')[0],
            user_type: 'admin'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Admin Account Created! 🎉",
        description: "Please check your email to verify your account",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in as admin
  if (user) {
    navigate('/restaurant-dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border-red-600/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">
            Restaurant Admin Access
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Restricted access for restaurant owners only
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="adminCode" className="text-gray-300">Admin Access Code</Label>
              <Input
                id="adminCode"
                type="password"
                value={formData.adminCode}
                onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                placeholder="Enter admin access code"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@restaurant.com"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold"
                disabled={loading}
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Authenticating...' : 'Admin Login'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={handleSignUp}
                disabled={loading}
              >
                Create Admin Account
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <p className="text-xs text-red-300 text-center">
              <Shield className="w-3 h-3 inline mr-1" />
              Authorized personnel only. This area is restricted to restaurant owners and administrators.
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back to Customer Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
