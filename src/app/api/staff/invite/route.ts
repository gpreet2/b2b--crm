import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/lib/session';
import { createStaffInvitation, isEmailInvited } from '@/lib/workos-invitations';
import { PERMISSIONS, roleHasPermission } from '@/lib/permissions';
import { workos } from '@/lib/workos-client';
import { withRateLimit, strictApiRateLimiter } from '@/lib/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Get authenticated user
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check permission
    if (!roleHasPermission(user.role, PERMISSIONS.INVITE_STAFF)) {
      return NextResponse.json(
        { error: 'You do not have permission to invite staff' },
        { status: 403 }
      );
    }
    
    const { email, role } = await request.json();
    
    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['manager', 'trainer'];
    if (user.role === 'owner') {
      validRoles.push('owner'); // Only owners can invite other owners
    }
    
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }
    
    // Check if already invited via WorkOS
    if (user.workos_organization_id) {
      const alreadyInvited = await isEmailInvited(email, user.workos_organization_id);
      if (alreadyInvited) {
        return NextResponse.json(
          { error: 'An invitation has already been sent to this email' },
          { status: 400 }
        );
      }
    }
    
    if (!user.gym_id || !user.workos_organization_id) {
      return NextResponse.json(
        { error: 'User must be associated with a gym and organization' },
        { status: 400 }
      );
    }
    
    try {
      // Create WorkOS invitation
      const { invitation, invitationRecord } = await createStaffInvitation({
        email,
        organizationId: user.workos_organization_id,
        role,
        inviterUserId: user.workos_user_id || undefined,
        gymId: user.gym_id,
      });
      
      // Store invitation in database
      const { data: dbInvitation, error: dbError } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          gym_id: user.gym_id,
          workos_organization_id: user.workos_organization_id,
          workos_invitation_id: invitation.id,
          inviter_user_id: user.id,
          token: crypto.randomUUID(), // Still generate for backward compatibility
          expires_at: invitation.expiresAt,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();
      
      if (dbError) {
        // Try to revoke WorkOS invitation if database insert fails
        try {
          await workos.userManagement.revokeInvitation(invitation.id);
        } catch (revokeError) {
          console.error('Failed to revoke invitation after DB error:', revokeError);
        }
        throw dbError;
      }
      
      return NextResponse.json({
        success: true,
        invitation: {
          id: dbInvitation.id,
          email: dbInvitation.email,
          role: dbInvitation.role,
          expires_at: dbInvitation.expires_at,
          workos_invitation_id: invitation.id,
        },
        message: `Invitation sent to ${email}`,
      });
      
    } catch (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Invite staff error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}, strictApiRateLimiter);

// List invitations
export const GET = withRateLimit(async (request: NextRequest) => {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check permission
    if (!roleHasPermission(user.role, PERMISSIONS.VIEW_STAFF)) {
      return NextResponse.json(
        { error: 'You do not have permission to view invitations' },
        { status: 403 }
      );
    }
    
    const supabase = await createClient();
    
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        inviter:inviter_user_id (
          id,
          full_name,
          email
        )
      `)
      .eq('gym_id', user.gym_id)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      invitations,
    });
    
  } catch (error) {
    console.error('List invitations error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
});

// Revoke invitation
export const DELETE = withRateLimit(async (request: NextRequest) => {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check permission
    if (!roleHasPermission(user.role, PERMISSIONS.INVITE_STAFF)) {
      return NextResponse.json(
        { error: 'You do not have permission to revoke invitations' },
        { status: 403 }
      );
    }
    
    const { invitationId } = await request.json();
    
    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get invitation details
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('gym_id', user.gym_id)
      .single();
    
    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Revoke WorkOS invitation if it exists
    if (invitation.workos_invitation_id) {
      try {
        await workos.userManagement.revokeInvitation(invitation.workos_invitation_id);
      } catch (revokeError) {
        console.error('Error revoking WorkOS invitation:', revokeError);
      }
    }
    
    // Update invitation status in database
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId);
    
    if (updateError) {
      throw updateError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
    });
    
  } catch (error) {
    console.error('Revoke invitation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}, strictApiRateLimiter);