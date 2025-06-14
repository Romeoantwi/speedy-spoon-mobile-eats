
import { Order } from '@/types/order';
import { UseToastReturn } from '@/hooks/use-toast';

export const showStatusUpdateToast = (toast: UseToastReturn['toast'], status: Order['status']) => {
  const statusMessages = {
    'placed': { title: "Order Placed", description: "Your order has been received" },
    'confirmed': { title: "Order Confirmed", description: "Restaurant is preparing your order" },
    'preparing': { title: "Order Preparing", description: "Your food is being prepared" },
    'ready': { title: "Order Ready", description: "Your order is ready for pickup" },
    'picked_up': { title: "Order Picked Up", description: "Driver is on the way to you" },
    'delivered': { title: "Order Delivered", description: "Your order has been delivered!" },
    'cancelled': { title: "Order Cancelled", description: "Your order has been cancelled" }
  };

  const message = statusMessages[status];
  if (message) {
    toast({
      title: message.title,
      description: message.description,
      variant: status === 'cancelled' ? 'destructive' : 'default',
    });
  }
};
