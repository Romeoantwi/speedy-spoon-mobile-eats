
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Truck, 
  Users, 
  Clock, 
  MapPin, 
  CreditCard
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            SpeedySpoon 🍽️
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Ghana's Premier Food Delivery Platform
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Multi-User Restaurant Management System
          </Badge>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/customer">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-600">Order Food</CardTitle>
                <CardDescription>Browse menu & place orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Start Ordering
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/driver-signup">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">Become a Driver</CardTitle>
                <CardDescription>Join our delivery team</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Sign Up as Driver
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin-setup">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Restaurant Admin</CardTitle>
                <CardDescription>Manage your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Admin Dashboard
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-4">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Real-time Tracking</h3>
            <p className="text-sm text-gray-600">Live order updates</p>
          </div>
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Ghana Locations</h3>
            <p className="text-sm text-gray-600">Accra, Kumasi & more</p>
          </div>
          <div className="text-center p-4">
            <CreditCard className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Mobile Money</h3>
            <p className="text-sm text-gray-600">MTN, AirtelTigo, Telecel</p>
          </div>
          <div className="text-center p-4">
            <ShoppingCart className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold">Easy Ordering</h3>
            <p className="text-sm text-gray-600">Simple & fast</p>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Setup Guide</CardTitle>
            <CardDescription className="text-orange-100">
              Get started in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-1">Create Account</h4>
                <p className="text-sm text-orange-100">Sign up as customer, driver, or admin</p>
              </div>
              <div>
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-1">Set Up Role</h4>
                <p className="text-sm text-orange-100">Complete your profile and verification</p>
              </div>
              <div>
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-1">Start Using</h4>
                <p className="text-sm text-orange-100">Order food, deliver, or manage restaurant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
