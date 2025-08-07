// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Reduced tracing in development for better performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.005,

  // Minimal logging in development, full logging in production
  enableLogs: true,

  // Never debug unless explicitly enabled to reduce noise
  debug: process.env.ENABLE_SENTRY_DEBUG === 'true',

  // Server-specific integrations only - reduce noise from instrumentation
  integrations: [
    // Exclude noisy integrations that spam console
    Sentry.extraErrorDataIntegration({ depth: 3 }),
  ],

  // Environment detection
  environment: process.env.NODE_ENV || 'development',
  
  // Filter out common development noise
  beforeSend(event) {
    // In development, ignore certain errors that are just noise
    if (process.env.NODE_ENV === 'development') {
      if (event.exception?.values?.[0]?.value?.includes('instrumentation')) {
        return null; // Don't send instrumentation errors in dev
      }
    }
    return event;
  },
});
