import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { NextRequest } from 'next/server';

console.log('🚀 MIDDLEWARE LOADING - Official WorkOS AuthKit integration...');

// Clean middleware with focused debugging for official integration
function debuggingMiddleware(request: NextRequest) {
  const baseMiddleware = authkitMiddleware({
    debug: true,
    middlewareAuth: {
      enabled: true,
      unauthenticatedPaths: ['/', '/auth'], // Simplified - removed custom token endpoint
    },
  });

  // Streamlined logging for authentication flow
  console.log('🔍 MIDDLEWARE - Processing request:', {
    url: request.url,
    method: request.method,
    hasSessionCookie: request.cookies.get('wos-session') ? 'YES' : 'NO',
    timestamp: new Date().toISOString()
  });

  // Call the original middleware
  const response = baseMiddleware(request);

  // Debug response for authentication flow
  if (response instanceof Promise) {
    return response.then(res => {
      if (res?.status === 307 && res.headers.get('location')?.includes('workos.com')) {
        console.log('🔐 MIDDLEWARE - Redirecting to WorkOS for authentication:', {
          redirectUrl: res.headers.get('location'),
          timestamp: new Date().toISOString()
        });
      } else if (res?.headers.get('set-cookie')?.includes('wos-session')) {
        console.log('🎉 MIDDLEWARE - Session cookie detected, authentication successful');
      }
      return res;
    });
  }

  return response;
}

export default debuggingMiddleware;

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run on all routes except static assets and API routes that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};

console.log('🚀 MIDDLEWARE LOADED - Ready for WorkOS AuthKit + Convex integration');