
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Phone, DollarSign, Star } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';
import LocationMap from '@/components/LocationMap';
import { formatCurrency } from '@/utils/currency';

interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  address: string;
  phone: string;
  status: 'available' | 'accepted' | 'picked_up' | 'delivered';
  estimatedTime: string;
  distance: string;
}

const DriverDashboard = () => {
  const [driverStatus, setDriverStatus] = useState<'offline' | 'online' | 'busy'>('offline');
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [earnings, setEarnings] = useState({ today: 45.50, week: 280.75 });

  useEffect(() => {
    // Simulate available orders
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        customerName: 'Kwame Asante',
        items: ['Assorted Jollof with Chicken', 'Extra Egg'],
        total: 44,
        address: 'East Legon, Accra',
        phone: '+233 24 123 4567',
        status: 'available',
        estimatedTime: '25 min',
        distance: '2.3 km'
      },
      {
        id: 'ORD-002', 
        customerName: 'Ama Osei',
        items: ['Assorted Fried Rice', 'Gizzard', 'Plantain'],
        total: 59,
        address: 'Osu, Accra',
        phone: '+233 20 987 6543',
        status: 'available',
        estimatedTime: '30 min',
        distance: '4.1 km'
      }
    ];
    
    if (driverStatus === 'online') {
      setAvailableOrders(mockOrders);
    } else {
      setAvailableOrders([]);
    }
  }, [driverStatus]);

  const acceptOrder = (order: Order) => {
    setCurrentOrder({ ...order, status: 'accepted' });
    setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
    setDriverStatus('busy');
  };

  const updateOrderStatus = (newStatus: Order['status']) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status: newStatus });
      
      if (newStatus === 'delivered') {
        setEarnings(prev => ({
          today: prev.today + currentOrder.total * 0.15, // 15% commission
          week: prev.week + currentOrder.total * 0.15
        }));
        setCurrentOrder(null);
        setDriverStatus('online');
      }
    }
  };

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
                onClick={() => setDriverStatus(driverStatus === 'offline' ? 'online' : 'offline')}
                variant={driverStatus === 'offline' ? 'default' : 'outline'}
                className="flex items-center"
              >
                <Truck className="w-4 h-4 mr-2" />
                {driverStatus === 'offline' ? 'Go Online' : 'Go Offline'}
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
                  <p className="text-2xl font-bold">4.9</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-4">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Online Time</p>
                  <p className="text-2xl font-bold">6h 23m</p>
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
                      <h3 className="font-semibold text-lg">{currentOrder.customerName}</h3>
                      <p className="text-gray-600">Order #{currentOrder.id}</p>
                    </div>
                    <Badge>{currentOrder.status.replace('_', ' ')}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Items:</p>
                    <ul className="text-sm text-gray-600">
                      {currentOrder.items.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-red-500" />
                      {currentOrder.address}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-green-500" />
                      {currentOrder.phone}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="font-bold text-lg">{formatCurrency(currentOrder.total)}</span>
                    <div className="space-x-2">
                      {currentOrder.status === 'accepted' && (
                        <Button onClick={() => updateOrderStatus('picked_up')} className="bg-orange-500 hover:bg-orange-600">
                          Mark as Picked Up
                        </Button>
                      )}
                      {currentOrder.status === 'picked_up' && (
                        <Button onClick={() => updateOrderStatus('delivered')} className="bg-green-500 hover:bg-green-600">
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Available Orders</CardTitle>
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
                              <h3 className="font-semibold">{order.customerName}</h3>
                              <p className="text-sm text-gray-600">#{order.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                              <p className="text-sm text-gray-600">{order.distance} • {order.estimatedTime}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-1">Items:</p>
                            <p className="text-sm">{order.items.join(', ')}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {order.address}
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
