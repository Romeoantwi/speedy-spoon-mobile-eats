
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface StatsCardsProps {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    avgPrepTime: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="flex items-center p-4">
          <Package className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Today's Orders</p>
            <p className="text-2xl font-bold">{stats.todayOrders}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-4">
          <DollarSign className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Today's Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-4">
          <Clock className="w-8 h-8 text-orange-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-4">
          <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Avg Prep Time</p>
            <p className="text-2xl font-bold">{stats.avgPrepTime}m</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
