
import { useState } from "react";
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import AuthModal from "@/components/AuthModal";
import OrderLimitModal from "@/components/OrderLimitModal";
import { CartItem, FoodItem, CustomizationOption, SpiceLevel } from "@/types/food";
import { formatCurrencyShort } from "@/utils/currency";
import { calculateDeliveryFee, isAtMaxOrderLimit } from "@/utils/deliveryFee";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import speedySpoonLogo from "@/assets/speedyspoon-logo.png";

const Customer = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOrderLimitModal, setShowOrderLimitModal] = useState(false);

  const addToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[] = [], quantity: number = 1, spiceLevel?: SpiceLevel) => {
    const totalItems = getTotalItems();
    
    // Check if adding this quantity would exceed the limit
    if (totalItems + quantity > 5) {
      setShowOrderLimitModal(true);
      return;
    }

    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    const totalPrice = (item.price + customizationPrice) * quantity;

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(cartItem => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.selectedCustomizations) === JSON.stringify(selectedCustomizations) &&
        cartItem.selectedSpiceLevel === spiceLevel
      );
      
      if (existingItemIndex !== -1) {
        return prev.map((cartItem, index) =>
          index === existingItemIndex
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + quantity,
                totalPrice: cartItem.totalPrice + totalPrice
              }
            : cartItem
        );
      }
      
      return [...prev, { 
        ...item, 
        quantity, 
        selectedCustomizations,
        selectedSpiceLevel: spiceLevel,
        totalPrice
      }];
    });

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: number, quantity: number, selectedCustomizations?: CustomizationOption[], spiceLevel?: SpiceLevel) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => 
        !(item.id === id && 
          JSON.stringify(item.selectedCustomizations) === JSON.stringify(selectedCustomizations) &&
          item.selectedSpiceLevel === spiceLevel)
      ));
    } else {
      const totalItems = getTotalItems();
      const currentItem = cartItems.find(item => 
        item.id === id && 
        JSON.stringify(item.selectedCustomizations) === JSON.stringify(selectedCustomizations) &&
        item.selectedSpiceLevel === spiceLevel
      );
      
      if (currentItem) {
        const difference = quantity - currentItem.quantity;
        if (totalItems + difference > 5) {
          setShowOrderLimitModal(true);
          return;
        }
      }

      setCartItems(prev =>
        prev.map(item => {
          if (item.id === id && 
              JSON.stringify(item.selectedCustomizations) === JSON.stringify(selectedCustomizations) &&
              item.selectedSpiceLevel === spiceLevel) {
            const customizationPrice = item.selectedCustomizations?.reduce((total, c) => total + c.price, 0) || 0;
            const unitPrice = item.price + customizationPrice;
            return { 
              ...item, 
              quantity,
              totalPrice: unitPrice * quantity
            };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getDeliveryFee = () => {
    return calculateDeliveryFee(getTotalItems());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <img 
            src={speedySpoonLogo} 
            alt="SpeedySpoon Logo" 
            className="h-20 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-gray-300 text-lg">Loading your culinary experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
        <Header 
          cartItemCount={0}
          onCartClick={() => {}}
          userType="customer"
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent blur-3xl -z-10"></div>
            <div className="flex justify-center mb-6">
              <img 
                src={speedySpoonLogo} 
                alt="SpeedySpoon Logo" 
                className="h-24 w-auto"
              />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-red-400 mb-4 uppercase tracking-wider">
              Get Your Feast No Sweat
            </p>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Experience the finest Ghanaian cuisine delivered to your doorstep with lightning speed
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-gray-900 to-black border-red-600/30 shadow-2xl">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-600/50">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-red-400 text-2xl">Sign In Required</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-gray-300 text-lg">
                  Please sign in to your account to browse our premium menu and place orders.
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950">
      <Header 
        cartItemCount={getTotalItems()}
        onCartClick={() => setIsCartOpen(true)}
        userType="customer"
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent blur-3xl -z-10"></div>
          <div className="flex justify-center mb-6">
            <img 
              src={speedySpoonLogo} 
              alt="SpeedySpoon Logo" 
              className="h-24 w-auto"
            />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-red-400 mb-4 uppercase tracking-wider">
            Get Your Feast No Sweat
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the finest Ghanaian cuisine delivered to your doorstep with lightning speed
          </p>
        </div>

        <MenuSection onAddToCart={addToCart} />
      </main>

      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        total={getTotalPrice()}
        deliveryFee={getDeliveryFee()}
      />

      <OrderLimitModal
        isOpen={showOrderLimitModal}
        onClose={() => setShowOrderLimitModal(false)}
      />
    </div>
  );
};

export default Customer;
