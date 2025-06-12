import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/food";
import { useToast } from "@/hooks/use-toast";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { useAuth } from "@/hooks/useAuth";
import { usePaystack } from "@/hooks/usePaystack"; // IMPORT THE NEW HOOK
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
  const { makePayment, loading: paymentLoading, error: paystackError } = usePaystack(); // USE THE NEW HOOK

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(paystackError); // Initialize with paystack hook error
  const [failedPaymentOrderId, setFailedPaymentOrderId] = useState<string | null>(null);

  // Effect to update local paymentError when paystackError changes
  // This is a simple way to propagate errors from the hook to the component's state
  useState(() => {
    setPaymentError(paystackError);
  }, [paystackError]);


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
    // setProcessingPayment(false); // Now managed by paystackLoading
    setPaymentError(errorMessage);
    toast({
      title: "Payment Failed",
      description: errorMessage || "There was an error processing your payment.",
      variant: "destructive"
    });
  };

  const handleRetryPayment = async () => {
    if (!failedPaymentOrderId || !user) return;

    try {
      setPaymentError(null); // Clear previous error for retry

      const result = await makePayment(
        {
          email: user.email || '',
          amount: total + 5, // Include delivery fee in total
          orderId: failedPaymentOrderId,
          customerName: user.user_metadata?.full_name,
          phone: user.phone
        }
      );

      if (result && result.status === 'success') {
        onClearCart();
        setFailedPaymentOrderId(null);
        // The success toast is already handled by usePaystack
      } else if (result && result.status === 'error') {
        handlePaymentFailed(failedPaymentOrderId, result.message);
      }
      // If result is undefined, it means the pop-up was opened, and callback will handle outcome.

    } catch (error: any) {
      console.error("Error during retry payment:", error);
      handlePaymentFailed(failedPaymentOrderId, error.message || "Payment failed. Please try again.");
    }
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
        amount: total + 5, // Include delivery fee in total
        orderId: orderId, // Pass the newly created orderId
        customerName: user.user_metadata?.full_name,
        phone: user.phone
      });

      // Check for immediate errors from makePayment (e.g., config error)
      if (result && result.status === 'error') {
        handlePaymentFailed(orderId, result.message);
      }
      // If result is undefined, it means the pop-up was opened, and callback will handle outcome.

    } catch (error: any) {
      console.error("Error creating order or initiating payment:", error);
      handlePaymentFailed(null, error.message || "Payment failed. Please try again.");
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowAddressForm(true);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
        <div className="bg-white w-full h-full md:h-auto md:max-h-[80vh] md:w-96 md:rounded-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-gray-800">
              {currentOrder ? 'Order Status' : 'Your Order'}
              {items.length > 0 && !currentOrder && (
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
              disabled={paymentLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {paymentLoading ? ( // Use paymentLoading from hook
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Processing Payment...</p>
                <p className="text-gray-500">Please complete your payment with Paystack</p>

                {paymentError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {paymentError}
                  </div>
                )}
              </div>
            ) : failedPaymentOrderId ? (
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
                    disabled={paymentLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Retry Payment
                  </Button>
                  <Button
                    onClick={() => {
                      setFailedPaymentOrderId(null);
                      setPaymentError(null);
                    }}
                    variant="outline"
                    disabled={paymentLoading}
                  >
                    Back to Cart
                  </Button>
                </div>
              </div>
            ) : currentOrder ? (
              <OrderStatusTracker
                order={currentOrder}
                onStatusChange={updateOrderStatus}
                onClose={onClose}
              />
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Add some delicious items to get started!</p>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="mt-6"
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {items.map((item, index) => (
                  <div
                    key={`<span class="math-inline">\{item\.id\}\-</span>{index}`}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/food-placeholder.png';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-orange-600 font-bold whitespace-nowrap ml-2">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>

                      {item.selectedCustomizations?.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500 mb-1">Customizations:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.selectedCustomizations.map((c, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.selectedCustomizations)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.selectedCustomizations)}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!currentOrder && !paymentLoading && !failedPaymentOrderId && items.length > 0 && ( // Use paymentLoading
            <div className="border-t p-4 space-y-4 sticky bottom-0 bg-white">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Subtotal:</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Delivery Fee:</span>
                <span>{formatCurrency(5)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-orange-600">{formatCurrency(total + 5)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={paymentLoading} // Use paymentLoading
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
              >
                {paymentLoading ? ( // Use paymentLoading
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {user ? 'Proceed to Payment' : 'Sign In to Order'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Secure payment powered by Paystack</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <DeliveryAddressForm
          onAddressSubmit={handleAddressSubmit}
          onCancel={() => {
            setShowAddressForm(false);
            setPaymentError(null);
          }}
          defaultAddress={user?.user_metadata?.address}
          isLoading={paymentLoading} // Use paymentLoading
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        redirectMessage="To complete your order"
      />
    </>
  );
};

export default Cart;