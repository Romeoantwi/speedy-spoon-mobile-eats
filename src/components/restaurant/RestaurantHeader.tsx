
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ChefHat, Shield, AlertTriangle } from 'lucide-react';

interface RestaurantHeaderProps {
  adminRole: string;
  isRestaurantOpen: boolean;
  onToggleStatus: () => void;
  updatingStatus: boolean;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  adminRole,
  isRestaurantOpen,
  onToggleStatus,
  updatingStatus
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">SpeedySpoon Restaurant</h1>
          <p className="text-gray-600">Admin Dashboard - {adminRole}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Shield className="w-6 h-6 text-green-600" />
          <Badge variant="default" className="bg-green-500">ADMIN ACCESS</Badge>
          
          {/* Restaurant Status Toggle */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm">
            <ChefHat className="w-6 h-6 text-orange-600" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Restaurant:</span>
              <Badge 
                variant="default" 
                className={isRestaurantOpen ? 'bg-green-500' : 'bg-red-500'}
              >
                {isRestaurantOpen ? 'OPEN' : 'CLOSED'}
              </Badge>
              <Switch
                checked={isRestaurantOpen}
                onCheckedChange={onToggleStatus}
                disabled={updatingStatus}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Alert */}
      {!isRestaurantOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Restaurant is Currently Closed</h3>
              <p className="text-sm text-red-600">Customers cannot place new orders while the restaurant is closed.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantHeader;
