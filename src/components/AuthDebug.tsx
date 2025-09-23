'use client';

import { useConvexAuth, useQuery } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-react';
import { useState } from 'react';
import { api } from '../../convex/_generated/api';

export function AuthDebug() {
  const convexAuth = useConvexAuth();
  const workosAuth = useAuth();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isTestingToken, setIsTestingToken] = useState(false);

  // Use our debug queries
  const debugAuthContext = useQuery(api.debugAuth.debugAuthContext);
  const debugAuthRequirement = useQuery(api.debugAuth.debugAuthRequirement);

  // Helper function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return { error: 'Invalid JWT format' };

      // Base64 URL decode function (handles JWT padding)
      const base64UrlDecode = (str: string) => {
        // Add padding if needed
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
          str += '=';
        }
        return atob(str);
      };

      // Decode header and payload
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));

      return {
        header,
        payload,
        hasAudClaim: !!payload.aud,
        audValue: payload.aud,
        issuer: payload.iss,
        subject: payload.sub,
        email: payload.email,
        expiry: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        allClaims: Object.keys(payload)
      };
    } catch (error) {
      return { error: `Failed to decode JWT: ${error instanceof Error ? error.message : String(error)}` };
    }
  };

  const testTokenFetch = async () => {
    setIsTestingToken(true);
    try {
      // Test getting access token from WorkOS AuthKit
      const accessToken = await workosAuth.getAccessToken();

      let jwtAnalysis = null;
      if (accessToken) {
        jwtAnalysis = decodeJWT(accessToken);
      }

      setTokenData({
        response: 200,
        data: {
          accessToken: accessToken ? '✅ Token retrieved' : '❌ No token',
          tokenLength: accessToken ? accessToken.length : 0,
          tokenPreview: accessToken ? `${accessToken.substring(0, 50)}...` : null,
          tokenType: accessToken ? (accessToken.includes('.') ? 'JWT (contains dots)' : 'Opaque (no dots)') : 'None',
          jwtAnalysis,
          user: workosAuth.user,
          authenticated: !!workosAuth.user,
          convexExpectedAud: process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID,
          issue: jwtAnalysis?.error === 'Failed to decode JWT' ?
            'WorkOS is providing opaque tokens, but Convex needs JWT tokens' : null
        }
      });
    } catch (error) {
      setTokenData({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsTestingToken(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md text-xs">
      <h3 className="font-bold mb-2">🔍 Auth Debug Panel</h3>
      
      <div className="space-y-2">
        <div>
          <strong>WorkOS AuthKit:</strong>
          <div className="ml-2">
            ✅ Authenticated: {workosAuth.user ? 'Yes' : 'No'}<br/>
            🔄 Loading: {workosAuth.isLoading ? 'Yes' : 'No'}
            {workosAuth.user && (
              <div className="ml-2">
                📧 Email: {workosAuth.user.email}<br/>
                🆔 ID: {workosAuth.user.id}<br/>
                🏢 Org: {workosAuth.organizationId || 'None'}<br/>
                👤 Role: {workosAuth.role || 'None'}
              </div>
            )}
          </div>
        </div>

        <div>
          <strong>Convex Auth:</strong>
          <div className="ml-2">
            ⚡ Authenticated: {convexAuth.isAuthenticated ? 'Yes' : 'No'}<br/>
            🔄 Loading: {convexAuth.isLoading ? 'Yes' : 'No'}<br/>
            {debugAuthContext && (
              <div className="mt-1 text-xs">
                <strong>Debug Context:</strong><br/>
                🔑 Has Identity: {debugAuthContext.authContext?.hasIdentity ? 'Yes' : 'No'}<br/>
                {debugAuthContext.authContext?.identity && (
                  <>
                    📧 JWT Email: {debugAuthContext.authContext.identity.email || 'None'}<br/>
                    🎯 JWT Audience: {debugAuthContext.authContext.identity.audience || 'None'}<br/>
                    🏢 JWT Issuer: {debugAuthContext.authContext.identity.issuer || 'None'}<br/>
                    🆔 JWT Subject: {debugAuthContext.authContext.identity.subject || 'None'}
                  </>
                )}
                {debugAuthContext.authContext?.identityError && (
                  <div className="text-red-500">❌ Error: {debugAuthContext.authContext.identityError}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <button 
            onClick={testTokenFetch}
            disabled={isTestingToken}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
          >
            {isTestingToken ? '🔄 Testing...' : '🧪 Test Token'}
          </button>
        </div>

        {tokenData && (
          <div className="bg-gray-100 p-2 rounded text-xs">
            <strong>Token Test Result:</strong>
            <pre className="whitespace-pre-wrap mt-1">
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-gray-500 text-xs">
          🕐 {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}