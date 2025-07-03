import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin } from 'lucide-react';

interface DeliveryAddressFormProps {
  onAddressSubmit: (address: string) => void;
  onCancel: () => void;
}

const DeliveryAddressForm = ({ onAddressSubmit, onCancel }: DeliveryAddressFormProps) => {
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Ho');
  const [region, setRegion] = useState('Volta Region');
  const [landmarks, setLandmarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (streetAddress.trim()) {
      const fullAddress = `${streetAddress}, ${city}, ${region}${landmarks ? `\nLandmarks: ${landmarks}` : ''}`;
      onAddressSubmit(fullAddress);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-orange-500" />
            Enter Delivery Address
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <Input
                id="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Enter your street address"
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="landmarks" className="block text-sm font-medium text-gray-700 mb-2">
                Landmarks (Optional)
              </label>
              <Textarea
                id="landmarks"
                value={landmarks}
                onChange={(e) => setLandmarks(e.target.value)}
                placeholder="Building names, nearby shops, distinctive features..."
                className="w-full"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!streetAddress.trim()}
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