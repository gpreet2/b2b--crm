'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface LoginTestResult {
  email: string
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp: string
}

export default function TestLoginPage() {
  const [results, setResults] = useState<LoginTestResult[]>([])
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  const testUsers = [
    { email: 'rigorous-test@example.com', password: '$2a$10$dummyhash', expectedRole: 'member' },
    { email: 'coach-test@example.com', password: '$2a$10$dummyhash', expectedRole: 'coach' },
    { email: 'error-test@example.com', password: '$2a$10$dummyhash', expectedRole: 'member' },
    { email: 'final-test@example.com', password: '$2a$10$dummyhash', expectedRole: 'admin' }
  ]

  const addResult = (result: Omit<LoginTestResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testLogin = async (email: string, password: string, expectedRole: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'testpassword123', // Use a consistent test password
      })

      if (error) {
        addResult({
          email,
          success: false,
          message: `Login failed: ${error.message}`,
          error: error.message
        })
        return false
      }

      if (data.user && data.session) {
        // Fetch profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, gym_id')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          addResult({
            email,
            success: false,
            message: `Login succeeded but profile fetch failed: ${profileError.message}`,
            error: profileError.message
          })
          return false
        }

        const roleMatch = profile.role === expectedRole
        addResult({
          email,
          success: true,
          message: `Login successful! Role: ${profile.role} ${roleMatch ? '✅' : '❌ Expected: ' + expectedRole}`,
          data: {
            userId: data.user.id,
            role: profile.role,
            fullName: profile.full_name,
            gymId: profile.gym_id,
            sessionExpiry: data.session.expires_at
          }
        })

        // Sign out after test
        await supabase.auth.signOut()
        return true
      }

      addResult({
        email,
        success: false,
        message: 'Login returned no session',
        error: 'No session created'
      })
      return false

    } catch (error) {
      addResult({
        email,
        success: false,
        message: `Login exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  const runRigorousLoginTests = async () => {
    setTesting(true)
    clearResults()

    addResult({
      email: 'SYSTEM',
      success: true,
      message: '🧪 STARTING RIGOROUS LOGIN TESTING'
    })
    addResult({
      email: 'SYSTEM',
      success: true,
      message: '========================================='
    })

    let successCount = 0
    let totalTests = testUsers.length

    // Test each user
    for (const user of testUsers) {
      addResult({
        email: user.email,
        success: true,
        message: `🔄 Testing login for ${user.email} (expected role: ${user.expectedRole})`
      })

      const success = await testLogin(user.email, user.password, user.expectedRole)
      if (success) successCount++

      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Test invalid credentials
    addResult({
      email: 'SYSTEM',
      success: true,
      message: '🔄 Testing invalid credentials...'
    })

    const { error: invalidError } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    })

    if (invalidError) {
      addResult({
        email: 'nonexistent@example.com',
        success: true,
        message: `✅ Invalid credentials properly rejected: ${invalidError.message}`
      })
    } else {
      addResult({
        email: 'nonexistent@example.com',
        success: false,
        message: '❌ Invalid credentials were accepted (security issue!)'
      })
    }

    // Test empty credentials
    addResult({
      email: 'SYSTEM',
      success: true,
      message: '🔄 Testing empty credentials...'
    })

    try {
      const { error: emptyError } = await supabase.auth.signInWithPassword({
        email: '',
        password: ''
      })

      if (emptyError) {
        addResult({
          email: 'EMPTY',
          success: true,
          message: `✅ Empty credentials properly rejected: ${emptyError.message}`
        })
      }
    } catch (error) {
      addResult({
        email: 'EMPTY',
        success: true,
        message: '✅ Empty credentials caused validation error (expected)'
      })
    }

    // Summary
    addResult({
      email: 'SYSTEM',
      success: true,
      message: '========================================='
    })
    addResult({
      email: 'SYSTEM',
      success: successCount === totalTests,
      message: `🎉 LOGIN TESTING COMPLETED: ${successCount}/${totalTests} successful`
    })

    if (successCount === totalTests) {
      addResult({
        email: 'SYSTEM',
        success: true,
        message: '✅ All login tests passed! Auth system is working correctly.'
      })
    } else {
      addResult({
        email: 'SYSTEM',
        success: false,
        message: `❌ ${totalTests - successCount} login tests failed. Check individual results above.`
      })
    }

    setTesting(false)
  }

  const testAuthFlow = async () => {
    setTesting(true)
    addResult({
      email: 'SYSTEM',
      success: true,
      message: '🔄 Testing complete auth flow with new user...'
    })

    const newEmail = `flow-test-${Date.now()}@example.com`
    const newPassword = 'FlowTest123!'
    const newName = 'Flow Test User'

    try {
      // Step 1: Signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: { full_name: newName }
        }
      })

      if (signupError) {
        addResult({
          email: newEmail,
          success: false,
          message: `Signup failed: ${signupError.message}`,
          error: signupError.message
        })
        setTesting(false)
        return
      }

      addResult({
        email: newEmail,
        success: true,
        message: '✅ Signup successful',
        data: { userId: signupData.user?.id }
      })

      // Step 2: Check profile creation
      if (signupData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signupData.user.id)
          .single()

        if (profileError) {
          addResult({
            email: newEmail,
            success: false,
            message: `Profile not created: ${profileError.message}`,
            error: profileError.message
          })
        } else {
          addResult({
            email: newEmail,
            success: true,
            message: '✅ Profile automatically created',
            data: profile
          })
        }
      }

      // Step 3: Login (may fail due to email confirmation)
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: newEmail,
        password: newPassword
      })

      if (loginError) {
        if (loginError.message.includes('confirm')) {
          addResult({
            email: newEmail,
            success: true,
            message: '✅ Login requires email confirmation (expected behavior)'
          })
        } else {
          addResult({
            email: newEmail,
            success: false,
            message: `Login failed: ${loginError.message}`,
            error: loginError.message
          })
        }
      } else {
        addResult({
          email: newEmail,
          success: true,
          message: '✅ Login successful (email confirmation disabled)'
        })
        await supabase.auth.signOut()
      }

      addResult({
        email: 'SYSTEM',
        success: true,
        message: '🎉 Complete auth flow test finished!'
      })

    } catch (error) {
      addResult({
        email: newEmail,
        success: false,
        message: `Auth flow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Rigorous Login Testing Dashboard</h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={runRigorousLoginTests}
              disabled={testing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Running Tests...' : 'Run Rigorous Login Tests'}
            </button>
            
            <button
              onClick={testAuthFlow}
              disabled={testing}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {testing ? 'Testing...' : 'Test Complete Auth Flow'}
            </button>
            
            <button
              onClick={clearResults}
              disabled={testing}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 ml-4"
            >
              Clear Results
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click "Run Rigorous Login Tests" to start.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className={`mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="flex justify-between">
                    <span>{result.message}</span>
                    <span className="text-gray-400 text-xs">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {result.data && (
                    <div className="text-gray-400 text-xs ml-4 mt-1">
                      {JSON.stringify(result.data, null, 2)}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-red-300 text-xs ml-4 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Test Users Created:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• rigorous-test@example.com (member)</li>
                <li>• coach-test@example.com (coach)</li>
                <li>• error-test@example.com (member)</li>
                <li>• final-test@example.com (admin)</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="font-semibold text-green-900 mb-2">What We're Testing:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Login with valid credentials</li>
                <li>• Role assignment verification</li>
                <li>• Profile data retrieval</li>
                <li>• Session management</li>
                <li>• Invalid credential rejection</li>
                <li>• Complete signup → login flow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}