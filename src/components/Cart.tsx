import { useState } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/food";
import { useToast } from "@/hooks/use-toast";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { useAuth } from "@/hooks/useAuth";
import { usePaystack } from "@/hooks/usePaystack";
import OrderStatusTracker from "./OrderStatusTracker";
import DeliveryAddressForm from "./DeliveryAddressForm";
import AuthModal from "./AuthModal";
import { formatCurrency } from "@/utils/currency";

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: number, quantity: number, selectedCustomizations?: any[]) => void;
  onClearCart: () => void;
  total: number;
}

const Cart = ({ items, isOpen, onClose, onUpdateQuantity, onClearCart, total }: CartProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrder, orderStatus, createOrder, updateOrderStatus } = useOrderManagement();
  const { makePayment, loading: paymentLoading } = usePaystack();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (address: string) => {
    if (!user) return;

    try {
      // Create order first
      const orderId = await createOrder(items, address);
      
      setProcessingPayment(true);
      setShowAddressForm(false);

      // Process payment with Paystack
      await makePayment(
        user.email || '',
        total,
        orderId,
        (transaction) => {
          // Payment successful
          toast({
            title: "Payment Successful! 🎉",
            description: `Order #${orderId.slice(-8)} has been confirmed and sent to the restaurant.`,
          });
          
          // Clear the cart
          onClearCart();
          setProcessingPayment(false);
          
          // Keep cart open to show order tracking
        },
        () => {
          // Payment cancelled or closed
          setProcessingPayment(false);
          toast({
            title: "Payment Cancelled",
            description: "Your order has been saved but payment was not completed.",
            variant: "destructive"
          });
        },
        user.user_metadata?.full_name,
        user.phone
      );
      
    } catch (error: any) {
      setProcessingPayment(false);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowAddressForm(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
        <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-96 md:rounded-lg overflow-hidden animate-slide-in-right">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              {currentOrder ? 'Order Status' : 'Your Order'}
            </h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {processingPayment ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-lg font-medium">Processing Payment...</p>
                <p className="text-gray-500">Please complete your payment with Paystack</p>
              </div>
            ) : currentOrder ? (
              <OrderStatusTracker 
                order={currentOrder} 
                onStatusChange={updateOrderStatus}
              />
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {item.selectedCustomizations.map(c => c.name).join(', ')}
                        </div>
                      )}
                      <p className="text-orange-600 font-bold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.selectedCustomizations)}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedCustomizations)}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!currentOrder && !processingPayment && items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-orange-600">{formatCurrency(total)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={paymentLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
              >
                {user ? 'Place Order & Pay' : 'Sign In to Order'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Paystack
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddressForm && (
        <DeliveryAddressForm
          onAddressSubmit={handleAddressSubmit}
          onCancel={() => setShowAddressForm(false)}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Cart;
