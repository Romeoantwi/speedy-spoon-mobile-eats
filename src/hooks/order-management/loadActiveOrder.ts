
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
      .eq('id', storedOrderId as any)
      .single();

    if (error) {
      console.error("Error loading order:", error);
      localStorage.removeItem('activeOrderId');
      return;
    }

    if (orderData) {
      const parsedItems = typeof (orderData as any).items === 'string'
        ? JSON.parse((orderData as any).items)
        : (orderData as any).items;

      const loadedOrder: Order = {
        ...(orderData as any),
        items: parsedItems as unknown as OrderItem[],
        status: (orderData as any).status as Order['status'],
        payment_status: (orderData as any).payment_status as Order['payment_status'],
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
