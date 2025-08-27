/**
 * Employee Invitation Management API Endpoint
 * 
 * GET /api/employees/invite/[id] - Get specific invitation details
 * DELETE /api/employees/invite/[id] - Cancel invitation
 * 
 * Features:
 * - Organization-level data isolation
 * - Permission checks (owner/admin only)
 * - Secure invitation token validation
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, AuthError } from '@/errors';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/employees/invite/[id]
 * Get specific invitation details
 */
export const GET = withAuth(async (req: NextRequest, authData: AuthData, { params }: RouteParams) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const { id } = await params;

  try {
    logger.info('Employee invitation details request started', { 
      requestId,
      invitationId: id
    });

    // Initialize database if not already initialized
    let db;
    try {
      db = getDatabase();
    } catch (error) {
      const dbInstance = initializeDatabase({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      });
      await dbInstance.initialize();
      db = dbInstance;
    }

    // Get the user's UUID from their WorkOS ID
    const { data: userData, error: userError } = await db
      .getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      logger.warn('User not found in database', { 
        requestId, 
        workosUserId: authData.user.id,
        error: userError
      });
      return NextResponse.json(
        { error: 'User not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Get user's active organization
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      logger.warn('No active organization for invitation request', { 
        requestId, 
        userId: authData.user.id,
        error: userOrgError
      });
      return NextResponse.json(
        { error: 'No active organization. Please select an organization first.' },
        { status: 403 }
      );
    }

    const organizationId = userOrg.organization_id;

    // Get invitation details (must belong to user's organization)
    const { data: invitation, error: invitationError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (invitationError || !invitation) {
      logger.warn('Invitation not found or access denied', { 
        requestId,
        invitationId: id,
        organizationId,
        error: invitationError
      });
      return NextResponse.json(
        { error: 'Invitation not found or access denied.' },
        { status: 404 }
      );
    }

    // Remove sensitive token from response
    const { token, ...safeInvitation } = invitation;

    logger.info('Employee invitation details request completed successfully', {
      requestId,
      invitationId: id,
      userId: authData.user.id,
      organizationId,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: safeInvitation
    }, { status: 200 });

  } catch (error) {
    logger.error('Employee invitation details request failed', {
      requestId,
      invitationId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving invitation details' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/employees/invite/[id]
 * Cancel invitation (soft delete by updating expires_at)
 */
export const DELETE = withAuth(async (req: NextRequest, authData: AuthData, { params }: RouteParams) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const { id } = await params;

  try {
    logger.info('Employee invitation cancellation request started', { 
      requestId,
      invitationId: id
    });

    // Initialize database if not already initialized
    let db;
    try {
      db = getDatabase();
    } catch (error) {
      const dbInstance = initializeDatabase({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      });
      await dbInstance.initialize();
      db = dbInstance;
    }

    // Get the user's UUID from their WorkOS ID
    const { data: userData, error: userError } = await db
      .getSupabaseClient()
      .from('users')
      .select('id')
      .eq('workos_user_id', authData.user.id)
      .single();

    if (userError || !userData) {
      logger.warn('User not found in database', { 
        requestId, 
        workosUserId: authData.user.id,
        error: userError
      });
      return NextResponse.json(
        { error: 'User not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Get user's active organization and verify they're an owner/admin
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select('organization_id, role')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userOrgError || !userOrg) {
      logger.warn('No active organization for invitation cancellation', { 
        requestId, 
        userId: authData.user.id,
        error: userOrgError
      });
      return NextResponse.json(
        { error: 'No active organization. Please select an organization first.' },
        { status: 403 }
      );
    }

    // Check if user has permission to cancel invitations (owner or admin only)
    if (!['owner', 'admin'].includes(userOrg.role)) {
      logger.warn('Insufficient permissions for invitation cancellation', { 
        requestId, 
        userId: authData.user.id,
        role: userOrg.role
      });
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners and admins can cancel invitations.' },
        { status: 403 }
      );
    }

    const organizationId = userOrg.organization_id;

    // Get invitation details first (must belong to user's organization and not be accepted)
    const { data: invitation, error: invitationError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (invitationError || !invitation) {
      logger.warn('Invitation not found or access denied', { 
        requestId,
        invitationId: id,
        organizationId,
        error: invitationError
      });
      return NextResponse.json(
        { error: 'Invitation not found or access denied.' },
        { status: 404 }
      );
    }

    // Check if invitation is already accepted
    if (invitation.is_accepted) {
      return NextResponse.json(
        { error: 'Cannot cancel an invitation that has already been accepted.' },
        { status: 400 }
      );
    }

    // Check if invitation is already expired
    if (new Date(invitation.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'Invitation has already expired.' },
        { status: 400 }
      );
    }

    // Cancel invitation by setting expires_at to now (soft delete)
    const { error: cancelError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .update({ 
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (cancelError) {
      logger.error('Failed to cancel invitation', { 
        error: cancelError, 
        requestId,
        invitationId: id,
        organizationId
      });
      return NextResponse.json(
        { error: 'Failed to cancel invitation. Please try again.' },
        { status: 500 }
      );
    }

    logger.info('Employee invitation cancelled successfully', {
      requestId,
      invitationId: id,
      email: invitation.email,
      organizationId,
      cancelledBy: userData.id,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    }, { status: 200 });

  } catch (error) {
    logger.error('Employee invitation cancellation request failed', {
      requestId,
      invitationId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Internal server error occurred while cancelling invitation' },
      { status: 500 }
    );
  }
});

/**
 * POST method not allowed
 */
export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST /api/employees/invite to create invitations.' },
    { status: 405 }
  );
}

/**
 * PUT method not allowed
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405 }
  );
}