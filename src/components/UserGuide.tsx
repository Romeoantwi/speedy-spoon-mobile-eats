
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Users, 
  ShoppingCart, 
  Truck, 
  Settings, 
  Database,
  Github,
  Shield,
  Coffee,
  MapPin,
  CreditCard
} from 'lucide-react';

const UserGuide = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Coffee className="w-8 h-8 mr-3 text-orange-600" />
            SpeedySpoon Food Delivery System - Complete Guide
          </CardTitle>
          <p className="text-gray-600">
            A comprehensive food delivery platform built with React, TypeScript, Supabase, and Tailwind CSS
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger>
          <TabsTrigger value="tech">Technology</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Frontend</h3>
                  <ul className="text-sm space-y-1">
                    <li>• React 18 with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Shadcn/ui components</li>
                    <li>• React Router for navigation</li>
                    <li>• Tanstack Query for state</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Backend</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Supabase Database</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Row Level Security</li>
                    <li>• Authentication system</li>
                    <li>• File storage</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Features</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Multi-user system</li>
                    <li>• Real-time updates</li>
                    <li>• Payment integration</li>
                    <li>• Location services</li>
                    <li>• Admin dashboard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles & Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Badge className="mb-2">Customer</Badge>
                  <p className="text-sm">Browse menu, place orders, track delivery, manage payment methods</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Badge className="mb-2">Restaurant Admin</Badge>
                  <p className="text-sm">Manage orders, view analytics, update menu, handle operations</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Badge className="mb-2">Driver</Badge>
                  <p className="text-sm">Accept deliveries, update location, manage availability status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Customer Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-semibold">1. Browse & Order</h4>
                  <p className="text-sm">• View restaurant menu with photos and descriptions</p>
                  <p className="text-sm">• Add items to cart with customizations</p>
                  <p className="text-sm">• Specify delivery address with map integration</p>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold">2. Payment & Checkout</h4>
                  <p className="text-sm">• Multiple payment methods (Mobile Money, Bank Transfer, Cash)</p>
                  <p className="text-sm">• Secure payment processing</p>
                  <p className="text-sm">• Order confirmation with estimated delivery time</p>
                </div>
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <h4 className="font-semibold">3. Real-time Tracking</h4>
                  <p className="text-sm">• Live order status updates</p>
                  <p className="text-sm">• Driver assignment notifications</p>
                  <p className="text-sm">• Delivery progress tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restaurant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Restaurant Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold mb-2">Admin Setup Process:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Sign up/login to the system</li>
                  <li>Navigate to <code>/admin-setup</code></li>
                  <li>Enter admin key: <code>SPEEDYSPOON_ADMIN_2024</code></li>
                  <li>Access restaurant dashboard</li>
                </ol>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Order Management</h4>
                  <ul className="text-sm space-y-1">
                    <li>• View incoming orders in real-time</li>
                    <li>• Update order status (confirmed → preparing → ready)</li>
                    <li>• Automatic driver assignment</li>
                    <li>• Customer notifications</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics & Reports</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Daily/weekly sales reports</li>
                    <li>• Popular items tracking</li>
                    <li>• Driver performance metrics</li>
                    <li>• Customer satisfaction data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driver" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Driver Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Driver Registration:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Visit <code>/driver-signup</code></li>
                  <li>Complete driver profile with license details</li>
                  <li>Provide vehicle information</li>
                  <li>Set availability status</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-semibold">Automatic Assignment</h4>
                  <p className="text-sm">System automatically assigns orders to available drivers based on rating and delivery count</p>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold">Status Updates</h4>
                  <p className="text-sm">Update delivery status: picked_up → delivered with real-time customer notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tech" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Technical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Database Schema</h4>
                  <ul className="text-sm space-y-1">
                    <li>• <code>profiles</code> - User information</li>
                    <li>• <code>orders</code> - Order management</li>
                    <li>• <code>driver_profiles</code> - Driver data</li>
                    <li>• <code>notifications</code> - Real-time alerts</li>
                    <li>• <code>payment_methods</code> - Payment info</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Real-time Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Order status subscriptions</li>
                    <li>• Live dashboard updates</li>
                    <li>• Driver location tracking</li>
                    <li>• Instant notifications</li>
                    <li>• Auto-driver assignment</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Key Hooks & Components:</h4>
                <div className="text-sm space-y-1">
                  <p>• <code>useAuth</code> - Authentication management</p>
                  <p>• <code>useAdminAuth</code> - Admin role verification</p>
                  <p>• <code>useRealTimeOrders</code> - Live order updates</p>
                  <p>• <code>useOrderManagement</code> - Order creation/updates</p>
                  <p>• <code>LocationMap</code> - Address selection with Ghana locations</p>
                  <p>• <code>PaymentMethods</code> - Ghana-specific payment options</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Mobile App Conversion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold mb-2">Step-by-Step Mobile Setup:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li><strong>Install Capacitor:</strong> I'll add the required dependencies</li>
                  <li><strong>Initialize:</strong> Run <code>npx cap init</code></li>
                  <li><strong>Add Platforms:</strong> <code>npx cap add ios</code> and <code>npx cap add android</code></li>
                  <li><strong>Build & Sync:</strong> <code>npm run build && npx cap sync</code></li>
                  <li><strong>Run:</strong> <code>npx cap run android</code> or <code>npx cap run ios</code></li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Android Requirements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Android Studio installed</li>
                    <li>• Java/Kotlin SDK</li>
                    <li>• Android device or emulator</li>
                    <li>• USB debugging enabled</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">iOS Requirements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• macOS with Xcode</li>
                    <li>• iOS simulator or device</li>
                    <li>• Apple Developer account (for device)</li>
                    <li>• Code signing setup</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Native Capabilities Available:</h4>
                <div className="text-sm space-y-1">
                  <p>• Push notifications for order updates</p>
                  <p>• GPS location for delivery tracking</p>
                  <p>• Camera for profile pictures</p>
                  <p>• Local storage for offline capability</p>
                  <p>• Biometric authentication</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Github className="w-5 h-5 mr-2" />
            GitHub Integration & Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">GitHub Setup</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Click the GitHub button in top-right</li>
                <li>Connect your GitHub account</li>
                <li>Create or link to repository</li>
                <li>All changes auto-sync both ways</li>
              </ol>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Deployment Options</h4>
              <ul className="text-sm space-y-1">
                <li>• Lovable hosting (Click "Publish")</li>
                <li>• Vercel/Netlify deployment</li>
                <li>• Custom domain connection</li>
                <li>• Environment variables setup</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold mb-2">Important Notes:</h4>
            <ul className="text-sm space-y-1">
              <li>• All code changes in Lovable automatically push to GitHub</li>
              <li>• Changes pushed to GitHub automatically sync to Lovable</li>
              <li>• Use branches for experimental features</li>
              <li>• Environment variables stored in hosting platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserGuide;
