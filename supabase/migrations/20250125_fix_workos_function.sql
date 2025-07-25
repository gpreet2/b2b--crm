-- Fix the upsert_user_from_workos function to handle profiles without auth.users dependency

-- Drop the existing function
DROP FUNCTION IF EXISTS upsert_user_from_workos;

-- Create updated function that doesn't depend on auth.users
CREATE OR REPLACE FUNCTION upsert_user_from_workos(
  p_workos_user_id TEXT,
  p_email TEXT,
  p_full_name TEXT,
  p_workos_org_id TEXT DEFAULT NULL,
  p_auth_provider TEXT DEFAULT 'magic_link'
) RETURNS profiles AS $$
DECLARE
  v_profile profiles;
  v_gym_id UUID;
  v_user_id UUID;
BEGIN
  -- For now, generate a UUID for the user ID since we're not using Supabase Auth
  -- In production, this should be the actual WorkOS user ID mapped appropriately
  v_user_id := gen_random_uuid();
  
  -- Check if user already exists by email or workos_user_id
  SELECT * INTO v_profile FROM profiles 
  WHERE email = p_email OR workos_user_id = p_workos_user_id
  LIMIT 1;
  
  IF v_profile.id IS NOT NULL THEN
    -- Update existing user
    UPDATE profiles SET
      workos_user_id = p_workos_user_id,
      email = p_email,
      full_name = COALESCE(p_full_name, full_name),
      workos_organization_id = COALESCE(p_workos_org_id, workos_organization_id),
      auth_provider = p_auth_provider,
      last_login_at = NOW()
    WHERE id = v_profile.id
    RETURNING * INTO v_profile;
  ELSE
    -- Check for pending invitation to get gym_id
    SELECT gym_id INTO v_gym_id FROM invitations 
    WHERE email = p_email AND status = 'pending' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If no invitation, check if this is the first user (make them owner)
    IF v_gym_id IS NULL THEN
      SELECT id INTO v_gym_id FROM gyms ORDER BY created_at LIMIT 1;
    END IF;
    
    -- Create new user profile
    -- Note: We're using v_user_id as both id and a separate workos_user_id
    -- This is a temporary solution until we fully migrate away from Supabase Auth
    INSERT INTO profiles (
      id,
      workos_user_id,
      email,
      full_name,
      gym_id,
      role,
      workos_organization_id,
      auth_provider,
      last_login_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id, -- Use generated UUID as profile ID
      p_workos_user_id,
      p_email,
      p_full_name,
      v_gym_id,
      CASE 
        WHEN (SELECT COUNT(*) FROM profiles) = 0 THEN 'owner' -- First user is owner
        ELSE 'member' -- Default role
      END,
      p_workos_org_id,
      p_auth_provider,
      NOW(),
      NOW(),
      NOW()
    )
    RETURNING * INTO v_profile;
    
    -- Accept invitation if exists
    UPDATE invitations SET
      status = 'accepted',
      accepted_at = NOW()
    WHERE email = p_email AND status = 'pending';
    
    -- Update role from invitation
    UPDATE profiles SET
      role = COALESCE(
        (SELECT role FROM invitations WHERE email = p_email ORDER BY created_at DESC LIMIT 1),
        role
      )
    WHERE id = v_profile.id;
  END IF;
  
  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_user_from_workos TO anon, authenticated;

-- Also ensure profiles table doesn't have strict foreign key to auth.users
-- Check current constraints
SELECT conname, contype, conrelid::regclass AS table_name, confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
AND contype = 'f'; -- 'f' for foreign key

-- If there's a foreign key to auth.users, we need to handle it
-- This is commented out for safety - uncomment if needed
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;