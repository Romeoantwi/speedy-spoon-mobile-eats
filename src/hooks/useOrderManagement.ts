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
    console.log('Active order cleared');
  }, []);

  // Load active order on mount
  useEffect(() => {
    loadActiveOrder();
  }, []);

  // Real-time order updates
  useEffect(() => {
    if (!currentOrder?.id) return;

    console.log(`Setting up real-time updates for order: ${currentOrder.id}`);

    const channel = supabase
      .channel(`order_updates_${currentOrder.id}`)
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
            const newPaymentStatus = payload.new.payment_status as Order['payment_status'];
            
            setCurrentOrder(prev => prev ? { 
              ...prev, 
              status: newStatus, 
              payment_status: newPaymentStatus 
            } : null);
            setOrderStatus(newStatus);
            
            console.log(`Order status updated: ${newStatus}`);

            // Show appropriate toast
            showStatusUpdateToast(newStatus);

            // Clear order if completed
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
              setTimeout(() => clearCurrentOrderInternal(), 2000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Cleaning up real-time subscription for order: ${currentOrder.id}`);
      supabase.removeChannel(channel);
    };
  }, [currentOrder?.id, clearCurrentOrderInternal]);

  const loadActiveOrder = async () => {
    const storedOrderId = localStorage.getItem('activeOrderId');
    if (!storedOrderId) return;

    setLoadingOrder(true);
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', storedOrderId)
        .single();

      if (error) {
        console.error("Error loading order:", error);
        localStorage.removeItem('activeOrderId');
        return;
      }

      if (orderData) {
        const parsedItems = typeof orderData.items === 'string'
          ? JSON.parse(orderData.items)
          : orderData.items;

        const loadedOrder: Order = {
          ...orderData,
          items: parsedItems as unknown as OrderItem[],
          status: orderData.status as Order['status'],
          payment_status: orderData.payment_status as Order['payment_status'],
        };

        // Only track active orders
        if (!['delivered', 'cancelled'].includes(loadedOrder.status)) {
          setCurrentOrder(loadedOrder);
          setOrderStatus(loadedOrder.status);
          console.log('Resumed tracking order:', loadedOrder.id);
        } else {
          localStorage.removeItem('activeOrderId');
        }
      }
    } catch (err) {
      console.error("Failed to load active order:", err);
      localStorage.removeItem('activeOrderId');
    } finally {
      setLoadingOrder(false);
    }
  };

  const showStatusUpdateToast = (status: Order['status']) => {
    const statusMessages = {
      'placed': { title: "Order Placed", description: "Your order has been received" },
      'confirmed': { title: "Order Confirmed", description: "Restaurant is preparing your order" },
      'preparing': { title: "Order Preparing", description: "Your food is being prepared" },
      'ready': { title: "Order Ready", description: "Your order is ready for pickup" },
      'picked_up': { title: "Order Picked Up", description: "Driver is on the way to you" },
      'delivered': { title: "Order Delivered", description: "Your order has been delivered!" },
      'cancelled': { title: "Order Cancelled", description: "Your order has been cancelled" }
    };

    const message = statusMessages[status];
    if (message) {
      toast({
        title: message.title,
        description: message.description,
        variant: status === 'cancelled' ? 'destructive' : 'default',
      });
    }
  };

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
        return null;
      }

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate delivery address
      if (!deliveryAddress || deliveryAddress.trim().length < 10) {
        throw new Error('Please provide a valid delivery address');
      }

      const orderItems: OrderItem[] = cartItems.map(item => {
        const customizationsTotal = item.selectedCustomizations?.reduce((sum, c) => sum + c.price, 0) || 0;
        return {
          food_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.selectedCustomizations?.map(c => ({
            id: c.id,
            name: c.name,
            price: c.price
          })) || [],
          total_price: (item.price + customizationsTotal) * item.quantity
        };
      });
      
      const subTotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
      const deliveryFee = 5.00;
      const totalAmount = subTotal + deliveryFee;

      // Calculate estimated times
      const now = new Date();
      const estimatedPrepTime = 25; // minutes
      const estimatedDeliveryTime = new Date(now.getTime() + (estimatedPrepTime + 15) * 60 * 1000);

      // Convert orderItems to JSON format for database storage
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: 'speedyspoon-main',
          items: orderItems as any, // Cast to any to handle JSON type
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          status: 'placed',
          delivery_address: deliveryAddress.trim(),
          estimated_prep_time: estimatedPrepTime,
          estimated_delivery_time: estimatedDeliveryTime.toISOString(),
          customer_phone: user.phone || user.user_metadata?.phone_number || '',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error('Failed to create order. Please try again.');
      }

      const newOrder: Order = {
        ...orderData,
        items: orderData.items as unknown as OrderItem[], // Cast from JSON to OrderItem[]
        status: orderData.status as Order['status'],
        payment_status: orderData.payment_status as Order['payment_status'],
      };

      setCurrentOrder(newOrder);
      setOrderStatus('placed');
      localStorage.setItem('activeOrderId', newOrder.id);

      console.log('Order created successfully:', newOrder.id);
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
      console.log(`Order status updated locally: ${newStatus}`);
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
