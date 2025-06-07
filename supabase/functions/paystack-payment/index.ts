
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  email: string;
  amount: number;
  orderId: string;
  customerName?: string;
  phone?: string;
}

interface VerifyPaymentRequest {
  reference: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'initialize') {
      const { email, amount, orderId, customerName, phone }: PaymentRequest = await req.json();

      // Initialize payment with Paystack
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: 'GHS',
          reference: `sp_${orderId}_${Date.now()}`,
          metadata: {
            order_id: orderId,
            customer_name: customerName,
            phone: phone,
          },
        }),
      });

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        throw new Error(paystackData.message || 'Payment initialization failed');
      }

      // Update order with payment reference
      await supabaseClient
        .from('orders')
        .update({ 
          payment_method: 'paystack',
          stripe_payment_intent_id: paystackData.data.reference 
        })
        .eq('id', orderId);

      console.log('Payment initialized:', paystackData.data.reference);

      return new Response(JSON.stringify(paystackData.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'verify') {
      const { reference, orderId }: VerifyPaymentRequest = await req.json();

      // Verify payment with Paystack
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        },
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.status) {
        throw new Error('Payment verification failed');
      }

      const paymentStatus = verifyData.data.status === 'success' ? 'paid' : 'failed';

      // Update order payment status
      await supabaseClient
        .from('orders')
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      // If payment successful, update order status to confirmed
      if (paymentStatus === 'paid') {
        await supabaseClient
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId);
      }

      console.log(`Payment ${paymentStatus} for order ${orderId}`);

      return new Response(JSON.stringify({ 
        success: paymentStatus === 'paid',
        status: paymentStatus,
        data: verifyData.data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error('Paystack payment error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
