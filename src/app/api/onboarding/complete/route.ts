import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingSessionManager } from '@/lib/onboarding-session';
import { validateCSRFToken } from '@/lib/onboarding-encryption';
import { getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schema for completing onboarding
const CompleteOnboardingSchema = z.object({
  sessionId: z.string().min(1),
  sessionToken: z.string().length(64),
  csrfToken: z.string().min(1),
});

/**
 * POST /api/onboarding/complete
 * Complete onboarding and redirect to WorkOS authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CompleteOnboardingSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Invalid onboarding completion request', { 
        errors: validation.error.issues 
      });
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken, csrfToken } = validation.data;

    // Validate CSRF token
    const csrfParts = csrfToken.split(':');
    if (csrfParts.length !== 2) {
      logger.warn('Invalid CSRF token format in onboarding completion', { sessionId });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const [token, timestampStr] = csrfParts;
    const timestamp = parseInt(timestampStr, 10);
    const csrfValid = validateCSRFToken(token, timestamp);
    if (!csrfValid) {
      logger.warn('Invalid CSRF token in onboarding completion', { sessionId });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const sessionManager = getOnboardingSessionManager();

    // Get session data to validate completeness
    const session = await sessionManager.getSession(sessionId, sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Validate that required data is present for completion
    if (!session.state.organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required for completion' },
        { status: 422 }
      );
    }

    if (!session.state.locations || session.state.locations.length === 0) {
      return NextResponse.json(
        { error: 'At least one location is required for completion' },
        { status: 422 }
      );
    }

    // Check if locations have required data
    const invalidLocations = session.state.locations.filter(
      loc => !loc.name || !loc.address
    );
    if (invalidLocations.length > 0) {
      return NextResponse.json(
        { error: 'All locations must have name and address' },
        { status: 422 }
      );
    }

    // Mark session as completed (step 4)
    const updateSuccess = await sessionManager.updateSession(sessionId, sessionToken, {
      currentStep: 4,
      state: {
        ...session.state,
        metadata: {
          ...session.state.metadata,
          completedSteps: [1, 2, 3, 4],
          lastActiveStep: 4,
        },
      },
    });

    if (!updateSuccess) {
      return NextResponse.json(
        { error: 'Failed to mark session as completed' },
        { status: 500 }
      );
    }

    // Generate WorkOS signup URL with session information for callback processing
    const _state = {
      prompt: 'create',
      returnTo: '/dashboard',
      forceNewAccount: true,
      timestamp: Date.now(),
      onboardingSessionId: sessionId,
      onboardingSessionToken: sessionToken,
    };

    // Use explicit redirect URI to avoid double-encoding issues
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    
    // Debug logging for redirect URI
    logger.info('=== Onboarding Complete Redirect URI Debug ===', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      constructedRedirectUri: redirectUri,
      sessionId,
    });
    
    const signUpUrl = await getSignUpUrl({ redirectUri });

    logger.info('Full WorkOS sign-up URL generated', {
      signUpUrl: signUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'),
      redirectUriInUrl: signUpUrl.includes(encodeURIComponent(redirectUri)),
      sessionId,
    });

    logger.info('Onboarding completed, redirecting to WorkOS', {
      sessionId,
      organizationName: session.state.organizationName,
      locationCount: session.state.locations.length,
      url: signUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'), // Mask tokens in logs
    });

    return NextResponse.json({
      success: true,
      url: signUpUrl,
      message: 'Onboarding completed successfully, redirecting to WorkOS',
      session: {
        id: session.id,
        organizationName: session.state.organizationName,
        locationCount: session.state.locations.length,
      },
    });

  } catch (error) {
    logger.error('Failed to complete onboarding', { error });
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}