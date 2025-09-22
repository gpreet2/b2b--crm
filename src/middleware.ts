import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';

console.log('🚀 MIDDLEWARE LOADING - WorkOS Node SDK implementation (AuthKit bypassed)...');

// Simple middleware without AuthKit - authentication handled by API routes
function debuggingMiddleware(request: NextRequest, event: NextFetchEvent) {
  // Log all requests for debugging
  console.log('🔍 MIDDLEWARE - Processing request:', {
    url: request.url,
    method: request.method,
    hasConvexToken: request.cookies.get('convex-token') ? 'YES' : 'NO',
    hasUserInfo: request.cookies.get('user-info') ? 'YES' : 'NO',
    timestamp: new Date().toISOString()
  });

  // Allow all requests to pass through - no authentication blocking
  // Authentication is now handled by individual API routes and client-side checks
  return NextResponse.next();
}

export default debuggingMiddleware;

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run on all routes except static assets, images, and specific API routes
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico).*)',
  ],
};

console.log('🚀 MIDDLEWARE LOADED - WorkOS Node SDK + Convex integration ready');