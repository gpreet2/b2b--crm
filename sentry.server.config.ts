/**
 * Sentry server-side configuration for TryZore
 * Handles error tracking for Next.js API routes and server-side rendering
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session tracking
  enableTracing: true,
  
  // Error filtering - don't send certain types of errors
  beforeSend(event, hint) {
    // Filter out cancelled requests and common client errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip AbortController errors (cancelled requests)
        if (error.name === "AbortError" || error.message.includes("The operation was aborted")) {
          return null;
        }
        
        // Skip network errors that are likely client-side
        if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Additional context for server errors
  initialScope: {
    tags: {
      component: "server",
      platform: "nextjs",
    },
  },
  
  // Integration configuration
  integrations: [
    new Sentry.Integrations.Http({
      tracing: true,
      breadcrumbs: true,
    }),
  ],
  
  // Release configuration
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
  
  // Disable in development if no DSN is provided
  enabled: !!SENTRY_DSN,
});

// Export Sentry for use in other files
export { Sentry };