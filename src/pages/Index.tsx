
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Clock, 
  MapPin, 
  CreditCard,
  Star,
  Zap,
  Heart
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent blur-3xl -z-10"></div>
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/f00a84b9-d2a8-4c94-99a5-09f87a39e9ee.png" 
              alt="SpeedySpoon Logo" 
              className="h-32 w-auto"
            />
          </div>
          <p className="text-3xl md:text-4xl font-bold text-red-400 mb-6 uppercase tracking-wider">
            Get Your Feast No Sweat
          </p>
          <p className="text-xl md:text-2xl text-gray-300 mb-6 max-w-3xl mx-auto">
            Premium Food Delivery Platform
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-3 bg-red-600/20 text-red-400 border-red-600/30">
            <Zap className="w-5 h-5 mr-2" />
            Next-Gen Multi-User System
          </Badge>
        </div>

        {/* Quick Access Card - Customer Only */}
        <div className="flex justify-center mb-16">
          <Card className="group hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-900 to-black border-red-600/30 hover:border-red-500 relative overflow-hidden max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Link to="/customer" className="relative z-10">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-600/50 transition-all duration-300">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-red-400 text-xl">Order Food</CardTitle>
                <CardDescription className="text-gray-400">Browse premium menu & place orders instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold">
                  Start Ordering
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black/50 border border-red-600/20 hover:border-red-500/40 transition-colors duration-300">
            <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-white text-lg mb-2">Real-time Tracking</h3>
            <p className="text-gray-400">Live order updates with GPS tracking</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black/50 border border-red-600/20 hover:border-red-500/40 transition-colors duration-300">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-white text-lg mb-2">Global Delivery</h3>
            <p className="text-gray-400">Available in major cities worldwide</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black/50 border border-red-600/20 hover:border-red-500/40 transition-colors duration-300">
            <CreditCard className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-white text-lg mb-2">Secure Payments</h3>
            <p className="text-gray-400">Multiple payment methods supported</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-gradient-to-br from-gray-900/50 to-black/50 border border-red-600/20 hover:border-red-500/40 transition-colors duration-300">
            <Star className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-white text-lg mb-2">Premium Service</h3>
            <p className="text-gray-400">5-star rated delivery experience</p>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <Card className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white border-none shadow-2xl shadow-red-600/25">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center">
              <Heart className="w-8 h-8 mr-3" />
              Quick Setup Guide
            </CardTitle>
            <CardDescription className="text-red-100 text-lg">
              Get started in 3 simple steps and join thousands of satisfied customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h4 className="font-bold mb-2 text-lg">Create Account</h4>
                <p className="text-red-100">Sign up as customer</p>
              </div>
              <div className="group">
                <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h4 className="font-bold mb-2 text-lg">Complete Profile</h4>
                <p className="text-red-100">Verify your identity and set preferences</p>
              </div>
              <div className="group">
                <div className="bg-white/20 backdrop-blur rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-bold mb-2 text-lg">Start Enjoying</h4>
                <p className="text-red-100">Order delicious food</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
