
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaymentDetails {
  email: string;
  amount: number;
  orderId: string;
  customerName?: string;
  phone?: string;
}

interface PaymentResponse {
  status: 'success' | 'error' | 'cancelled';
  message: string;
  reference?: string;
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makePayment = async ({ email, amount, orderId, customerName, phone }: PaymentDetails): Promise<PaymentResponse | undefined> => {
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!email || !amount || amount <= 0 || !orderId) {
        throw new Error('Invalid payment details provided');
      }

      // Get Paystack public key
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackPublicKey) {
        throw new Error('Paystack configuration error. Please contact support.');
      }

      console.log("Initializing payment for order:", orderId, "Amount:", amount);

      // Initialize payment with Supabase Edge Function
      const { data: initData, error: initError } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'initialize',
          email,
          amount,
          orderId,
          customerName,
          phone
        },
      });

      if (initError) {
        console.error("Payment initialization error:", initError);
        throw new Error(initError.message || 'Failed to initialize payment');
      }

      if (!initData?.status || !initData?.data?.reference) {
        console.error("Invalid initialization response:", initData);
        throw new Error('Invalid payment initialization response');
      }

      const { reference } = initData.data;
      console.log("Payment initialized with reference:", reference);

      // Load Paystack script if needed
      if (!window.PaystackPop) {
        await loadPaystackScript();
      }

      // Setup payment parameters
      const [firstname, lastname] = customerName ? customerName.split(' ') : ['', ''];

      // Create and execute payment
      return new Promise<PaymentResponse>((resolve) => {
        try {
          const handler = window.PaystackPop.setup({
            key: paystackPublicKey,
            email,
            amount: Math.round(amount * 100), // Convert to kobo
            ref: reference,
            currency: 'GHS',
            metadata: {
              order_id: orderId,
              customer_name: customerName || '',
              customer_phone: phone || '',
            },
            channels: ['card', 'mobile_money', 'bank_transfer'],
            firstname: firstname || undefined,
            lastname: lastname || undefined,
            phone: phone || undefined,

            callback: async (response: any) => {
              console.log("Payment callback received:", response);
              
              if (!response.reference) {
                setError("Invalid payment response");
                resolve({ status: 'error', message: 'Invalid payment response' });
                return;
              }

              try {
                // Verify payment
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('paystack-payment', {
                  body: {
                    action: 'verify',
                    reference: response.reference,
                    orderId
                  },
                });

                if (verifyError) {
                  console.error("Payment verification error:", verifyError);
                  setError(verifyError.message || 'Payment verification failed');
                  resolve({ status: 'error', message: verifyError.message || 'Payment verification failed' });
                  return;
                }

                if (verifyData?.success === true || verifyData?.data?.status === 'success') {
                  console.log("Payment successfully verified");
                  resolve({ 
                    status: 'success', 
                    message: 'Payment successful', 
                    reference: response.reference 
                  });
                } else {
                  const errorMessage = verifyData?.data?.gateway_response || 'Payment verification failed';
                  console.warn("Payment verification failed:", verifyData);
                  setError(errorMessage);
                  resolve({ status: 'error', message: errorMessage });
                }
              } catch (verifyErr: any) {
                console.error("Verification process error:", verifyErr);
                setError('Payment verification failed');
                resolve({ status: 'error', message: 'Payment verification failed' });
              } finally {
                setLoading(false);
              }
            },

            onClose: () => {
              console.log('Payment cancelled by user');
              setLoading(false);
              setError('Payment cancelled');
              resolve({ status: 'cancelled', message: 'Payment was cancelled' });
            },
          });

          handler.openIframe();
        } catch (popupError: any) {
          console.error("Paystack popup error:", popupError);
          setLoading(false);
          setError('Failed to open payment window');
          resolve({ status: 'error', message: 'Failed to open payment window' });
        }
      });

    } catch (err: any) {
      console.error("Payment process error:", err);
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      setLoading(false);
      return { status: 'error', message: errorMessage };
    }
  };

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        console.log("Paystack script loaded successfully");
        resolve();
      };
      
      script.onerror = () => {
        console.error("Failed to load Paystack script");
        reject(new Error('Failed to load Paystack script'));
      };
      
      document.head.appendChild(script);
    });
  };

  return { makePayment, loading, error };
};
