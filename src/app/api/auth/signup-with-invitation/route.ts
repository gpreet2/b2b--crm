/**
 * Employee Invitation Acceptance API Endpoint
 * 
 * POST /api/auth/signup-with-invitation - Accept invitation and create user account
 * 
 * Features:
 * - Secure invitation token validation
 * - User account creation with pre-configured role/permissions
 * - Organization and location assignment
 * - Integration with WorkOS authentication
 * - Single-use invitation tokens
 * - Proper audit logging
 * 
 * @swagger
 * /api/auth/signup-with-invitation:
 *   post:
 *     tags:
 *       - Authentication
 *       - Employee Invitations
 *     summary: Accept employee invitation and create account
 *     description: |
 *       Accept an employee invitation using the provided token and create a new user account
 *       with pre-configured role, permissions, and location access.
 *       
 *       **Security**: Validates invitation token, checks expiration, and ensures single-use.
 *       Creates user account with WorkOS integration and assigns to the specified organization.
 *       
 *       **Flow**: This endpoint is typically called after the user fills out the signup form
 *       on the invitation acceptance page (/invite/[token]).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, workos_user_id]
 *             properties:
 *               token:
 *                 type: string
 *                 format: uuid
 *                 description: The invitation token from the email link
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               workos_user_id:
 *                 type: string
 *                 description: The WorkOS user ID after successful authentication
 *                 example: "user_01HQZX3V4W8K9N2M5L7P6Q8R9S"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User's chosen password (if required by WorkOS setup)
 *                 example: "SecurePassword123!"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       required: [user_id, organization_id, role]
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           format: uuid
 *                         organization_id:
 *                           type: string
 *                           format: uuid
 *                         role:
 *                           type: string
 *                         location_ids:
 *                           type: array
 *                           items:
 *                             type: string
 *                             format: uuid
 *                         permissions:
 *                           type: object
 *       400:
 *         description: Invalid token or request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invitation token not found
 *       409:
 *         description: Invitation already accepted or user already exists
 *       410:
 *         description: Invitation token has expired
 *       500:
 *         $ref: '#/components/responses/500'
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, ValidationError } from '@/errors';
import { z } from 'zod';

// Validation schema
const AcceptInvitationSchema = z.object({
  token: z.string().uuid('Invalid invitation token format'),
  workos_user_id: z.string().min(1, 'WorkOS user ID is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional()
});

type AcceptInvitationRequest = z.infer<typeof AcceptInvitationSchema>;

/**
 * POST /api/auth/signup-with-invitation
 * Accept invitation and create user account
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Invitation acceptance request started', { 
      requestId,
      url: req.url 
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

    // Parse and validate request body
    const body = await req.json();
    const validatedData = AcceptInvitationSchema.parse(body);

    // Get invitation details and validate
    const { data: invitation, error: invitationError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('*')
      .eq('token', validatedData.token)
      .single();

    if (invitationError || !invitation) {
      logger.warn('Invitation token not found', { 
        requestId,
        token: validatedData.token,
        error: invitationError
      });
      return NextResponse.json(
        { error: 'Invalid invitation token.' },
        { status: 404 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.is_accepted) {
      logger.warn('Invitation already accepted', { 
        requestId,
        invitationId: invitation.id,
        token: validatedData.token
      });
      return NextResponse.json(
        { error: 'This invitation has already been accepted.' },
        { status: 409 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) <= new Date()) {
      logger.warn('Invitation token expired', { 
        requestId,
        invitationId: invitation.id,
        expiresAt: invitation.expires_at
      });
      return NextResponse.json(
        { error: 'This invitation has expired. Please request a new invitation.' },
        { status: 410 }
      );
    }

    // Check if a user with this email already exists
    const { data: existingUser } = await db
      .getSupabaseClient()
      .from('users')
      .select('id, email')
      .eq('email', invitation.email)
      .single();

    if (existingUser) {
      logger.warn('User with invitation email already exists', { 
        requestId,
        email: invitation.email,
        existingUserId: existingUser.id
      });
      return NextResponse.json(
        { error: 'A user with this email already exists. Please contact support.' },
        { status: 409 }
      );
    }

    // Check if WorkOS user ID is already in use
    const { data: workosUser } = await db
      .getSupabaseClient()
      .from('users')
      .select('id, workos_user_id')
      .eq('workos_user_id', validatedData.workos_user_id)
      .single();

    if (workosUser) {
      logger.warn('WorkOS user ID already exists', { 
        requestId,
        workosUserId: validatedData.workos_user_id,
        existingUserId: workosUser.id
      });
      return NextResponse.json(
        { error: 'This WorkOS user is already registered. Please contact support.' },
        { status: 409 }
      );
    }

    // Create user account
    const { data: newUser, error: userError } = await db
      .getSupabaseClient()
      .from('users')
      .insert({
        email: invitation.email,
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        workos_user_id: validatedData.workos_user_id,
        user_type: 'employee', // Set user type for employees
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError || !newUser) {
      logger.error('Failed to create user account', { 
        error: userError, 
        requestId,
        email: invitation.email,
        workosUserId: validatedData.workos_user_id
      });
      return NextResponse.json(
        { error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    // Define role-based permissions
    const rolePermissions = {
      trainer: {
        manage_classes: true,
        view_clients: true,
        manage_workouts: true,
        view_reports: false,
        manage_users: false,
        manage_settings: false,
        manage_billing: false
      },
      coach: {
        manage_classes: true,
        view_clients: true,
        manage_workouts: true,
        view_reports: true,
        manage_users: false,
        manage_settings: false,
        manage_billing: false
      },
      front_desk: {
        manage_classes: false,
        view_clients: true,
        manage_workouts: false,
        view_reports: false,
        manage_users: false,
        manage_settings: false,
        manage_billing: false,
        manage_bookings: true
      },
      manager: {
        manage_classes: true,
        view_clients: true,
        manage_workouts: true,
        view_reports: true,
        manage_users: true,
        manage_settings: true,
        manage_billing: false
      },
      admin: {
        manage_classes: true,
        view_clients: true,
        manage_workouts: true,
        view_reports: true,
        manage_users: true,
        manage_settings: true,
        manage_billing: true
      }
    };

    // Create user-organization relationship
    const permissions = rolePermissions[invitation.role as keyof typeof rolePermissions] || rolePermissions.trainer;
    
    const { error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .insert({
        user_id: newUser.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        is_active: true,
        is_primary: true,
        joined_at: new Date().toISOString(),
        permissions
      });

    if (userOrgError) {
      logger.error('Failed to create user-organization relationship', { 
        error: userOrgError, 
        requestId,
        userId: newUser.id,
        organizationId: invitation.organization_id
      });
      // Don't fail completely - user was created
    }

    // Create user-location relationships for assigned locations
    if (invitation.location_ids && invitation.location_ids.length > 0) {
      const locationAssignments = invitation.location_ids.map((locationId: string) => ({
        user_id: newUser.id,
        location_id: locationId,
        is_active: true,
        assigned_at: new Date().toISOString()
      }));

      const { error: locationError } = await db
        .getSupabaseClient()
        .from('user_locations')
        .insert(locationAssignments);

      if (locationError) {
        logger.error('Failed to create user-location relationships', { 
          error: locationError, 
          requestId,
          userId: newUser.id,
          locationIds: invitation.location_ids
        });
        // Don't fail completely - user and organization relationship were created
      }
    }

    // Mark invitation as accepted
    const { error: acceptError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .update({ 
        is_accepted: true,
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (acceptError) {
      logger.error('Failed to mark invitation as accepted', { 
        error: acceptError, 
        requestId,
        invitationId: invitation.id
      });
      // Don't fail - user account was created successfully
    }

    logger.info('Invitation accepted and user account created successfully', {
      requestId,
      invitationId: invitation.id,
      userId: newUser.id,
      email: invitation.email,
      role: invitation.role,
      organizationId: invitation.organization_id,
      locationIds: invitation.location_ids,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: {
        user_id: newUser.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        location_ids: invitation.location_ids || [],
        permissions
      }
    }, { status: 201 });

  } catch (error) {
    logger.error('Invitation acceptance request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while accepting invitation' },
      { status: 500 }
    );
  }
}

/**
 * GET method not allowed
 */
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to accept invitations.' },
    { status: 405 }
  );
}

/**
 * PUT method not allowed
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to accept invitations.' },
    { status: 405 }
  );
}

/**
 * DELETE method not allowed
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to accept invitations.' },
    { status: 405 }
  );
}