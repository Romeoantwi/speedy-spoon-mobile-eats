
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showDriverLocation?: boolean;
  orderStatus?: string;
  height?: string;
}

const LocationMap = ({ onLocationSelect, showDriverLocation = false, orderStatus, height = "400px" }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Ho, Volta Region locations for delivery service
  const hoLocations = [
    { name: "Ho Central", lat: 6.6078, lng: 0.4707, address: "Ho Central, Volta Region, Ghana" },
    { name: "Ho Market Area", lat: 6.6102, lng: 0.4702, address: "Ho Market Area, Volta Region, Ghana" },
    { name: "Ho Technical University", lat: 6.6047, lng: 0.4658, address: "Ho Technical University, Volta Region, Ghana" },
    { name: "Bankoe, Ho", lat: 6.6150, lng: 0.4750, address: "Bankoe, Ho, Volta Region, Ghana" },
    { name: "Dome, Ho", lat: 6.6020, lng: 0.4680, address: "Dome, Ho, Volta Region, Ghana" },
    { name: "Kpodzi, Ho", lat: 6.5980, lng: 0.4720, address: "Kpodzi, Ho, Volta Region, Ghana" },
    { name: "Ahoe, Ho", lat: 6.6180, lng: 0.4800, address: "Ahoe, Ho, Volta Region, Ghana" },
    { name: "Fiave, Ho", lat: 6.5950, lng: 0.4650, address: "Fiave, Ho, Volta Region, Ghana" },
  ];

  const [filteredLocations, setFilteredLocations] = useState(hoLocations);

  useEffect(() => {
    // Filter locations based on search query
    const filtered = hoLocations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  }, [searchQuery]);

  const selectLocation = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Check if the current location is within Ho, Volta Region (approximate bounds)
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Ho, Volta Region approximate bounds
          const isInHo = lat >= 6.58 && lat <= 6.63 && lng >= 0.45 && lng <= 0.49;
          
          if (isInHo) {
            const location = {
              lat: lat,
              lng: lng,
              address: `Current Location in Ho (${lat.toFixed(4)}, ${lng.toFixed(4)})`
            };
            selectLocation(location);
          } else {
            // Fallback to Ho Central if outside service area
            const hoCenter = { lat: 6.6078, lng: 0.4707, address: "Ho Central, Volta Region, Ghana (Default - Outside Service Area)" };
            selectLocation(hoCenter);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Ho Central
          const hoCenter = { lat: 6.6078, lng: 0.4707, address: "Ho Central, Volta Region, Ghana (Default)" };
          selectLocation(hoCenter);
        }
      );
    } else {
      // Fallback to Ho Central
      const hoCenter = { lat: 6.6078, lng: 0.4707, address: "Ho Central, Volta Region, Ghana (Default)" };
      selectLocation(hoCenter);
    }
  };

  useEffect(() => {
    // Auto-select Ho Central as default
    if (!selectedLocation) {
      selectLocation({ lat: 6.6078, lng: 0.4707, address: "Ho Central, Volta Region, Ghana" });
    }
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for a location in Ho, Volta Region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleUseCurrentLocation} variant="outline">
            <MapPin className="w-4 h-4 mr-2" />
            Use Current
          </Button>
        </div>

        {searchQuery && (
          <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => {
                    selectLocation(location);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {location.name}
                </button>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-sm">
                No locations found in Ho, Volta Region
              </div>
            )}
          </div>
        )}
      </div>

      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-300 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center relative overflow-hidden"
      >
        {selectedLocation ? (
          <div className="text-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
              <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Selected Location</h3>
              <p className="text-sm text-gray-600">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500 mt-2">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
              <div className="mt-2 text-xs text-orange-600 font-medium">
                📍 Service Area: Ho, Volta Region Only
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Select a location in Ho, Volta Region</p>
          </div>
        )}
        
        {/* Decorative map-like elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-yellow-500 rounded-full"></div>
        </div>
      </div>

      {showDriverLocation && orderStatus === 'picked_up' && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚗 Your driver is on the way!</p>
          <p className="text-blue-600 text-sm">Estimated arrival: 15-20 minutes</p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
