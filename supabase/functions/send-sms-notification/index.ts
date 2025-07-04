import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

interface SMSRequest {
  to: string;
  message: string;
  orderDetails?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, message, orderDetails }: SMSRequest = await req.json();

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // Format order details for SMS
    let smsMessage = message;
    if (orderDetails) {
      smsMessage = `🍽️ NEW ORDER ALERT!\n\n` +
        `Order ID: #${orderDetails.id.slice(-8)}\n` +
        `Customer: ${orderDetails.customer_phone || 'Not provided'}\n` +
        `Amount: GH₵${orderDetails.total_amount}\n` +
        `Delivery: ${orderDetails.delivery_address}\n` +
        `Items: ${orderDetails.items.length} item(s)\n\n` +
        `📱 Check your dashboard for full details including spice levels and customizations.`;
    }

    // Send SMS via Twilio
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Body: smsMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully:', result.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});