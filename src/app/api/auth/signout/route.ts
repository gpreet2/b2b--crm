import { signOut } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Get returnTo from form data or default to home
    const formData = await request.formData().catch(() => null);
    const returnTo = formData?.get('returnTo')?.toString() ?? '/';

    // Log sign out attempt
    logger.info('User signing out', { returnTo });

    // For creating new account flow, we need to ensure complete logout
    if (returnTo === '/onboarding') {
      // Create a response that clears all cookies and redirects
      const response = NextResponse.redirect(new URL(returnTo, request.url));

      // Clear all auth-related cookies
      response.cookies.delete('wos-session');
      response.cookies.delete('b2b_session');

      // Set headers to clear browser data
      response.headers.set('Clear-Site-Data', '"cookies", "storage"');
      response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    }

    // Normal sign out flow
    const signOutResponse = await signOut();
    return signOutResponse;
  } catch (error) {
    logger.error('Sign out error', { error });
    return new Response('Failed to sign out', { status: 500 });
  }
}
