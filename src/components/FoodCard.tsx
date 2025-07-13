
import { Star, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/types/food";

interface FoodCardProps {
  item: FoodItem;
  onAddToCart: () => void;
}

const FoodCard = ({ item, onAddToCart }: FoodCardProps) => {
  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-fade-in border border-border">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-black/80 rounded-full px-2 py-1 flex items-center space-x-1 shadow-lg">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-white">{item.rating}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{item.name}</h3>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{item.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{item.prepTime}</span>
          </div>
          <span className="text-2xl font-bold text-red-600">₵{item.price}</span>
        </div>
        
        <Button
          onClick={onAddToCart}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Cart</span>
        </Button>
      </div>
    </div>
  );
};

export default FoodCard;
