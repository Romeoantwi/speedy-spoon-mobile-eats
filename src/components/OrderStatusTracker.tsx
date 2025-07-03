
import { useEffect, useState } from 'react';
import { Order } from '@/types/order';
import { Clock, CheckCircle, Truck, MapPin, Zap } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: Order;
  onStatusChange?: (status: Order['status']) => void;
}

const OrderStatusTracker = ({ order, onStatusChange }: OrderStatusTrackerProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const statusSteps = [
    { status: 'placed', label: 'Order Placed', icon: CheckCircle, color: 'text-green-400' },
    { status: 'preparing', label: 'Preparing Food', icon: Clock, color: 'text-orange-400' },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle, color: 'text-blue-400' },
    { status: 'picked_up', label: 'Out for Delivery', icon: Truck, color: 'text-purple-400' },
    { status: 'delivered', label: 'Delivered', icon: MapPin, color: 'text-green-500' }
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
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl border border-red-600/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Order #{order.id.slice(-8)}</h3>
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-semibold">Live Tracking</span>
        </div>
      </div>
      
      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.status} className="relative">
              {index < statusSteps.length - 1 && (
                <div className={`absolute left-5 top-12 w-0.5 h-8 transition-colors duration-500 ${
                  isActive ? 'bg-gradient-to-b from-red-500 to-red-600' : 'bg-gray-700'
                }`} />
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive 
                    ? 'bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-600/50' 
                    : 'bg-gray-800 border border-gray-600'
                } ${isCurrent ? 'animate-pulse-glow' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                </div>
                
                <div className="flex-1">
                  <p className={`font-semibold transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-red-400 animate-pulse font-medium">
                      {step.status === 'preparing' && '🔥 Estimated time: 20-25 minutes'}
                      {step.status === 'picked_up' && '🚚 On the way to you!'}
                      {step.status === 'placed' && '✅ Order confirmed'}
                      {step.status === 'ready' && '📦 Ready for pickup'}
                    </p>
                  )}
                </div>
                
                {isActive && (
                  <CheckCircle className="w-6 h-6 text-green-400 animate-fade-in" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {order.status === 'picked_up' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 animate-fade-in">
          <p className="text-blue-300 font-semibold flex items-center">
            🚗 <span className="ml-2">Your order is on the way!</span>
          </p>
          <p className="text-blue-400 text-sm mt-1">Track your order progress below</p>
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30 animate-fade-in">
          <p className="text-green-300 font-semibold flex items-center">
            🎉 <span className="ml-2">Order delivered successfully!</span>
          </p>
          <p className="text-green-400 text-sm mt-1">Thank you for choosing SpeedySpoon!</p>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTracker;
