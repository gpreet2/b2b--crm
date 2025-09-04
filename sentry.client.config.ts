/**
 * Sentry client-side configuration for TryZore
 * Handles error tracking for browser JavaScript errors and user interactions
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session tracking
  enableTracing: true,
  autoSessionTracking: true,
  
  // User interaction tracking
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering - don't send certain types of errors
  beforeSend(event, hint) {
    // Filter out cancelled requests and common browser errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip AbortController errors (cancelled requests)
        if (error.name === "AbortError" || error.message.includes("The operation was aborted")) {
          return null;
        }
        
        // Skip network errors
        if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
          return null;
        }
        
        // Skip React hydration errors in development
        if (process.env.NODE_ENV === "development" && error.message.includes("Hydration")) {
          return null;
        }
        
        // Skip common browser extension errors
        if (error.message.includes("Extension context invalidated") || 
            error.message.includes("chrome-extension://")) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // User context enrichment
  beforeSendTransaction(event) {
    // Add additional context to transactions
    event.tags = {
      ...event.tags,
      component: "client",
      platform: "browser",
    };
    
    return event;
  },
  
  // Initial scope configuration
  initialScope: {
    tags: {
      component: "client",
      platform: "browser",
    },
  },
  
  // Integration configuration
  integrations: [
    new Sentry.Replay({
      // Mask sensitive data in replays
      maskAllText: process.env.NODE_ENV === "production",
      blockAllMedia: false,
    }),
    new Sentry.BrowserTracing({
      // Track route changes
      routingInstrumentation: Sentry.nextRouterInstrumentation,
    }),
  ],
  
  // Release configuration
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GITHUB_SHA,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
  
  // Disable in development if no DSN is provided
  enabled: !!SENTRY_DSN && typeof window !== "undefined",
  
  // Privacy settings
  sendDefaultPii: false, // Don't send personally identifiable information by default
});

// Export Sentry for use in other files
export { Sentry };