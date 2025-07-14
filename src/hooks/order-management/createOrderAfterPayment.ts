
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order';

export const createOrderAfterPayment = async (
  cartItems: CartItem[],
  deliveryAddress: string,
  user: any,
  setCurrentOrder: (order: Order) => void,
  setOrderStatus: (status: Order['status']) => void,
  toast: any,
  paymentReference?: string
): Promise<string | null> => {
  try {
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
        status: 'confirmed', // Order is confirmed since payment is already processed
        delivery_address: deliveryAddress.trim(),
        estimated_prep_time: estimatedPrepTime,
        estimated_delivery_time: estimatedDeliveryTime.toISOString(),
        customer_phone: user.phone || user.user_metadata?.phone_number || '',
        payment_status: 'paid', // Payment already successful
        payment_method: 'paystack',
        paystack_reference: paymentReference,
      } as any)
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order. Please contact support.');
    }

    const newOrder: Order = {
      ...(orderData as any),
      items: (typeof (orderData as any).items === 'string' 
        ? JSON.parse((orderData as any).items) 
        : (orderData as any).items) as unknown as OrderItem[],
      status: (orderData as any).status as Order['status'],
      payment_status: (orderData as any).payment_status as Order['payment_status'],
    };

    setCurrentOrder(newOrder);
    setOrderStatus('confirmed');
    localStorage.setItem('activeOrderId', newOrder.id);

    console.log('Order created successfully after payment:', newOrder.id);
    toast({
      title: "Order Created",
      description: "Your order has been confirmed and is being prepared!",
      variant: "default",
    });

    return newOrder.id;
  } catch (error: any) {
    console.error('Error creating order after payment:', error);
    toast({
      title: "Order Creation Failed",
      description: error.message || "Could not create your order. Please contact support.",
      variant: "destructive",
    });
    return null;
  }
};
