
import { useState } from "react";
import { FoodItem, MenuCategory, CustomizationOption, SpiceLevel } from "@/types/food";
import FoodCard from "./FoodCard";
import FoodDetailsModal from "./FoodDetailsModal";
import { Button } from "@/components/ui/button";
import jollofRiceImage from "@/assets/jollof-rice.jpg";
import bankuTilapiaImage from "@/assets/banku-tilapia.jpg";
import keleweleImage from "@/assets/kelewele.jpg";
import waakeyeImage from "@/assets/waakye.jpg";

interface MenuSectionProps {
  onAddToCart: (item: FoodItem, selectedCustomizations?: CustomizationOption[], quantity?: number, spiceLevel?: SpiceLevel) => void;
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
        image: jollofRiceImage,
        category: "main-dishes",
        rating: 4.9,
        prepTime: "25-30 min",
        hasSpiceLevels: true,
        customizations: [
          { id: "egg1", name: "Egg", price: 4, category: "extra" },
          { id: "chicken1", name: "Extra Chicken", price: 15, category: "extra" },
          { id: "gizzard1", name: "Gizzard", price: 10, category: "extra" },
          { id: "plantain1", name: "Fried Plantain (3 pieces)", price: 5, category: "extra" }
        ]
      },
      {
        id: 2,
        name: "Banku with Tilapia",
        description: "Traditional Ghanaian corn dough served with grilled tilapia and spicy pepper sauce",
        price: 30,
        image: bankuTilapiaImage,
        category: "main-dishes",
        rating: 4.8,
        prepTime: "30-35 min",
        hasSpiceLevels: true,
        customizations: [
          { id: "egg2", name: "Egg", price: 4, category: "extra" },
          { id: "fish2", name: "Extra Fish", price: 15, category: "extra" },
          { id: "shito2", name: "Extra Shito", price: 3, category: "extra" },
          { id: "plantain2", name: "Fried Plantain (3 pieces)", price: 5, category: "extra" }
        ]
      },
      {
        id: 3,
        name: "Waakye Special",
        description: "Delicious rice and beans served with boiled eggs, wele, and traditional shito sauce",
        price: 25,
        image: waakeyeImage,
        category: "main-dishes",
        rating: 4.7,
        prepTime: "20-25 min",
        hasSpiceLevels: true,
        customizations: [
          { id: "egg3", name: "Egg", price: 4, category: "extra" },
          { id: "wele3", name: "Extra Wele", price: 8, category: "extra" },
          { id: "gari3", name: "Gari", price: 2, category: "extra" },
          { id: "sausage3", name: "Sausage", price: 4, category: "extra" }
        ]
      },
      {
        id: 4,
        name: "Kelewele (Spiced Plantains)",
        description: "Crispy fried plantain cubes seasoned with traditional Ghanaian spices and ginger",
        price: 15,
        image: keleweleImage,
        category: "main-dishes",
        rating: 4.6,
        prepTime: "15-20 min",
        hasSpiceLevels: true,
        customizations: [
          { id: "nuts4", name: "Groundnuts", price: 3, category: "extra" },
          { id: "pepper4", name: "Extra Pepper", price: 2, category: "extra" },
          { id: "ginger4", name: "Extra Ginger", price: 2, category: "extra" }
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
    if ((item.customizations && item.customizations.length > 0) || item.hasSpiceLevels) {
      setSelectedItem(item);
    } else {
      onAddToCart(item);
    }
  };

  const handleModalAddToCart = (item: FoodItem, selectedCustomizations: CustomizationOption[], quantity: number, spiceLevel?: SpiceLevel) => {
    onAddToCart(item, selectedCustomizations, quantity, spiceLevel);
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
