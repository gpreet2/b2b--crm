import * as Sentry from '@sentry/node';
import { Request, Response, Router } from 'express';

import { getDatabase } from '../config/database';
import { logger } from '../utils/logger';

export const monitoringRouter = Router();

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'pass' | 'fail';
      latency?: number;
      error?: string;
      metrics?: Record<string, unknown>;
    };
    supabase: {
      status: 'pass' | 'fail';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'pass' | 'fail';
      usage: NodeJS.MemoryUsage;
      percentUsed: number;
    };
  };
}

// Health check endpoint
monitoringRouter.get('/health', async (req: Request, res: Response) => {
  const _startTime = Date.now();
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: { status: 'pass' },
      supabase: { status: 'pass' },
      memory: {
        status: 'pass',
        usage: process.memoryUsage(),
        percentUsed: 0,
      },
    },
  };

  try {
    // Check database connection
    const dbCheckStart = Date.now();
    try {
      const db = getDatabase();

      // Try a simple query if PostgreSQL is configured
      try {
        await db.query('SELECT 1');
        response.checks.database.latency = Date.now() - dbCheckStart;
        response.checks.database.metrics = db.getMetrics() as unknown as Record<string, unknown>;
      } catch (_error) {
        // PostgreSQL might not be configured, check Supabase client
        const client = db.getSupabaseClient();
        if (!client) {
          throw new Error('No database connection available');
        }
      }
    } catch (error) {
      response.checks.database.status = 'fail';
      response.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
      response.status = 'unhealthy';
      logger.error('Database health check failed', { error });
    }

    // Check Supabase connection
    const supabaseCheckStart = Date.now();
    try {
      const db = getDatabase();
      const client = db.getSupabaseClient();

      // Try to query a non-existent table (should fail with specific error)
      const { error } = await client.from('_health_check_test').select('count').limit(1);

      // PGRST116 means table doesn't exist, which is expected
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      response.checks.supabase.latency = Date.now() - supabaseCheckStart;
    } catch (error) {
      response.checks.supabase.status = 'fail';
      response.checks.supabase.error = error instanceof Error ? error.message : 'Unknown error';
      response.status = response.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      logger.error('Supabase health check failed', { error });
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = process.env.NODE_MEMORY_LIMIT
      ? parseInt(process.env.NODE_MEMORY_LIMIT) * 1024 * 1024
      : 512 * 1024 * 1024; // Default 512MB

    const percentUsed = (memUsage.heapUsed / totalMemory) * 100;
    response.checks.memory.percentUsed = Math.round(percentUsed * 100) / 100;

    if (percentUsed > 90) {
      response.checks.memory.status = 'fail';
      response.status = response.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    // Set appropriate status code
    const statusCode =
      response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check failed', { error });
    response.status = 'unhealthy';
    res.status(503).json(response);
  }
});

// Liveness probe - simple check that the process is running
monitoringRouter.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// Readiness probe - check if the app is ready to serve traffic
monitoringRouter.get('/ready', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const metrics = db.getMetrics();

    if (!metrics.isHealthy) {
      return res.status(503).json({
        status: 'not ready',
        reason: 'Database not healthy',
      });
    }

    return res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'not ready',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Metrics endpoint for monitoring tools
monitoringRouter.get('/metrics', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const dbMetrics = db.getMetrics();
    const memUsage = process.memoryUsage();

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
      },
      database: dbMetrics,
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage(),
      },
      requests: {
        // These would be populated by request tracking middleware
        total: 0,
        active: 0,
        errors: 0,
      },
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Failed to get metrics', { error });
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Sentry test endpoint (only in development)
if (process.env.NODE_ENV !== 'production') {
  monitoringRouter.get('/test-sentry', (req: Request, res: Response) => {
    const testError = new Error('This is a test error for Sentry');
    Sentry.captureException(testError);
    logger.error('Test error sent to Sentry', { error: testError });
    res.json({ message: 'Test error sent to Sentry' });
  });
}
