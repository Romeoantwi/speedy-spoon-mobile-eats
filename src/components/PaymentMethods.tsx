
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'mtn_momo' | 'airteltigo_money' | 'telecel_cash' | 'bank_transfer' | 'cash';
  provider_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
}

const PaymentMethods = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'mtn_momo' as PaymentMethod['type'],
    provider_name: 'MTN Mobile Money',
    account_number: '',
    account_name: '',
    is_default: false
  });

  const paymentOptions = [
    { value: 'mtn_momo', label: 'MTN Mobile Money', provider: 'MTN Ghana' },
    { value: 'airteltigo_money', label: 'AirtelTigo Money', provider: 'AirtelTigo' },
    { value: 'telecel_cash', label: 'Telecel Cash', provider: 'Telecel Ghana' },
    { value: 'bank_transfer', label: 'Bank Transfer', provider: 'Bank' },
    { value: 'cash', label: 'Cash on Delivery', provider: 'Cash' }
  ];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const addPaymentMethod = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: formData.type,
          provider_name: formData.provider_name,
          account_number: formData.account_number,
          account_name: formData.account_name,
          is_default: formData.is_default
        });

      if (error) throw error;

      toast({
        title: "Payment Method Added! 💳",
        description: "Your payment method has been added successfully."
      });

      setFormData({
        type: 'mtn_momo',
        provider_name: 'MTN Mobile Money',
        account_number: '',
        account_name: '',
        is_default: false
      });
      setShowAddForm(false);
      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive"
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Payment Method Removed",
        description: "Payment method has been deleted successfully."
      });

      fetchPaymentMethods();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment method",
        variant: "destructive"
      });
    }
  };

  const handleTypeChange = (type: PaymentMethod['type']) => {
    const option = paymentOptions.find(opt => opt.value === type);
    setFormData({
      ...formData,
      type,
      provider_name: option?.provider || ''
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payment methods added yet</p>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{paymentOptions.find(opt => opt.value === method.type)?.label}</p>
                  <p className="text-sm text-gray-600">{method.account_number} - {method.account_name}</p>
                  {method.is_default && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePaymentMethod(method.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!showAddForm ? (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="payment-type">Payment Type</Label>
              <select
                id="payment-type"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as PaymentMethod['type'])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.type !== 'cash' && (
              <>
                <div>
                  <Label htmlFor="account-number">
                    {formData.type === 'bank_transfer' ? 'Account Number' : 'Phone Number'}
                  </Label>
                  <Input
                    id="account-number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder={formData.type === 'bank_transfer' ? '1234567890' : '0XX XXX XXXX'}
                  />
                </div>

                <div>
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-2">
              <Button onClick={addPaymentMethod} className="flex-1">
                Add Method
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
