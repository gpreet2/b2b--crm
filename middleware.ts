import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  debug: process.env.NODE_ENV === 'development',
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/auth',
      '/onboarding',
      '/create-account',
      '/test-multiple-accounts',
      '/test-auth',
      '/test-signout',
      '/test-refresh',
      '/api/auth/callback',
      '/api/auth/signout',
      '/api/auth/force-logout',
      '/api/test-workos',
      '/api/health',
      '/api/monitoring/health',
    ],
  },
  signUpPaths: ['/sign-up', '/register'],
});

// Match all routes except static files, images, and favicon
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
