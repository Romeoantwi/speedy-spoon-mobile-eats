
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const corsPreflightHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

interface PaymentRequest {
  action: 'initialize';
  email: string;
  amount: number;
  orderId: string;
  customerName?: string;
  phone?: string;
}

interface VerifyPaymentRequest {
  action: 'verify';
  reference: string;
  orderId: string;
}

type RequestBody = PaymentRequest | VerifyPaymentRequest;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsPreflightHeaders, status: 200 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      throw new Error("Payment service configuration error");
    }

    const requestBody: RequestBody = await req.json();
    const { action } = requestBody;

    if (action === 'initialize') {
      const { email, amount, orderId, customerName, phone } = requestBody as PaymentRequest;

      // Validate required fields
      if (!email || !amount || amount <= 0 || !orderId) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid required parameters' }), 
          { status: 400, headers: corsHeaders }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }), 
          { status: 400, headers: corsHeaders }
        );
      }

      // Generate unique reference
      const reference = `sp_${orderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`Initializing payment: Order ${orderId}, Amount: ${amount}, Email: ${email}`);

      // Initialize with Paystack
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: 'GHS',
          reference,
          metadata: {
            order_id: orderId,
            customer_name: customerName || '',
            customer_phone: phone || '',
          },
          channels: ['card', 'mobile_money', 'bank_transfer'],
        }),
      });

      if (!paystackResponse.ok) {
        const errorText = await paystackResponse.text();
        console.error(`Paystack API error: ${paystackResponse.status} - ${errorText}`);
        throw new Error('Payment service temporarily unavailable');
      }

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        console.error("Paystack initialization failed:", paystackData);
        throw new Error(paystackData.message || 'Payment initialization failed');
      }

      // Update order with payment reference
      const { error: dbError } = await supabaseClient
        .from('orders')
        .update({
          payment_method: 'paystack',
          paystack_reference: reference,
          payment_status: 'pending'
        })
        .eq('id', orderId);

      if (dbError) {
        console.error("Database update error:", dbError);
        throw new Error("Failed to update order status");
      }

      console.log(`Payment initialized successfully: ${reference}`);

      return new Response(JSON.stringify(paystackData), {
        headers: corsHeaders,
        status: 200,
      });

    } else if (action === 'verify') {
      const { reference, orderId } = requestBody as VerifyPaymentRequest;

      if (!reference || !orderId) {
        return new Response(
          JSON.stringify({ error: 'Missing verification parameters' }), 
          { status: 400, headers: corsHeaders }
        );
      }

      console.log(`Verifying payment: ${reference} for order ${orderId}`);

      // Verify with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error(`Paystack verification error: ${verifyResponse.status} - ${errorText}`);
        throw new Error('Payment verification service unavailable');
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.status) {
        console.error("Paystack verification failed:", verifyData);
        throw new Error('Payment verification failed');
      }

      const isSuccessful = verifyData.data.status === 'success';
      const paymentStatus = isSuccessful ? 'paid' : 'failed';

      // Update order status
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error("Database update error:", updateError);
        throw new Error("Failed to update payment status");
      }

      // If payment successful, confirm the order
      if (isSuccessful) {
        const { error: confirmError } = await supabaseClient
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId);

        if (confirmError) {
          console.error("Order confirmation error:", confirmError);
          // Don't throw here as payment was successful
        }
      }

      console.log(`Payment verification complete: ${paymentStatus} for order ${orderId}`);

      return new Response(JSON.stringify({
        success: isSuccessful,
        status: paymentStatus,
        data: verifyData.data
      }), {
        headers: corsHeaders,
        status: 200,
      });

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "initialize" or "verify"' }), 
        { status: 400, headers: corsHeaders }
      );
    }

  } catch (error: any) {
    console.error('Edge Function error:', error.message || error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message || 'An unexpected error occurred' 
      }), 
      { status: 500, headers: corsHeaders }
    );
  }
});
