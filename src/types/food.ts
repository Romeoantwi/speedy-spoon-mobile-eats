
export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: FoodItem[];
}
