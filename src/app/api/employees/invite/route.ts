/**
 * Employee Invitation API Endpoint
 * 
 * POST /api/employees/invite - Create employee invitation
 * GET /api/employees/invite - List pending invitations
 * 
 * Features:
 * - Organization-level data isolation
 * - Secure invitation token generation
 * - Role and location assignment
 * - Expiration management (7 days default)
 * - Proper permission checks (owner/admin only)
 * - Security-first approach with RLS
 * 
 * @swagger
 * /api/employees/invite:
 *   post:
 *     tags:
 *       - Employee Invitations
 *     summary: Create employee invitation
 *     description: |
 *       Create a new employee invitation with pre-configured role and location access.
 *       Only organization owners and admins can invite employees.
 *       
 *       **Security**: Requires WorkOS authentication. Users can only create invitations
 *       for their own organizations due to Row-Level Security (RLS) policies.
 *       
 *       **Token Security**: Generates cryptographically secure UUID tokens that expire
 *       after 7 days. Tokens are single-use and become invalid after acceptance.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, role]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.doe@example.com
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Doe
 *               role:
 *                 type: string
 *                 enum: [trainer, coach, front_desk, manager, admin]
 *                 example: trainer
 *               location_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of location IDs this employee can access
 *                 example: ["123e4567-e89b-12d3-a456-426614174000"]
 *     responses:
 *       201:
 *         description: Invitation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       required: [invitation_id, token, expires_at, invitation_url]
 *                       properties:
 *                         invitation_id:
 *                           type: string
 *                           format: uuid
 *                         token:
 *                           type: string
 *                           format: uuid
 *                         expires_at:
 *                           type: string
 *                           format: date-time
 *                         invitation_url:
 *                           type: string
 *                           format: uri
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       409:
 *         description: Email already invited or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/500'
 *     security:
 *       - WorkOSSession: []
 *         CurrentUserId: []
 *   get:
 *     tags:
 *       - Employee Invitations
 *     summary: List pending invitations
 *     description: |
 *       Retrieve all pending employee invitations for the authenticated user's organization.
 *       Shows invitations that haven't been accepted yet and haven't expired.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         description: Filter invitations by status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, accepted, expired]
 *           default: pending
 *     responses:
 *       200:
 *         description: Successfully retrieved invitations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       required: [invitations, pagination]
 *                       properties:
 *                         invitations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/EmployeeInvitation'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, AuthError, ValidationError } from '@/errors';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schemas
const CreateInvitationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  role: z.enum(['trainer', 'coach', 'front_desk', 'manager', 'admin']).refine(
    (val) => ['trainer', 'coach', 'front_desk', 'manager', 'admin'].includes(val),
    { message: 'Invalid role. Must be one of: trainer, coach, front_desk, manager, admin' }
  ),
  location_ids: z.array(z.string().uuid('Invalid location ID')).optional().default([])
});

const InvitationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'accepted', 'expired']).default('pending')
});

type CreateInvitationRequest = z.infer<typeof CreateInvitationSchema>;
type InvitationQuery = z.infer<typeof InvitationQuerySchema>;

/**
 * POST /api/employees/invite
 * Create a new employee invitation
 */
