// Your Supabase Edge Function: initialize-paystack-payment (or combined "handle-payment")
// This code needs to be deployed to your Supabase project as an Edge Function.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"; // Keep this version for now, or update if needed
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Define CORS headers for successful responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // IMPORTANT: In production, change '*' to your specific frontend URL (e.g., 'https://yourdomain.com')
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json', // Add Content-Type for JSON responses
};

// Define CORS headers specifically for the OPTIONS preflight response
const corsPreflightHeaders = {
    'Access-Control-Allow-Origin': '*', // IMPORTANT: In production, change '*' to your specific frontend URL
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Explicitly allow POST and OPTIONS
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

interface PaymentRequest {
  action: 'initialize'; // Use literal types for actions
  email: string;
  amount: number; // Amount in major currency (e.g., GHS)
  orderId: string;
  customerName?: string;
  phone?: string;
}

interface VerifyPaymentRequest {
  action: 'verify'; // Use literal types for actions
  reference: string;
  orderId: string;
}

// Type for the incoming request body
type RequestBody = PaymentRequest | VerifyPaymentRequest;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsPreflightHeaders, status: 200 }); // Explicitly set status to 200 OK
  }

  try {
    // Initialize Supabase client for database operations within the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', // SUPABASE_URL must be set in Edge Function env
      Deno.env.get('SUPABASE_ANON_KEY') ?? '' // SUPABASE_ANON_KEY must be set in Edge Function env
    );

    // Get Paystack Secret Key from Edge Function environment variables
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY is not set in Edge Function environment variables.");
      throw new Error("Server configuration error: Paystack Secret Key is missing.");
    }

    const requestBody: RequestBody = await req.json();
    const { action } = requestBody;

    if (action === 'initialize') {
      const { email, amount, orderId, customerName, phone } = requestBody as PaymentRequest;

      // Input validation
      if (!email || typeof amount !== 'number' || amount <= 0 || !orderId) {
        throw new Error('Missing or invalid required parameters for payment initialization.');
      }

      // Generate a unique reference
      const reference = `sp_${orderId}_${Date.now()}`; // Added sp_ for Supabase Paystack clarity

      console.log(`Initializing Paystack transaction for order ${orderId}, amount: ${amount}, email: ${email}`);

      // Call Paystack Transaction Initialize API
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo/pesewas
          currency: 'GHS', // Hardcode or derive currency
          reference: reference,
          metadata: {
            order_id: orderId,
            customer_name: customerName,
            customer_phone: phone,
          },
          // You might add callback_url here if you're not using pop-up callbacks
        }),
      });

      if (!paystackResponse.ok) { // Check if the HTTP response itself was OK (e.g., 200)
          const errorText = await paystackResponse.text(); // Get raw error response
          console.error(`Paystack initialize API error: Status ${paystackResponse.status}, Body: ${errorText}`);
          throw new Error(`Failed to initialize payment with Paystack: ${paystackResponse.statusText}. Please check Paystack API logs.`);
      }

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) { // Check Paystack's internal status property
        console.error("Paystack API returned non-success status:", paystackData);
        throw new Error(paystackData.message || 'Payment initialization failed with Paystack.');
      }

      // Update order with payment reference (use `paystack_reference` for clarity)
      const { error: dbError } = await supabaseClient
        .from('orders')
        .update({
          payment_method: 'paystack',
          paystack_reference: paystackData.data.reference, // Use a more descriptive field name
          payment_status: 'pending' // Set to pending until verified
        })
        .eq('id', orderId);

      if (dbError) {
          console.error("Supabase DB error updating order:", dbError);
          // Decide if you want to fail the entire function or log and continue
          throw new Error("Failed to update order in database after Paystack initialization.");
      }

      console.log('Payment initialized and order updated. Reference:', paystackData.data.reference);

      return new Response(JSON.stringify(paystackData), { // Return the full Paystack response for client
        headers: corsHeaders,
        status: 200, // Explicitly return 200 OK
      });

    } else if (action === 'verify') {
      const { reference, orderId } = requestBody as VerifyPaymentRequest;

      if (!reference || !orderId) {
        throw new Error('Missing or invalid required parameters for payment verification.');
      }

      console.log(`Verifying Paystack transaction for reference ${reference}, order ${orderId}`);

      // Call Paystack Transaction Verify API
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      if (!verifyResponse.ok) { // Check if the HTTP response itself was OK
          const errorText = await verifyResponse.text();
          console.error(`Paystack verify API error: Status ${verifyResponse.status}, Body: ${errorText}`);
          throw new Error(`Failed to verify payment with Paystack: ${verifyResponse.statusText}. Please check Paystack API logs.`);
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.status) { // Check Paystack's internal status property
        console.error("Paystack API returned non-success status during verification:", verifyData);
        throw new Error('Payment verification failed with Paystack.');
      }

      const paymentStatus = verifyData.data.status === 'success' ? 'paid' : 'failed';

      // Update order payment status
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
          // Consider storing more verification data if needed
        })
        .eq('id', orderId);

      if (updateError) {
          console.error("Supabase DB error updating order status:", updateError);
          throw new Error("Failed to update order status in database after verification.");
      }

      // If payment successful, update order status to confirmed
      if (paymentStatus === 'paid') {
        const { error: confirmError } = await supabaseClient
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId);

        if (confirmError) {
            console.error("Supabase DB error confirming order:", confirmError);
            throw new Error("Failed to confirm order in database after successful payment.");
        }
      }

      console.log(`Payment ${paymentStatus} for order ${orderId}. Verification details:`, verifyData.data);

      return new Response(JSON.stringify({
        success: paymentStatus === 'paid',
        status: paymentStatus,
        data: verifyData.data // Return Paystack's full verification data
      }), {
        headers: corsHeaders,
        status: 200,
      });

    } else {
      // Handle invalid 'action' values
      return new Response(JSON.stringify({ error: 'Invalid action provided. Expected "initialize" or "verify".' }), {
        status: 400, // Bad Request
        headers: corsHeaders,
      });
    }

  } catch (error: any) {
    console.error('An unexpected error occurred in Edge Function:', error.message || error);
    // Return a generic error response for security and consistency
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { // Added details for debugging in development
      status: 500,
      headers: corsHeaders,
    });
  }
});