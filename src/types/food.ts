
export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  category: 'topping' | 'side' | 'drink' | 'sauce' | 'extra';
}

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  customizations?: CustomizationOption[];
}

export interface CartItem extends FoodItem {
  quantity: number;
  selectedCustomizations?: CustomizationOption[];
  totalPrice: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: FoodItem[];
}
