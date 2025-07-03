
import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, Truck, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'restaurant' | 'customer';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  orderId?: string;
}

interface NotificationCenterProps {
  userType: 'restaurant' | 'customer';
}

const NotificationCenter = ({ userType }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulate receiving notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'restaurant',
        title: 'New Order Received! 🍽️',
        message: 'Order #ORD-ABC123 - Assorted Jollof with Chicken. Total: ₵45',
        timestamp: new Date().toISOString(),
        isRead: false,
        orderId: 'ORD-ABC123'
      },
      {
        id: '3',
        type: 'restaurant',
        title: 'Order Completed ✅',
        message: 'Order #ORD-XYZ789 has been successfully delivered',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isRead: true,
        orderId: 'ORD-XYZ789'
      }
    ];

    // Filter notifications by user type
    const userNotifications = mockNotifications.filter(n => n.type === userType);
    setNotifications(userNotifications);
  }, [userType]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <ChefHat className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications yet</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-colors ${
                notification.isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 h-auto"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
