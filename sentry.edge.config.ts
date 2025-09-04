/**
 * Sentry edge runtime configuration for TryZore
 * Handles error tracking for Next.js Edge API routes and middleware
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  
  // Performance monitoring (lower sample rate for edge)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0.5,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out cancelled requests and common edge runtime errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip AbortController errors
        if (error.name === "AbortError" || error.message.includes("The operation was aborted")) {
          return null;
        }
        
        // Skip timeout errors that are expected in edge runtime
        if (error.message.includes("timeout") || error.message.includes("deadline")) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Additional context for edge runtime errors
  initialScope: {
    tags: {
      component: "edge",
      platform: "edge-runtime",
    },
  },
  
  // Release configuration
  release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
  
  // Disable in development if no DSN is provided
  enabled: !!SENTRY_DSN,
});

// Export Sentry for use in other files
export { Sentry };