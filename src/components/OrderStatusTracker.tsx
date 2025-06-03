
import { useEffect, useState } from 'react';
import { Order } from '@/types/order';
import { Clock, CheckCircle, Truck, MapPin } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: Order;
  onStatusChange?: (status: Order['status']) => void;
}

const OrderStatusTracker = ({ order, onStatusChange }: OrderStatusTrackerProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const statusSteps = [
    { status: 'placed', label: 'Order Placed', icon: CheckCircle, color: 'text-green-500' },
    { status: 'preparing', label: 'Preparing Food', icon: Clock, color: 'text-orange-500' },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-blue-500' },
    { status: 'picked_up', label: 'Out for Delivery', icon: Truck, color: 'text-purple-500' },
    { status: 'delivered', label: 'Delivered', icon: MapPin, color: 'text-green-600' }
  ];

  useEffect(() => {
    const stepIndex = statusSteps.findIndex(step => step.status === order.status);
    setCurrentStep(stepIndex);
  }, [order.status]);

  useEffect(() => {
    // Simulate order progression for demo
    const progressOrder = async () => {
      const delays = {
        'placed': 2000,
        'preparing': 15000, // 15 seconds for demo (real: 20-25 minutes)
        'ready': 3000,
        'picked_up': 10000, // 10 seconds for demo (real: 15-30 minutes)
      };

      for (const [status, delay] of Object.entries(delays)) {
        if (order.status === status) {
          setTimeout(() => {
            const nextStepIndex = statusSteps.findIndex(s => s.status === status) + 1;
            if (nextStepIndex < statusSteps.length) {
              const nextStatus = statusSteps[nextStepIndex].status as Order['status'];
              onStatusChange?.(nextStatus);
            }
          }, delay);
          break;
        }
      }
    };

    progressOrder();
  }, [order.status, onStatusChange]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Order #{order.id}</h3>
      
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.status} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isActive ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-orange-600 animate-pulse">
                    {step.status === 'preparing' && 'Estimated time: 20-25 minutes'}
                    {step.status === 'picked_up' && 'Driver is on the way!'}
                  </p>
                )}
              </div>
              {isActive && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          );
        })}
      </div>

      {order.status === 'picked_up' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚗 Your order is on the way!</p>
          <p className="text-blue-600 text-sm">Track your driver in real-time below</p>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
