import { useState } from "react";
import { FoodItem, MenuCategory, CustomizationOption } from "@/types/food";
import FoodCard from "./FoodCard";
import FoodDetailsModal from "./FoodDetailsModal";
import { Button } from "@/components/ui/button";

interface MenuSectionProps {
  onAddToCart: (item: FoodItem, selectedCustomizations?: CustomizationOption[], quantity?: number) => void;
}

const menuData: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    items: [
      {
        id: 1,
        name: "Crispy Chicken Wings",
        description: "Juicy wings with our signature spicy sauce",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=500",
        category: "appetizers",
        rating: 4.8,
        prepTime: "15-20 min",
        customizations: [
          { id: "sauce1", name: "Extra Spicy Sauce", price: 0.50, category: "sauce" },
          { id: "sauce2", name: "BBQ Sauce", price: 0.50, category: "sauce" },
          { id: "side1", name: "Celery Sticks", price: 2.00, category: "side" },
          { id: "side2", name: "Blue Cheese Dip", price: 1.50, category: "side" }
        ]
      },
      {
        id: 2,
        name: "Loaded Nachos",
        description: "Crispy chips topped with cheese, jalapeños, and sour cream",
        price: 10.99,
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500",
        category: "appetizers",
        rating: 4.6,
        prepTime: "10-15 min",
        customizations: [
          { id: "topping1", name: "Extra Cheese", price: 1.50, category: "topping" },
          { id: "topping2", name: "Guacamole", price: 2.00, category: "topping" },
          { id: "topping3", name: "Jalapeños", price: 0.75, category: "topping" },
          { id: "side3", name: "Sour Cream", price: 1.00, category: "side" }
        ]
      }
    ]
  },
  {
    id: "mains",
    name: "Main Courses",
    items: [
      {
        id: 3,
        name: "SpeedySpoon Burger",
        description: "Our signature beef burger with fresh lettuce, tomato, and special sauce",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500",
        category: "mains",
        rating: 4.9,
        prepTime: "20-25 min",
        customizations: [
          { id: "topping4", name: "Extra Cheese", price: 1.50, category: "topping" },
          { id: "topping5", name: "Bacon", price: 2.50, category: "topping" },
          { id: "topping6", name: "Avocado", price: 2.00, category: "topping" },
          { id: "side4", name: "French Fries", price: 3.50, category: "side" },
          { id: "side5", name: "Onion Rings", price: 4.00, category: "side" },
          { id: "drink1", name: "Soft Drink", price: 2.50, category: "drink" }
        ]
      },
      {
        id: 4,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, basil, and tomato sauce",
        price: 18.99,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500",
        category: "mains",
        rating: 4.7,
        prepTime: "25-30 min",
        customizations: [
          { id: "topping7", name: "Extra Cheese", price: 2.00, category: "topping" },
          { id: "topping8", name: "Pepperoni", price: 3.00, category: "topping" },
          { id: "topping9", name: "Mushrooms", price: 1.50, category: "topping" },
          { id: "topping10", name: "Olives", price: 1.50, category: "topping" },
          { id: "side6", name: "Garlic Bread", price: 4.50, category: "side" }
        ]
      },
      {
        id: 5,
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with seasonal vegetables and lemon butter",
        price: 22.99,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500",
        category: "mains",
        rating: 4.8,
        prepTime: "25-30 min",
        customizations: [
          { id: "side7", name: "Rice Pilaf", price: 3.00, category: "side" },
          { id: "side8", name: "Mashed Potatoes", price: 3.50, category: "side" },
          { id: "sauce3", name: "Lemon Butter Sauce", price: 1.50, category: "sauce" },
          { id: "extra1", name: "Extra Vegetables", price: 2.00, category: "extra" }
        ]
      }
    ]
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: 6,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center and vanilla ice cream",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500",
        category: "desserts",
        rating: 4.9,
        prepTime: "15-20 min"
      }
    ]
  },
  {
    id: "drinks",
    name: "Beverages",
    items: [
      {
        id: 7,
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 4.99,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500",
        category: "drinks",
        rating: 4.5,
        prepTime: "5 min"
      },
      {
        id: 8,
        name: "Iced Coffee",
        description: "Cold brew coffee with ice and your choice of milk",
        price: 3.99,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500",
        category: "drinks",
        rating: 4.4,
        prepTime: "5 min"
      }
    ]
  }
];

const MenuSection = ({ onAddToCart }: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const currentCategory = menuData.find(cat => cat.id === activeCategory);

  const handleFoodCardClick = (item: FoodItem) => {
    if (item.customizations && item.customizations.length > 0) {
      setSelectedItem(item);
    } else {
      onAddToCart(item);
    }
  };

  const handleModalAddToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[], quantity: number) => {
    onAddToCart(item, selectedCustomizations, quantity);
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Menu</h2>
      
      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {menuData.map((category) => (
          <Button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={`${
              activeCategory === category.id
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "border-orange-500 text-orange-500 hover:bg-orange-50"
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCategory?.items.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            onAddToCart={() => handleFoodCardClick(item)}
          />
        ))}
      </div>

      {/* Food Details Modal */}
      <FoodDetailsModal
        item={selectedItem!}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleModalAddToCart}
      />
    </section>
  );
};

export default MenuSection;
