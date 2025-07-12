-- Regenerate Supabase types to match current database schema
-- This ensures TypeScript types are properly synchronized with the database

-- Verify the profiles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify the orders table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
AND table_schema = 'public'
ORDER BY ordinal_position;