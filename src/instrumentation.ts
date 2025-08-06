export async function register() {
  // Only initialize in production or when explicitly enabled in development
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SENTRY_DEV === 'true') {
    try {
      if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Server-side runtime
        await import('../sentry.server.config');
      } else if (process.env.NEXT_RUNTIME === 'edge') {
        // Edge runtime
        await import('../sentry.edge.config');
      }
    } catch (error) {
      // Gracefully handle instrumentation errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Sentry instrumentation failed:', error);
      } else {
        throw error;
      }
    }
  }
}

// Only export onRequestError in production to avoid dev conflicts
export const onRequestError = process.env.NODE_ENV === 'production' 
  ? require('@sentry/nextjs').captureRequestError 
  : undefined;
