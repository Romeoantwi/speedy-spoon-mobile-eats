
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Crosshair } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

const LocationMap = ({ onLocationSelect, initialLocation, height = '400px' }: LocationMapProps) => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Default location: Accra, Ghana
  const defaultLocation = { lat: 5.6037, lng: -0.1870 };

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: process.env.GOOGLE_MAPS_API_KEY || '', // You'll need to set this
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();

      if (!mapRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: initialLocation || defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      const googleMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(googleMap);

      // Add marker
      const mapMarker = new google.maps.Marker({
        position: initialLocation || defaultLocation,
        map: googleMap,
        draggable: true,
        title: 'Delivery Location'
      });
      setMarker(mapMarker);

      // Handle marker drag
      mapMarker.addListener('dragend', () => {
        const position = mapMarker.getPosition();
        if (position) {
          reverseGeocode(position.lat(), position.lng());
        }
      });

      // Handle map click
      googleMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          mapMarker.setPosition(event.latLng);
          reverseGeocode(event.latLng.lat(), event.latLng.lng());
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Map Error",
        description: "Failed to load map. Please check your internet connection.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      const address = response.results[0]?.formatted_address || `${lat}, ${lng}`;
      
      onLocationSelect({ lat, lng, address });
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
    }
  };

  const searchLocation = async () => {
    if (!map || !searchValue.trim()) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ 
        address: searchValue,
        componentRestrictions: { country: 'GH' } // Restrict to Ghana
      });

      if (response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        map.setCenter({ lat, lng });
        marker?.setPosition({ lat, lng });
        
        onLocationSelect({ 
          lat, 
          lng, 
          address: response.results[0].formatted_address 
        });
      } else {
        toast({
          title: "Location Not Found",
          description: "Could not find the specified location in Ghana.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for location. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map && marker) {
          map.setCenter({ lat: latitude, lng: longitude });
          marker.setPosition({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location Access Denied",
          description: "Please allow location access or search for your address manually.",
          variant: "destructive"
        });
      }
    );
  };

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for location in Ghana..."
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
          />
          <Button
            size="sm"
            onClick={searchLocation}
            className="absolute right-1 top-1 h-8 px-2"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={getCurrentLocation}
          className="flex items-center space-x-2"
        >
          <Crosshair className="w-4 h-4" />
          <span>Use My Location</span>
        </Button>
      </div>

      <div 
        ref={mapRef} 
        className="w-full rounded-lg border"
        style={{ height }}
      />
      
      <p className="text-sm text-gray-600 text-center">
        Click on the map or drag the marker to select your delivery location
      </p>
    </div>
  );
};

export default LocationMap;
