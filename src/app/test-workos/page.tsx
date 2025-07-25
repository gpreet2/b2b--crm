'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'

export default function TestWorkOSPage() {
  const { user, loading, signIn, signOut } = useAuth()
  const [testEmail, setTestEmail] = useState('')
  const [signInResult, setSignInResult] = useState<any>(null)
  const [dbTest, setDbTest] = useState<any>({ loading: true })

  useEffect(() => {
    testDatabase()
  }, [])

  const testDatabase = async () => {
    const supabase = createClient()
    
    try {
      // Test database connection
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('id, name')
        .limit(3)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, workos_user_id, role')
        .limit(3)

      setDbTest({
        loading: false,
        gyms: gyms || [],
        profiles: profiles || [],
        gymsError,
        profilesError
      })
    } catch (error) {
      setDbTest({ loading: false, error: error.message })
    }
  }

  const handleSignIn = async () => {
    setSignInResult({ loading: true })
    const result = await signIn(testEmail)
    setSignInResult({ ...result, loading: false })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">WorkOS Authentication Test</h1>

        {/* Current User Status */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          {loading ? (
            <p>Loading auth state...</p>
          ) : user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Gym ID:</strong> {user.gym_id}</p>
              <p><strong>WorkOS User ID:</strong> {user.workos_user_id || 'Not set'}</p>
              <p><strong>Auth Provider:</strong> {user.auth_provider}</p>
              <button
                onClick={signOut}
                className="mt-4 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-muted">Not authenticated</p>
          )}
        </div>

        {/* Sign In Test */}
        {!user && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Sign In</h2>
            <div className="space-y-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email"
                className="w-full px-4 py-2 border border-border rounded-lg bg-surface-light"
              />
              <button
                onClick={handleSignIn}
                disabled={!testEmail || signInResult?.loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {signInResult?.loading ? 'Sending...' : 'Send Magic Link'}
              </button>
              
              {signInResult && !signInResult.loading && (
                <div className={`p-4 rounded-lg ${signInResult.error ? 'bg-danger/10' : 'bg-success/10'}`}>
                  {signInResult.error ? (
                    <p className="text-danger">Error: {signInResult.error}</p>
                  ) : (
                    <div>
                      <p className="text-success">Success! Auth method: {signInResult.authMethod}</p>
                      {signInResult.authMethod === 'magic_link' && (
                        <p className="text-sm mt-2">Check your email for the magic link</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Database Test */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          {dbTest.loading ? (
            <p>Testing database...</p>
          ) : dbTest.error ? (
            <p className="text-danger">Database Error: {dbTest.error}</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Gyms ({dbTest.gyms.length})</h3>
                {dbTest.gymsError ? (
                  <p className="text-danger text-sm">Error: {dbTest.gymsError.message}</p>
                ) : (
                  <pre className="text-sm bg-surface-light p-2 rounded overflow-auto">
                    {JSON.stringify(dbTest.gyms, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Profiles ({dbTest.profiles.length})</h3>
                {dbTest.profilesError ? (
                  <p className="text-danger text-sm">Error: {dbTest.profilesError.message}</p>
                ) : (
                  <pre className="text-sm bg-surface-light p-2 rounded overflow-auto">
                    {JSON.stringify(dbTest.profiles, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Environment Check */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="space-y-2 text-sm">
            <p className={process.env.NEXT_PUBLIC_APP_URL ? 'text-success' : 'text-danger'}>
              ✓ NEXT_PUBLIC_APP_URL: {process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Not set'}
            </p>
            <p className="text-muted">WorkOS API Key and Client ID are configured server-side</p>
          </div>
        </div>
      </div>
    </div>
  )
}