
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface DeliveryAddressFormProps {
  onAddressSubmit: (address: string) => void;
  onCancel: () => void;
}

const DeliveryAddressForm = ({ onAddressSubmit, onCancel }: DeliveryAddressFormProps) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAddressSubmit(address.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-orange-500" />
          Delivery Address
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your delivery address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, City, State, ZIP Code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
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
  );
};

export default DeliveryAddressForm;
