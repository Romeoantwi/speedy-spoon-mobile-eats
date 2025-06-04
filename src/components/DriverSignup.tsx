
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Shield, User, Upload, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureUpload from './ProfilePictureUpload';
import LocationMap from './LocationMap';

const DriverSignup = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [profilePicture, setProfilePicture] = useState('');
  const [ghanaCardFile, setGhanaCardFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ghanaCardNumber: '',
    vehicleType: '',
    vehicleModel: '',
    vehiclePlateNumber: '',
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

    if (!location) {
      toast({
        title: "Location Required",
        description: "Please select your current location on the map.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            user_type: 'driver'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // 2. Upload Ghana Card if provided
      let ghanaCardUrl = '';
      if (ghanaCardFile) {
        const fileExt = ghanaCardFile.name.split('.').pop();
        const fileName = `${authData.user.id}/ghana_card.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, ghanaCardFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);
          ghanaCardUrl = data.publicUrl;
        }
      }

      // 3. Update profile
      await supabase
        .from('profiles')
        .update({
          avatar_url: profilePicture,
          phone_number: formData.phone,
          user_type: 'driver',
          ghana_card_number: formData.ghanaCardNumber
        })
        .eq('id', authData.user.id);

      // 4. Create driver profile
      await supabase
        .from('driver_profiles')
        .insert({
          user_id: authData.user.id,
          license_number: formData.licenseNumber,
          vehicle_type: formData.vehicleType,
          vehicle_model: formData.vehicleModel,
          vehicle_plate_number: formData.vehiclePlateNumber,
          current_latitude: location.lat,
          current_longitude: location.lng
        });

      toast({
        title: "Registration Successful! 🚗",
        description: "Your driver application has been submitted. Please check your email to verify your account.",
      });

      // Reset form
      setCurrentStep(1);
      setFormData({
        fullName: '', email: '', phone: '', ghanaCardNumber: '',
        vehicleType: '', vehicleModel: '', vehiclePlateNumber: '',
        licenseNumber: '', password: '', confirmPassword: ''
      });
      setProfilePicture('');
      setGhanaCardFile(null);
      setLocation(null);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create driver account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleGhanaCardUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file for your Ghana Card.",
          variant: "destructive"
        });
        return;
      }
      setGhanaCardFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Become a SpeedySpoon Driver
          </CardTitle>
          <p className="text-gray-600">Step {currentStep} of 3</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                
                <div className="flex justify-center mb-6">
                  <ProfilePictureUpload 
                    currentAvatarUrl={profilePicture}
                    onAvatarUpdate={setProfilePicture}
                    size="lg"
                  />
                </div>

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
                    placeholder="0XX XXX XXXX"
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
                </div>

                <div>
                  <Label htmlFor="ghanaCardFile" className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Ghana Card Photo (Optional)
                  </Label>
                  <input
                    id="ghanaCardFile"
                    type="file"
                    accept="image/*"
                    onChange={handleGhanaCardUpload}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  {ghanaCardFile && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {ghanaCardFile.name} selected
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>

                <div>
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <select
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                  <Label htmlFor="vehicleModel">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="e.g., Honda CB125, Toyota Corolla"
                  />
                </div>

                <div>
                  <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
                  <Input
                    id="vehiclePlateNumber"
                    value={formData.vehiclePlateNumber}
                    onChange={(e) => handleInputChange('vehiclePlateNumber', e.target.value)}
                    placeholder="GS-XXXX-XX"
                  />
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Location & Security</h3>

                <div>
                  <Label className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    Current Location
                  </Label>
                  <LocationMap
                    onLocationSelect={setLocation}
                    height="300px"
                  />
                  {location && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Location selected: {location.address}
                    </p>
                  )}
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
              </div>
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} className="bg-orange-500 hover:bg-orange-600">
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6"
                >
                  Submit Application
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverSignup;
