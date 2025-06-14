
// src/hooks/usePaystack.ts

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
// import type { Database } from "@/integrations/supabase/types"; // Not used directly

declare global {
  interface Window {
    PaystackPop: any; // Simplified to any to avoid namespace issues with PaystackPop.PaystackPopOptions
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
  authorization_url?: string; // This is not typically returned to this hook post-payment
}

export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makePayment = async ({ email, amount, orderId, customerName, phone }: PaymentDetails): Promise<PaymentResponse | undefined> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call Supabase Edge Function to Initialize Payment
      console.log("Calling Supabase Edge Function: paystack-payment for initialization", { email, amount, orderId, customerName, phone });
      const { data: initData, error: initError } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'initialize',
          email,
          amount, // Amount is in major currency (e.g., GHS)
          orderId,
          customerName,
          phone
        },
      });

      if (initError) {
        console.error("Error initializing payment via Edge Function:", initError);
        throw new Error(initError.message || 'Payment initiation failed. Please try again.');
      }

      if (!initData || !initData.data || !initData.data.authorization_url || !initData.data.reference) {
          console.error("Invalid response from paystack-payment (initialize):", initData);
          // Provide more specific error if message exists
          const message = initData?.message || "Invalid response from payment initiation. Missing authorization URL or reference.";
          throw new Error(`${message} Please contact support.`);
      }

      const { reference } = initData.data; // authorization_url and access_code are used by PaystackPop
      console.log("Payment initialization successful. Reference:", reference);

      // 2. Dynamically load Paystack inline script if not already present
      if (!window.PaystackPop) {
        console.log("Paystack script not found, dynamically loading...");
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log("Paystack script loaded.");
            resolve();
          };
          script.onerror = () => {
            console.error("Failed to load Paystack script.");
            reject(new Error('Failed to load Paystack script. Please check your internet connection.'));
          };
        });
      }

      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackPublicKey) {
        throw new Error("Paystack Public Key (VITE_PAYSTACK_PUBLIC_KEY) not found. Please set it in your environment variables.");
      }

      const [firstname, lastname] = customerName ? customerName.split(' ') : ['', ''];

      // 3. Setup and open Paystack Pop-up
      // This promise will resolve or reject based on the Paystack callback/onClose events
      return new Promise<PaymentResponse>((resolve) => {
        const handler = window.PaystackPop.setup({
          key: paystackPublicKey,
          email,
          amount: Math.round(amount * 100), // Amount to kobo/pesewas
          ref: reference,
          currency: 'GHS',
          metadata: {
            order_id: orderId,
            customer_name: customerName,
            customer_phone: phone,
            // custom_fields: [{ display_name: "Order ID", variable_name: "order_id", value: orderId }]
          },
          channels: ['card', 'mobile_money', 'bank_transfer'], // Added bank_transfer

          callback: function(response: any) { 
            (async () => {
              console.log("Paystack callback received:", response);
              setLoading(true); // Keep loading true during verification
              try {
                if (!response.reference) {
                    throw new Error("Paystack callback did not provide a transaction reference.");
                }
  
                console.log("Calling Supabase Edge Function: paystack-payment for verification for reference:", response.reference);
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('paystack-payment', {
                  body: {
                    action: 'verify',
                    reference: response.reference,
                    orderId
                  },
                });
  
                if (verifyError) {
                  console.error("Error verifying payment via Edge Function:", verifyError);
                  setError(verifyError.message || 'Payment verification failed.');
                  resolve({ status: 'error', message: verifyError.message || 'Payment verification failed.' });
                  return;
                }
  
                if (verifyData?.data?.status === 'success' || verifyData?.success === true) { // Check both possible success flags
                  console.log("Payment successfully verified by the backend.");
                  resolve({ status: 'success', message: 'Payment successful and verified.', reference: response.reference });
                } else {
                  const errorMessage = verifyData?.data?.gateway_response || verifyData?.message || 'Payment not successful after verification.';
                  console.warn("Payment verification failed on backend:", verifyData);
                  setError(errorMessage);
                  resolve({ status: 'error', message: errorMessage, reference: response.reference });
                }
              } catch (verificationError: any) {
                console.error("Verification process failed:", verificationError);
                setError(verificationError.message || 'Payment verification failed due to an unexpected error.');
                resolve({ status: 'error', message: verificationError.message || 'Payment verification failed.' });
              } finally {
                setLoading(false); 
              }
            })();
          },
          onClose: () => {
            console.log('Paystack Pop-up closed by user.');
            setLoading(false);
            setError('Payment cancelled by user.');
            resolve({ status: 'cancelled', message: 'Payment cancelled by user.' });
          },
          firstname: firstname || undefined, // Ensure undefined if empty
          lastname: lastname || undefined,   // Ensure undefined if empty
          phone: phone || undefined,         // Ensure undefined if empty
        });
  
        handler.openIframe();
        console.log("Paystack pop-up opened.");
        // The promise resolves via callback or onClose, so no explicit return here for the promise.
        // However, makePayment itself returns this promise.
      });

    } catch (err: any) {
      console.error("Error during makePayment execution:", err);
      setError(err.message || "An unexpected error occurred during payment initiation.");
      setLoading(false);
      return { status: 'error', message: err.message || "An unexpected error occurred during payment." };
    }
  };

  return { makePayment, loading, error };
};
