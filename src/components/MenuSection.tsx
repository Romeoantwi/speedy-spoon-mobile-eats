
import { useState } from "react";
import { FoodItem, MenuCategory } from "@/types/food";
import FoodCard from "./FoodCard";
import { Button } from "@/components/ui/button";

interface MenuSectionProps {
  onAddToCart: (item: FoodItem) => void;
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
        prepTime: "15-20 min"
      },
      {
        id: 2,
        name: "Loaded Nachos",
        description: "Crispy chips topped with cheese, jalapeños, and sour cream",
        price: 10.99,
        image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500",
        category: "appetizers",
        rating: 4.6,
        prepTime: "10-15 min"
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
        prepTime: "20-25 min"
      },
      {
        id: 4,
        name: "Margherita Pizza",
        description: "Classic pizza with fresh mozzarella, basil, and tomato sauce",
        price: 18.99,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500",
        category: "mains",
        rating: 4.7,
        prepTime: "25-30 min"
      },
      {
        id: 5,
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with seasonal vegetables and lemon butter",
        price: 22.99,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500",
        category: "mains",
        rating: 4.8,
        prepTime: "25-30 min"
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

  const currentCategory = menuData.find(cat => cat.id === activeCategory);

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
            onAddToCart={() => onAddToCart(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default MenuSection;
