
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationMapProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  showDriverLocation?: boolean;
  orderStatus?: string;
  height?: string;
}

const LocationMap = ({ onLocationSelect, showDriverLocation = false, orderStatus, height = "400px" }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with actual API key
        version: "weekly",
        libraries: ["places"]
      });

      try {
        await loader.load();
        setIsLoaded(true);

        if (mapRef.current) {
          const accra = new google.maps.LatLng(5.6037, -0.1870);
          
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: accra,
            zoom: 13,
            mapTypeId: 'roadmap'
          });

          setMap(mapInstance);

          if (onLocationSelect) {
            const markerInstance = new google.maps.Marker({
              position: accra,
              map: mapInstance,
              draggable: true,
              title: 'Select your location'
            });

            setMarker(markerInstance);

            google.maps.event.addListener(markerInstance, 'dragend', () => {
              const position = markerInstance.getPosition();
              if (position) {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: position }, (results, status) => {
                  if (status === google.maps.GeocoderStatus.OK && results[0]) {
                    onLocationSelect({
                      lat: position.lat(),
                      lng: position.lng(),
                      address: results[0].formatted_address
                    });
                  }
                });
              }
            });

            // Initial geocode for default position
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: accra }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results[0]) {
                onLocationSelect({
                  lat: accra.lat(),
                  lng: accra.lng(),
                  address: results[0].formatted_address
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (!isLoaded) {
      initMap();
    }
  }, [onLocationSelect, isLoaded]);

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-300"
      />
      {showDriverLocation && orderStatus === 'picked_up' && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">🚗 Your driver is on the way!</p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
