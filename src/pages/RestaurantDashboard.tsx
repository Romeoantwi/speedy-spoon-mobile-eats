
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, CheckCircle, Package, DollarSign, TrendingUp } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';

interface Order {
  id: string;
  customer_id: string;
  items: any[];
  total_amount: number;
  status: string;
  delivery_address: string;
  customer_phone?: string;
  special_instructions?: string;
  estimated_prep_time: number;
  created_at: string;
}

const RestaurantDashboard = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    avgPrepTime: 25
  });

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time order updates
    const ordersSubscription = supabase
      .channel('restaurant-orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🍽️ New order received!', payload);
          const newOrder = {
            ...payload.new,
            items: typeof payload.new.items === 'string' ? JSON.parse(payload.new.items) : payload.new.items
          } as Order;
          setOrders(prev => [newOrder, ...prev]);
          
          toast({
            title: "New Order Received! 🍽️",
            description: `Order #${newOrder.id.slice(-8)} - ${formatCurrency(newOrder.total_amount)}`,
          });
          
          // Automatically confirm the order after 30 seconds (demo purposes)
          setTimeout(() => {
            updateOrderStatus(newOrder.id, 'confirmed');
          }, 30000);
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', 'speedyspoon-main')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Parse the items JSON field
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      
      setOrders(parsedOrders);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = parsedOrders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
        pendingOrders: parsedOrders.filter(order => 
          ['placed', 'confirmed', 'preparing'].includes(order.status)
        ).length,
        avgPrepTime: 25
      });
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      const statusMessages = {
        confirmed: 'Order confirmed and being prepared',
        preparing: 'Order is now being prepared',
        ready: 'Order is ready for pickup'
      };
      
      toast({
        title: "Order Updated! ✅",
        description: statusMessages[newStatus as keyof typeof statusMessages] || `Order status updated to ${newStatus}`,
      });
      
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">SpeedySpoon Restaurant</h1>
              <p className="text-gray-600">Manage your orders and kitchen operations</p>
            </div>
            <div className="flex items-center space-x-2">
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
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders yet today</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
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
                        </div>
                        
                        {getNextStatus(order.status) && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            {getNextStatusLabel(order.status)}
                          </Button>
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
