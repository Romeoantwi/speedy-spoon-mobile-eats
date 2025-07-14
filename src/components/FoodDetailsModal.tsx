
import { useState } from "react";
import { X, Plus, Minus, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodItem, CustomizationOption, SpiceLevel } from "@/types/food";

interface FoodDetailsModalProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: FoodItem, selectedCustomizations: CustomizationOption[], quantity: number, spiceLevel?: SpiceLevel) => void;
}

const FoodDetailsModal = ({ item, isOpen, onClose, onAddToCart }: FoodDetailsModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ customization: CustomizationOption; quantity: number }[]>([]);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState<SpiceLevel>('mild');

  if (!isOpen || !item) return null;

  const handleCustomizationQuantityChange = (customization: CustomizationOption, quantity: number) => {
    console.log('Changing customization quantity:', customization, quantity);
    
    setSelectedCustomizations(prev => {
      const existingIndex = prev.findIndex(c => c.customization.id === customization.id);
      
      if (quantity === 0) {
        // Remove if quantity is 0
        return prev.filter(c => c.customization.id !== customization.id);
      }
      
      if (existingIndex >= 0) {
        // Update existing quantity
        const newCustomizations = [...prev];
        newCustomizations[existingIndex] = { customization, quantity };
        return newCustomizations;
      } else {
        // Add new customization
        return [...prev, { customization, quantity }];
      }
    });
  };

  const getTotalPrice = () => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + (c.customization.price * c.quantity), 0);
    return (item.price + customizationPrice) * quantity;
  };

  const handleAddToCart = () => {
    console.log('Adding to cart with customizations:', selectedCustomizations);
    console.log('Selected spice level:', selectedSpiceLevel);
    // Convert back to flat array for compatibility
    const flatCustomizations = selectedCustomizations.flatMap(c => 
      Array(c.quantity).fill(c.customization)
    );
    onAddToCart(item, flatCustomizations, quantity, item.hasSpiceLevels ? selectedSpiceLevel : undefined);
    onClose();
    setQuantity(1);
    setSelectedCustomizations([]);
    setSelectedSpiceLevel('mild');
  };

  const spiceLevels: { level: SpiceLevel; label: string; emoji: string }[] = [
    { level: 'mild', label: 'Mild', emoji: '🟢' },
    { level: 'medium', label: 'Medium', emoji: '🟡' },
    { level: 'hot', label: 'Hot', emoji: '🟠' },
    { level: 'extra-hot', label: 'Extra Hot', emoji: '🔥' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
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
            className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 rounded-full"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{item.name}</h2>
          <p className="text-muted-foreground mb-4">{item.description}</p>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xl font-bold text-primary">₵{item.price}</p>
            <div className="flex items-center space-x-1 bg-primary/10 rounded-full px-2 py-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">{item.rating}</span>
            </div>
          </div>

          {/* Spice Level Selection */}
          {item.hasSpiceLevels && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Choose Spice Level
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {spiceLevels.map(({ level, label, emoji }) => (
                  <div
                    key={level}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSpiceLevel === level
                        ? 'bg-primary/10 border-primary/20 ring-2 ring-primary'
                        : 'hover:bg-secondary border-border'
                    }`}
                    onClick={() => setSelectedSpiceLevel(level)}
                  >
                    <span className="text-lg mr-2">{emoji}</span>
                    <span className="font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extras Section */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Add Extras
              </h3>
              <div className="space-y-3">
                {item.customizations.map((customization) => {
                  const selectedItem = selectedCustomizations.find(c => c.customization.id === customization.id);
                  const currentQuantity = selectedItem?.quantity || 0;
                  
                  return (
                    <div
                      key={customization.id}
                      className="flex items-center justify-between p-3 border rounded-lg transition-all hover:bg-secondary border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{customization.name}</span>
                          <span className="text-primary font-semibold">₵{customization.price}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => handleCustomizationQuantityChange(customization, Math.max(0, currentQuantity - 1))}
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-lg font-semibold w-8 text-center">{currentQuantity}</span>
                          <Button
                            onClick={() => handleCustomizationQuantityChange(customization, currentQuantity + 1)}
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Extras Summary */}
          {selectedCustomizations.length > 0 && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="font-medium text-foreground mb-2">Selected Extras:</h4>
              <div className="space-y-1">
                {selectedCustomizations.map((custom) => (
                  <div key={custom.customization.id} className="flex justify-between text-sm">
                    <span>{custom.customization.name} x{custom.quantity}</span>
                    <span>+₵{(custom.customization.price * custom.quantity).toFixed(2)}</span>
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
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
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
