import { handleAuth } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// Track used authorization codes to prevent reuse
const usedCodes = new Set<string>();

// Official WorkOS AuthKit callback handler with detailed logging
export const GET = handleAuth({
  returnPathname: '/dashboard',
  onSuccess: async (data) => {
    console.log('🎉 AUTH CALLBACK SUCCESS - WorkOS authentication completed:', {
      userId: data.user.id,
      userEmail: data.user.email,
      userName: `${data.user.firstName} ${data.user.lastName}`,
      profilePicture: data.user.profilePictureUrl,
      userObject: data.user.object,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
      organizationId: data.organizationId,
      authenticationMethod: data.authenticationMethod,
      hasOauthTokens: !!data.oauthTokens,
      hasAccessToken: !!data.accessToken,
      hasRefreshToken: !!data.refreshToken,
      timestamp: new Date().toISOString(),
      note: 'This means WorkOS session cookie was created successfully'
    });

    console.log('🔍 AUTH CALLBACK - Full data object keys:', {
      dataKeys: Object.keys(data),
      userKeys: Object.keys(data.user),
      hasRequiredFields: {
        hasId: !!data.user.id,
        hasEmail: !!data.user.email,
        hasFirstName: !!data.user.firstName,
        hasLastName: !!data.user.lastName
      }
    });
  },
  onError: ({ error, request }) => {
    console.log('🔍 AUTH CALLBACK - onError called with:', {
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      hasRequest: !!request,
      requestType: typeof request,
      timestamp: new Date().toISOString()
    });

    // Track the authorization code for debugging reuse issues  
    if (request?.url) {
      try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        
        // Check if this code was already used
        if (code && usedCodes.has(code)) {
          console.error('🚨 AUTH CALLBACK - Code reuse error detected:', {
            code: code.slice(0, 10) + '...',
            fullUrl: request.url,
            timestamp: new Date().toISOString(),
            note: 'This authorization code was already used - likely cause of the error'
          });
        } else if (code) {
          // Mark code as attempted even if it failed
          usedCodes.add(code);
          console.error('❌ AUTH CALLBACK - Code error tracking (code marked as used):', {
            code: code.slice(0, 10) + '...',
            fullUrl: request.url,
            usedCodesCount: usedCodes.size,
            timestamp: new Date().toISOString(),
            note: 'This code may have been expired or invalid'
          });
        } else {
          console.error('❌ AUTH CALLBACK - No authorization code found:', {
            fullUrl: request.url,
            timestamp: new Date().toISOString(),
            note: 'Missing authorization code in callback URL'
          });
        }
      } catch (urlError) {
        console.error('❌ AUTH CALLBACK - Error parsing request URL:', {
          urlError: urlError instanceof Error ? urlError.message : String(urlError),
          requestUrl: request.url,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.error('❌ AUTH CALLBACK - No request URL available:', {
        hasRequest: !!request,
        requestKeys: request ? Object.keys(request) : 'null',
        timestamp: new Date().toISOString(),
        note: 'Request object is missing or has no URL property'
      });
    }
    
    // Safely extract error details with comprehensive handling
    let errorMessage = 'Unknown authentication error';
    try {
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
    } catch (stringifyError) {
      errorMessage = 'Error occurred but could not be serialized';
      console.error('❌ AUTH CALLBACK - Error serializing error object:', {
        stringifyError: stringifyError instanceof Error ? stringifyError.message : String(stringifyError),
        timestamp: new Date().toISOString()
      });
    }
    
    console.error('❌ AUTH CALLBACK ERROR - WorkOS authentication failed:', {
      error: errorMessage,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorStack: error instanceof Error ? error.stack : null,
      requestUrl: request?.url || 'N/A',
      requestMethod: request?.method || 'N/A',
      requestHeaders: request ? {
        cookie: request.headers?.get?.('cookie') ? 'PRESENT' : 'MISSING',
        userAgent: request.headers?.get?.('user-agent') || 'N/A',
        referer: request.headers?.get?.('referer') || 'N/A',
      } : 'N/A',
      timestamp: new Date().toISOString(),
      note: 'This error means WorkOS could not complete the OAuth flow'
    });

    // Log additional context for common errors
    if (error instanceof Error && error.message.includes('code')) {
      console.error('🔍 AUTH CALLBACK - Code-related error details:', {
        possibleCauses: [
          'Authorization code expired (codes are single-use and expire quickly)',
          'Authorization code already used',
          'Authorization code invalid or corrupted',  
          'Client ID mismatch',
          'Redirect URI mismatch'
        ]
      });
    }

    // CRITICAL FIX: Return a NextResponse object (required by Next.js App Router)
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth?error=authentication_failed&details=${encodeURIComponent(errorMessage)}`;
    
    console.log('🔄 AUTH CALLBACK - Redirecting to auth page with error:', {
      redirectUrl,
      timestamp: new Date().toISOString()
    });

    return NextResponse.redirect(redirectUrl);
  }
});