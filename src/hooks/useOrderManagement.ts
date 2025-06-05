
import { useState } from 'react';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order';
import { supabase } from '@/integrations/supabase/client';

export const useOrderManagement = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status'] | null>(null);

  const createOrder = async (cartItems: CartItem[], deliveryAddress: string): Promise<string> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Convert cart items to order items
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

      // Insert order into database - convert orderItems to JSON
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: 'speedyspoon-main',
          items: JSON.stringify(orderItems),
          total_amount: totalAmount,
          delivery_fee: 5.00,
          status: 'placed',
          delivery_address: deliveryAddress,
          estimated_prep_time: 25
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const order: Order = {
        id: orderData.id,
        customer_id: orderData.customer_id,
        restaurant_id: orderData.restaurant_id,
        driver_id: orderData.driver_id,
        items: orderItems,
        total_amount: orderData.total_amount,
        status: orderData.status as Order['status'],
        created_at: orderData.created_at,
        estimated_prep_time: orderData.estimated_prep_time,
        delivery_address: orderData.delivery_address,
        customer_phone: orderData.customer_phone,
        special_instructions: orderData.special_instructions
      };

      setCurrentOrder(order);
      setOrderStatus('placed');

      console.log('🍽️ Order created and sent to restaurant:', order.id);

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = (newStatus: Order['status']) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status: newStatus });
      setOrderStatus(newStatus);
      
      console.log(`📱 Order status updated: ${newStatus}`);
    }
  };

  return {
    currentOrder,
    orderStatus,
    createOrder,
    updateOrderStatus
  };
};
