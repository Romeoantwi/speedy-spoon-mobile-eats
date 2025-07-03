-- Create enhanced notification function for admin order details
CREATE OR REPLACE FUNCTION public.notify_admin_order_details()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  order_details TEXT;
  admin_ids UUID[];
BEGIN
  -- Build detailed order information
  order_details := 'New Order Details:' || E'\n' ||
    'Order ID: ' || NEW.id || E'\n' ||
    'Customer: ' || COALESCE(NEW.customer_phone, 'Not provided') || E'\n' ||
    'Total Amount: GH₵' || NEW.total_amount || E'\n' ||
    'Delivery Fee: GH₵' || NEW.delivery_fee || E'\n' ||
    'Payment Status: ' || COALESCE(NEW.payment_status, 'pending') || E'\n' ||
    'Delivery Address: ' || NEW.delivery_address || E'\n';
  
  -- Add special instructions if provided
  IF NEW.special_instructions IS NOT NULL AND NEW.special_instructions != '' THEN
    order_details := order_details || 'Special Instructions: ' || NEW.special_instructions || E'\n';
  END IF;
  
  -- Add item details from JSON
  order_details := order_details || E'\nOrdered Items:' || E'\n';
  
  -- Get all admin users (those with admin roles)
  SELECT ARRAY(
    SELECT DISTINCT customer_id 
    FROM orders 
    WHERE customer_id IN (
      SELECT id FROM auth.users WHERE email IN (
        'admin@speedyspoon.com', 
        'restaurant@speedyspoon.com',
        'manager@speedyspoon.com'
      )
    )
    LIMIT 1
  ) INTO admin_ids;
  
  -- If no specific admin found, notify first user (fallback)
  IF array_length(admin_ids, 1) IS NULL THEN
    SELECT ARRAY(SELECT id FROM auth.users LIMIT 1) INTO admin_ids;
  END IF;
  
  -- Send notification to all admins
  IF array_length(admin_ids, 1) > 0 THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    SELECT 
      admin_id,
      NEW.id,
      'new_order_admin',
      'New Order Received! 🍽️',
      order_details
    FROM unnest(admin_ids) AS admin_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for new orders to notify admin
DROP TRIGGER IF EXISTS admin_order_notification ON orders;
CREATE TRIGGER admin_order_notification
  AFTER INSERT ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_admin_order_details();

-- Remove driver assignment functions and triggers
DROP TRIGGER IF EXISTS auto_assign_driver ON orders;
DROP FUNCTION IF EXISTS public.assign_driver_to_order();

-- Update order status notification to remove driver references
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Notify customer of status changes
  IF NEW.status = 'confirmed' THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    VALUES (
      NEW.customer_id,
      NEW.id,
      'order_confirmed',
      'Order Confirmed! 🍽️',
      'Your order has been confirmed and is being prepared. Estimated time: ' || COALESCE(NEW.estimated_prep_time::text, '25') || ' minutes'
    );
  ELSIF NEW.status = 'ready' THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    VALUES (
      NEW.customer_id,
      NEW.id,
      'order_ready',
      'Order Ready! 📦',
      'Your order is ready for pickup/delivery'
    );
  ELSIF NEW.status = 'picked_up' THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    VALUES (
      NEW.customer_id,
      NEW.id,
      'order_picked_up',
      'Order On The Way! 🚚',
      'Your order has been picked up and is on its way to you'
    );
  ELSIF NEW.status = 'delivered' THEN
    INSERT INTO notifications (recipient_id, order_id, type, title, message)
    VALUES (
      NEW.customer_id,
      NEW.id,
      'order_delivered',
      'Order Delivered! ✅',
      'Your order has been delivered. Thank you for choosing SpeedySpoon!'
    );
  END IF;

  RETURN NEW;
END;
$function$;