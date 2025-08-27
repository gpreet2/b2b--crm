/**
 * Employee Invitation Token Validation API Endpoint
 * 
 * GET /api/employees/invite/token/[token] - Get invitation details by token
 * 
 * Features:
 * - Public endpoint for invitation validation
 * - No authentication required (token acts as authentication)
 * - Returns invitation details for display on acceptance page
 * - Handles expired/invalid tokens gracefully
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * GET /api/employees/invite/token/[token]
 * Get invitation details by token (public endpoint)
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';
  const { token } = await params;

  try {
    logger.info('Invitation token validation request started', { 
      requestId,
      token: token.substring(0, 8) + '...' // Log partial token for debugging
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

    // Get invitation details by token
    const { data: invitation, error: invitationError } = await db
      .getSupabaseClient()
      .from('invitation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (invitationError || !invitation) {
      logger.warn('Invitation token not found', { 
        requestId,
        token: token.substring(0, 8) + '...',
        error: invitationError
      });
      return NextResponse.json(
        { error: 'Invalid invitation token.' },
        { status: 404 }
      );
    }

    logger.info('Invitation token validation completed successfully', {
      requestId,
      invitationId: invitation.id,
      email: invitation.email,
      isAccepted: invitation.is_accepted,
      isExpired: new Date(invitation.expires_at) <= new Date(),
      duration: Date.now() - startTime
    });

    // Don't return the token in the response for security
    const { token: _, ...safeInvitation } = invitation;

    return NextResponse.json({
      success: true,
      data: safeInvitation
    }, { status: 200 });

  } catch (error) {
    logger.error('Invitation token validation request failed', {
      requestId,
      token: token.substring(0, 8) + '...',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { error: 'Internal server error occurred while validating invitation token' },
      { status: 500 }
    );
  }
}

/**
 * POST method not allowed
 */
export function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to validate invitation tokens.' },
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

/**
 * DELETE method not allowed
 */
export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed.' },
    { status: 405 }
  );
}