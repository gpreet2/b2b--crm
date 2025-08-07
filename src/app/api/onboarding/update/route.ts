import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingSessionManager } from '@/lib/onboarding-session';
import { OnboardingStateSchema } from '@/lib/onboarding-validation';
import { validateCSRFToken } from '@/lib/onboarding-encryption';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schema for session updates
const UpdateSessionSchema = z.object({
  sessionId: z.string().min(1),
  sessionToken: z.string().length(64),
  csrfToken: z.string().min(1),
  currentStep: z.number().int().min(1).max(4).optional(),
  state: OnboardingStateSchema.optional(),
});

/**
 * PUT /api/onboarding/update
 * Update onboarding session state and progress
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateSessionSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Invalid session update request', { 
        errors: validation.error.issues 
      });
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken, csrfToken, currentStep, state } = validation.data;

    // Validate CSRF token
    const csrfParts = csrfToken.split(':');
    if (csrfParts.length !== 2) {
      logger.warn('Invalid CSRF token format in session update', { sessionId });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const [token, timestampStr] = csrfParts;
    const timestamp = parseInt(timestampStr, 10);
    const csrfValid = validateCSRFToken(token, timestamp);
    if (!csrfValid) {
      logger.warn('Invalid CSRF token in session update', { sessionId });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const sessionManager = getOnboardingSessionManager();

    // Update session
    const success = await sessionManager.updateSession(sessionId, sessionToken, {
      ...(currentStep && { currentStep }),
      ...(state && { state }),
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 404 }
      );
    }

    // Get updated session data
    const updatedSession = await sessionManager.getSession(sessionId, sessionToken);
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found after update' },
        { status: 500 }
      );
    }

    logger.info('Onboarding session updated', {
      sessionId,
      currentStep: updatedSession.currentStep,
      hasOrganizationName: !!updatedSession.state.organizationName,
      locationCount: updatedSession.state.locations?.length || 0,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        currentStep: updatedSession.currentStep,
        state: updatedSession.state,
        isCompleted: updatedSession.isCompleted,
        expiresAt: updatedSession.expiresAt,
      },
      message: 'Session updated successfully',
    });

  } catch (error) {
    logger.error('Failed to update onboarding session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding/update
 * Alternative method for updating session (same functionality)
 */
export async function POST(request: NextRequest) {
  return PUT(request);
}