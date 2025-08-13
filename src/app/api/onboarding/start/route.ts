import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingSessionManager } from '@/lib/onboarding-session';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schema for starting onboarding
const StartOnboardingSchema = z.object({
  userAgent: z.string().optional(),
  returnTo: z.string().optional(),
});

/**
 * POST /api/onboarding/start
 * Start a new onboarding session
 */
export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_jsonError) {
      // Empty body is fine for starting onboarding
    }

    const validation = StartOnboardingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get client information
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || validation.data.userAgent || 'unknown';

    const sessionManager = getOnboardingSessionManager();
    
    // Create new onboarding session
    const session = await sessionManager.createSession({
      userAgent,
      ipAddress: clientIp !== 'unknown' ? clientIp : undefined,
    });

    logger.info('New onboarding session started', {
      sessionId: session.sessionId,
      clientIp,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      sessionToken: session.sessionToken,
      csrfToken: session.csrfToken,
      message: 'Onboarding session started successfully',
    });

  } catch (error) {
    logger.error('Failed to start onboarding session', { error });
    return NextResponse.json(
      { error: 'Failed to start onboarding session' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/start
 * Alternative method for starting onboarding (redirect-based)
 */
export async function GET(request: NextRequest) {
  try {
    const sessionManager = getOnboardingSessionManager();
    
    // Get client information
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create new onboarding session
    const session = await sessionManager.createSession({
      userAgent,
      ipAddress: clientIp !== 'unknown' ? clientIp : undefined,
    });

    // Redirect to onboarding page with session parameters
    const onboardingUrl = new URL('/onboarding', request.url);
    onboardingUrl.searchParams.set('session', session.sessionId);
    onboardingUrl.searchParams.set('token', session.sessionToken);
    onboardingUrl.searchParams.set('csrf', session.csrfToken);

    logger.info('Onboarding session created via redirect', {
      sessionId: session.sessionId,
      clientIp,
      userAgent,
    });

    return NextResponse.redirect(onboardingUrl);

  } catch (error) {
    logger.error('Failed to start onboarding session via redirect', { error });
    
    const errorUrl = new URL('/onboarding?error=session_failed', request.url);
    return NextResponse.redirect(errorUrl);
  }
}