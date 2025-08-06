// Import Sentry initialization first
// Sentry now auto-initializes via instrumentation.ts

import * as Sentry from '@sentry/node';
import express from 'express';

import { dashboardRouter } from './api/dashboard';
import { monitoringRouter } from './api/monitoring';
import { initializeDatabase, getDatabase } from './config/database';
import { errorHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(requestIdMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/monitoring', monitoringRouter);
app.use('/dashboard', dashboardRouter);

// Test error endpoint
app.get('/test-error', (req, res, next) => {
  next(new Error('Test error for error handling'));
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'TryZore B2B CRM API',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Sentry error handler must come before any other error handling middleware
Sentry.setupExpressErrorHandler(app);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  // Close database connections
  try {
    const db = getDatabase();
    await db.shutdown();
  } catch (error) {
    logger.error('Error shutting down database', { error });
  }

  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize database
    const db = initializeDatabase({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      databaseUrl: process.env.DATABASE_URL,
      poolConfig: {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '5'),
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      },
    });

    await db.initialize();
    logger.info('Database initialized');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT,
        dashboardUrl: `http://localhost:${PORT}/dashboard`,
        monitoringUrl: `http://localhost:${PORT}/monitoring/health`,
      });
    });
  } catch (error) {
    logger.fatal('Failed to start server', { error });
    process.exit(1);
  }
}

// Only start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
