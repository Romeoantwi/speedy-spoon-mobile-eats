
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Phone, MapPin, Truck } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

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

interface OrderCardProps {
  order: OrderWithDetails;
  onUpdateStatus: (orderId: string, status: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'placed': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'placed': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      default: return null;
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.created_at).toLocaleTimeString()}
          </p>
          {order.payment_status && (
            <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {order.payment_status}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace('_', ' ')}
          </Badge>
          <p className="font-bold text-lg mt-1">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>
      
      {/* Customer Information */}
      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center">
          <User className="w-4 h-4 mr-2 text-blue-600" />
          Customer Details
        </h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Name:</strong> {order.customer_name || 'Loading...'}</p>
          {order.customer_phone && (
            <p className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              <strong>Phone:</strong> {order.customer_phone}
            </p>
          )}
          <p className="flex items-start">
            <MapPin className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
            <span><strong>Address:</strong> {order.delivery_address}</span>
          </p>
        </div>
      </div>

      {/* Driver Information */}
      {order.driver_id ? (
        <div className="mb-3 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-green-600" />
            Driver Assigned
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Name:</strong> {order.driver_name || 'Loading...'}</p>
            <p><strong>Phone:</strong> {order.driver_phone || 'Loading...'}</p>
            <p><strong>Vehicle:</strong> {order.driver_vehicle || 'Loading...'}</p>
          </div>
        </div>
      ) : (
        <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center">
            <Truck className="w-4 h-4 mr-2" />
            No driver assigned yet
          </p>
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Items:</p>
        <div className="text-sm text-gray-600">
          {order.items.map((item: any, index: number) => (
            <div key={index}>• {item.name} x{item.quantity}</div>
          ))}
        </div>
      </div>
      
      {order.special_instructions && (
        <div className="mb-3 p-2 bg-orange-50 rounded">
          <p className="text-sm"><strong>Special Instructions:</strong> {order.special_instructions}</p>
        </div>
      )}
      
      {getNextStatus(order.status) && order.payment_status === 'paid' && (
        <Button 
          onClick={() => onUpdateStatus(order.id, getNextStatus(order.status)!)}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          {getNextStatusLabel(order.status)}
        </Button>
      )}
      
      {order.payment_status !== 'paid' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
          ⏳ Waiting for payment confirmation
        </div>
      )}
    </div>
  );
};

export default OrderCard;
