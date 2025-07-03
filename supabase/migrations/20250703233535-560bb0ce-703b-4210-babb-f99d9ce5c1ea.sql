-- Remove all driver-related triggers and functions properly
DROP TRIGGER IF EXISTS assign_driver_on_ready ON orders;
DROP TRIGGER IF EXISTS auto_assign_driver ON orders;
DROP FUNCTION IF EXISTS public.assign_driver_to_order() CASCADE;

-- Create enhanced notification function for admin order details
CREATE OR REPLACE FUNCTION public.notify_admin_order_details()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  order_details TEXT;
  item_details JSONB;
  admin_user_id UUID;
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

  RETURN NEW;
END;
$function$;

-- Create trigger for new orders to notify admin
DROP TRIGGER IF EXISTS admin_order_notification ON orders;
CREATE TRIGGER admin_order_notification
  AFTER INSERT ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.notify_admin_order_details();

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