import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disabled WorkOS middleware for Task 1 testing
// TODO: Re-enable in Task 6 when implementing WorkOS integration
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Run middleware on all routes including auth routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};