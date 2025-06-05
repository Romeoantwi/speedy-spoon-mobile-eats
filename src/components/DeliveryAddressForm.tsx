
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import LocationMap from './LocationMap';

interface DeliveryAddressFormProps {
  onAddressSubmit: (address: string) => void;
  onCancel: () => void;
}

const DeliveryAddressForm = ({ onAddressSubmit, onCancel }: DeliveryAddressFormProps) => {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      const fullAddress = additionalDetails 
        ? `${selectedLocation.address}\n${additionalDetails}`
        : selectedLocation.address;
      onAddressSubmit(fullAddress);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
            Select Delivery Location
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <LocationMap
                onLocationSelect={setSelectedLocation}
                height="300px"
              />
            </div>
            
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                id="details"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Apartment number, building name, landmarks..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!selectedLocation}
              >
                Confirm Order
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
