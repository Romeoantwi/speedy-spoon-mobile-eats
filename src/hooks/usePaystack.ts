// src/hooks/usePaystack.ts (or wherever your usePaystack.ts file is located)

import { useState } from 'react';

// IMPORTANT: This line assumes your main Supabase client is initialized and exported
// from this specific path. Adjust the path if your setup is different.
// Example: if your client is in `src/lib/supabase/client.ts`, the path would be `src/lib/supabase/client`.
import { supabase } from "@/integrations/supabase/client";

// IMPORTANT: This line assumes your Supabase database types are generated and located
// at this specific path. Adjust the path if your setup is different.
import type { Database } from "@/integrations/supabase/types";

// Declare window.PaystackPop for TypeScript to recognize Paystack's inline script
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

// Define the interface for payment details required by the hook
interface PaymentDetails {
  email: string;
  amount: number; // Total amount (e.g., in GHS, not pesewas/cents yet)
  orderId: string;
  customerName?: string;
  phone?: string;
}

// Define the expected structure of the payment response
interface PaymentResponse {
  status: 'success' | 'error' | 'cancelled'; // Explicitly define possible statuses
  message: string;
  reference?: string; // Paystack transaction reference
  authorization_url?: string; // If applicable (e.g., for redirect flows)
}

/**
 * A React hook for integrating Paystack payments using Supabase Edge Functions.
 * Handles payment initiation, Paystack pop-up, and backend verification.
 */
export const usePaystack = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiates a Paystack payment.
   * @param {PaymentDetails} details - Object containing email, amount, orderId, etc.
   * @returns {Promise<PaymentResponse | undefined>} - Resolves with payment status or undefined if pop-up opened.
   */
  const makePayment = async ({ email, amount, orderId, customerName, phone }: PaymentDetails): Promise<PaymentResponse | undefined> => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // 1. Call Supabase Edge Function to Initialize Payment
      console.log("Calling Supabase Edge Function: initialize-paystack-payment", { email, amount, orderId, customerName, phone });
      const { data: initData, error: initError } = await supabase.functions.invoke('initialize-paystack-payment', {
        body: { email, amount, orderId, customerName, phone },
      });

      if (initError) {
        console.error("Error initializing payment via Edge Function:", initError);
        // Provide a user-friendly message for initialization failure
        throw new Error(initError.message || 'Payment initiation failed. Please try again.');
      }

      // Validate the response from the initialization function
      if (!initData || !initData.data || !initData.data.authorization_url || !initData.data.reference) {
          console.error("Invalid response from initialize-paystack-payment:", initData);
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

        // Wait for the script to load before proceeding
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

      // Get Paystack Public Key from environment variables (for client-side pop-up)
      const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackPublicKey) {
        // Essential environment variable missing
        throw new Error("Paystack Public Key (VITE_PAYSTACK_PUBLIC_KEY) not found in environment. Please add it to your .env.local file and restart the development server.");
      }

      // Prepare customer name for Paystack pop-up
      const [firstname, lastname] = customerName ? customerName.split(' ') : ['', ''];

      // 3. Setup and open Paystack Pop-up
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email,
        amount: Math.round(amount * 100), // Paystack amount is in kobo/pesewas (cents)
        ref: reference, // Use the reference generated by your backend!
        currency: 'GHS', // Ghana Cedi
        metadata: {
          order_id: orderId, // Pass orderId for backend verification context
          customer_name: customerName,
          customer_phone: phone,
          // You can pass other custom fields here, e.g., cart items
        },
        channels: ['card', 'mobile_money', 'bank_transfer'], // Allowed payment channels
        callback: async (response: any) => {
          // This callback fires when the user completes payment or closes the pop-up
          console.log("Paystack callback received:", response);
          setLoading(true); // Keep loading true during verification

          try {
            // Ensure Paystack provided a reference
            if (!response.reference) {
                throw new Error("Paystack callback did not provide a transaction reference. Cannot verify payment.");
            }

            // 4. Call Supabase Edge Function to Verify Payment
            console.log("Calling Supabase Edge Function: verify-paystack-payment for reference:", response.reference);
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-paystack-payment', {
              body: { reference: response.reference, orderId }, // Send reference and orderId to backend
            });

            if (verifyError) {
              console.error("Error verifying payment via Edge Function:", verifyError);
              throw new Error(verifyError.message || 'Payment verification failed. Please check with support if payment went through.');
            }

            // Check the status from your backend verification
            if (verifyData.data && verifyData.data.status === 'success') {
              console.log("Payment successfully verified by the backend.");
              // This is where you might trigger UI updates, navigate, etc.
              // For example, you might dispatch an event or update global state.
              return { status: 'success', message: 'Payment successful and verified.', reference: response.reference };
            } else {
              // Payment not successful after verification, or backend reported failure
              console.warn("Payment verification failed on backend:", verifyData.data);
              throw new Error(verifyData.data?.gateway_response || 'Payment not successful. Please try again or contact support.');
            }
          } catch (verificationError: any) {
            console.error("Verification process failed:", verificationError);
            setError(verificationError.message || 'Payment verification failed due to an unexpected error.');
            // Return an error response from the callback so the caller can handle it
            return { status: 'error', message: verificationError.message || 'Payment verification failed.' };
          } finally {
            setLoading(false); 
          }
        },
        onClose: () => {
          console.log('Paystack Pop-up closed by user.');
          setLoading(false); 
          setError('Payment cancelled by user.'); // Inform the user
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