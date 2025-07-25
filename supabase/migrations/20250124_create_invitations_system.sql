-- Create invitations table for staff invite-only system
CREATE TABLE IF NOT EXISTS public.invitations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('owner', 'manager', 'trainer', 'member')),
    token uuid DEFAULT gen_random_uuid() NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_by uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    accepted_at timestamptz,
    accepted_by uuid REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_gym_id ON public.invitations(gym_id);
CREATE INDEX idx_invitations_status ON public.invitations(status);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations table
-- Only owners and managers can view invitations for their gym
CREATE POLICY "View invitations for own gym" ON public.invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = invitations.gym_id
            AND profiles.role IN ('owner', 'manager')
        )
    );

-- Only owners and managers can create invitations for their gym
CREATE POLICY "Create invitations for own gym" ON public.invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = invitations.gym_id
            AND profiles.role IN ('owner', 'manager')
        )
        AND created_by = auth.uid()
    );

-- Only owners and managers can update invitations for their gym
CREATE POLICY "Update invitations for own gym" ON public.invitations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.gym_id = invitations.gym_id
            AND profiles.role IN ('owner', 'manager')
        )
    );

-- Create function to automatically expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < now();
END;
$$;

-- Create a scheduled job to expire invitations (requires pg_cron extension)
-- This would be set up in Supabase dashboard or via SQL if pg_cron is available

-- Create RPC function: create_invitation
CREATE OR REPLACE FUNCTION public.create_invitation(
    p_email text,
    p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_user_gym_id uuid;
    v_user_role text;
    v_invitation_id uuid;
    v_token uuid;
BEGIN
    -- Get the current user's details
    v_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Get user's gym_id and role
    SELECT gym_id, role INTO v_user_gym_id, v_user_role
    FROM public.profiles
    WHERE id = v_user_id;
    
    -- Check if user has permission (owner or manager)
    IF v_user_role NOT IN ('owner', 'manager') THEN
        RAISE EXCEPTION 'Insufficient permissions. Only owners and managers can create invitations.';
    END IF;
    
    -- Validate role parameter
    IF p_role NOT IN ('manager', 'trainer', 'member') THEN
        RAISE EXCEPTION 'Invalid role. Must be manager, trainer, or member.';
    END IF;
    
    -- Check if there's already a pending invitation for this email in this gym
    IF EXISTS (
        SELECT 1 FROM public.invitations
        WHERE email = p_email
        AND gym_id = v_user_gym_id
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'An invitation for this email already exists.';
    END IF;
    
    -- Generate token
    v_token := gen_random_uuid();
    
    -- Create the invitation
    INSERT INTO public.invitations (
        gym_id, email, role, token, created_by
    ) VALUES (
        v_user_gym_id, p_email, p_role, v_token, v_user_id
    ) RETURNING id INTO v_invitation_id;
    
    -- Return the invitation details
    RETURN json_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'token', v_token,
        'invitation_url', 'https://app.back2back.com/accept-invitation?token=' || v_token
    );
END;
$$;

-- Create RPC function: accept_invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(
    p_token text,
    p_name text,
    p_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation record;
    v_user_id uuid;
    v_existing_user_id uuid;
BEGIN
    -- Find the invitation
    SELECT * INTO v_invitation
    FROM public.invitations
    WHERE token = p_token::uuid
    AND status = 'pending'
    FOR UPDATE;
    
    -- Check if invitation exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired invitation token.';
    END IF;
    
    -- Check if invitation is expired
    IF v_invitation.expires_at < now() THEN
        -- Update status to expired
        UPDATE public.invitations
        SET status = 'expired'
        WHERE id = v_invitation.id;
        
        RAISE EXCEPTION 'This invitation has expired.';
    END IF;
    
    -- Check if user already exists with this email
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = v_invitation.email;
    
    IF v_existing_user_id IS NOT NULL THEN
        RAISE EXCEPTION 'A user with this email already exists.';
    END IF;
    
    -- Create the user in auth.users
    -- Note: This requires using Supabase Admin API in production
    -- For now, we'll return the necessary data for the frontend to create the user
    
    -- Update invitation status
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invitation.id;
    
    -- Return success with invitation details
    RETURN json_build_object(
        'success', true,
        'email', v_invitation.email,
        'role', v_invitation.role,
        'gym_id', v_invitation.gym_id,
        'name', p_name
    );
END;
$$;

-- Grant execute permissions on RPCs
GRANT EXECUTE ON FUNCTION public.create_invitation(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text, text, text) TO authenticated;

-- Update the handle_new_user trigger to properly handle invited users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    default_gym_id uuid;
    user_role text;
    user_full_name text;
BEGIN
    -- Get metadata from the user
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'member');
    user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
    
    -- Try to get gym_id from metadata (for invited users)
    default_gym_id := (new.raw_user_meta_data->>'gym_id')::uuid;
    
    -- If no gym_id in metadata, get the default gym
    IF default_gym_id IS NULL THEN
        SELECT id INTO default_gym_id FROM public.gyms WHERE is_default = true LIMIT 1;
    END IF;
    
    -- If still no gym, create a default one
    IF default_gym_id IS NULL THEN
        INSERT INTO public.gyms (name, is_default) 
        VALUES ('Default Gym', true) 
        RETURNING id INTO default_gym_id;
    END IF;
    
    -- Create profile
    INSERT INTO public.profiles (id, gym_id, role, full_name)
    VALUES (new.id, default_gym_id, user_role, user_full_name);
    
    RETURN new;
END;
$$;