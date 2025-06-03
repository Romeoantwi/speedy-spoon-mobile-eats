import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import NotificationCenter from "@/components/NotificationCenter";
import LocationMap from "@/components/LocationMap";
import { CartItem, FoodItem, CustomizationOption } from "@/types/food";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[] = [], quantity: number = 1) => {
    const customizationPrice = selectedCustomizations.reduce((total, c) => total + c.price, 0);
    const deliveryFee = 5;
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
            const deliveryFee = 5;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header 
        cartItemCount={getTotalItems()}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-orange-600">SpeedySpoon</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Fast, fresh, and delicious Ghanaian food delivered right to your doorstep
          </p>
          
          {/* Driver Signup Button */}
          <Link to="/driver-signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3">
              <Truck className="w-5 h-5 mr-2" />
              Become a Driver
            </Button>
          </Link>
        </div>

        <MenuSection onAddToCart={addToCart} />
        
        {/* Demo sections for notifications and map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Restaurant Notifications</h3>
            <NotificationCenter userType="restaurant" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Delivery Tracking</h3>
            <LocationMap showDriverLocation={true} orderStatus="picked_up" />
          </div>
        </div>
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

export default Index;
