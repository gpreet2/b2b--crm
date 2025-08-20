'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    // Only capture errors with Sentry in production
    if (process.env.NODE_ENV === 'production') {
      try {
        import('@sentry/nextjs').then(Sentry => {
          Sentry.captureException(error);
        });
      } catch (err) {
        console.error('Failed to capture error with Sentry:', err);
      }
    } else {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html>
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
