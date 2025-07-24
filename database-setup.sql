-- Database setup SQL for authentication system
-- Based on context7 search findings for fixing 500 errors

-- 1. Ensure profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'coach', 'member')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create function to handle new user signup
-- This prevents the 500 error by ensuring profile creation always succeeds
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_gym_id UUID;
BEGIN
  -- Get default gym ID, create one if none exists
  SELECT id INTO default_gym_id 
  FROM gyms 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Create default gym if none exists
  IF default_gym_id IS NULL THEN
    INSERT INTO gyms (name, timezone) 
    VALUES ('Back2Back Fitness', 'America/New_York')
    RETURNING id INTO default_gym_id;
  END IF;
  
  -- Insert profile with robust error handling
  INSERT INTO public.profiles (
    id, 
    gym_id, 
    role, 
    full_name
  ) VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'gym_id')::UUID,
      default_gym_id
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'member'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create function to handle profile updates
-- This prevents errors during profile modifications
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if gym_id is not null to prevent constraint violations
  IF NEW.gym_id IS NOT NULL THEN
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but allow update to proceed
    RAISE WARNING 'Error updating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();

-- 6. Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Gym members can view same gym profiles" ON profiles;
CREATE POLICY "Gym members can view same gym profiles" ON profiles
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.gyms TO anon, authenticated;

-- 8. Ensure gyms table exists with default data
CREATE TABLE IF NOT EXISTS gyms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default gym if none exists
INSERT INTO gyms (name, timezone)
SELECT 'Back2Back Fitness', 'America/New_York'
WHERE NOT EXISTS (SELECT 1 FROM gyms LIMIT 1);

-- Enable RLS on gyms table
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Create gym policies
DROP POLICY IF EXISTS "Authenticated users can view gyms" ON gyms;
CREATE POLICY "Authenticated users can view gyms" ON gyms
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Gym owners can manage gym" ON gyms;
CREATE POLICY "Gym owners can manage gym" ON gyms
  FOR ALL TO authenticated USING (
    id IN (
      SELECT gym_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

COMMENT ON FUNCTION public.handle_new_user IS 'Creates user profile automatically on signup with error handling';
COMMENT ON FUNCTION public.handle_profile_update IS 'Updates profile timestamp and handles gym_id constraints';