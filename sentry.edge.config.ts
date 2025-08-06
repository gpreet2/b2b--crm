// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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

  // Edge-specific configuration
  environment: process.env.NODE_ENV || 'development',
});
