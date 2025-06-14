
import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order'; 
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useOrderManagement = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status'] | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const { toast } = useToast();

  const clearCurrentOrderInternal = useCallback(() => {
    setCurrentOrder(null);
    setOrderStatus(null);
    localStorage.removeItem('activeOrderId');
    console.log('🗑️ Active order cleared.');
    toast({
      title: "Order Cleared",
      description: "You can now browse or place a new order.",
      variant: "default", 
    });
  }, [toast]);

  useEffect(() => {
    const loadActiveOrder = async () => {
      const storedOrderId = localStorage.getItem('activeOrderId');
      if (storedOrderId) {
        setLoadingOrder(true);
        try {
          const { data: orderData, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', storedOrderId)
            .single();

          if (error) {
            console.error("Error fetching stored order:", error);
            localStorage.removeItem('activeOrderId');
            toast({
              title: "Order Not Found",
              description: "Your previous order could not be loaded.",
              variant: "destructive",
            });
          } else if (orderData) {
            const parsedItems = typeof orderData.items === 'string'
              ? JSON.parse(orderData.items)
              : orderData.items;

            const loadedOrder: Order = {
              ...orderData,
              items: parsedItems as OrderItem[],
              status: orderData.status as Order['status'],
              payment_status: orderData.payment_status as Order['payment_status'],
            };
            setCurrentOrder(loadedOrder);
            setOrderStatus(loadedOrder.status);
            console.log('✅ Resuming tracking for order:', loadedOrder.id, 'Status:', loadedOrder.status);
          }
        } catch (err) {
          console.error("Failed to load active order:", err);
          localStorage.removeItem('activeOrderId');
        } finally {
          setLoadingOrder(false);
        }
      }
    };
    loadActiveOrder();
  }, [toast]);

  useEffect(() => {
    if (!currentOrder?.id) return;

    console.log(`📡 Subscribing to real-time updates for order: ${currentOrder.id}`);

    const channel = supabase
      .channel(`order_status_channel_${currentOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrder.id}`
        },
        (payload: any) => {
          if (payload.new.status) {
            const newStatus = payload.new.status as Order['status'];
            setCurrentOrder(prev => prev ? { ...prev, status: newStatus, payment_status: payload.new.payment_status as Order['payment_status'] } : null);
            setOrderStatus(newStatus);
            console.log(`📱 Order status updated via Realtime: ${newStatus}`);

            toast({
              title: "Order Update",
              description: `Your order status changed to: ${newStatus}`,
              variant: 'default',
            });

            if (newStatus === 'delivered' || newStatus === 'cancelled') {
              clearCurrentOrderInternal();
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`🛑 Unsubscribing from order updates for order: ${currentOrder.id}`);
      supabase.removeChannel(channel);
    };
  }, [currentOrder?.id, toast, clearCurrentOrderInternal]);

  const createOrder = useCallback(async (cartItems: CartItem[], deliveryAddress: string): Promise<string | null> => {
    setLoadingOrder(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place an order.",
          variant: "destructive",
        });
        throw new Error('No authenticated user');
      }

      const orderItems: OrderItem[] = cartItems.map(item => ({
        food_item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.selectedCustomizations?.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price
        })) || [],
        total_price: item.totalPrice 
      }));
      
      const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const customizationsTotal = cartItems.reduce((sum, item) => {
        return sum + (item.selectedCustomizations?.reduce((s,c) => s + c.price, 0) || 0) * item.quantity;
      }, 0);
      const totalAmount = subTotal + customizationsTotal;

      const now = new Date();
      const estimatedDeliveryTime = new Date(now.getTime() + (40 * 60 * 1000)); 

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: 'speedyspoon-main',
          items: orderItems as any,
          total_amount: totalAmount,
          delivery_fee: 5.00,
          status: 'placed',
          delivery_address: deliveryAddress,
          estimated_prep_time: 25,
          estimated_delivery_time: estimatedDeliveryTime.toISOString(),
          customer_phone: user.phone || user.user_metadata?.phone,
          payment_status: 'pending' as Order['payment_status'],
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      const parsedOrderItems = typeof orderData.items === 'string'
        ? JSON.parse(orderData.items)
        : orderData.items;

      const newOrder: Order = {
        id: orderData.id,
        customer_id: orderData.customer_id,
        restaurant_id: orderData.restaurant_id,
        driver_id: orderData.driver_id,
        items: parsedOrderItems as OrderItem[],
        total_amount: orderData.total_amount,
        delivery_fee: orderData.delivery_fee,
        status: orderData.status as Order['status'],
        delivery_address: orderData.delivery_address,
        customer_phone: orderData.customer_phone,
        special_instructions: orderData.special_instructions,
        estimated_prep_time: orderData.estimated_prep_time,
        estimated_delivery_time: orderData.estimated_delivery_time,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        payment_status: orderData.payment_status as Order['payment_status'],
      };

      setCurrentOrder(newOrder);
      setOrderStatus('placed');
      localStorage.setItem('activeOrderId', newOrder.id);

      console.log('🍽️ Order created and sent to restaurant:', newOrder.id);
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
        variant: "default",
      });

      return newOrder.id;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Could not place your order. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoadingOrder(false);
    }
  }, [toast]);

  const updateOrderStatus = useCallback((newStatus: Order['status']) => {
    if (currentOrder) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setOrderStatus(newStatus);
      console.log(`📱 Order status updated locally: ${newStatus}`);
    }
  }, [currentOrder]);

  return {
    currentOrder,
    orderStatus,
    loadingOrder,
    createOrder,
    updateOrderStatus,
    clearCurrentOrder: clearCurrentOrderInternal,
  };
};
