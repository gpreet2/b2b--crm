-- Migration: WorkOS Authentication System
-- Description: Add WorkOS authentication support to the database schema

-- 1. Update profiles table with WorkOS fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS workos_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS workos_organization_id TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'magic_link';

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_workos_user_id ON profiles(workos_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON profiles(gym_id);

-- 2. Update invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS workos_organization_id TEXT;

-- 3. Create sessions table for session management
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions(profile_id);

-- 4. Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to upsert user from WorkOS profile
CREATE OR REPLACE FUNCTION upsert_user_from_workos(
  p_workos_user_id TEXT,
  p_email TEXT,
  p_full_name TEXT,
  p_workos_org_id TEXT DEFAULT NULL,
  p_auth_provider TEXT DEFAULT 'magic_link'
)
RETURNS profiles AS $$
DECLARE
  v_profile profiles;
  v_gym_id UUID;
BEGIN
  -- First, check if user exists by email
  SELECT * INTO v_profile FROM profiles WHERE email = p_email;
  
  IF v_profile.id IS NOT NULL THEN
    -- Update existing user
    UPDATE profiles SET
      workos_user_id = p_workos_user_id,
      workos_organization_id = COALESCE(p_workos_org_id, workos_organization_id),
      auth_provider = p_auth_provider,
      last_login_at = NOW(),
      updated_at = NOW()
    WHERE id = v_profile.id
    RETURNING * INTO v_profile;
  ELSE
    -- Check if there's a pending invitation
    SELECT gym_id INTO v_gym_id FROM invitations 
    WHERE email = p_email AND status = 'pending' 
    LIMIT 1;
    
    -- If no invitation, use default gym (id = 1) for now
    IF v_gym_id IS NULL THEN
      v_gym_id := (SELECT id FROM gyms ORDER BY created_at LIMIT 1);
    END IF;
    
    -- Create new user
    INSERT INTO profiles (
      id,
      workos_user_id,
      email,
      full_name,
      gym_id,
      role,
      workos_organization_id,
      auth_provider,
      last_login_at
    ) VALUES (
      gen_random_uuid(),
      p_workos_user_id,
      p_email,
      p_full_name,
      v_gym_id,
      'member', -- Default role, will be updated if invitation exists
      p_workos_org_id,
      p_auth_provider,
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
        'member'
      )
    WHERE id = v_profile.id;
  END IF;
  
  RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update RLS policies for new auth system
-- Drop existing RLS policies that depend on auth.uid()
DO $$ 
BEGIN
  -- Disable RLS temporarily to update policies
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
  
  -- Drop old policies if they exist
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
END $$;

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies based on session token
-- For now, we'll create permissive policies until we implement session validation
CREATE POLICY "Profiles are viewable by gym members"
  ON profiles FOR SELECT
  USING (true); -- Will be updated to check session

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (true); -- Will be updated to check session

CREATE POLICY "Sessions are only viewable by owner"
  ON sessions FOR ALL
  USING (true); -- Will be updated to check session

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON sessions TO anon, authenticated;
GRANT ALL ON invitations TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_from_workos TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO anon, authenticated;

-- 8. Add comment for documentation
COMMENT ON TABLE sessions IS 'User session management for WorkOS authentication';
COMMENT ON COLUMN profiles.workos_user_id IS 'Unique user ID from WorkOS';
COMMENT ON COLUMN profiles.workos_organization_id IS 'WorkOS organization ID for enterprise SSO';
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication provider: magic_link, google, microsoft, etc';