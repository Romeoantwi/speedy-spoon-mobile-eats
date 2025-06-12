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
  // We're now getting clearCurrentOrder and loadingOrder from useOrderManagement
  const { currentOrder, orderStatus, createOrder, clearCurrentOrder, loadingOrder } = useOrderManagement();
  const { makePayment, loading: paymentLoading, error: paystackError } = usePaystack();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [failedPaymentOrderId, setFailedPaymentOrderId] = useState<string | null>(null);
  // Combined loading state for any active process (order creation, payment)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Synchronize paystackError with local paymentError state
  useEffect(() => {
    setPaymentError(paystackError);
  }, [paystackError]);

  // Manage overall loading state based on order creation and payment processing
  useEffect(() => {
    setIsProcessingOrder(loadingOrder || paymentLoading);
  }, [loadingOrder, paymentLoading]);


  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setShowAddressForm(true);
    setPaymentError(null); // Clear previous errors
  };

  const handlePaymentFailed = (orderId: string | null, errorMessage: string) => {
    setFailedPaymentOrderId(orderId);
    setPaymentError(errorMessage);
    toast({
      title: "Payment Failed",
      description: errorMessage || "There was an error processing your payment.",
      variant: "destructive"
    });
    // setIsProcessingOrder will be updated by the useEffect linked to paymentLoading/loadingOrder
  };

  const handleRetryPayment = async () => {
    if (!failedPaymentOrderId || !user) return;

    try {
      setPaymentError(null); // Clear previous error for retry

      const result = await makePayment(
        {
          email: user.email || '',
          amount: total + 5, // Include delivery fee in total (GH₵ 5.00)
          orderId: failedPaymentOrderId,
          customerName: user.user_metadata?.full_name,
          phone: user.phone
        }
      );

      if (result && result.status === 'success') {
        onClearCart(); // Clear the cart as payment is successful
        setFailedPaymentOrderId(null); // Clear failed state
        // The success toast and order status update is handled by usePaystack callback
      } else if (result && result.status === 'error') {
        handlePaymentFailed(failedPaymentOrderId, result.message);
      }
      // If result is undefined, it means the Paystack pop-up was successfully opened,
      // and the outcome (success/error/cancel) will be handled by its callback.
    } catch (error: any) {
      console.error("Error during retry payment:", error);
      handlePaymentFailed(failedPaymentOrderId, error.message || "Payment failed. Please try again.");
    }
    // No finally block for setIsProcessingOrder(false) here, as paymentLoading from hook will handle it
  };

  const handleAddressSubmit = async (address: string) => {
    if (!user) return;

    try {
      setPaymentError(null); // Clear previous error
      setShowAddressForm(false);

      // Create order first
      const orderId = await createOrder(items, address);

      if (!orderId) {
        throw new Error("Failed to create order. Please try again.");
      }

      // Initiate Paystack payment via the hook
      const result = await makePayment({
        email: user.email || '',
        amount: total + 5, // Include delivery fee in total (GH₵ 5.00)
        orderId: orderId, // Pass the newly created orderId
        customerName: user.user_metadata?.full_name,
        phone: user.phone
      });

      // Check for immediate errors from makePayment (e.g., configuration issues)
      if (result && result.status === 'error') {
        handlePaymentFailed(orderId, result.message);
      }
      // If result is undefined, it means the Paystack pop-up was successfully opened,
      // and its callback will handle the final payment outcome.
    } catch (error: any) {
      console.error("Error creating order or initiating payment:", error);
      // Pass null for orderId if order creation failed, otherwise pass the failed orderId
      handlePaymentFailed(error.orderId || null, error.message || "Payment failed. Please try again.");
    }
    // No finally block for setIsProcessingOrder(false) here, as loadingOrder/paymentLoading from hooks will handle it
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowAddressForm(true); // Proceed to address form after successful auth
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to allow starting a new order while one is active
  const startNewOrder = () => {
    clearCurrentOrder(); // Clear the active order state from order management hook
    onClearCart(); // Clear the current shopping cart contents
    setFailedPaymentOrderId(null); // Reset any failed payment state
    setPaymentError(null); // Clear any payment errors
    setShowAddressForm(false); // Hide address form
    // isProcessingOrder will automatically update based on loadingOrder/paymentLoading
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
        <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-96 md:rounded-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {/* Conditional title based on active order or cart content */}
              {currentOrder && orderStatus !== 'delivered' && orderStatus !== 'cancelled' ? 'Current Order' : 'Your Order'}
              {items.length > 0 && !(currentOrder && orderStatus !== 'delivered' && orderStatus !== 'cancelled') && (
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
              disabled={isProcessingOrder} {/* Disable close during any active process */}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isProcessingOrder ? ( // Show loader when any payment/order process is active
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Processing Your Request...</p>
                <p className="text-gray-500">
                  {loadingOrder ? "Creating your order..." : "Please complete your payment with Paystack"}
                </p>

                {paymentError && ( // Display any payment errors during loading
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {paymentError}
                  </div>
                )}
              </div>
            ) : failedPaymentOrderId ? ( // Display payment failure message and retry option
              <div className="text-center p-6">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="xl font-bold text-gray-800 mb-2">Payment Failed</h3>
                <p className="text-gray-600 mb-6">{paymentError}</p>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleRetryPayment}
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isProcessingOrder}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Retry Payment
                  </Button>
                  <Button
                    onClick={() => {
                      setFailedPaymentOrderId(null); // Allow returning to cart view
                      setPaymentError(null);
                    }}
                    variant="outline"
                    disabled={isProcessingOrder}
                  >
                    Back to Cart
                  </Button>
                </div>
              </div>
            ) : showAddressForm ? ( // Display delivery address form
              <DeliveryAddressForm onSubmit={handleAddressSubmit} onBack={() => setShowAddressForm(false)} />
            ) : currentOrder && orderStatus !== 'delivered' && orderStatus !== 'cancelled' ? (
              // Display current order status if an order is active and not completed/cancelled
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Your Active Order</h3>
                <OrderStatusTracker
                  order={currentOrder}
                  status={orderStatus}
                  // These callbacks handle user interaction to clear the order
                  onOrderComplete={() => clearCurrentOrder()}
                  onOrderCancelled={() => clearCurrentOrder()}
                  onTrackMore={() => { /* Implement navigation to a full tracking page if needed */ }}
                />
                <div className="mt-6 border-t pt-4">
                  <p className="text-gray-600 text-sm mb-2">You have an ongoing order. Would you like to start a new one?</p>
                  <Button
                    onClick={startNewOrder} // Call the new startNewOrder function
                    variant="outline"
                    className="w-full"
                  >
                    Start a New Order
                  </Button>
                </div>
              </div>
            ) : (
              // Default cart view: empty cart or populated cart
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
                      <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div>
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
                          <span className="font-medium text-gray-800">{item.quantity}</span>
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
                            onClick={() => onUpdateQuantity(item.id, 0, item.selectedCustomizations)} // Remove item
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

          {/* Footer - Only show if in the default cart view and items are present */}
          {!isProcessingOrder && !failedPaymentOrderId && !(currentOrder && orderStatus !== 'delivered' && orderStatus !== 'cancelled') && items.length > 0 && !showAddressForm && (
            <div className="p-4 border-t sticky bottom-0 bg-white z-10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700">Subtotal:</p>
                <p className="font-bold text-gray-800">{formatCurrency(total)}</p>
              </div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700">Delivery Fee:</p>
                <p className="font-bold text-gray-800">{formatCurrency(5)}</p>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
                <p>Total:</p>
                <p>{formatCurrency(total + 5)}</p>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={items.length === 0 || isProcessingOrder}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}

          {/* Auth Modal */}
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    </>
  );
};

export default Cart;