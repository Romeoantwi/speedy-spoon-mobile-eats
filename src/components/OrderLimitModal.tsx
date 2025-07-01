
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderLimitModal = ({ isOpen, onClose }: OrderLimitModalProps) => {
  if (!isOpen) return null;

  const handleCallNow = () => {
    window.location.href = "tel:+233546906739";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Order Limit Reached</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-gray-600 mb-4">
              You've reached the maximum order limit of 5 items. For larger orders, please call us directly.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleCallNow}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call +233 546 906 739
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderLimitModal;
