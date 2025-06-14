
-- Update the profiles table check constraint to allow 'admin' user type
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Add the updated constraint that includes 'admin' as a valid user type
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('customer', 'driver', 'admin'));
