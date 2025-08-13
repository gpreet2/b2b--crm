import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingSessionManager } from '@/lib/onboarding-session';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schemas
const CreateSessionSchema = z.object({
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

const UpdateSessionSchema = z.object({
  sessionId: z.string(),
  sessionToken: z.string(),
  currentStep: z.number().min(1).max(3).optional(),
  state: z.object({
    organizationName: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    locations: z.array(z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
    })).optional(),
  }).optional(),
  isCompleted: z.boolean().optional(),
});

const GetSessionSchema = z.object({
  sessionId: z.string(),
  sessionToken: z.string(),
});

/**
 * POST /api/onboarding/session
 * Create a new onboarding session
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (_jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const validation = CreateSessionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const sessionManager = getOnboardingSessionManager();
    
    const result = await sessionManager.createSession(validation.data);

    logger.info('Onboarding session created via API', {
      sessionId: result.sessionId,
    });

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      sessionToken: result.sessionToken,
      csrfToken: result.csrfToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    });

  } catch (error) {
    logger.error('Failed to create onboarding session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/session
 * Retrieve an existing onboarding session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionId || !sessionToken) {
      return NextResponse.json(
        { error: 'Session ID and token are required' },
        { status: 400 }
      );
    }

    const validation = GetSessionSchema.safeParse({ sessionId, sessionToken });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid session parameters' },
        { status: 400 }
      );
    }

    const sessionManager = getOnboardingSessionManager();
    const session = await sessionManager.getSession(sessionId, sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    // Return session data (excluding sensitive token)
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        currentStep: session.currentStep,
        state: session.state,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCompleted: session.isCompleted,
      },
    });

  } catch (error) {
    logger.error('Failed to retrieve onboarding session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/session
 * Update an existing onboarding session
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = UpdateSessionSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken, ...updateData } = validation.data;
    const sessionManager = getOnboardingSessionManager();

    const success = await sessionManager.updateSession(
      sessionId,
      sessionToken,
      updateData
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Session not found, expired, or update failed' },
        { status: 404 }
      );
    }

    logger.info('Onboarding session updated via API', {
      sessionId,
      step: updateData.currentStep,
      completed: updateData.isCompleted,
    });

    return NextResponse.json({
      success: true,
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
 * DELETE /api/onboarding/session
 * Delete an onboarding session
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionId || !sessionToken) {
      return NextResponse.json(
        { error: 'Session ID and token are required' },
        { status: 400 }
      );
    }

    const sessionManager = getOnboardingSessionManager();
    
    // Verify session exists first
    const session = await sessionManager.getSession(sessionId, sessionToken);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      );
    }

    const success = await sessionManager.deleteSession(sessionId);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    logger.info('Onboarding session deleted via API', { sessionId });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });

  } catch (error) {
    logger.error('Failed to delete onboarding session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}