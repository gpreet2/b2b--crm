// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Reduced tracing in development for better performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.01,

  // Enable logs only in production
  enableLogs: process.env.NODE_ENV === 'production',

  // Debug only in development when explicitly enabled
  debug: process.env.NODE_ENV === 'development' && process.env.ENABLE_SENTRY_DEV === 'true',

  // Server-specific integrations only
  integrations: [
    // Remove browser-specific integrations that could cause "self is not defined"
  ],

  // Environment detection
  environment: process.env.NODE_ENV || 'development',
});
