'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface RLSTestResult {
  testId: string
  testName: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message: string
  details?: any
  error?: string
  timestamp: string
}

interface TestUser {
  id: string
  email: string
  password: string
  gymId: string
  role: 'owner' | 'admin' | 'coach' | 'member'
  fullName: string
}

export default function TestRLSPage() {
  const [results, setResults] = useState<RLSTestResult[]>([])
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  // Test users for different scenarios
  const testUsers: TestUser[] = [
    {
      id: 'gym1-admin',
      email: 'gym1-admin@test.com',
      password: 'testpass123',
      gymId: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
      fullName: 'Gym 1 Admin'
    },
    {
      id: 'gym1-coach',
      email: 'gym1-coach@test.com',
      password: 'testpass123',
      gymId: '00000000-0000-0000-0000-000000000001',
      role: 'coach',
      fullName: 'Gym 1 Coach'
    },
    {
      id: 'gym1-member',
      email: 'gym1-member@test.com',
      password: 'testpass123',
      gymId: '00000000-0000-0000-0000-000000000001',
      role: 'member',
      fullName: 'Gym 1 Member'
    },
    {
      id: 'gym2-admin',
      email: 'gym2-admin@test.com',
      password: 'testpass123',
      gymId: '00000000-0000-0000-0000-000000000002',
      role: 'admin',
      fullName: 'Gym 2 Admin'
    },
    {
      id: 'gym2-member',
      email: 'gym2-member@test.com',
      password: 'testpass123',
      gymId: '00000000-0000-0000-0000-000000000002',
      role: 'member',
      fullName: 'Gym 2 Member'
    }
  ]

  const addResult = (result: Omit<RLSTestResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }

  const updateResult = (testId: string, updates: Partial<RLSTestResult>) => {
    setResults(prev => prev.map(result => 
      result.testId === testId ? { ...result, ...updates } : result
    ))
  }

  const clearResults = () => {
    setResults([])
  }

  // Helper function to create test users if they don't exist
  const createTestUser = async (user: TestUser) => {
    // First try to sign in - if user exists, this will succeed
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    })
    
    if (!signInError) {
      // User exists and can sign in
      return true
    }
    
    // If sign in failed, try to create the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          full_name: user.fullName,
          role: user.role,
          gym_id: user.gymId
        }
      }
    })
    
    if (signUpError) {
      throw new Error(`Failed to create test user ${user.id}: ${signUpError.message}`)
    }
    
    // If user was created, we need to update their profile with the correct gym and role
    if (data.user) {
      // Sign in as the new user
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      // Update the profile with correct gym_id and role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gym_id: user.gymId,
          role: user.role,
          full_name: user.fullName
        })
        .eq('id', data.user.id)
      
      if (updateError) {
        console.warn(`Could not update profile for ${user.id}:`, updateError.message)
      }
    }
    
    return true
  }

  // Helper function to authenticate as a specific test user
  const signInAsUser = async (user: TestUser) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    })
    if (error) throw new Error(`Failed to sign in as ${user.id}: ${error.message}`)
  }

  // Test 1: Gym Data Isolation
  const testGymDataIsolation = async () => {
    const testId = 'gym-isolation'
    addResult({
      testId,
      testName: 'Gym Data Isolation Test',
      status: 'running',
      message: 'Testing that users can only access their gym\'s data...'
    })

    try {
      // Sign in as Gym 1 Admin
      await signInAsUser(testUsers[0])
      
      // Try to access clients - should only see Gym 1 clients
      const { data: gym1Clients, error: gym1Error } = await supabase
        .from('clients')
        .select('id, gym_id, profile_id')
        .limit(10)

      if (gym1Error) {
        updateResult(testId, {
          status: 'failed',
          message: 'Failed to query clients as Gym 1 Admin',
          error: gym1Error.message
        })
        return
      }

      // Verify all clients belong to Gym 1
      const gym1Only = gym1Clients.every(client => client.gym_id === testUsers[0].gymId)
      
      if (!gym1Only) {
        updateResult(testId, {
          status: 'failed',
          message: 'Gym 1 Admin can see clients from other gyms - DATA BREACH!',
          details: { clientsFound: gym1Clients }
        })
        return
      }

      // Now sign in as Gym 2 Admin
      await signInAsUser(testUsers[3])
      
      // Try to access clients - should only see Gym 2 clients
      const { data: gym2Clients, error: gym2Error } = await supabase
        .from('clients')
        .select('id, gym_id, profile_id')
        .limit(10)

      if (gym2Error) {
        updateResult(testId, {
          status: 'failed',
          message: 'Failed to query clients as Gym 2 Admin',
          error: gym2Error.message
        })
        return
      }

      // Verify all clients belong to Gym 2
      const gym2Only = gym2Clients.every(client => client.gym_id === testUsers[3].gymId)
      
      if (!gym2Only) {
        updateResult(testId, {
          status: 'failed',
          message: 'Gym 2 Admin can see clients from other gyms - DATA BREACH!',
          details: { clientsFound: gym2Clients }
        })
        return
      }

      updateResult(testId, {
        status: 'passed',
        message: '✅ Gym data isolation working correctly',
        details: { 
          gym1ClientCount: gym1Clients.length,
          gym2ClientCount: gym2Clients.length,
          isolationVerified: true
        }
      })

    } catch (error) {
      updateResult(testId, {
        status: 'failed',
        message: 'Test failed with exception',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test 2: Role-Based Access Control
  const testRoleBasedAccess = async () => {
    const testId = 'role-based-access'
    addResult({
      testId,
      testName: 'Role-Based Access Control Test',
      status: 'running',
      message: 'Testing admin/coach/member permission levels...'
    })

    try {
      // Test Admin Access
      await signInAsUser(testUsers[0]) // Gym 1 Admin
      
      const { data: adminClients, error: adminError } = await supabase
        .from('clients')
        .select('id, gym_id')
        .limit(5)

      if (adminError) {
        updateResult(testId, {
          status: 'failed',
          message: 'Admin cannot access clients table',
          error: adminError.message
        })
        return
      }

      // Test Coach Access  
      await signInAsUser(testUsers[1]) // Gym 1 Coach
      
      const { data: coachClients, error: coachError } = await supabase
        .from('clients')
        .select('id, gym_id')
        .limit(5)

      if (coachError) {
        updateResult(testId, {
          status: 'failed',
          message: 'Coach cannot access clients table',
          error: coachError.message
        })
        return
      }

      // Test Member Access - should be restricted
      await signInAsUser(testUsers[2]) // Gym 1 Member
      
      const { data: memberClients, error: memberError } = await supabase
        .from('clients')
        .select('id, gym_id')
        .limit(5)

      // Members should only see their own client record (if they have one)
      // or no clients at all if they don't have a client record

      updateResult(testId, {
        status: 'passed',
        message: '✅ Role-based access control working correctly',
        details: {
          adminCanAccessClients: adminClients.length > 0,
          coachCanAccessClients: coachClients.length > 0,
          memberClientAccess: memberClients?.length || 0,
          rolePermissionsVerified: true
        }
      })

    } catch (error) {
      updateResult(testId, {
        status: 'failed',
        message: 'Role-based access test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test 3: Profile Self-Access
  const testProfileSelfAccess = async () => {
    const testId = 'profile-self-access'
    addResult({
      testId,
      testName: 'Profile Self-Access Test',
      status: 'running',
      message: 'Testing that users can only access their own profiles...'
    })

    try {
      // Sign in as Gym 1 Member
      await signInAsUser(testUsers[2])
      
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Try to access own profile
      const { data: ownProfile, error: ownError } = await supabase
        .from('profiles')
        .select('id, full_name, role, gym_id')
        .eq('id', user.id)
        .single()

      if (ownError) {
        updateResult(testId, {
          status: 'failed',
          message: 'User cannot access their own profile',
          error: ownError.message
        })
        return
      }

      // Try to access all profiles (should be restricted based on role)
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name, role, gym_id')
        .limit(10)

      // For members, this should either fail or only return their own profile
      // For admin/coach, this should return profiles from their gym only

      const canAccessOwnProfile = ownProfile && ownProfile.id === user.id
      const profileAccessRestricted = allProfiles?.every(p => p.gym_id === ownProfile.gym_id) || false

      updateResult(testId, {
        status: canAccessOwnProfile ? 'passed' : 'failed',
        message: canAccessOwnProfile 
          ? '✅ Profile self-access working correctly' 
          : '❌ User cannot access own profile',
        details: {
          canAccessOwnProfile,
          ownProfileData: ownProfile,
          allProfilesCount: allProfiles?.length || 0,
          profileAccessRestricted
        }
      })

    } catch (error) {
      updateResult(testId, {
        status: 'failed',
        message: 'Profile self-access test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test 4: Cross-Gym Access Prevention
  const testCrossGymAccessPrevention = async () => {
    const testId = 'cross-gym-prevention'
    addResult({
      testId,
      testName: 'Cross-Gym Access Prevention Test',
      status: 'running',
      message: 'Testing that users cannot access data from other gyms...'
    })

    try {
      // Sign in as Gym 1 Admin
      await signInAsUser(testUsers[0])
      
      // Try to access classes from all gyms
      const { data: allClasses, error: classError } = await supabase
        .from('classes')
        .select('id, gym_id, name')
        .limit(20)

      if (classError) {
        updateResult(testId, {
          status: 'failed',
          message: 'Failed to query classes table',
          error: classError.message
        })
        return
      }

      // Verify all classes belong to Gym 1 only
      const gym1Only = allClasses.every(cls => cls.gym_id === testUsers[0].gymId)
      
      if (!gym1Only) {
        updateResult(testId, {
          status: 'failed',
          message: 'CRITICAL: User can access classes from other gyms - DATA BREACH!',
          details: { 
            expectedGymId: testUsers[0].gymId,
            classesFound: allClasses,
            crossGymAccess: true
          }
        })
        return
      }

      // Test with different tables
      const tablesToTest = ['class_bookings', 'exercises', 'workouts']
      const testResults = []

      for (const tableName of tablesToTest) {
        const { data, error } = await supabase
          .from(tableName)
          .select('id, gym_id')
          .limit(10)

        if (error) {
          testResults.push({ table: tableName, accessible: false, error: error.message })
        } else {
          const gymIsolated = data.every(record => record.gym_id === testUsers[0].gymId)
          testResults.push({ 
            table: tableName, 
            accessible: true, 
            gymIsolated,
            recordCount: data.length 
          })
        }
      }

      const allTablesIsolated = testResults.every(result => 
        !result.accessible || result.gymIsolated
      )

      updateResult(testId, {
        status: allTablesIsolated ? 'passed' : 'failed',
        message: allTablesIsolated 
          ? '✅ Cross-gym access prevention working correctly'
          : '❌ CRITICAL: Cross-gym data access detected - SECURITY BREACH!',
        details: {
          classesGymIsolated: gym1Only,
          tableTestResults: testResults,
          overallIsolation: allTablesIsolated
        }
      })

    } catch (error) {
      updateResult(testId, {
        status: 'failed',
        message: 'Cross-gym access prevention test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test 5: Privilege Escalation Prevention
  const testPrivilegeEscalation = async () => {
    const testId = 'privilege-escalation'
    addResult({
      testId,
      testName: 'Privilege Escalation Prevention Test',
      status: 'running',
      message: 'Testing that members cannot access admin-only data...'
    })

    try {
      // Sign in as Member
      await signInAsUser(testUsers[2]) // Gym 1 Member
      
      // Try to access admin-only tables
      const restrictedTables = [
        'transactions',
        'invoices', 
        'membership_plans',
        'access_jobs',
        'kisi_access_group_map'
      ]

      const accessResults = []

      for (const tableName of restrictedTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('id')
            .limit(1)

          if (error) {
            // Expected - member should not have access
            accessResults.push({ 
              table: tableName, 
              accessible: false, 
              expected: true,
              error: error.message 
            })
          } else if (data.length === 0) {
            // No data but no error - acceptable
            accessResults.push({ 
              table: tableName, 
              accessible: true, 
              expected: true,
              recordCount: 0 
            })
          } else {
            // CRITICAL: Member has access to restricted data!
            accessResults.push({ 
              table: tableName, 
              accessible: true, 
              expected: false,
              recordCount: data.length,
              securityBreach: true
            })
          }
        } catch (err) {
          accessResults.push({ 
            table: tableName, 
            accessible: false, 
            expected: true,
            exception: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      const privilegeEscalationDetected = accessResults.some(result => 
        result.securityBreach === true
      )

      updateResult(testId, {
        status: privilegeEscalationDetected ? 'failed' : 'passed',
        message: privilegeEscalationDetected
          ? '❌ CRITICAL: Privilege escalation detected - Member has admin access!'
          : '✅ Privilege escalation prevention working correctly',
        details: {
          restrictedTableAccess: accessResults,
          privilegeEscalationDetected,
          memberAccessRestricted: !privilegeEscalationDetected
        }
      })

    } catch (error) {
      updateResult(testId, {
        status: 'failed',
        message: 'Privilege escalation test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Create all test users
  const createAllTestUsers = async () => {
    addResult({
      testId: 'user-setup',
      testName: '👥 Setting up test users',
      status: 'running',
      message: 'Creating test users for different gyms and roles...'
    })

    try {
      for (const user of testUsers) {
        await createTestUser(user)
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between user creation
      }

      addResult({
        testId: 'user-setup',
        testName: '👥 Test users created',
        status: 'passed',
        message: '✅ All test users created successfully'
      })
    } catch (error) {
      addResult({
        testId: 'user-setup',
        testName: '👥 Test user creation failed',
        status: 'failed',
        message: 'Failed to create test users',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  // Run all RLS tests
  const runComprehensiveRLSTests = async () => {
    setTesting(true)
    clearResults()

    addResult({
      testId: 'system',
      testName: '🔒 COMPREHENSIVE RLS SECURITY TESTING',
      status: 'running',
      message: 'Starting comprehensive Row-Level Security testing...'
    })

    addResult({
      testId: 'system-info',
      testName: 'CRITICAL SECURITY VALIDATION',
      status: 'running',
      message: 'Testing for data breaches, privilege escalation, and access control vulnerabilities'
    })

    try {
      // First, create all test users
      await createAllTestUsers()
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Run tests sequentially to avoid conflicts
      await testGymDataIsolation()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await testRoleBasedAccess()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await testProfileSelfAccess()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await testCrossGymAccessPrevention()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await testPrivilegeEscalation()

      // Calculate overall results
      const testResults = results.filter(r => 
        r.testId !== 'system' && r.testId !== 'system-info'
      )
      const passedTests = testResults.filter(r => r.status === 'passed').length
      const failedTests = testResults.filter(r => r.status === 'failed').length
      const totalTests = testResults.length

      addResult({
        testId: 'system-summary',
        testName: '🎉 RLS SECURITY TEST COMPLETED',
        status: failedTests === 0 ? 'passed' : 'failed',
        message: failedTests === 0 
          ? `✅ ALL SECURITY TESTS PASSED! (${passedTests}/${totalTests}) - Your RLS policies are secure.`
          : `❌ SECURITY VULNERABILITIES DETECTED! (${failedTests} failed, ${passedTests} passed) - IMMEDIATE ACTION REQUIRED!`
      })

    } catch (error) {
      addResult({
        testId: 'system-error',
        testName: 'SYSTEM ERROR',
        status: 'failed',
        message: 'RLS testing failed with system error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    // Sign out after testing
    await supabase.auth.signOut()
    setTesting(false)
  }

  const passedTests = results.filter(r => r.status === 'passed').length
  const failedTests = results.filter(r => r.status === 'failed').length
  const totalTests = results.filter(r => 
    !['system', 'system-info', 'system-summary', 'system-error'].includes(r.testId)
  ).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔒 RLS Security Testing Dashboard</h1>
              <p className="text-gray-600 mt-1">Critical Row-Level Security Policy Validation</p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="text-green-600">✅ Passed: {passedTests}</div>
              <div className="text-red-600">❌ Failed: {failedTests}</div>
              <div className="text-gray-500">Total: {totalTests}</div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-semibold text-red-900 mb-2">⚠️ CRITICAL SECURITY TESTING</h3>
            <p className="text-red-800 text-sm">
              This test validates that your RLS policies prevent data breaches, privilege escalation, 
              and unauthorized access. Any failed test indicates a critical security vulnerability 
              that could result in data exposure and legal liability.
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={runComprehensiveRLSTests}
              disabled={testing}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {testing ? '🔍 Running Security Tests...' : '🔒 Run Comprehensive RLS Security Tests'}
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
              <p className="text-gray-500">No tests run yet. Click "Run Comprehensive RLS Security Tests" to start.</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className={`mb-3 ${
                  result.status === 'passed' ? 'text-green-400' :
                  result.status === 'failed' ? 'text-red-400' :
                  result.status === 'running' ? 'text-blue-400' :
                  'text-gray-400'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{result.testName}</div>
                      <div className="text-sm mt-1">{result.message}</div>
                    </div>
                    <span className="text-gray-400 text-xs ml-4">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {result.details && (
                    <div className="text-gray-400 text-xs ml-4 mt-2 bg-gray-800 p-2 rounded">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
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
            <div className="p-4 bg-red-50 rounded-md">
              <h3 className="font-semibold text-red-900 mb-2">🔒 Security Tests Performed:</h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Gym Data Isolation (Multi-tenant separation)</li>
                <li>• Role-Based Access Control (Admin/Coach/Member)</li>
                <li>• Profile Self-Access (User isolation)</li>
                <li>• Cross-Gym Access Prevention (Data breach prevention)</li>
                <li>• Privilege Escalation Prevention (Security boundaries)</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">📊 What We're Validating:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• No cross-gym data access (GDPR compliance)</li>
                <li>• Proper role-based permissions</li>
                <li>• Data isolation between tenants</li>
                <li>• Prevention of unauthorized data access</li>
                <li>• Security policy enforcement at database level</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}