import { NextRequest, NextResponse } from 'next/server';
import { getOnboardingCleanupService } from '@/lib/onboarding-cleanup';
import { logger } from '@/utils/logger';
import { z } from 'zod';

// Validation schema for manual cleanup
const ManualCleanupSchema = z.object({
  maxAgeHours: z.number().int().min(1).max(168).optional(), // Max 1 week
});

/**
 * GET /api/onboarding/cleanup
 * Get cleanup service status
 */
export async function GET() {
  try {
    const cleanupService = getOnboardingCleanupService();
    const status = cleanupService.getStatus();

    return NextResponse.json({
      success: true,
      status,
      message: 'Cleanup service status retrieved successfully',
    });
  } catch (error) {
    logger.error('Failed to get cleanup service status', { error });
    return NextResponse.json(
      { error: 'Failed to get cleanup service status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding/cleanup
 * Manually trigger cleanup of expired sessions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validation = ManualCleanupSchema.safeParse(body);
    
    if (!validation.success) {
      logger.warn('Invalid manual cleanup request', { 
        errors: validation.error.issues 
      });
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { maxAgeHours } = validation.data;

    // Check if we're in development/admin context
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required for manual cleanup' },
        { status: 401 }
      );
    }

    // In a real app, you'd validate the admin token here
    // For now, we'll just check for a simple admin token
    const token = authHeader.replace('Bearer ', '');
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN || 'dev-admin-token';
    
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 403 }
      );
    }

    logger.info('Manual cleanup triggered', { 
      maxAgeHours,
      triggeredBy: 'admin-api',
    });

    const cleanupService = getOnboardingCleanupService();
    const cleanedCount = await cleanupService.cleanupExpiredSessions(maxAgeHours);

    logger.info('Manual cleanup completed', { 
      cleanedCount,
      maxAgeHours: maxAgeHours || cleanupService.getStatus().config.maxAgeHours,
    });

    return NextResponse.json({
      success: true,
      cleanedCount,
      maxAgeHours: maxAgeHours || cleanupService.getStatus().config.maxAgeHours,
      message: `Successfully cleaned up ${cleanedCount} expired sessions`,
    });

  } catch (error) {
    logger.error('Failed to run manual cleanup', { error });
    return NextResponse.json(
      { error: 'Failed to run cleanup' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/onboarding/cleanup
 * Start or stop the cleanup service
 */
export async function PUT(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "stop"' },
        { status: 400 }
      );
    }

    // Check admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const expectedToken = process.env.ADMIN_CLEANUP_TOKEN || 'dev-admin-token';
    
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 403 }
      );
    }

    const cleanupService = getOnboardingCleanupService();

    if (action === 'start') {
      cleanupService.start();
      logger.info('Cleanup service started via API');
    } else {
      cleanupService.stop();
      logger.info('Cleanup service stopped via API');
    }

    const status = cleanupService.getStatus();

    return NextResponse.json({
      success: true,
      action,
      status,
      message: `Cleanup service ${action}ed successfully`,
    });

  } catch (error) {
    logger.error('Failed to control cleanup service', { error });
    return NextResponse.json(
      { error: 'Failed to control cleanup service' },
      { status: 500 }
    );
  }
}