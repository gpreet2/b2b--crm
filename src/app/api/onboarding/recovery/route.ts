import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingRecoveryManager } from '@/lib/onboarding-recovery';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Recovery request validation
const RecoveryRequestSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  sessionToken: z.string().length(64, 'Invalid session token'),
  validateSteps: z.boolean().optional(),
  repairMissingData: z.boolean().optional(),
  maxStepBack: z.number().int().min(1).max(4).optional(),
});

const ForceResumeSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  sessionToken: z.string().length(64, 'Invalid session token'),
  targetStep: z.number().int().min(1).max(4, 'Target step must be between 1 and 4'),
});

/**
 * POST /api/onboarding/recovery
 * Attempt to recover an interrupted onboarding session
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

    const validation = RecoveryRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken, ...options } = validation.data;
    const recoveryManager = getOnboardingRecoveryManager();

    const result = await recoveryManager.recoverSession(sessionId, sessionToken, options);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Recovery failed', 
          reason: result.reason,
          canContinue: result.canContinue
        },
        { status: result.canContinue ? 422 : 404 }
      );
    }

    logger.info('Session recovery completed via API', {
      sessionId,
      nextStep: result.nextStep,
      canContinue: result.canContinue
    });

    // Return session data without sensitive token
    return NextResponse.json({
      success: true,
      canContinue: result.canContinue,
      nextStep: result.nextStep,
      session: result.session ? {
        id: result.session.id,
        currentStep: result.session.currentStep,
        state: result.session.state,
        createdAt: result.session.createdAt,
        expiresAt: result.session.expiresAt,
        isCompleted: result.session.isCompleted,
      } : undefined,
      missingData: result.missingData,
      reason: result.reason
    });

  } catch (error) {
    logger.error('Session recovery API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/recovery
 * Force resume from a specific step
 */
export async function PUT(request: NextRequest) {
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

    const validation = ForceResumeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, sessionToken, targetStep } = validation.data;
    const recoveryManager = getOnboardingRecoveryManager();

    // First check if resume is possible
    const canResume = await recoveryManager.canResumeFromStep(sessionId, sessionToken, targetStep);
    if (!canResume.canResume) {
      return NextResponse.json(
        { 
          error: 'Cannot resume from target step', 
          reason: canResume.reason 
        },
        { status: 422 }
      );
    }

    // Attempt force resume
    const result = await recoveryManager.forceResumeFromStep(sessionId, sessionToken, targetStep);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Force resume failed', 
          reason: result.reason 
        },
        { status: 500 }
      );
    }

    logger.info('Force resume completed via API', {
      sessionId,
      targetStep
    });

    return NextResponse.json({
      success: true,
      message: 'Session resumed successfully',
      currentStep: targetStep
    });

  } catch (error) {
    logger.error('Force resume API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/recovery
 * Get recovery statistics
 */
export async function GET() {
  try {
    const recoveryManager = getOnboardingRecoveryManager();
    const stats = await recoveryManager.getRecoveryStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Recovery stats API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}