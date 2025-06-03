
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DriverSignup = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ghanaCardNumber: '',
    vehicleType: '',
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement Supabase authentication and data storage
    console.log('Driver signup data:', formData);
    
    toast({
      title: "Registration Submitted! 🚗",
      description: "Your driver application is being reviewed. We'll contact you within 24 hours.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Become a SpeedySpoon Driver
          </CardTitle>
          <p className="text-gray-600">Join our delivery team and start earning</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <Label htmlFor="ghanaCard" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Ghana Card Number
              </Label>
              <Input
                id="ghanaCard"
                value={formData.ghanaCardNumber}
                onChange={(e) => handleInputChange('ghanaCardNumber', e.target.value)}
                placeholder="GHA-XXXXXXXXX-X"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Ghana Card details are encrypted and secure
              </p>
            </div>

            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <select
                id="vehicleType"
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              >
                <option value="">Select vehicle type</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div>
              <Label htmlFor="licenseNumber">Driver's License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter license number"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
            >
              Submit Application
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverSignup;
