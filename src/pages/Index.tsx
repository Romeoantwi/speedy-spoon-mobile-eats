
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, UtensilsCrossed, Clock, Star, MapPin, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-orange-500 text-white p-2 rounded-lg">
                <span className="text-xl font-bold">SS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">SpeedySpoon</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Welcome to <span className="text-orange-600">SpeedySpoon</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Ghana's premier food delivery platform. Fast, fresh, and delicious Ghanaian cuisine delivered right to your doorstep with world-class service.
          </p>
          
          {/* User Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UtensilsCrossed className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">I'm Hungry!</CardTitle>
                <p className="text-gray-600">Order delicious Ghanaian food</p>
              </CardHeader>
              <CardContent>
                <Link to="/customer">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg">
                    Order Food
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Deliver & Earn</CardTitle>
                <p className="text-gray-600">Join our driver community</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/driver-dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                    Driver Dashboard
                  </Button>
                </Link>
                <Link to="/driver-signup">
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    Become a Driver
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose SpeedySpoon?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Average delivery time of 25 minutes</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Top Quality</h3>
              <p className="text-gray-600">Authentic Ghanaian cuisine from trusted restaurants</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">Track your order from kitchen to doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
              <p className="text-gray-600">Ghana Card verification for all drivers</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-orange-600 mb-2">50,000+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">1,200+</h3>
              <p className="text-gray-600">Verified Drivers</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">25 min</h3>
              <p className="text-gray-600">Average Delivery Time</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
