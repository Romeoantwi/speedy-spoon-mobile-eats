import { useState } from "react";
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import AuthModal from "@/components/AuthModal";
import { CartItem, FoodItem, CustomizationOption } from "@/types/food";
import { formatCurrencyShort } from "@/utils/currency";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Customer = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const addToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[] = [], quantity: number = 1) => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    const deliveryFee = 5; // GH₵ 5.00 delivery fee
    const totalPrice = (item.price + customizationPrice + deliveryFee) * quantity;

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
            const deliveryFee = 5; // GH₵ 5.00 delivery fee
            const unitPrice = item.price + customizationPrice + deliveryFee;
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Header 
          cartItemCount={0}
          onCartClick={() => {}}
          userType="customer"
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-orange-600">SpeedySpoon</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Fast, fresh, and delicious Ghanaian food delivered right to your doorstep
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-600">Sign In Required</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Please sign in to your account to browse our menu and place orders.
                </p>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Sign In to Continue
                </Button>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-gray-700 text-sm">
                    🚚 <span className="font-semibold">Delivery Fee:</span> {formatCurrencyShort(5.00)} 
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header 
        cartItemCount={getTotalItems()}
        onCartClick={() => setIsCartOpen(true)}
        userType="customer"
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-orange-600">SpeedySpoon</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Fast, fresh, and delicious Ghanaian food delivered right to your doorstep
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-gray-700">
              🚚 <span className="font-semibold">Delivery Fee:</span> {formatCurrencyShort(5.00)} 
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
