import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingCleanupManager } from '@/lib/onboarding-cleanup';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Cleanup request validation
const CleanupRequestSchema = z.object({
  maxAge: z.number().int().min(1).max(168).optional(), // 1 hour to 1 week
  batchSize: z.number().int().min(10).max(1000).optional(),
  dryRun: z.boolean().optional(),
  emergency: z.boolean().optional(),
});

/**
 * POST /api/onboarding/cleanup
 * Run cleanup of onboarding sessions
 */
export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (jsonError) {
      // Empty body is fine for basic cleanup
    }

    const validation = CleanupRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { emergency, ...options } = validation.data;
    const cleanupManager = getOnboardingCleanupManager();

    // Run appropriate cleanup
    const result = emergency 
      ? await cleanupManager.emergencyCleanup()
      : await cleanupManager.runCleanup(options);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Cleanup failed',
          errors: result.errors,
          partialResult: {
            cleanedSessions: result.cleanedSessions,
            duration: result.duration
          }
        },
        { status: 500 }
      );
    }

    logger.info('Cleanup completed via API', {
      cleanedSessions: result.cleanedSessions,
      duration: result.duration,
      emergency: emergency || false
    });

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      result: {
        cleanedSessions: result.cleanedSessions,
        duration: result.duration,
        errors: result.errors
      }
    });

  } catch (error) {
    logger.error('Cleanup API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/cleanup
 * Get cleanup statistics without performing cleanup
 */
export async function GET() {
  try {
    const cleanupManager = getOnboardingCleanupManager();
    const stats = await cleanupManager.getCleanupStats();

    return NextResponse.json({
      success: true,
      stats,
      recommendations: {
        needsCleanup: stats.orphanedSessions > 10 || stats.stuckSessions > 5 || stats.oldSessions > 0,
        priority: stats.oldSessions > 0 ? 'high' : stats.orphanedSessions > 50 ? 'medium' : 'low',
        estimatedCleanupCount: stats.expiredSessions + stats.orphanedSessions + stats.stuckSessions + stats.oldSessions
      }
    });

  } catch (error) {
    logger.error('Cleanup stats API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/cleanup
 * Schedule automatic cleanup
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const intervalHours = z.number().int().min(1).max(168).parse(body.intervalHours);

    const cleanupManager = getOnboardingCleanupManager();
    await cleanupManager.scheduleCleanup(intervalHours);

    logger.info('Cleanup scheduling requested via API', { intervalHours });

    return NextResponse.json({
      success: true,
      message: 'Cleanup scheduling configured',
      intervalHours
    });

  } catch (error) {
    logger.error('Cleanup scheduling API failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}