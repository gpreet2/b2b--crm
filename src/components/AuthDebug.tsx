'use client';

import { useConvexAuth } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-react';
import { useState } from 'react';

export function AuthDebug() {
  const convexAuth = useConvexAuth();
  const workosAuth = useAuth();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isTestingToken, setIsTestingToken] = useState(false);

  const testTokenFetch = async () => {
    setIsTestingToken(true);
    try {
      // Test getting access token from WorkOS AuthKit
      const accessToken = await workosAuth.getAccessToken();
      setTokenData({ 
        response: 200,
        data: { 
          accessToken: accessToken ? '✅ Token retrieved' : '❌ No token',
          user: workosAuth.user,
          authenticated: !!workosAuth.user
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
            🔄 Loading: {convexAuth.isLoading ? 'Yes' : 'No'}
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