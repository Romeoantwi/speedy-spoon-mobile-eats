
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';

export const loadActiveOrder = async (
  setLoadingOrder: (v: boolean) => void,
  setCurrentOrder: (order: Order | null) => void,
  setOrderStatus: (status: Order['status'] | null) => void,
) => {
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
