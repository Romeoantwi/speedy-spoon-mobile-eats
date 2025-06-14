
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderCard from './OrderCard';

interface OrderWithDetails {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  items: any[];
  special_instructions?: string;
}

interface OrdersListProps {
  orders: OrderWithDetails[];
  loading: boolean;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, loading, onUpdateStatus }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No orders yet today</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersList;
