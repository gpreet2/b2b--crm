import { cookies } from 'next/headers';
import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function DebugSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('wos-session');
  
  let authResult;
  let authError: string | null = null;
  
  try {
    authResult = await withAuth();
  } catch (err) {
    authError = err instanceof Error ? err.message : String(err);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Session Cookie:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              hasSession: !!sessionCookie,
              cookieName: sessionCookie?.name,
              cookieValue: sessionCookie?.value ? 'EXISTS' : 'MISSING',
              cookieLength: sessionCookie?.value?.length || 0
            }, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Auth Result:</h2>
          <pre className="bg-green-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authResult, null, 2)}
          </pre>
        </div>

        {authError && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Auth Error:</h2>
            <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
              {authError}
            </pre>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">Environment Check:</h2>
          <pre className="bg-blue-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ? 'Set' : 'Not set',
              WORKOS_API_KEY: process.env.WORKOS_API_KEY ? 'Set' : 'Not set', 
              WORKOS_COOKIE_PASSWORD: process.env.WORKOS_COOKIE_PASSWORD ? 'Set' : 'Not set',
              WORKOS_REDIRECT_URI: process.env.WORKOS_REDIRECT_URI,
              NODE_ENV: process.env.NODE_ENV,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}