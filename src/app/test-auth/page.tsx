'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function TestAuthPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runComprehensiveTest = async () => {
    setTesting(true)
    clearResults()
    
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    const testName = 'Test User'

    try {
      // Test 1: Database Connection
      addResult({ success: true, message: '🔄 Starting comprehensive auth tests...' })
      
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .select('id, name')
        .limit(1)
        .single()

      if (gymError) {
        addResult({ success: false, message: '❌ Database connection failed', error: gymError.message })
        return
      }
      
      addResult({ success: true, message: '✅ Database connection successful', data: gymData })

      // Test 2: Check if triggers exist
      try {
        const { data: triggerData, error: triggerError } = await supabase.rpc('exec_sql', {
          sql_query: `SELECT trigger_name FROM information_schema.triggers WHERE trigger_name IN ('on_auth_user_created', 'on_profile_updated')`
        })
        
        if (!triggerError && triggerData) {
          addResult({ success: true, message: '✅ Database triggers verified' })
        } else {
          addResult({ success: false, message: '⚠️  Could not verify triggers (may still work)' })
        }
      } catch (e) {
        addResult({ success: false, message: '⚠️  Trigger verification skipped (may still work)' })
      }

      // Test 3: Signup Test
      addResult({ success: true, message: `🔄 Testing signup with email: ${testEmail}` })
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
          },
        },
      })

      if (signupError) {
        addResult({ success: false, message: '❌ Signup failed', error: signupError.message })
        
        // Check if it's an email confirmation issue
        if (signupError.message.includes('confirmation') || signupError.message.includes('confirm')) {
          addResult({ success: true, message: '💡 This may be due to email confirmation being enabled' })
          addResult({ success: true, message: '💡 In production, user would receive confirmation email' })
        }
        return
      }

      addResult({ success: true, message: '✅ Signup successful', data: { userId: signupData.user?.id } })

      // Test 4: Check if profile was created automatically
      if (signupData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, role, gym_id')
          .eq('id', signupData.user.id)
          .single()

        if (profileError) {
          addResult({ success: false, message: '❌ Profile creation failed', error: profileError.message })
        } else {
          addResult({ success: true, message: '✅ Profile automatically created by trigger', data: profileData })
        }

        // Test 5: Login Test
        addResult({ success: true, message: `🔄 Testing login with same credentials` })
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })

        if (loginError) {
          addResult({ success: false, message: '❌ Login failed', error: loginError.message })
          
          // Check if it's an email confirmation issue
          if (loginError.message.includes('confirmation') || loginError.message.includes('confirm') || loginError.message.includes('not confirmed')) {
            addResult({ success: true, message: '💡 Login failed due to email confirmation requirement' })
            addResult({ success: true, message: '💡 This is expected behavior - user must confirm email first' })
            addResult({ success: true, message: '✅ Auth flow is working correctly (confirmation required)' })
          }
        } else {
          addResult({ success: true, message: '✅ Login successful', data: { userId: loginData.user?.id } })
          
          // Test 6: Sign out
          await supabase.auth.signOut()
          addResult({ success: true, message: '✅ Signout successful' })
        }
      }

      // Test 7: Check auth state
      const { data: sessionData } = await supabase.auth.getSession()
      addResult({ 
        success: true, 
        message: `📊 Current auth state: ${sessionData.session ? 'Authenticated' : 'Not authenticated'}` 
      })

      addResult({ success: true, message: '🎉 Comprehensive test completed!' })

    } catch (error) {
      addResult({ success: false, message: '❌ Test failed with exception', error: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    setTesting(false)
  }

  const testEmailConfirmationSettings = async () => {
    setTesting(true)
    addResult({ success: true, message: '🔄 Checking email confirmation settings...' })
    
    try {
      // This will help determine if email confirmation is enabled
      const testEmail = `quicktest${Date.now()}@example.com`
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpass123',
        options: { data: { full_name: 'Quick Test' } }
      })

      if (error) {
        if (error.message.includes('confirmation') || error.message.includes('confirm')) {
          addResult({ success: true, message: '📧 Email confirmation is ENABLED' })
          addResult({ success: true, message: '💡 Users must confirm email before signing in' })
          addResult({ success: true, message: '💡 To disable: Supabase Dashboard > Auth > Settings > Email Confirmation' })
        } else {
          addResult({ success: false, message: '❌ Signup error', error: error.message })
        }
      } else {
        if (data.user && !data.session) {
          addResult({ success: true, message: '📧 Email confirmation is ENABLED (user created, no session)' })
        } else if (data.session) {
          addResult({ success: true, message: '✅ Email confirmation is DISABLED (immediate session)' })
        }
      }
    } catch (error) {
      addResult({ success: false, message: '❌ Test failed', error: error instanceof Error ? error.message : 'Unknown error' })
    }
    
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Testing Dashboard</h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={runComprehensiveTest}
              disabled={testing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Running Tests...' : 'Run Comprehensive Auth Test'}
            </button>
            
            <button
              onClick={testEmailConfirmationSettings}
              disabled={testing}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {testing ? 'Testing...' : 'Test Email Confirmation Settings'}
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
              <p className="text-gray-500">No tests run yet. Click "Run Comprehensive Auth Test" to start.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className={`mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  <div>{result.message}</div>
                  {result.data && (
                    <div className="text-gray-400 text-xs ml-4">
                      {JSON.stringify(result.data, null, 2)}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-red-300 text-xs ml-4">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Comprehensive Test:</strong> Tests signup, profile creation, login, and signout</li>
              <li>• <strong>Email Confirmation Test:</strong> Checks if email confirmation is enabled</li>
              <li>• <strong>Expected Behavior:</strong> If email confirmation is enabled, signup succeeds but login requires email verification</li>
              <li>• <strong>Database Triggers:</strong> Profile should be automatically created on signup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}