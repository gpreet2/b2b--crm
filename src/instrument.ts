/**
 * Sentry initialization - must be imported before any other modules
 * Optimized for development performance
 */
import * as Sentry from '@sentry/node';

// Initialize Sentry before any other modules
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Minimal tracing in development for better performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,
    // Disable profiling in development for better performance  
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    // Minimal integrations in development
    integrations: process.env.NODE_ENV === 'production' ? undefined : [],
  });
}