export const POST = withAuth(async (req: NextRequest, authData: AuthData) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Employee invitation request started', { 
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
    const validatedData = CreateInvitationSchema.parse(body);

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

    // Check if user has permission to invite employees (owner or admin only)
    if (!['owner', 'admin'].includes(userOrg.role)) {
      logger.warn('Insufficient permissions for employee invitation', { 
        requestId, 
        userId: authData.user.id,
        role: userOrg.role
      });
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners and admins can invite employees.' },
        { status: 403 }
      );
    }

    const organizationId = userOrg.organization_id;

    // Check if email is already registered as a user
    const { data: existingUser } = await db
      .getSupabaseClient()
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists. Please use a different email address.' },
        { status: 409 }
      );
    }

    // Check if email already has a pending invitation
    const { data: existingInvitation } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('id')
      .eq('email', validatedData.email)
      .eq('organization_id', organizationId)
      .eq('is_accepted', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email address.' },
        { status: 409 }
      );
    }

    // Validate location IDs belong to the organization
    if (validatedData.location_ids.length > 0) {
      const { data: validLocations, error: locationError } = await db
        .getSupabaseClient()
        .from('locations')
        .select('id')
        .eq('organization_id', organizationId)
        .in('id', validatedData.location_ids)
        .eq('is_active', true);

      if (locationError || !validLocations || validLocations.length !== validatedData.location_ids.length) {
        return NextResponse.json(
          { error: 'One or more location IDs are invalid or do not belong to your organization.' },
          { status: 400 }
        );
      }
    }

    // Generate secure invitation token and expiration
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    const { data: invitation, error: invitationError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .insert({
        token: invitationToken,
        email: validatedData.email,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: validatedData.role,
        organization_id: organizationId,
        location_ids: validatedData.location_ids,
        invited_by_user_id: userData.id,
        expires_at: expiresAt.toISOString(),
        is_accepted: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (invitationError || !invitation) {
      logger.error('Failed to create invitation', { 
        error: invitationError, 
        requestId,
        organizationId,
        email: validatedData.email
      });
      return NextResponse.json(
        { error: 'Failed to create invitation. Please try again.' },
        { status: 500 }
      );
    }

    // Generate invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;
    const invitationUrl = `${baseUrl}/invite/${invitationToken}`;

    logger.info('Employee invitation created successfully', {
      requestId,
      invitationId: invitation.id,
      email: validatedData.email,
      role: validatedData.role,
      organizationId,
      invitedBy: userData.id,
      expiresAt: expiresAt.toISOString(),
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: {
        invitation_id: invitation.id,
        token: invitationToken,
        expires_at: expiresAt.toISOString(),
        invitation_url: invitationUrl
      }
    }, { status: 201 });

  } catch (error) {
    logger.error('Employee invitation request failed', {
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
      const statusCode = error instanceof AuthError ? 401 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while creating invitation' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/employees/invite
 * List pending employee invitations
 */
export const GET = withAuth(async (req: NextRequest, authData: AuthData) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Employee invitations list request started', { 
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

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedQuery = InvitationQuerySchema.parse(queryParams);

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
      logger.warn('No active organization for invitations list request', { 
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

    // Build query based on status filter
    let invitationQuery = db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply status filter
    const now = new Date().toISOString();
    switch (validatedQuery.status) {
      case 'pending':
        invitationQuery = invitationQuery
          .eq('is_accepted', false)
          .gte('expires_at', now);
        break;
      case 'accepted':
        invitationQuery = invitationQuery
          .eq('is_accepted', true);
        break;
      case 'expired':
        invitationQuery = invitationQuery
          .eq('is_accepted', false)
          .lt('expires_at', now);
        break;
    }

    // Apply pagination and ordering
    const offset = (validatedQuery.page - 1) * validatedQuery.limit;
    invitationQuery = invitationQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + validatedQuery.limit - 1);

    const { data: invitations, count, error: invitationsError } = await invitationQuery;

    if (invitationsError) {
      logger.error('Failed to retrieve invitations', { 
        error: invitationsError, 
        requestId,
        organizationId
      });
      return NextResponse.json(
        { error: 'Failed to retrieve invitations' },
        { status: 500 }
      );
    }

    logger.info('Employee invitations list request completed successfully', {
      requestId,
      userId: authData.user.id,
      organizationId,
      resultCount: invitations?.length || 0,
      total: count || 0,
      status: validatedQuery.status,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: {
        invitations: invitations || [],
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / validatedQuery.limit)
        }
      }
    }, { status: 200 });

  } catch (error) {
    logger.error('Employee invitations list request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.issues
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      const statusCode = error instanceof AuthError ? 401 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving invitations' },
      { status: 500 }
    );
  }
});

/**
 * PUT method not allowed
 */
export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create invitations or GET to list them.' },
    { status: 405 }
  );
}

/**
 * DELETE method not allowed (use DELETE /api/employees/invite/[id] instead)
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE /api/employees/invite/[id] to cancel specific invitations.' },
    { status: 405 }
  );
}