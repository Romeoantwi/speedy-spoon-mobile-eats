
import { useState } from "react";
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import AuthModal from "@/components/AuthModal";
import { CartItem, FoodItem, CustomizationOption } from "@/types/food";
import { formatCurrencyShort } from "@/utils/currency";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Customer = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const addToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[] = [], quantity: number = 1) => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    const totalPrice = (item.price + customizationPrice) * quantity;

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(cartItem => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.selectedCustomizations) === JSON.stringify(selectedCustomizations)
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
        totalPrice
      }];
    });
  };

  const updateQuantity = (id: number, quantity: number, selectedCustomizations?: CustomizationOption[]) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => 
        !(item.id === id && JSON.stringify(item.selectedCustomizations) === JSON.stringify(selectedCustomizations))
      ));
    } else {
      setCartItems(prev =>
        prev.map(item => {
          if (item.id === id && JSON.stringify(item.selectedCustomizations) === JSON.stringify(selectedCustomizations)) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              Welcome to <span className="gradient-text">SpeedySpoon</span>
            </h1>
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
                <div className="glass-effect rounded-lg p-4">
                  <p className="text-gray-300 text-sm flex items-center justify-center">
                    🚚 <span className="font-semibold ml-2">Delivery Fee:</span> 
                    <span className="text-red-400 ml-2">{formatCurrencyShort(5.00)}</span>
                    <span className="text-xs text-gray-500 ml-2">All prices in Ghanaian Cedis</span>
                  </p>
                </div>
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
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Welcome to <span className="gradient-text">SpeedySpoon</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the finest Ghanaian cuisine delivered to your doorstep with lightning speed
          </p>
          <div className="glass-effect rounded-lg p-4 inline-block">
            <p className="text-gray-300 flex items-center">
              🚚 <span className="font-semibold ml-2">Delivery Fee:</span> 
              <span className="text-red-400 ml-2">{formatCurrencyShort(5.00)}</span>
              <span className="text-sm text-gray-500 ml-2">All prices in Ghanaian Cedis</span>
            </p>
          </div>
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
      />
    </div>
  );
};

export default Customer;
