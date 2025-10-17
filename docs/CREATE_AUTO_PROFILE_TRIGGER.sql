-- ============================================
-- AUTO-CREATE PROFILE FOR NEW USERS
-- ============================================
-- This trigger automatically creates a profile entry
-- when a new user signs up via Supabase Auth
-- ============================================

-- Step 1: Create the function that will handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Get the first tenant ID as default (or you can set a specific one)
  SELECT id INTO default_tenant_id
  FROM tenants
  LIMIT 1;

  -- Insert a new profile for the user
  INSERT INTO public.profiles (
    id,
    tenant_id,
    full_name,
    username,
    role_id,
    locale,
    timezone,
    notification_preferences,
    is_active
  )
  VALUES (
    NEW.id,
    default_tenant_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    4,  -- Default role: Contractor (you can change this to 0 for Admin)
    COALESCE(NEW.raw_user_meta_data->>'locale', 'tr'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Europe/Istanbul'),
    '{"email": true, "push": true, "sms": false}'::jsonb,
    true
  );

  RETURN NEW;
END;
$$;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. From now on, every new user will automatically get:
--    - A profile entry
--    - Default role_id = 4 (Contractor)
--    - Assigned to the first tenant
--    - Active status
--
-- 3. You can customize the default values in the function above
-- 4. To change default role, modify the role_id value (line 34)
--    - 0 = SNSD Admin
--    - 1 = Company Admin
--    - 2 = HSE Manager
--    - 3 = HSE Specialist
--    - 4 = Contractor
--
-- ============================================
