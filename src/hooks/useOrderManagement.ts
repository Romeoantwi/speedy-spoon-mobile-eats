
import { useState } from 'react';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order';

export const useOrderManagement = () => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status'] | null>(null);

  const createOrder = async (cartItems: CartItem[], deliveryAddress: string): Promise<string> => {
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

    // Create order object
    const order: Order = {
      id: generateOrderId(),
      customer_id: 'temp-customer-id', // Will be replaced with actual user ID from Supabase auth
      restaurant_id: 'speedyspoon-main',
      items: orderItems,
      total_amount: totalAmount,
      status: 'placed',
      created_at: new Date().toISOString(),
      estimated_prep_time: 25, // Base prep time in minutes
      delivery_address: deliveryAddress
    };

    // TODO: Save to Supabase database
    console.log('Order created:', order);
    
    setCurrentOrder(order);
    setOrderStatus('placed');

    // Simulate restaurant notification
    setTimeout(() => {
      console.log('🍽️ Restaurant notified: New order received!');
      setOrderStatus('preparing');
    }, 1000);

    return order.id;
  };

  const updateOrderStatus = (newStatus: Order['status']) => {
    if (currentOrder) {
      setCurrentOrder({ ...currentOrder, status: newStatus });
      setOrderStatus(newStatus);
      
      // Log status changes
      console.log(`📱 Order status updated: ${newStatus}`);
    }
  };

  const generateOrderId = (): string => {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
  };

  return {
    currentOrder,
    orderStatus,
    createOrder,
    updateOrderStatus
  };
};
