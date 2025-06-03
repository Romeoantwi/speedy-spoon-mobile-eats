
import { useState } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodItem, CustomizationOption } from "@/types/food";

interface FoodDetailsModalProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: FoodItem, selectedCustomizations: CustomizationOption[], quantity: number) => void;
}

const FoodDetailsModal = ({ item, isOpen, onClose, onAddToCart }: FoodDetailsModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationOption[]>([]);

  if (!isOpen || !item) return null;

  const handleCustomizationToggle = (customization: CustomizationOption) => {
    console.log('Toggling customization:', customization);
    
    setSelectedCustomizations(prev => {
      const exists = prev.find(c => c.id === customization.id);
      let newCustomizations;
      
      if (exists) {
        newCustomizations = prev.filter(c => c.id !== customization.id);
        console.log('Removed customization:', customization.name);
      } else {
        newCustomizations = [...prev, customization];
        console.log('Added customization:', customization.name);
      }
      
      console.log('New customizations:', newCustomizations);
      return newCustomizations;
    });
  };

  const getTotalPrice = () => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    const deliveryFee = 5;
    return (item.price + customizationPrice + deliveryFee) * quantity;
  };

  const handleAddToCart = () => {
    console.log('Adding to cart with customizations:', selectedCustomizations);
    onAddToCart(item, selectedCustomizations, quantity);
    onClose();
    setQuantity(1);
    setSelectedCustomizations([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="mb-4">
            <p className="text-xl font-bold text-orange-600">₵{item.price}</p>
            <p className="text-sm text-gray-500">+ ₵5 delivery fee</p>
          </div>

          {/* Extras Section */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Add Extras
              </h3>
              <div className="space-y-3">
                {item.customizations.map((customization) => {
                  const isSelected = selectedCustomizations.some(c => c.id === customization.id);
                  
                  return (
                    <div
                      key={customization.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleCustomizationToggle(customization)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{customization.name}</span>
                      </div>
                      <span className="text-orange-600 font-semibold">
                        +₵{customization.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Extras Summary */}
          {selectedCustomizations.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Selected Extras:</h4>
              <div className="space-y-1">
                {selectedCustomizations.map((custom) => (
                  <div key={custom.id} className="flex justify-between text-sm">
                    <span>{custom.name}</span>
                    <span>+₵{custom.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold">Quantity</span>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                variant="outline"
                size="icon"
                className="w-10 h-10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                onClick={() => setQuantity(quantity + 1)}
                variant="outline"
                size="icon"
                className="w-10 h-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart - ₵{getTotalPrice().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
