
export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  category: 'topping' | 'side' | 'drink' | 'sauce' | 'extra';
}

export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra-hot';

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
  hasSpiceLevels?: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
  selectedCustomizations?: CustomizationOption[];
  selectedSpiceLevel?: SpiceLevel;
  totalPrice: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: FoodItem[];
}
