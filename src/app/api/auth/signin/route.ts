import { NextRequest, NextResponse } from 'next/server';
import { workos, WORKOS_CONFIG, getOrganizationByEmail } from '@/lib/workos-client';
import { withRateLimit, signInRateLimiter } from '@/lib/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if organization has SSO configured
    const organizationId = await getOrganizationByEmail(email);
    
    // In development with test keys, always use Magic Link for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestKey = process.env.WORKOS_API_KEY?.startsWith('sk_test_');
    const forceUseMagicLink = isDevelopment && isTestKey;
    
    if (organizationId && !forceUseMagicLink) {
      // Organization has SSO, redirect to SSO flow (only in production)
      const authorizationUrl = workos.sso.getAuthorizationUrl({
        organization: organizationId,
        clientId: WORKOS_CONFIG.clientId,
        redirectUri: WORKOS_CONFIG.redirectUri,
      });
      
      return NextResponse.json({
        success: true,
        authMethod: 'sso',
        authorizationUrl,
      });
    } else {
      // No SSO, use Magic Link
      try {
        const passwordlessSession = await workos.passwordless.createSession({
          email,
          type: 'MagicLink',
          redirectUri: WORKOS_CONFIG.redirectUri,
        });
        
        // In development with test keys, return the magic link directly
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isTestKey = process.env.WORKOS_API_KEY?.startsWith('sk_test_');
        
        if (isDevelopment && isTestKey) {
          // Test keys don't send emails, so return the link for development
          return NextResponse.json({
            success: true,
            authMethod: 'magic_link',
            message: 'Test mode: Use the link below to sign in',
            magicLink: passwordlessSession.link, // Include the link for development
          });
        } else {
          // Production: WorkOS will send the magic link email
          return NextResponse.json({
            success: true,
            authMethod: 'magic_link',
            message: 'Check your email for a sign-in link',
          });
        }
      } catch (error: any) {
        console.error('Error creating magic link:', error);
        return NextResponse.json(
          { error: 'Failed to send magic link' },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
}, signInRateLimiter);