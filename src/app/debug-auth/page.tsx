'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/utils/supabase/client'

interface DebugLog {
  timestamp: string
  event: string
  details: any
  status: 'info' | 'success' | 'error' | 'warning'
}

export default function DebugAuthPage() {
  const [email, setEmail] = useState('gym1admin@testvalidation.com')
  const [password, setPassword] = useState('SecurePass123!')
  const [fullName, setFullName] = useState('')
  const [testing, setTesting] = useState(false)
  const [logs, setLogs] = useState<DebugLog[]>([])
  const [dbLogs, setDbLogs] = useState<any[]>([])
  
  const { signIn, signUp, user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const addLog = (event: string, details: any, status: DebugLog['status'] = 'info') => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      status
    }
    setLogs(prev => [...prev, log])
    console.log(`[DEBUG AUTH] ${event}:`, details)
  }

  const clearLogs = () => {
    setLogs([])
    setDbLogs([])
  }

  // Monitor auth context changes
  useEffect(() => {
    addLog('Auth Context Update', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id,
      userRole: user?.role,
      userGymId: user?.gym_id,
      loading
    }, user ? 'success' : 'info')
  }, [user, loading])

  // Monitor Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog('Supabase Auth State Change', {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'Present' : 'None'
      }, event === 'SIGNED_IN' ? 'success' : event === 'SIGNED_OUT' ? 'warning' : 'info')
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkDatabase = async () => {
    addLog('Starting Database Check', {}, 'info')
    
    try {
      // Check auth.users
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, email_confirmed_at, created_at')
        .limit(5)
      
      if (authError) {
        addLog('Auth Users Query Failed', { error: authError.message }, 'error')
      } else {
        addLog('Auth Users Query Success', { count: authUsers?.length || 0 }, 'success')
      }

      // Check profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, gym_id, created_at')
        .limit(5)
      
      if (profilesError) {
        addLog('Profiles Query Failed', { error: profilesError.message }, 'error')
      } else {
        addLog('Profiles Query Success', { 
          count: profiles?.length || 0,
          profiles: profiles?.map(p => ({ email: p.email, role: p.role, gym_id: p.gym_id }))
        }, 'success')
        setDbLogs(profiles || [])
      }

      // Check current session
      const { data: sessionData } = await supabase.auth.getSession()
      addLog('Current Session Check', {
        hasSession: !!sessionData.session,
        userEmail: sessionData.session?.user?.email,
        isExpired: sessionData.session ? sessionData.session.expires_at < Date.now() / 1000 : null
      }, sessionData.session ? 'success' : 'warning')

    } catch (error) {
      addLog('Database Check Exception', { error: error.message }, 'error')
    }
  }

  const testSignUp = async () => {
    setTesting(true)
    addLog('Starting Sign-Up Test', { email, fullName }, 'info')

    try {
      const startTime = Date.now()
      const result = await signUp(email, password, { full_name: fullName })
      const duration = Date.now() - startTime

      if (result.error) {
        addLog('Sign-Up Failed', { error: result.error, duration }, 'error')
      } else {
        addLog('Sign-Up Success', { duration }, 'success')
      }
    } catch (error) {
      addLog('Sign-Up Exception', { error: error.message }, 'error')
    } finally {
      setTesting(false)
    }
  }

  const testSignIn = async () => {
    setTesting(true)
    addLog('Starting Sign-In Test', { email }, 'info')

    try {
      const startTime = Date.now()
      
      // Test direct Supabase call first
      addLog('Testing Direct Supabase Sign-In', {}, 'info')
      const { data: directData, error: directError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      const directDuration = Date.now() - startTime

      if (directError) {
        addLog('Direct Supabase Sign-In Failed', { 
          error: directError.message, 
          duration: directDuration 
        }, 'error')
      } else {
        addLog('Direct Supabase Sign-In Success', { 
          userId: directData.user?.id,
          email: directData.user?.email,
          duration: directDuration 
        }, 'success')
        
        // Test profile fetch
        if (directData.user) {
          const profileStart = Date.now()
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('gym_id, role, full_name')
            .eq('id', directData.user.id)
            .single()
          const profileDuration = Date.now() - profileStart

          if (profileError) {
            addLog('Profile Fetch Failed', { 
              error: profileError.message, 
              duration: profileDuration 
            }, 'error')
          } else {
            addLog('Profile Fetch Success', { 
              profile, 
              duration: profileDuration 
            }, 'success')
          }
        }
      }

      // Now test auth context sign-in
      addLog('Testing Auth Context Sign-In', {}, 'info')
      const contextStart = Date.now()
      const contextResult = await signIn(email, password)
      const contextDuration = Date.now() - contextStart

      if (contextResult.error) {
        addLog('Auth Context Sign-In Failed', { 
          error: contextResult.error, 
          duration: contextDuration 
        }, 'error')
      } else {
        addLog('Auth Context Sign-In Success', { 
          duration: contextDuration 
        }, 'success')

        // Wait for auth state to update
        setTimeout(() => {
          addLog('Post-SignIn Auth State', {
            hasUser: !!user,
            userEmail: user?.email,
            loading
          }, 'info')
        }, 1000)
      }

    } catch (error) {
      addLog('Sign-In Exception', { error: error.message }, 'error')
    } finally {
      setTesting(false)
    }
  }

  const testSignOut = async () => {
    setTesting(true)
    addLog('Starting Sign-Out Test', {}, 'info')

    try {
      await supabase.auth.signOut()
      addLog('Sign-Out Success', {}, 'success')
    } catch (error) {
      addLog('Sign-Out Exception', { error: error.message }, 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Auth Flow Debug Dashboard</h1>
        
        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Auth Context State</h3>
            <div className="text-sm">
              <div className={`mb-1 ${loading ? 'text-yellow-600' : 'text-gray-600'}`}>
                Loading: {loading ? '⏳ Yes' : '✅ No'}
              </div>
              <div className={`mb-1 ${user ? 'text-green-600' : 'text-red-600'}`}>
                User: {user ? `✅ ${user.email}` : '❌ None'}
              </div>
              {user && (
                <>
                  <div className="text-gray-600">Role: {user.role}</div>
                  <div className="text-gray-600">Gym: {user.gym_id}</div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Database Stats</h3>
            <div className="text-sm text-gray-600">
              <div>Profiles: {dbLogs.length}</div>
              <button 
                onClick={checkDatabase}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Check Database
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={clearLogs}
                className="w-full px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
              >
                Clear Logs
              </button>
              <button 
                onClick={testSignOut}
                disabled={testing}
                className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Test Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Sign Up Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign-Up Test</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={testSignUp}
                disabled={testing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {testing ? '🔄 Testing Sign-Up...' : '📝 Test Sign-Up'}
              </button>
            </div>
          </div>

          {/* Sign In Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sign-In Test</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={testSignIn}
                disabled={testing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? '🔄 Testing Sign-In...' : '🔑 Test Sign-In'}
              </button>
            </div>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Debug Logs</h2>
          </div>
          <div className="p-6">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run a test to see debug information.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-2 ${
                    log.status === 'error' ? 'text-red-400' :
                    log.status === 'success' ? 'text-green-400' :
                    log.status === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">{log.event}</span>
                      <span className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-gray-300 text-xs ml-2 mt-1">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}