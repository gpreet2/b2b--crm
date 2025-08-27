/**
 * Onboarding Start API Endpoint
 * 
 * POST /api/onboarding/start
 * 
 * Starts a new onboarding session for a user without an organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthData } from '@/lib/auth-server';
import { OnboardingService } from '@/lib/services/onboarding';
import { initializeDatabase, getDatabase } from '@/config/database';
import { logger } from '@/utils/logger';
import { AppError, AuthError, ValidationError } from '@/errors';
import type { OnboardingStartRequest, OnboardingStartResponse } from '@/types/generated/onboarding.types';

export const POST = withAuth(async (req: NextRequest, authData: AuthData) => {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') || 'unknown';

  try {
    logger.info('Onboarding start request', { 
      requestId,
      userId: authData.user.id 
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
      logger.warn('User not found in database for onboarding', { 
        requestId, 
        workosUserId: authData.user.id,
        error: userError
      });
      return NextResponse.json(
        { error: 'User not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Check if user already has an organization
    const { data: userOrg, error: userOrgError } = await db
      .getSupabaseClient()
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .limit(1);

    if (userOrg && userOrg.length > 0) {
      logger.info('User already has organization, redirecting to dashboard', {
        requestId,
        userId: authData.user.id,
        organizationId: userOrg[0].organization_id
      });
      return NextResponse.json(
        { error: 'User already has an organization. Redirecting to dashboard.' },
        { status: 400 }
      );
    }

    // Parse request body
    let body: OnboardingStartRequest = {};
    try {
      body = await req.json();
    } catch (error) {
      // Empty body is fine
    }

    const userAgent = req.headers.get('user-agent') || body.userAgent;
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     body.ipAddress;

    // Start onboarding session
    const onboardingService = new OnboardingService();
    const { sessionToken, csrfToken, expiresAt } = await onboardingService.startSession(
      userData.id,
      userAgent,
      ipAddress
    );

    logger.info('Onboarding session started successfully', {
      requestId,
      userId: authData.user.id,
      sessionToken: sessionToken.substring(0, 8) + '...', // Log partial token for debugging
      duration: Date.now() - startTime
    });

    const response: OnboardingStartResponse = {
      success: true,
      sessionToken,
      currentStep: 'welcome',
      expiresAt,
      csrfToken
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    logger.error('Onboarding start request failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime
    });

    if (error instanceof AppError) {
      const statusCode = error instanceof AuthError ? 401 : 400;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error occurred while starting onboarding' },
      { status: 500 }
    );
  }
});

// Other methods not allowed
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to start onboarding.' },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to start onboarding.' },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to start onboarding.' },
    { status: 405 }
  );
}