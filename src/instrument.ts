/**
 * Sentry initialization - must be imported before any other modules
 */
import * as Sentry from '@sentry/node';

// Initialize Sentry before any other modules
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Set profilesSampleRate to 1.0 to profile 100%
    // of sampled transactions in development
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}