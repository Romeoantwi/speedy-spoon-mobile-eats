
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order';

export const createOrderFn = async (
  cartItems: CartItem[],
  deliveryAddress: string,
  toast: any, // UseToastReturn['toast']
  setCurrentOrder: (order: Order) => void,
  setOrderStatus: (status: Order['status']) => void,
  setLoadingOrder: (v: boolean) => void
): Promise<string | null> => {
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

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

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

    const now = new Date();
    const estimatedPrepTime = 25; // minutes
    const estimatedDeliveryTime = new Date(now.getTime() + (estimatedPrepTime + 15) * 60 * 1000);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        restaurant_id: 'speedyspoon-main',
        items: orderItems as any, // JSONB
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
      items: orderData.items as unknown as OrderItem[],
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
};
