
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  onSuccess: (transaction: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async (
    email: string,
    amount: number,
    orderId: string,
    customerName?: string,
    phone?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          email,
          amount,
          orderId,
          customerName,
          phone,
        },
        query: { action: 'initialize' }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string, orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: { reference, orderId },
        query: { action: 'verify' }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error", 
        description: error.message || "Failed to verify payment",
        variant: "destructive"
      });
      throw error;
    }
  };

  const makePayment = (
    email: string,
    amount: number,
    orderId: string,
    onSuccess: (transaction: any) => void,
    onClose?: () => void,
    customerName?: string,
    phone?: string
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize payment
        const paymentData = await initializePayment(email, amount, orderId, customerName, phone);

        // Load Paystack script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => {
            openPaystackPopup();
          };
          document.head.appendChild(script);
        } else {
          openPaystackPopup();
        }

        function openPaystackPopup() {
          const handler = window.PaystackPop.setup({
            key: 'pk_test_fa7fd5600c6823d69311c5b70263db20b4b5558b', // Your Paystack public key
            email: email,
            amount: Math.round(amount * 100), // Convert to kobo
            ref: paymentData.reference,
            onSuccess: async (transaction: any) => {
              try {
                // Verify payment
                const verificationResult = await verifyPayment(transaction.reference, orderId);
                
                if (verificationResult.success) {
                  onSuccess(transaction);
                  resolve(transaction);
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (error) {
                reject(error);
              }
            },
            onClose: () => {
              onClose?.();
              reject(new Error('Payment cancelled by user'));
            },
          });

          handler.openIframe();
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    makePayment,
    initializePayment,
    verifyPayment,
    loading
  };
};
