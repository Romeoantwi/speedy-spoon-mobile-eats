
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'mtn_momo' | 'airtel_money' | 'tigo_cash' | 'telecel_cash';
  provider_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  is_active: boolean;
}

const PaymentMethods = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'mtn_momo' as const,
    provider_name: '',
    account_number: '',
    account_name: '',
    is_default: false
  });

  const paymentTypeLabels = {
    bank_transfer: 'Bank Transfer',
    mtn_momo: 'MTN Mobile Money',
    airtel_money: 'AirtelTigo Money',
    tigo_cash: 'Tigo Cash',
    telecel_cash: 'Telecel Cash'
  };

  const paymentTypeColors = {
    bank_transfer: 'bg-blue-100 text-blue-800',
    mtn_momo: 'bg-yellow-100 text-yellow-800',
    airtel_money: 'bg-red-100 text-red-800',
    tigo_cash: 'bg-green-100 text-green-800',
    telecel_cash: 'bg-purple-100 text-purple-800'
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return;
    }

    setPaymentMethods(data || []);
  };

  const addPaymentMethod = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('payment_methods')
      .insert({
        ...newMethod,
        user_id: user.id
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Payment method added successfully!"
    });

    setIsAdding(false);
    setNewMethod({
      type: 'mtn_momo',
      provider_name: '',
      account_number: '',
      account_name: '',
      is_default: false
    });
    fetchPaymentMethods();
  };

  const deletePaymentMethod = async (id: string) => {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Payment method removed successfully!"
    });
    fetchPaymentMethods();
  };

  const setAsDefault = async (id: string) => {
    // First, unset all defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .neq('id', id);

    // Then set the selected one as default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default payment method.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Default payment method updated!"
    });
    fetchPaymentMethods();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Payment Methods</h2>
        <Button onClick={() => setIsAdding(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Payment Type</Label>
              <select
                id="type"
                value={newMethod.type}
                onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(paymentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                value={newMethod.provider_name}
                onChange={(e) => setNewMethod({ ...newMethod, provider_name: e.target.value })}
                placeholder="e.g., MTN Ghana, Access Bank"
              />
            </div>

            <div>
              <Label htmlFor="account_number">Account/Phone Number</Label>
              <Input
                id="account_number"
                value={newMethod.account_number}
                onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
                placeholder="0XX XXX XXXX or Account Number"
              />
            </div>

            <div>
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                value={newMethod.account_name}
                onChange={(e) => setNewMethod({ ...newMethod, account_name: e.target.value })}
                placeholder="Full name on account"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newMethod.is_default}
                onChange={(e) => setNewMethod({ ...newMethod, is_default: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_default">Set as default payment method</Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={addPaymentMethod} className="bg-orange-500 hover:bg-orange-600">
                Add Payment Method
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CreditCard className="w-8 h-8 text-gray-600" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge className={paymentTypeColors[method.type]}>
                        {paymentTypeLabels[method.type]}
                      </Badge>
                      {method.is_default && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold">{method.provider_name}</p>
                    <p className="text-sm text-gray-600">{method.account_name}</p>
                    <p className="text-sm text-gray-500">****{method.account_number.slice(-4)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePaymentMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {paymentMethods.length === 0 && !isAdding && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment methods added yet.</p>
              <p className="text-sm text-gray-500">Add a payment method to complete orders.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
