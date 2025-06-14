
import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/order';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { showStatusUpdateToast } from './order-management/toast';
import { loadActiveOrder } from './order-management/loadActiveOrder';
import { createOrderAfterPayment } from './order-management/createOrderAfterPayment';
import { setupOrderRealtime } from './order-management/realtime';

export const useOrderManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<Order['status'] | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const showStatusToast = useCallback((status: Order['status']) => {
    showStatusUpdateToast(toast, status);
  }, [toast]);

  const clearCurrentOrderInternal = useCallback(() => {
    setCurrentOrder(null);
    setOrderStatus(null);
    localStorage.removeItem('activeOrderId');
    console.log('Cleared current order');
  }, []);

  // Load active order on mount
  useEffect(() => {
    loadActiveOrder(setLoadingOrder, setCurrentOrder, setOrderStatus);
  }, []);

  // Set up real-time subscription when we have an order
  useEffect(() => {
    if (currentOrder?.id) {
      console.log('Setting up real-time subscription for order:', currentOrder.id);
      return setupOrderRealtime(
        currentOrder.id,
        setCurrentOrder,
        setOrderStatus,
        showStatusToast,
        clearCurrentOrderInternal
      );
    }
  }, [currentOrder?.id, showStatusToast, clearCurrentOrderInternal]);

  const placeOrderAfterPayment = async (orderData: { items: any[], address: string }, paymentReference?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place an order",
        variant: "destructive",
      });
      return null;
    }

    setLoadingOrder(true);
    try {
      const orderId = await createOrderAfterPayment(
        orderData.items,
        orderData.address,
        user,
        setCurrentOrder,
        setOrderStatus,
        toast,
        paymentReference
      );

      // Add the new order to recent orders list
      if (orderId && currentOrder) {
        setRecentOrders(prev => [currentOrder, ...prev.slice(0, 4)]); // Keep last 5 orders
      }

      return orderId;
    } finally {
      setLoadingOrder(false);
    }
  };

  const clearCurrentOrder = () => {
    clearCurrentOrderInternal();
  };

  const viewOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setOrderStatus(order.status);
    localStorage.setItem('activeOrderId', order.id);
  };

  return {
    currentOrder,
    orderStatus,
    loadingOrder,
    recentOrders,
    placeOrderAfterPayment,
    clearCurrentOrder,
    viewOrderDetails,
  };
};
