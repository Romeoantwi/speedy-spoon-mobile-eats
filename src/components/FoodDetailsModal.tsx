
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

  if (!isOpen) return null;

  const handleCustomizationToggle = (customization: CustomizationOption) => {
    setSelectedCustomizations(prev => {
      const exists = prev.find(c => c.id === customization.id);
      if (exists) {
        return prev.filter(c => c.id !== customization.id);
      } else {
        return [...prev, customization];
      }
    });
  };

  const getTotalPrice = () => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    return (item.price + customizationPrice) * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart(item, selectedCustomizations, quantity);
    onClose();
    setQuantity(1);
    setSelectedCustomizations([]);
  };

  const groupedCustomizations = item.customizations?.reduce((acc, customization) => {
    if (!acc[customization.category]) {
      acc[customization.category] = [];
    }
    acc[customization.category].push(customization);
    return acc;
  }, {} as Record<string, CustomizationOption[]>) || {};

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
          <p className="text-2xl font-bold text-orange-600 mb-6">${item.price}</p>

          {/* Customization Options */}
          {Object.entries(groupedCustomizations).map(([category, options]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                {category}s
              </h3>
              <div className="space-y-2">
                {options.map((customization) => (
                  <div
                    key={customization.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCustomizationToggle(customization)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomizations.some(c => c.id === customization.id)}
                        onChange={() => handleCustomizationToggle(customization)}
                        className="w-4 h-4 text-orange-600 rounded"
                      />
                      <span className="font-medium">{customization.name}</span>
                    </div>
                    <span className="text-orange-600 font-semibold">
                      +${customization.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

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
            Add to Cart - ${getTotalPrice().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailsModal;
