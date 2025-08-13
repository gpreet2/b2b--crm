import { NextResponse } from 'next/server';
import { getSignInUrl, getSignUpUrl } from '@workos-inc/authkit-nextjs';
import { logger } from '@/utils/logger';

export async function GET() {
  try {
    logger.info('=== WorkOS Debug Config Check ===');

    // Check environment variables
    const envConfig = {
      WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ? '✓ Set' : '✗ Missing',
      WORKOS_API_KEY: process.env.WORKOS_API_KEY ? '✓ Set' : '✗ Missing',
      WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD ? '✓ Set' : '✗ Missing',
      ONBOARDING_ENCRYPTION_KEY: process.env.ONBOARDING_ENCRYPTION_KEY ? '✓ Set' : '✗ Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Construct redirect URI
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

    logger.info('Environment variables check', envConfig);
    logger.info('Constructed redirect URI', { redirectUri });

    // Test WorkOS URL generation
    const testResults: {
      signInUrl: string;
      signUpUrl: string;
      error: string | null;
    } = {
      signInUrl: 'N/A',
      signUpUrl: 'N/A',
      error: null,
    };

    try {
      const signInUrl = await getSignInUrl({ redirectUri });
      const signUpUrl = await getSignUpUrl({ redirectUri });
      
      testResults.signInUrl = signInUrl;
      testResults.signUpUrl = signUpUrl;

      logger.info('WorkOS URL generation successful', {
        signInUrlLength: signInUrl.length,
        signUpUrlLength: signUpUrl.length,
        redirectUriInUrl: signInUrl.includes(encodeURIComponent(redirectUri)),
      });
    } catch (error) {
      testResults.error = error instanceof Error ? error.message : String(error);
      logger.error('WorkOS URL generation failed', { error });
    }

    // Parse and validate URLs
    const urlAnalysis = {
      redirectUriEncoded: encodeURIComponent(redirectUri),
      expectedInWorkOS: `redirect_uri=${encodeURIComponent(redirectUri)}`,
    };

    const response = {
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envConfig,
      redirectUri: {
        raw: redirectUri,
        encoded: urlAnalysis.redirectUriEncoded,
        expectedParam: urlAnalysis.expectedInWorkOS,
      },
      workosTest: testResults,
      recommendations: [] as string[],
    };

    // Add recommendations based on findings
    if (!process.env.WORKOS_CLIENT_ID) {
      response.recommendations.push('Missing WORKOS_CLIENT_ID environment variable');
    }
    if (!process.env.WORKOS_API_KEY) {
      response.recommendations.push('Missing WORKOS_API_KEY environment variable');
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      response.recommendations.push('Missing NEXT_PUBLIC_APP_URL environment variable');
    }
    if (!process.env.ONBOARDING_ENCRYPTION_KEY) {
      response.recommendations.push('Missing ONBOARDING_ENCRYPTION_KEY environment variable');
    }
    if (testResults.error) {
      response.recommendations.push(`WorkOS URL generation failed: ${testResults.error}`);
    }

    // Mask sensitive data in URLs for logging
    const maskedSignIn = testResults.signInUrl.replace(/client_id=[^&]*/, 'client_id=***');
    const maskedSignUp = testResults.signUpUrl.replace(/client_id=[^&]*/, 'client_id=***');

    logger.info('WorkOS debug check completed', {
      envVarsOk: !response.recommendations.length,
      recommendationCount: response.recommendations.length,
      signInUrl: maskedSignIn,
      signUpUrl: maskedSignUp,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('WorkOS debug config check failed', { error });
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}