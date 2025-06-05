
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

  // Ghana locations for demo purposes
  const ghanaLocations = [
    { name: "East Legon, Accra", lat: 5.6307, lng: -0.1501, address: "East Legon, Accra, Ghana" },
    { name: "Osu, Accra", lat: 5.5550, lng: -0.1816, address: "Osu, Accra, Ghana" },
    { name: "Tema", lat: 5.6698, lng: -0.0166, address: "Tema, Ghana" },
    { name: "Kumasi", lat: 6.6885, lng: -1.6244, address: "Kumasi, Ashanti Region, Ghana" },
    { name: "Spintex Road", lat: 5.6070, lng: -0.1047, address: "Spintex Road, Accra, Ghana" },
    { name: "Cantonments", lat: 5.5700, lng: -0.1850, address: "Cantonments, Accra, Ghana" },
  ];

  const [filteredLocations, setFilteredLocations] = useState(ghanaLocations);

  useEffect(() => {
    // Filter locations based on search query
    const filtered = ghanaLocations.filter(location =>
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
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
          };
          selectLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Accra center
          const accra = { lat: 5.6037, lng: -0.1870, address: "Accra, Ghana (Default)" };
          selectLocation(accra);
        }
      );
    } else {
      // Fallback to Accra center
      const accra = { lat: 5.6037, lng: -0.1870, address: "Accra, Ghana (Default)" };
      selectLocation(accra);
    }
  };

  useEffect(() => {
    // Auto-select Accra as default
    if (!selectedLocation) {
      selectLocation({ lat: 5.6037, lng: -0.1870, address: "Accra, Ghana" });
    }
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for a location in Ghana..."
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
            {filteredLocations.map((location, index) => (
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
            ))}
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
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Select a location</p>
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
