-- Create RPC for direct staff account creation (owner only)
CREATE OR REPLACE FUNCTION public.create_staff_account(
    p_email text,
    p_password text,
    p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_gym_id uuid;
    v_new_user_id uuid;
BEGIN
    -- Get the current user's role and gym_id
    SELECT 
        p.role,
        p.gym_id
    INTO v_user_role, v_gym_id
    FROM public.profiles p
    WHERE p.id = auth.uid();

    -- Only owners can create staff accounts
    IF v_user_role != 'owner' THEN
        RAISE EXCEPTION 'Only gym owners can create staff accounts';
    END IF;

    -- Validate role parameter
    IF p_role NOT IN ('manager', 'trainer') THEN
        RAISE EXCEPTION 'Invalid role. Must be manager or trainer';
    END IF;

    -- Check if email already exists
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = lower(p_email)
    ) THEN
        RAISE EXCEPTION 'An account with this email already exists';
    END IF;

    -- Create the user account using Admin API
    -- Note: This requires the service_role key in production
    -- For now, we'll return instructions for manual creation
    
    -- In production, you would use Supabase Admin API to create the user
    -- For this implementation, we'll store the pending account info
    
    -- Create a pending account record
    INSERT INTO public.pending_accounts (
        gym_id,
        email,
        role,
        created_by,
        temp_password
    ) VALUES (
        v_gym_id,
        lower(p_email),
        p_role,
        auth.uid(),
        crypt(p_password, gen_salt('bf'))
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        role = EXCLUDED.role,
        temp_password = EXCLUDED.temp_password,
        created_at = now();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Account created successfully',
        'email', lower(p_email),
        'role', p_role
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Create pending_accounts table to store account creation requests
CREATE TABLE IF NOT EXISTS public.pending_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    role text NOT NULL CHECK (role IN ('manager', 'trainer')),
    temp_password text NOT NULL,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    activated_at timestamptz
);

-- Enable RLS on pending_accounts
ALTER TABLE public.pending_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only gym owners can view their pending accounts
CREATE POLICY "Owners can view their gym's pending accounts"
    ON public.pending_accounts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = pending_accounts.gym_id
            AND profiles.role = 'owner'
        )
    );

-- Create function to activate pending account (called after user signs up)
CREATE OR REPLACE FUNCTION public.activate_pending_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pending_account record;
BEGIN
    -- Check if this email has a pending account
    SELECT * INTO v_pending_account
    FROM public.pending_accounts
    WHERE email = NEW.email
    AND activated_at IS NULL;

    IF v_pending_account IS NOT NULL THEN
        -- Create profile for the new user
        INSERT INTO public.profiles (
            id,
            gym_id,
            role,
            full_name
        ) VALUES (
            NEW.id,
            v_pending_account.gym_id,
            v_pending_account.role,
            NEW.raw_user_meta_data->>'full_name'
        );

        -- Mark pending account as activated
        UPDATE public.pending_accounts
        SET activated_at = now()
        WHERE id = v_pending_account.id;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger to activate pending accounts on user creation
CREATE TRIGGER on_auth_user_created_activate_account
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.activate_pending_account();

-- Update the profiles table to ensure role validation
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('owner', 'manager', 'trainer', 'member'));

-- Create view for staff members
CREATE OR REPLACE VIEW public.staff_members AS
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.created_at,
    u.email,
    p.gym_id
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('owner', 'manager', 'trainer');

-- Grant access to the view
GRANT SELECT ON public.staff_members TO authenticated;

-- RLS policy for staff_members view
CREATE POLICY "Users can view their gym's staff"
    ON public.profiles
    FOR SELECT
    USING (
        gym_id = (SELECT gym_id FROM public.profiles WHERE id = auth.uid())
    );

-- Function to handle staff login with role validation
CREATE OR REPLACE FUNCTION public.validate_staff_login(
    p_email text,
    p_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role text;
BEGIN
    -- Get the user's actual role
    SELECT p.role INTO v_user_role
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE u.email = lower(p_email);

    -- Check if the selected role matches their actual role
    RETURN v_user_role = p_role;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_staff_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_staff_login TO anon, authenticated;