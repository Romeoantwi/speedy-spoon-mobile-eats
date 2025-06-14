
import { useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/food';
import { Order, OrderItem } from '@/types/order'; 
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

import { showStatusUpdateToast } from './order-management/toast';
import { loadActiveOrder } from './order-management/loadActiveOrder';
import { createOrderFn } from './order-management/createOrder';
import { setupOrderRealtime } from './order-management/realtime';

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
    loadActiveOrder(setLoadingOrder, setCurrentOrder, setOrderStatus);
  }, []);

  // Real-time order updates
  useEffect(() => {
    if (!currentOrder?.id) return;
    const cleanup = setupOrderRealtime(
      currentOrder.id,
      setCurrentOrder,
      setOrderStatus,
      (status) => showStatusUpdateToast(toast, status),
      clearCurrentOrderInternal,
    );
    return cleanup;
  }, [currentOrder?.id, clearCurrentOrderInternal, toast]);

  const createOrder = useCallback(
    async (cartItems: CartItem[], deliveryAddress: string): Promise<string | null> => {
      return createOrderFn(
        cartItems,
        deliveryAddress,
        toast,
        setCurrentOrder,
        setOrderStatus,
        setLoadingOrder
      );
    },
    [toast]
  );

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
