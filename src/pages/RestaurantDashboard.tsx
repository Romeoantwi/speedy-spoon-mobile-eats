
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, CheckCircle, Package, DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { formatCurrency } from '@/utils/currency';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, adminRole, permissions, loading: adminLoading } = useAdminAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useRealTimeOrders('restaurant');
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    avgPrepTime: 25
  });

  useEffect(() => {
    if (orders.length > 0) {
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
        pendingOrders: orders.filter(order => 
          ['placed', 'confirmed', 'preparing'].includes(order.status)
        ).length,
        avgPrepTime: 25
      });
    }
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'placed': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'placed': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      default: return null;
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">You must be logged in to access the restaurant dashboard.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              You need admin privileges to access the restaurant dashboard.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/admin-setup'} 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Set Up Admin Access
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">SpeedySpoon Restaurant</h1>
              <p className="text-gray-600">Admin Dashboard - {adminRole}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-600" />
              <Badge variant="default" className="bg-green-500">ADMIN ACCESS</Badge>
              <ChefHat className="w-8 h-8 text-orange-600" />
              <Badge variant="default" className="bg-green-500">OPEN</Badge>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold">{stats.todayOrders}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Prep Time</p>
                  <p className="text-2xl font-bold">{stats.avgPrepTime}m</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <p className="text-center text-gray-500 py-8">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders yet today</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                            {order.payment_status && (
                              <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {order.payment_status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.replace('_', ' ')}
                            </Badge>
                            <p className="font-bold text-lg mt-1">{formatCurrency(order.total_amount)}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Items:</p>
                          <div className="text-sm text-gray-600">
                            {order.items.map((item: any, index: number) => (
                              <div key={index}>• {item.name} x{item.quantity}</div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <p><strong>Delivery:</strong> {order.delivery_address}</p>
                          {order.customer_phone && (
                            <p><strong>Phone:</strong> {order.customer_phone}</p>
                          )}
                          {order.special_instructions && (
                            <p><strong>Instructions:</strong> {order.special_instructions}</p>
                          )}
                          {order.driver_id && (
                            <p><strong>Driver:</strong> Assigned</p>
                          )}
                        </div>
                        
                        {getNextStatus(order.status) && order.payment_status === 'paid' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            {getNextStatusLabel(order.status)}
                          </Button>
                        )}
                        
                        {order.payment_status !== 'paid' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
                            ⏳ Waiting for payment confirmation
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <NotificationCenter userType="restaurant" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
