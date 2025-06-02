
import { Star, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/types/food";

interface FoodCardProps {
  item: FoodItem;
  onAddToCart: () => void;
}

const FoodCard = ({ item, onAddToCart }: FoodCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center space-x-1 shadow-lg">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{item.rating}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{item.prepTime}</span>
          </div>
          <span className="text-2xl font-bold text-orange-600">${item.price}</span>
        </div>
        
        <Button
          onClick={onAddToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Cart</span>
        </Button>
      </div>
    </div>
  );
};

export default FoodCard;
