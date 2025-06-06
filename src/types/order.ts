
export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  driver_id?: string;
  items: OrderItem[];
  total_amount: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  created_at: string;
  estimated_prep_time?: number;
  estimated_delivery_time?: string;
  delivery_address: string;
  customer_phone?: string;
  special_instructions?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  payment_method?: string;
  delivery_fee: number;
  updated_at: string;
}

export interface OrderItem {
  food_item_id: number;
  name: string;
  price: number;
  quantity: number;
  customizations: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  total_price: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
  is_available: boolean;
  rating: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  estimated_prep_time: number;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'super_admin' | 'restaurant_admin' | 'manager';
  restaurant_id: string;
  permissions: {
    manage_orders?: boolean;
    view_analytics?: boolean;
    manage_menu?: boolean;
    manage_users?: boolean;
    manage_drivers?: boolean;
  };
  created_at: string;
}
