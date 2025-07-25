-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('manager', 'trainer')),
    token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    accepted_at timestamptz,
    expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only gym owners and managers can view their gym's invitations
CREATE POLICY "Users can view their gym's invitations"
    ON public.invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = invitations.gym_id
            AND profiles.role IN ('owner', 'manager')
        )
    );

-- RLS policy: Only gym owners and managers can create invitations
CREATE POLICY "Owners and managers can create invitations"
    ON public.invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = invitations.gym_id
            AND profiles.role IN ('owner', 'manager')
        )
    );

-- Create function to create invitation
CREATE OR REPLACE FUNCTION public.create_invitation(
    p_email text,
    p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_role text;
    v_gym_id uuid;
    v_invitation_id uuid;
    v_token text;
BEGIN
    -- Get the current user's role and gym_id
    SELECT 
        p.role,
        p.gym_id
    INTO v_user_role, v_gym_id
    FROM public.profiles p
    WHERE p.id = auth.uid();

    -- Only owners and managers can create invitations
    IF v_user_role NOT IN ('owner', 'manager') THEN
        RAISE EXCEPTION 'Only gym owners and managers can send invitations';
    END IF;

    -- Validate role parameter
    IF p_role NOT IN ('manager', 'trainer') THEN
        RAISE EXCEPTION 'Invalid role. Must be manager or trainer';
    END IF;

    -- Check if email already has a pending invitation
    IF EXISTS (
        SELECT 1 FROM public.invitations 
        WHERE email = lower(p_email)
        AND gym_id = v_gym_id
        AND status = 'pending'
        AND expires_at > now()
    ) THEN
        RAISE EXCEPTION 'An invitation has already been sent to this email';
    END IF;

    -- Check if email is already a staff member
    IF EXISTS (
        SELECT 1 FROM auth.users u
        JOIN public.profiles p ON p.id = u.id
        WHERE u.email = lower(p_email)
        AND p.gym_id = v_gym_id
    ) THEN
        RAISE EXCEPTION 'This email is already a staff member';
    END IF;

    -- Generate token
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Create invitation
    INSERT INTO public.invitations (
        gym_id,
        email,
        role,
        token,
        created_by
    ) VALUES (
        v_gym_id,
        lower(p_email),
        p_role,
        v_token,
        auth.uid()
    )
    RETURNING id INTO v_invitation_id;

    -- Return success with invitation link
    RETURN jsonb_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'invitation_link', format('%s/accept-invitation?token=%s', 
            current_setting('app.base_url', true), 
            v_token
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_token text,
    p_name text,
    p_password text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation record;
BEGIN
    -- Find valid invitation
    SELECT * INTO v_invitation
    FROM public.invitations
    WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now();

    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- If this is just checking the invitation (empty name/password), return info
    IF p_name = '' AND p_password = '' THEN
        RETURN jsonb_build_object(
            'email', v_invitation.email,
            'role', v_invitation.role,
            'gym_id', v_invitation.gym_id
        );
    END IF;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;

    -- Return invitation data for account creation
    RETURN jsonb_build_object(
        'email', v_invitation.email,
        'role', v_invitation.role,
        'gym_id', v_invitation.gym_id,
        'success', true
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION '%', SQLERRM;
END;
$$;

-- Create trigger to handle profile creation when user signs up
CREATE OR REPLACE FUNCTION public.create_profile_from_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation record;
BEGIN
    -- Check if this email has an accepted invitation
    SELECT * INTO v_invitation
    FROM public.invitations
    WHERE email = NEW.email
    AND status = 'accepted';

    IF v_invitation IS NOT NULL THEN
        -- Create profile for the new user
        INSERT INTO public.profiles (
            id,
            gym_id,
            role,
            full_name
        ) VALUES (
            NEW.id,
            v_invitation.gym_id,
            v_invitation.role,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger to auto-create profiles for invited users
CREATE TRIGGER on_auth_user_created_from_invitation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_from_invitation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation TO anon, authenticated;

-- Create index for performance
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email_gym ON public.invitations(email, gym_id);
CREATE INDEX idx_invitations_status_expires ON public.invitations(status, expires_at);