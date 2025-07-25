import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CONFIG } from '@/lib/workos-client';
import { createSession, setSessionCookie } from '@/lib/session';
import { createClient } from '@/utils/supabase/server';
import { WorkOSProfile } from '@/lib/auth-types';
import { createOrganizationMembership } from '@/lib/workos-organizations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  // Handle errors from WorkOS
  if (error) {
    console.error('WorkOS auth error:', error);
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(error)}`, request.url)
    );
  }
  
  if (!code) {
    return NextResponse.redirect(
      new URL('/signin?error=missing_code', request.url)
    );
  }
  
  try {
    let profile: WorkOSProfile;
    let authMethod: string;
    
    // Try SSO first
    try {
      const ssoResult = await workos.sso.getProfileAndToken({
        code,
        clientId: WORKOS_CONFIG.clientId,
      });
      profile = ssoResult.profile;
      authMethod = 'sso';
    } catch (ssoError) {
      // If SSO fails, try Magic Link
      try {
        const user = await workos.userManagement.authenticateWithCode({
          code,
          clientId: WORKOS_CONFIG.clientId,
        });
        
        // Convert user management user to profile format
        profile = {
          id: user.user.id,
          email: user.user.email,
          first_name: user.user.firstName || null,
          last_name: user.user.lastName || null,
          idp_id: user.user.id,
          connection_id: 'magic_link',
          connection_type: 'magic_link',
          organization_id: user.organizationId || undefined,
          raw_attributes: {},
        };
        authMethod = 'magic_link';
      } catch (magicLinkError) {
        console.error('Both SSO and Magic Link authentication failed');
        throw new Error('Authentication failed');
      }
    }
    
    // Create or update user in database
    const user = await upsertUserFromWorkOS(profile, authMethod);
    
    // Get IP and user agent for session
    const ip = request.headers.get('x-forwarded-for') || request.ip || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Create session
    const sessionToken = await createSession(user.id, ip, userAgent);
    
    // Set session cookie
    await setSessionCookie(sessionToken);
    
    // Redirect to dashboard or intended destination
    const redirectTo = state ? decodeURIComponent(state) : '/';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/signin?error=auth_failed', request.url)
    );
  }
}

async function upsertUserFromWorkOS(profile: WorkOSProfile, authMethod: string) {
  const supabase = await createClient();
  
  // Construct full name from first and last name
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ') || profile.email.split('@')[0];
  
  // Check for pending invitation
  let invitationData = null;
  if (profile.email) {
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', profile.email)
      .eq('status', 'pending')
      .eq('workos_organization_id', profile.organization_id)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    invitationData = invitation;
  }
  
  // Call the database function to upsert user
  const { data, error } = await supabase.rpc('upsert_user_from_workos', {
    p_workos_user_id: profile.id,
    p_email: profile.email,
    p_full_name: fullName,
    p_workos_org_id: profile.organization_id || null,
    p_auth_provider: authMethod,
  });
  
  if (error) {
    console.error('Error upserting user:', error);
    throw new Error('Failed to create or update user');
  }
  
  // If there's a pending invitation, update the user's role and gym
  if (invitationData && data) {
    // Update user profile with invitation details
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: invitationData.role,
        gym_id: invitationData.gym_id,
      })
      .eq('id', data.id);
    
    if (!updateError) {
      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: data.id,
        })
        .eq('id', invitationData.id);
      
      // Create organization membership in WorkOS if user has WorkOS ID
      if (profile.id && profile.organization_id) {
        try {
          await createOrganizationMembership({
            organizationId: profile.organization_id,
            userId: profile.id,
            roleSlug: invitationData.role,
          });
        } catch (membershipError) {
          console.error('Error creating organization membership:', membershipError);
          // Non-critical error, continue
        }
      }
    }
  }
  
  return data;
}