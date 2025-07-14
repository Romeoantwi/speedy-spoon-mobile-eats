
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeOrders = (userType: 'restaurant' | 'driver' | 'customer' = 'restaurant') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Create a unique channel name to avoid conflicts
    const channelName = `orders-realtime-${userType}-${Date.now()}`;
    
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('📱 Real-time order update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = {
              ...payload.new,
              items: typeof payload.new.items === 'string' ? JSON.parse(payload.new.items) : payload.new.items,
              status: payload.new.status as Order['status']
            } as Order;
            
            setOrders(prev => [newOrder, ...prev]);
            
            if (userType === 'restaurant') {
              toast({
                title: "New Order Received! 🍽️",
                description: `Order #${newOrder.id.slice(-8)} - GH₵${newOrder.total_amount}`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = {
              ...payload.new,
              items: typeof payload.new.items === 'string' ? JSON.parse(payload.new.items) : payload.new.items,
              status: payload.new.status as Order['status']
            } as Order;
            
            setOrders(prev => prev.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            ));
          }
        }
      )
      .subscribe();

    // Cleanup function to properly unsubscribe
    return () => {
      console.log('Cleaning up real-time subscription for:', channelName);
      supabase.removeChannel(subscription);
    };
  }, [userType, toast]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (userType === 'driver') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.or(`driver_id.eq.${user.id},driver_id.is.null`);
        }
      } else if (userType === 'customer') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('customer_id', user.id as any);
        }
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const parsedOrders = (data || []).map(order => ({
        ...(order as any),
        items: typeof (order as any).items === 'string' ? JSON.parse((order as any).items) : (order as any).items,
        status: (order as any).status as Order['status']
      })) as Order[];

      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus } as any)
        .eq('id', orderId as any);

      if (error) throw error;
      
      toast({
        title: "Order Updated! ✅",
        description: `Order status changed to ${newStatus.replace('_', ' ')}`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };
};
