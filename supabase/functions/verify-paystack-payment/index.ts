import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'; // Adjust version if needed

// Function to call Paystack verification API
async function verifyPayment(reference: string) {
    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY'); // Get secret key from Supabase Secrets

    if (!secretKey) {
        throw new Error('Paystack secret key not set in environment variables.');
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secretKey}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Paystack Verification Error:', errorData);
        throw new Error(errorData.message || 'Failed to verify Paystack payment');
    }

    const data = await response.json();
    return data.data; // This contains the verification status and details
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { reference, orderId } = await req.json(); // orderId added for potential database update

        if (!reference) {
            return new Response(JSON.stringify({ error: 'Missing required parameter: reference' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            });
        }

        const verificationData = await verifyPayment(reference);

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY'); // Or use a service role key if needed
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        // Update your 'orders' table in Supabase based on verificationData
        let status = 'failed';
        if (verificationData.status === 'success') {
            status = 'paid'; // Or 'processing', 'completed', based on your order lifecycle
        }

        // Example: Update order status in your 'orders' table
        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders') // Your orders table name
            .update({ payment_status: status, paystack_ref: reference, paystack_data: verificationData }) // Add other relevant data
            .eq('id', orderId) // Assuming orderId is the primary key
            .select();

        if (updateError) {
            console.error('Supabase Order Update Error:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to update order status in database.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        return new Response(JSON.stringify({ data: verificationData, updatedOrder: updatedOrder[0] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });

    } catch (error) {
        console.error('Error in verify-paystack-payment:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
        });
    }
});