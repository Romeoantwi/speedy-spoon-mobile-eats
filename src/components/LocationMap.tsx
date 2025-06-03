
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocationMapProps {
  showDriverLocation?: boolean;
  orderStatus?: string;
}

const LocationMap = ({ showDriverLocation = false, orderStatus }: LocationMapProps) => {
  const [driverLocation, setDriverLocation] = useState({ lat: 5.6037, lng: -0.1870 }); // Accra coordinates
  const [customerLocation] = useState({ lat: 5.6137, lng: -0.1970 });

  // Simulate driver movement
  useEffect(() => {
    if (!showDriverLocation || orderStatus !== 'picked_up') return;

    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [showDriverLocation, orderStatus]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-600" />
          {showDriverLocation ? 'Live Delivery Tracking' : 'Delivery Location'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Placeholder for Google Maps */}
        <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Google Maps Integration</p>
            <p className="text-sm text-gray-500 mt-1">
              Map will show delivery location and live driver tracking
            </p>
          </div>
          
          {/* Mock location markers */}
          {showDriverLocation && (
            <>
              <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg">
                <Truck className="w-4 h-4" />
              </div>
              <div className="absolute bottom-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
        
        {showDriverLocation && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Driver Location:</span>
              <span className="font-medium">
                {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated Arrival:</span>
              <span className="font-medium text-orange-600">8-12 minutes</span>
            </div>
          </div>
        )}
        
        <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
          <Navigation className="w-4 h-4 mr-2" />
          Get Directions
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
