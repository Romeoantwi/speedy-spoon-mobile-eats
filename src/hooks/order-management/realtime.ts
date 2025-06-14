
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/order';

type ShowStatusToast = (status: Order['status']) => void;
type ClearCurrentOrder = () => void;

export const setupOrderRealtime = (
  orderId: string | undefined,
  setCurrentOrder: (cb: (prev: Order | null) => Order | null) => void,
  setOrderStatus: (status: Order['status']) => void,
  showStatusUpdateToast: ShowStatusToast,
  clearCurrentOrderInternal: ClearCurrentOrder,
) => {
  if (!orderId) return;

  // Create a unique channel name to avoid conflicts
  const channelName = `order_updates_${orderId}_${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
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
          showStatusUpdateToast(newStatus);

          if (newStatus === 'delivered' || newStatus === 'cancelled') {
            setTimeout(() => clearCurrentOrderInternal(), 2000);
          }
        }
      }
    ).subscribe();

  return () => {
    console.log(`Cleaning up real-time subscription for order: ${orderId}`);
    supabase.removeChannel(channel);
  };
};
