
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
    }
    
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng | undefined;
    }
    
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    
    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }
    
    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      mapTypeId?: string;
    }
    
    interface MarkerOptions {
      position?: LatLng;
      map?: Map;
      title?: string;
      draggable?: boolean;
    }
    
    interface GeocoderRequest {
      location?: LatLng;
    }
    
    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
      };
    }
    
    enum GeocoderStatus {
      OK = 'OK'
    }
    
    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): void;
    }
  }
}

interface Window {
  google: typeof google;
}
