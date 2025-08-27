import { NextRequest, NextResponse } from 'next/server';
import { OnboardingService } from '@/lib/services/onboarding';
import { WorkOS } from '@workos-inc/node';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Initialize WorkOS
const workos = new WorkOS(process.env.WORKOS_API_KEY!);

// Validation schema for completing onboarding
const CompleteOnboardingSchema = z.object({
  sessionToken: z.string().min(1),
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

    const { sessionToken, csrfToken } = validation.data;

    const onboardingService = new OnboardingService();

    // Get session data to validate completeness
    const session = await onboardingService.getSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Validate CSRF token
    if (!session.csrfToken || session.csrfToken !== csrfToken) {
      logger.warn('Invalid CSRF token in onboarding completion', { sessionToken: sessionToken.substring(0, 8) + '...' });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Validate that required data is present for completion
    const orgData = session.stepData.organization;
    const locationData = session.stepData.location;

    if (!orgData || !orgData.name) {
      return NextResponse.json(
        { error: 'Organization name is required for completion' },
        { status: 422 }
      );
    }

    if (!locationData || !locationData.name || !locationData.address) {
      return NextResponse.json(
        { error: 'Location information is required for completion' },
        { status: 422 }
      );
    }

    // Complete onboarding and create organization/location
    const organizationId = await onboardingService.completeOnboarding(sessionToken, csrfToken);

    // Generate WorkOS signup URL with organization information for callback processing
    const state = {
      returnTo: '/dashboard',
      timestamp: Date.now(),
      organizationId: organizationId,
    };

    // Get the base URL for redirect URI (dynamic port support)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    const signUpUrl = workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: process.env.WORKOS_CLIENT_ID!,
      redirectUri: redirectUri,
      screenHint: 'sign-up',
      state: JSON.stringify(state),
    });

    logger.info('Onboarding completed, redirecting to WorkOS', {
      sessionToken: sessionToken.substring(0, 8) + '...',
      organizationId: organizationId,
      organizationName: orgData.name,
      url: signUpUrl.replace(/&[^=]*token[^=]*=[^&]*/gi, '&token=***'), // Mask tokens in logs
    });

    return NextResponse.json({
      success: true,
      url: signUpUrl,
      message: 'Onboarding completed successfully, redirecting to WorkOS',
      session: {
        id: session.id,
        organizationId: organizationId,
        organizationName: orgData.name,
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