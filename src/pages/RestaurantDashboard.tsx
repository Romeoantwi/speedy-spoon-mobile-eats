
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import StatsCards from '@/components/restaurant/StatsCards';
import OrdersList from '@/components/restaurant/OrdersList';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

interface OrderWithDetails extends Order {
  customer_name?: string;
}

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, adminRole, loading: adminLoading } = useAdminAuth();
  const { orders, loading: ordersLoading, updateOrderStatus } = useRealTimeOrders('restaurant');
  const [enrichedOrders, setEnrichedOrders] = useState<OrderWithDetails[]>([]);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    avgPrepTime: 25
  });

  // Load restaurant status on mount
  useEffect(() => {
    loadRestaurantStatus();
  }, []);

  const loadRestaurantStatus = async () => {
    try {
      const status = localStorage.getItem('restaurantOpen');
      if (status !== null) {
        setIsRestaurantOpen(status === 'true');
      }
    } catch (error) {
      console.error('Error loading restaurant status:', error);
    }
  };

  const toggleRestaurantStatus = async () => {
    setUpdatingStatus(true);
    try {
      const newStatus = !isRestaurantOpen;
      setIsRestaurantOpen(newStatus);
      localStorage.setItem('restaurantOpen', newStatus.toString());
      console.log(`Restaurant ${newStatus ? 'opened' : 'closed'}`);
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Enrich orders with customer details
  useEffect(() => {
    const enrichOrdersWithDetails = async () => {
      if (orders.length === 0) {
        setEnrichedOrders([]);
        return;
      }

      const enrichedData = await Promise.all(
        orders.map(async (order) => {
          const enrichedOrder: OrderWithDetails = { ...order };

          // Get customer details
          try {
            const { data: customerProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', order.customer_id)
              .single();
            
            if (customerProfile) {
              enrichedOrder.customer_name = customerProfile.full_name || 'N/A';
            }
          } catch (error) {
            console.log('Customer profile not found for order:', order.id);
            enrichedOrder.customer_name = 'N/A';
          }

          return enrichedOrder;
        })
      );

      setEnrichedOrders(enrichedData);
    };

    enrichOrdersWithDetails();
  }, [orders]);

  useEffect(() => {
    if (enrichedOrders.length > 0) {
      const today = new Date().toDateString();
      const todayOrders = enrichedOrders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
      
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
        pendingOrders: enrichedOrders.filter(order => 
          ['placed', 'confirmed', 'preparing'].includes(order.status)
        ).length,
        avgPrepTime: 25
      });
    }
  }, [enrichedOrders]);

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
        <RestaurantHeader
          adminRole={adminRole || 'admin'}
          isRestaurantOpen={isRestaurantOpen}
          onToggleStatus={toggleRestaurantStatus}
          updatingStatus={updatingStatus}
        />
        
        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrdersList
              orders={enrichedOrders}
              loading={ordersLoading}
              onUpdateStatus={updateOrderStatus}
            />
          </div>

          <div>
            <NotificationCenter userType="restaurant" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
