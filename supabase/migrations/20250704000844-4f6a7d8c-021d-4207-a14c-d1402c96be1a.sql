-- Update the admin notification function to also send SMS
CREATE OR REPLACE FUNCTION public.notify_admin_order_details()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  order_details TEXT;
  item_details JSONB;
  admin_user_id UUID;
  admin_phone TEXT := '+233546906739'; -- Admin phone number
BEGIN
  -- Get the first admin user or fallback to any user
  SELECT id INTO admin_user_id
  FROM auth.users 
  WHERE email IN ('admin@speedyspoon.com', 'restaurant@speedyspoon.com', 'manager@speedyspoon.com')
  LIMIT 1;
  
  -- If no specific admin found, get first user as fallback
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  END IF;
  
  -- Parse items JSON to extract details
  item_details := NEW.items;
  
  -- Build detailed order information with item breakdown
  order_details := 'New Order Details:' || E'\n' ||
    'Order ID: #' || SUBSTRING(NEW.id::text, 1, 8) || E'\n' ||
    'Customer Phone: ' || COALESCE(NEW.customer_phone, 'Not provided') || E'\n' ||
    'Total Amount: GH₵' || NEW.total_amount || E'\n' ||
    'Delivery Fee: GH₵' || NEW.delivery_fee || E'\n' ||
    'Payment Status: ' || COALESCE(NEW.payment_status, 'pending') || E'\n' ||
    'Delivery Address: ' || NEW.delivery_address || E'\n';
  
  -- Add special instructions if provided
  IF NEW.special_instructions IS NOT NULL AND NEW.special_instructions != '' THEN
    order_details := order_details || 'Special Instructions: ' || NEW.special_instructions || E'\n';
  END IF;
  
  order_details := order_details || E'\n📋 Ordered Items:' || E'\n';
  
  -- Send notification to admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    VALUES (
      admin_user_id,
      NEW.id,
      'new_order_admin',
      'New Order Received! 🍽️ #' || SUBSTRING(NEW.id::text, 1, 8),
      order_details || 'Items: Check order details for full breakdown including spice levels and customizations.'
    );
  END IF;

  -- Send SMS notification to admin
  SELECT extensions.http_post(
    'https://oeyehfuhmgwelttxwfew.supabase.co/functions/v1/send-sms-notification',
    jsonb_build_object(
      'to', admin_phone,
      'message', 'New order received',
      'orderDetails', jsonb_build_object(
        'id', NEW.id,
        'customer_phone', NEW.customer_phone,
        'total_amount', NEW.total_amount,
        'delivery_address', NEW.delivery_address,
        'items', NEW.items
      )
    ),
    'application/json'::text,
    'Bearer ' || current_setting('app.supabase_anon_key', true)
  );

  RETURN NEW;
END;
$function$;