
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Phone, DollarSign, Star } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import LocationMap from '@/components/LocationMap';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useRealTimeOrders('driver');
  const [driverStatus, setDriverStatus] = useState<'offline' | 'online' | 'busy'>('offline');
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0 });
  const [driverProfile, setDriverProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchDriverProfile();
      fetchEarnings();
    }
  }, [user]);

  useEffect(() => {
    // Find current assigned order
    const assignedOrder = orders.find(order => 
      order.driver_id === user?.id && ['ready', 'picked_up'].includes(order.status)
    );
    
    if (assignedOrder) {
      setCurrentOrder(assignedOrder);
      setDriverStatus('busy');
    } else if (currentOrder && currentOrder.status === 'delivered') {
      setCurrentOrder(null);
      setDriverStatus('online');
    }
  }, [orders, user?.id]);

  const fetchDriverProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('Driver profile not found, user might not be a driver');
        return;
      }

      setDriverProfile(data);
      setDriverStatus(data.is_available ? 'online' : 'offline');
    } catch (error) {
      console.error('Error fetching driver profile:', error);
    }
  };

  const fetchEarnings = async () => {
    if (!user) return;

    try {
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', today);

      const { data: weekOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', weekAgo);

      const todayEarnings = (todayOrders || []).reduce((sum, order) => sum + Number(order.total_amount) * 0.15, 0);
      const weekEarnings = (weekOrders || []).reduce((sum, order) => sum + Number(order.total_amount) * 0.15, 0);

      setEarnings({ today: todayEarnings, week: weekEarnings });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  };

  const toggleDriverStatus = async () => {
    if (!driverProfile) {
      toast({
        title: "Driver Profile Required",
        description: "Please complete your driver profile first",
        variant: "destructive"
      });
      return;
    }

    const newStatus = driverStatus === 'offline' ? 'online' : 'offline';
    
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_available: newStatus === 'online' })
        .eq('user_id', user?.id);

      if (error) throw error;

      setDriverStatus(newStatus);
      
      toast({
        title: `Driver Status Updated`,
        description: `You are now ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const acceptOrder = async (order: any) => {
    try {
      const success = await updateOrderStatus(order.id, 'picked_up');
      if (success) {
        setCurrentOrder(order);
        setDriverStatus('busy');
        
        // Update driver availability
        await supabase
          .from('driver_profiles')
          .update({ is_available: false })
          .eq('user_id', user?.id);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const completeDelivery = async () => {
    if (!currentOrder) return;

    try {
      const success = await updateOrderStatus(currentOrder.id, 'delivered');
      if (success) {
        // Update earnings
        const commission = currentOrder.total_amount * 0.15;
        setEarnings(prev => ({
          today: prev.today + commission,
          week: prev.week + commission
        }));

        // Update driver profile
        await supabase
          .from('driver_profiles')
          .update({ 
            is_available: true,
            total_deliveries: (driverProfile?.total_deliveries || 0) + 1
          })
          .eq('user_id', user?.id);

        setCurrentOrder(null);
        setDriverStatus('online');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const availableOrders = orders.filter(order => 
    order.status === 'ready' && !order.driver_id
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Driver Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">Please sign in to access the driver dashboard.</p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Driver Profile Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              You need to complete your driver profile to access the dashboard.
            </p>
            <Button 
              onClick={() => window.location.href = '/driver-signup'} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Complete Driver Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Driver Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={driverStatus === 'online' ? 'default' : driverStatus === 'busy' ? 'secondary' : 'destructive'}
                className="text-sm px-3 py-1"
              >
                {driverStatus.toUpperCase()}
              </Badge>
              <Button
                onClick={toggleDriverStatus}
                variant={driverStatus === 'offline' ? 'default' : 'outline'}
                className="flex items-center"
                disabled={driverStatus === 'busy'}
              >
                <Truck className="w-4 h-4 mr-2" />
                {driverStatus === 'offline' ? 'Go Online' : driverStatus === 'busy' ? 'Busy' : 'Go Offline'}
              </Button>
            </div>
          </div>
          
          {/* Earnings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center p-4">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(earnings.today)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Star className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold">{driverProfile?.rating || 5.0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Deliveries</p>
                  <p className="text-2xl font-bold">{driverProfile?.total_deliveries || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Order or Available Orders */}
          <div>
            {currentOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-blue-600" />
                    Current Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{currentOrder.id.slice(-8)}</h3>
                      <Badge>{currentOrder.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="font-bold text-lg">{formatCurrency(currentOrder.total_amount)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Items:</p>
                    <ul className="text-sm text-gray-600">
                      {currentOrder.items.map((item: any, index: number) => (
                        <li key={index}>• {item.name} x{item.quantity}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-1 text-red-500" />
                      <span>{currentOrder.delivery_address}</span>
                    </div>
                    {currentOrder.customer_phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-green-500" />
                        <span>{currentOrder.customer_phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    {currentOrder.status === 'ready' && (
                      <Button 
                        onClick={() => updateOrderStatus(currentOrder.id, 'picked_up')} 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                      >
                        Mark as Picked Up
                      </Button>
                    )}
                    {currentOrder.status === 'picked_up' && (
                      <Button 
                        onClick={completeDelivery} 
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Available Orders ({availableOrders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {driverStatus === 'offline' ? (
                    <p className="text-center text-gray-500 py-8">Go online to see available orders</p>
                  ) : availableOrders.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No orders available right now</p>
                  ) : (
                    <div className="space-y-4">
                      {availableOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <p className="font-bold text-lg">{formatCurrency(order.total_amount)}</p>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Items:</p>
                            <p className="text-sm">
                              {order.items.map((item: any) => item.name).join(', ')}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {order.delivery_address}
                            </div>
                            <Button 
                              onClick={() => acceptOrder(order)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Accept Order
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notifications and Map */}
          <div className="space-y-6">
            <NotificationCenter userType="driver" />
            <LocationMap 
              showDriverLocation={currentOrder?.status === 'picked_up'} 
              orderStatus={currentOrder?.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
