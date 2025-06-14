
import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
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
  const { currentOrder, orderStatus, placeOrderAfterPayment, clearCurrentOrder, loadingOrder } = useOrderManagement();
  const { makePayment, loading: paymentLoading, error: paystackError } = usePaystack();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<{ items: CartItem[], address: string } | null>(null);

  const isProcessingOrder = loadingOrder || paymentLoading;

  useEffect(() => {
    setPaymentError(paystackError);
  }, [paystackError]);

  const validateCart = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items to proceed.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleCheckout = () => {
    if (!validateCart()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setShowAddressForm(true);
    setPaymentError(null);
    setPendingOrderData(null);
  };

  const handleAddressSubmit = async (address: string) => {
    if (!user) return;

    try {
      setPaymentError(null);
      setShowAddressForm(false);

      // Validate address
      if (!address || address.trim().length < 10) {
        toast({
          title: "Invalid Address",
          description: "Please provide a complete delivery address.",
          variant: "destructive"
        });
        setShowAddressForm(true);
        return;
      }

      // Store order data for after payment
      const orderData = { items, address };
      setPendingOrderData(orderData);

      // Process payment first
      const deliveryFee = 5;
      const totalWithDelivery = total + deliveryFee;

      const result = await makePayment({
        email: user.email || '',
        amount: totalWithDelivery,
        orderId: `temp_${Date.now()}`, // Temporary ID for payment
        customerName: user.user_metadata?.full_name || '',
        phone: user.phone || user.user_metadata?.phone_number || ''
      });

      if (result?.status === 'success') {
        // Payment successful, now create the order
        const orderId = await placeOrderAfterPayment(orderData, result.reference);
        
        if (orderId) {
          onClearCart();
          setPendingOrderData(null);
          toast({
            title: "Order Successful",
            description: "Your payment has been processed and order has been placed!",
            variant: "default"
          });
        }
      } else if (result?.status === 'error') {
        setPendingOrderData(null);
        setPaymentError(result.message);
        toast({
          title: "Payment Failed",
          description: result.message || "Payment processing failed. Please try again.",
          variant: "destructive"
        });
      } else if (result?.status === 'cancelled') {
        setPendingOrderData(null);
        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled. You can try again anytime.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Payment/Order error:", error);
      setPendingOrderData(null);
      setPaymentError(error.message || "An error occurred. Please try again.");
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowAddressForm(true);
  };

  const getTotalItems = () => {
    return items.reduce((totalItems, item) => totalItems + item.quantity, 0);
  };

  const startNewOrder = () => {
    clearCurrentOrder();
    onClearCart();
    setPendingOrderData(null);
    setPaymentError(null);
    setShowAddressForm(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'delivered' || newStatus === 'cancelled') {
      clearCurrentOrder();
    }
  };

  if (!isOpen) return null;

  const hasActiveOrder = currentOrder && orderStatus !== 'delivered' && orderStatus !== 'cancelled';
  const deliveryFee = 5;
  const totalWithDelivery = total + deliveryFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-96 md:rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {hasActiveOrder ? 'Current Order' : 'Your Order'}
            {items.length > 0 && !hasActiveOrder && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100"
            disabled={isProcessingOrder}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isProcessingOrder ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Processing Your Request...</p>
              <p className="text-gray-500">
                {paymentLoading ? "Please complete your payment with Paystack" : "Creating your order..."}
              </p>
              {paymentError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {paymentError}
                </div>
              )}
            </div>
          ) : paymentError ? (
            <div className="text-center p-6">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-6">{paymentError}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => {
                    if (pendingOrderData) {
                      handleAddressSubmit(pendingOrderData.address);
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isProcessingOrder || !pendingOrderData}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Retry Payment
                </Button>
                <Button
                  onClick={() => {
                    setPaymentError(null);
                    setPendingOrderData(null);
                  }}
                  variant="outline"
                  disabled={isProcessingOrder}
                >
                  Back to Cart
                </Button>
              </div>
            </div>
          ) : showAddressForm ? (
            <DeliveryAddressForm 
              onAddressSubmit={handleAddressSubmit} 
              onCancel={() => setShowAddressForm(false)} 
            />
          ) : hasActiveOrder ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Your Active Order</h3>
              <OrderStatusTracker
                order={currentOrder}
                onStatusChange={handleStatusChange}
              />
              <div className="mt-6 border-t pt-4">
                <p className="text-gray-600 text-sm mb-2">You have an ongoing order. Would you like to start a new one?</p>
                <Button
                  onClick={startNewOrder}
                  variant="outline"
                  className="w-full"
                >
                  Start a New Order
                </Button>
              </div>
            </div>
          ) : (
            <>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Your cart is empty.</p>
                  <p className="text-sm">Add some delicious food to get started!</p>
                </div>
              ) : (
                <div className="p-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${JSON.stringify(item.selectedCustomizations)}`} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {item.selectedCustomizations.map(c => c.name).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.selectedCustomizations)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium text-gray-800 min-w-[2rem] text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedCustomizations)}
                          className="w-8 h-8 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, 0, item.selectedCustomizations)}
                          className="w-8 h-8 text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isProcessingOrder && !paymentError && !hasActiveOrder && items.length > 0 && !showAddressForm && (
          <div className="p-4 border-t sticky bottom-0 bg-white z-10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-700">Subtotal:</p>
              <p className="font-bold text-gray-800">{formatCurrency(total)}</p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700">Delivery Fee:</p>
              <p className="font-bold text-gray-800">{formatCurrency(deliveryFee)}</p>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
              <p>Total:</p>
              <p>{formatCurrency(totalWithDelivery)}</p>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={items.length === 0 || isProcessingOrder}
            >
              Pay Now & Place Order
            </Button>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess} 
        />
      </div>
    </div>
  );
};

export default Cart;
