import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const event = req.body;
  
  if (event.event === 'charge.success') {
    const { reference } = event.data;
    
    try {
      // Update order status in your database
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_reference: reference,
          payment_data: event.data
        })
        .eq('id', reference);

      if (error) throw error;

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ message: 'Error processing webhook' });
    }
  }

  return res.status(200).json({ received: true });
}