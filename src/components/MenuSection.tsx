
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
    id: "main-dishes",
    name: "Main Dishes",
    items: [
      {
        id: 1,
        name: "Assorted Jollof with Chicken and Salad",
        description: "Traditional Ghanaian jollof rice with assorted chicken pieces and fresh salad",
        price: 35,
        image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=500",
        category: "main-dishes",
        rating: 4.9,
        prepTime: "25-30 min",
        customizations: [
          { id: "egg1", name: "Egg", price: 4, category: "extra" },
          { id: "chicken1", name: "Extra Chicken", price: 15, category: "extra" },
          { id: "gizzard1", name: "Gizzard", price: 10, category: "extra" },
          { id: "plantain1", name: "Fried Plantain (3 pieces)", price: 5, category: "extra" }
        ]
      },
      {
        id: 2,
        name: "Assorted Fried Rice",
        description: "Delicious fried rice with assorted meat and vegetables",
        price: 35,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500",
        category: "main-dishes",
        rating: 4.8,
        prepTime: "25-30 min",
        customizations: [
          { id: "egg2", name: "Egg", price: 4, category: "extra" },
          { id: "chicken2", name: "Extra Chicken", price: 15, category: "extra" },
          { id: "gizzard2", name: "Gizzard", price: 10, category: "extra" },
          { id: "plantain2", name: "Fried Plantain (3 pieces)", price: 5, category: "extra" }
        ]
      },
      {
        id: 3,
        name: "Assorted Noodles",
        description: "Tasty noodles with assorted meat and spices",
        price: 30,
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500",
        category: "main-dishes",
        rating: 4.7,
        prepTime: "20-25 min",
        customizations: [
          { id: "egg3", name: "Egg", price: 4, category: "extra" },
          { id: "chicken3", name: "Extra Chicken", price: 15, category: "extra" },
          { id: "gizzard3", name: "Gizzard", price: 10, category: "extra" },
          { id: "sausage3", name: "Sausage", price: 4, category: "extra" }
        ]
      },
      {
        id: 4,
        name: "Assorted Spaghetti",
        description: "Classic spaghetti with assorted meat in rich tomato sauce",
        price: 25,
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=500",
        category: "main-dishes",
        rating: 4.6,
        prepTime: "20-25 min",
        customizations: [
          { id: "egg4", name: "Egg", price: 4, category: "extra" },
          { id: "chicken4", name: "Extra Chicken", price: 15, category: "extra" },
          { id: "gizzard4", name: "Gizzard", price: 10, category: "extra" },
          { id: "sausage4", name: "Sausage", price: 4, category: "extra" }
        ]
      }
    ]
  }
];

const MenuSection = ({ onAddToCart }: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState("main-dishes");
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
    setSelectedItem(null);
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
