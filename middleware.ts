import { type NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/session'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'b2b_session'

// Routes that don't require authentication
const publicRoutes = [
  '/signin',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/signout',
  '/invite/accept',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check for session
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    // No session, redirect to sign in
    const url = new URL('/signin', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // For API routes, we can't use Supabase server client in middleware
  // So we'll validate in the route handlers instead
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // For page routes, we'll validate in the layout/page components
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}