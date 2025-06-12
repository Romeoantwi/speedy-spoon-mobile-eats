import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order'; // Ensure you have Order type defined
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast"; // Assuming you have a useToast hook

export const useOrderManagement = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status'] | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false); // New loading state for order operations
  const { toast } = useToast();

  // --- 1. Load Active Order on Mount ---
  // Checks for an existing active order (e.g., from local storage)
  // and fetches its details to resume tracking.
  useEffect(() => {
    const loadActiveOrder = async () => {
      const storedOrderId = localStorage.getItem('activeOrderId');
      if (storedOrderId) {
        setLoadingOrder(true);
        try {
          const { data: orderData, error } = await supabase
            .from('orders')
            .select('*') // Select all columns for the Order type
            .eq('id', storedOrderId)
            .single();

          if (error) {
            console.error("Error fetching stored order:", error);
            localStorage.removeItem('activeOrderId'); // Clear invalid ID
            toast({
              title: "Order Not Found",
              description: "Your previous order could not be loaded. Please place a new one.",
              variant: "destructive",
            });
          } else if (orderData) {
            // Ensure `items` is parsed if stored as JSON string
            const parsedItems = typeof orderData.items === 'string'
              ? JSON.parse(orderData.items)
              : orderData.items;

            const loadedOrder: Order = {
              ...orderData,
              items: parsedItems, // Assign parsed items
              status: orderData.status as Order['status'], // Type assertion for status
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
  }, [toast]); // Dependency on toast to ensure it's available

  // --- 2. Real-time Order Status Subscription ---
  // Subscribes to Supabase Realtime to update order status automatically.
  useEffect(() => {
    if (!currentOrder?.id) return; // Only subscribe if there's a current order

    console.log(`📡 Subscribing to real-time updates for order: ${currentOrder.id}`);

    const channel = supabase
      .channel(`order_status_channel_${currentOrder.id}`) // Unique channel name
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
            setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null); // Update currentOrder object
            setOrderStatus(newStatus);
            console.log(`📱 Order status updated via Realtime: ${newStatus}`);

            toast({
              title: "Order Update",
              description: `Your order status changed to: ${newStatus}`,
              variant: (newStatus === 'delivered' || newStatus === 'cancelled') ? 'default' : 'foreground', // Use default for final states
            });

            // If the order is delivered or cancelled, automatically clear it from active tracking.
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
              clearCurrentOrder(); // Use the provided clear function
            }
          }
        }
      )
      .subscribe();

    // Clean up subscription on component unmount or if currentOrder changes
    return () => {
      console.log(`🛑 Unsubscribing from order updates for order: ${currentOrder.id}`);
      supabase.removeChannel(channel);
    };
  }, [currentOrder?.id, toast]); // Re-subscribe if currentOrder ID changes

  // --- 3. Create Order Function ---
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

      const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

      // Add estimated delivery time (e.g., 30-45 minutes from now)
      const now = new Date();
      const estimatedDeliveryTime = new Date(now.getTime() + (40 * 60 * 1000)); // ~40 minutes from now

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: 'speedyspoon-main', // Assuming a fixed restaurant
          items: JSON.stringify(orderItems), // Store items as JSON string
          total_amount: totalAmount,
          delivery_fee: 5.00, // Fixed delivery fee
          status: 'placed',
          delivery_address: deliveryAddress,
          estimated_prep_time: 25, // Fixed prep time
          estimated_delivery_time: estimatedDeliveryTime.toISOString(), // Store as ISO string
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // Re-fetch to ensure all properties from DB are correctly typed if needed, or rely on select()
      // For simplicity, let's assume `orderData` directly maps to `Order` for now
      const newOrder: Order = {
        id: orderData.id,
        customer_id: orderData.customer_id,
        restaurant_id: orderData.restaurant_id,
        driver_id: orderData.driver_id, // This will be null initially
        items: JSON.parse(orderData.items), // Parse back for client-side state
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
        payment_status: orderData.payment_status, // Ensure payment_status is included
        paystack_reference: orderData.paystack_reference, // Ensure this is included
      };

      setCurrentOrder(newOrder);
      setOrderStatus('placed');
      localStorage.setItem('activeOrderId', newOrder.id); // Persist the active order ID

      console.log('🍽️ Order created and sent to restaurant:', newOrder.id);
      toast({
        title: "Order Placed",
        description: "Your order has been successfully placed!",
        variant: "success",
      });

      return newOrder.id;
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Could not place your order. Please try again.",
        variant: "destructive",
      });
      return null; // Return null on error
    } finally {
      setLoadingOrder(false);
    }
  }, [toast]);

  // --- 4. Update Order Status (for internal/manual updates, less used with Realtime) ---
  const updateOrderStatus = useCallback((newStatus: Order['status']) => {
    // This function is primarily for local state updates or if you had a different update mechanism.
    // With Realtime, it's often better to let the DB change trigger the state update.
    if (currentOrder) {
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setOrderStatus(newStatus);
      console.log(`📱 Order status updated locally: ${newStatus}`);
    }
  }, [currentOrder]);


  // --- 5. Clear Current Order Function ---
  // Allows the user to 'dismiss' a completed/cancelled order or start a new one.
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    setOrderStatus(null); // Or 'idle'
    localStorage.removeItem('activeOrderId');
    console.log('🗑️ Active order cleared.');
    toast({
      title: "Order Cleared",
      description: "You can now browse or place a new order.",
      variant: "info",
    });
  }, [toast]);


  return {
    currentOrder,
    orderStatus,
    loadingOrder, // Expose loading state
    createOrder,
    updateOrderStatus,
    clearCurrentOrder, // Expose clear function
  };
};