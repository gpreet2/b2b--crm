export async function register() {
  // Initialize Sentry in all environments for proper error tracking
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Server-side runtime
      await import('../sentry.server.config');
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      // Edge runtime
      await import('../sentry.edge.config');
    }
  } catch (error) {
    // Gracefully handle instrumentation errors
    if (process.env.NODE_ENV === 'development') {
      // Only warn in development, don't crash
      console.warn('Sentry instrumentation failed (non-critical):', error instanceof Error ? error.message : error);
    } else {
      // In production, this is more critical
      console.error('Sentry instrumentation failed:', error);
    }
  }
}

// Only export onRequestError in production to avoid dev conflicts
// Using dynamic import to avoid TypeScript require() issues
export const onRequestError = process.env.NODE_ENV === 'production' 
  ? (async () => {
      const sentry = await import('@sentry/nextjs');
      return sentry.captureRequestError;
    })()
  : undefined;
