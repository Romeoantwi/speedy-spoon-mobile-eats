
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Users, Store, Clock, Star, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">SpeedySpoon</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-orange-600">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-orange-600">How It Works</a>
            <a href="#about" className="text-gray-600 hover:text-orange-600">About</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Hungry? We've Got You Covered!
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Ghana's fastest food delivery service. Fresh, delicious Ghanaian meals delivered to your doorstep in 30 minutes or less.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link to="/customer">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg">
                Order Now 🍽️
              </Button>
            </Link>
            <Link to="/driver-signup">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Become a Driver 🚗
              </Button>
            </Link>
            <Link to="/restaurant-dashboard">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                Restaurant Portal 🏪
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SpeedySpoon?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardContent>
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Get your food delivered in 30 minutes or less, guaranteed.</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent>
                <Star className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
                <p className="text-gray-600">Fresh, authentic Ghanaian cuisine from the best local restaurants.</p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent>
                <Shield className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Secure payments with Mobile Money, bank transfer, and cash options.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Order</h3>
              <p className="text-gray-600">Choose from our delicious menu and place your order</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">We Prepare</h3>
              <p className="text-gray-600">Our chefs prepare your meal with fresh ingredients</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Your order is delivered hot and fresh to your door</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="text-center bg-white rounded-lg p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">10,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <Store className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">500+</div>
              <div className="text-gray-600">Partner Restaurants</div>
            </div>
            <div>
              <Truck className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">200+</div>
              <div className="text-gray-600">Active Drivers</div>
            </div>
            <div>
              <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">25 min</div>
              <div className="text-gray-600">Average Delivery</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
