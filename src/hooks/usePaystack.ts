// src/hooks/usePaystack.ts

import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackPop.PaystackPopOptions) => {
        openIframe: () => void;
        closeIframe: () => void;
      };
    };
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
  authorization_url?: string;
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
          amount,
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
          throw new Error("Invalid response from payment initiation. Missing authorization URL or reference. Please contact support.");
      }

      const { authorization_url, reference, access_code } = initData.data;
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
        throw new Error("Paystack Public Key (VITE_PAYSTACK_PUBLIC_KEY) not found in environment. Please add it to your .env.local file and restart the development server.");
      }

      const [firstname, lastname] = customerName ? customerName.split(' ') : ['', ''];

      // 3. Setup and open Paystack Pop-up
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email,
        amount: Math.round(amount * 100),
        ref: reference,
        currency: 'GHS',
        metadata: {
          order_id: orderId,
          customer_name: customerName,
          customer_phone: phone,
        },
        channels: ['card', 'mobile_money', 'bank_transfer'],

        // **** CRUCIAL CHANGE HERE: WRAP THE ASYNC CALLBACK ****
        callback: function(response: any) { // Changed to a regular function
          (async () => { // Immediately invoked async function expression
            console.log("Paystack callback received:", response);
            setLoading(true);

            try {
              if (!response.reference) {
                  throw new Error("Paystack callback did not provide a transaction reference. Cannot verify payment.");
              }

              // 4. Call Supabase Edge Function to Verify Payment
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
                throw new Error(verifyError.message || 'Payment verification failed. Please check with support if payment went through.');
              }

              if (verifyData.data && verifyData.data.status === 'success') {
                console.log("Payment successfully verified by the backend.");
                // You might return a success object here if this was not an IIFE,
                // but since it is, you'll need to handle the success state
                // (e.g., navigation, UI update) directly in this callback.
                // For simplicity for now, let's just log and update state.
                return { status: 'success', message: 'Payment successful and verified.', reference: response.reference };
              } else {
                console.warn("Payment verification failed on backend:", verifyData.data);
                throw new Error(verifyData.data?.gateway_response || 'Payment not successful. Please try again or contact support.');
              }
            } catch (verificationError: any) {
              console.error("Verification process failed:", verificationError);
              setError(verificationError.message || 'Payment verification failed due to an unexpected error.');
              return { status: 'error', message: verificationError.message || 'Payment verification failed.' };
            } finally {
              setLoading(false);
            }
          })(); // Call the async function immediately
        },
        // **** END CRUCIAL CHANGE ****

        onClose: () => {
          console.log('Paystack Pop-up closed by user.');
          setLoading(false);
          setError('Payment cancelled by user.');
        },
        firstname,
        lastname,
        phone
      });

      handler.openIframe();
      console.log("Paystack pop-up opened.");
      return undefined;

    } catch (err: any) {
      console.error("Error during makePayment execution:", err);
      setError(err.message || "An unexpected error occurred during payment initiation.");
      setLoading(false);
      return { status: 'error', message: err.message || "An unexpected error occurred during payment." };
    }
  };

  return { makePayment, loading, error };
};