import { useState } from "react";
import Header from "@/components/Header";
import MenuSection from "@/components/MenuSection";
import Cart from "@/components/Cart";
import { CartItem, FoodItem, CustomizationOption } from "@/types/food";

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, fresh, and delicious food delivered right to your doorstep
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
      />
    </div>
  );
};

export default Index;
