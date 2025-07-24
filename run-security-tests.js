#!/usr/bin/env node

// CRITICAL RLS SECURITY VALIDATION
// This script tests Row-Level Security policies to prevent data breaches

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ulymixjoyuhapqxkcwbi.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseW1peGpveXVoYXBxeGtjd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjU1NDQsImV4cCI6MjA2ODkwMTU0NH0.TKwAES_wwzZKSxkD-W7OvS0a_ujtGAuNdSfn0LE-vAM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  {
    id: 'gym1-admin',
    email: 'gym1admin@testvalidation.com',
    password: 'SecurePass123!',
    gymId: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
    fullName: 'Gym 1 Admin'
  },
  {
    id: 'gym2-admin', 
    email: 'gym2admin@testvalidation.com',
    password: 'SecurePass123!',
    gymId: '00000000-0000-0000-0000-000000000002',
    role: 'admin',
    fullName: 'Gym 2 Admin'
  }
]

let testResults = []

function logResult(testName, status, message, details = null) {
  const result = {
    test: testName,
    status: status, // 'PASS', 'FAIL', 'ERROR'
    message,
    details,
    timestamp: new Date().toISOString()
  }
  testResults.push(result)
  
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${emoji} ${testName}: ${message}`)
  if (details) {
    console.log(`   Details:`, JSON.stringify(details, null, 2))
  }
}

async function createOrSignInUser(user) {
  try {
    // Try signing in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    })
    
    if (!signInError) {
      logResult(`User Setup (${user.id})`, 'PASS', 'User already exists and can sign in')
      return true
    }
    
    // Create user if doesn't exist
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
      logResult(`User Setup (${user.id})`, 'ERROR', `Failed to create user: ${signUpError.message}`)
      return false
    }
    
    if (data?.user) {
      logResult(`User Setup (${user.id})`, 'PASS', 'User created successfully')
      
      // Sign in as the new user to update profile
      await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      // Update profile with correct gym and role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gym_id: user.gymId,
          role: user.role,
          full_name: user.fullName
        })
        .eq('id', data.user.id)
      
      if (updateError) {
        logResult(`Profile Update (${user.id})`, 'ERROR', `Could not update profile: ${updateError.message}`)
      } else {
        logResult(`Profile Update (${user.id})`, 'PASS', 'Profile updated with correct gym and role')
      }
    }
    
    return true
  } catch (error) {
    logResult(`User Setup (${user.id})`, 'ERROR', `Exception during user setup: ${error.message}`)
    return false
  }
}

async function testGymDataIsolation() {
  console.log('\n🔒 CRITICAL TEST 1: GYM DATA ISOLATION')
  console.log('=' .repeat(50))
  
  try {
    // Test Gym 1 Admin access
    await supabase.auth.signInWithPassword({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
    
    const { data: gym1Clients, error: gym1Error } = await supabase
      .from('clients')
      .select('id, gym_id, email')
      .limit(10)
    
    if (gym1Error) {
      logResult('Gym 1 Client Access', 'ERROR', `Cannot access clients: ${gym1Error.message}`)
      return
    }
    
    logResult('Gym 1 Client Access', 'PASS', `Gym 1 Admin can access ${gym1Clients.length} clients`)
    
    // CRITICAL: Check if all clients belong to Gym 1
    const expectedGymId = testUsers[0].gymId
    const crossGymAccess = gym1Clients.filter(client => client.gym_id !== expectedGymId)
    
    if (crossGymAccess.length > 0) {
      logResult('Gym Data Isolation', 'FAIL', 
        '🚨 CRITICAL SECURITY BREACH: Gym 1 Admin can see other gyms\' data!',
        { 
          expectedGymId,
          unauthorizedAccess: crossGymAccess,
          totalClients: gym1Clients.length,
          breachCount: crossGymAccess.length
        }
      )
    } else {
      logResult('Gym Data Isolation', 'PASS', 
        'Gym 1 data properly isolated - no cross-gym access',
        { 
          gymId: expectedGymId,
          clientCount: gym1Clients.length,
          allClientsMatch: true
        }
      )
    }
    
    // Test Gym 2 Admin access
    await supabase.auth.signInWithPassword({
      email: testUsers[1].email,
      password: testUsers[1].password
    })
    
    const { data: gym2Clients, error: gym2Error } = await supabase
      .from('clients')
      .select('id, gym_id, email')
      .limit(10)
    
    if (gym2Error) {
      logResult('Gym 2 Client Access', 'ERROR', `Cannot access clients: ${gym2Error.message}`)
      return
    }
    
    logResult('Gym 2 Client Access', 'PASS', `Gym 2 Admin can access ${gym2Clients.length} clients`)
    
    // CRITICAL: Check if all clients belong to Gym 2
    const expectedGym2Id = testUsers[1].gymId
    const crossGym2Access = gym2Clients.filter(client => client.gym_id !== expectedGym2Id)
    
    if (crossGym2Access.length > 0) {
      logResult('Gym 2 Data Isolation', 'FAIL', 
        '🚨 CRITICAL SECURITY BREACH: Gym 2 Admin can see other gyms\' data!',
        { 
          expectedGymId: expectedGym2Id,
          unauthorizedAccess: crossGym2Access,
          totalClients: gym2Clients.length,
          breachCount: crossGym2Access.length
        }
      )
    } else {
      logResult('Gym 2 Data Isolation', 'PASS', 
        'Gym 2 data properly isolated - no cross-gym access',
        { 
          gymId: expectedGym2Id,
          clientCount: gym2Clients.length,
          allClientsMatch: true
        }
      )
    }
    
  } catch (error) {
    logResult('Gym Data Isolation', 'ERROR', `Test failed with exception: ${error.message}`)
  }
}

async function testProfileAccess() {
  console.log('\n🔒 CRITICAL TEST 2: PROFILE ACCESS CONTROL')
  console.log('=' .repeat(50))
  
  try {
    // Test Gym 1 Admin profile access
    await supabase.auth.signInWithPassword({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logResult('Profile Access', 'ERROR', 'No authenticated user found')
      return
    }
    
    // Test accessing own profile
    const { data: ownProfile, error: ownError } = await supabase
      .from('profiles')
      .select('id, full_name, role, gym_id')
      .eq('id', user.id)
      .single()
    
    if (ownError) {
      logResult('Own Profile Access', 'FAIL', `Cannot access own profile: ${ownError.message}`)
    } else {
      logResult('Own Profile Access', 'PASS', 'User can access their own profile', ownProfile)
    }
    
    // Test accessing all profiles (should be restricted to same gym)
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, role, gym_id')
      .limit(10)
    
    if (allError) {
      logResult('All Profiles Access', 'ERROR', `Cannot query profiles: ${allError.message}`)
    } else {
      const expectedGymId = testUsers[0].gymId
      const crossGymProfiles = allProfiles.filter(p => p.gym_id !== expectedGymId)
      
      if (crossGymProfiles.length > 0) {
        logResult('Profile Access Control', 'FAIL',
          '🚨 SECURITY BREACH: Can access profiles from other gyms!',
          {
            expectedGymId,
            totalProfiles: allProfiles.length,
            crossGymAccess: crossGymProfiles,
            breachCount: crossGymProfiles.length
          }
        )
      } else {
        logResult('Profile Access Control', 'PASS',
          'Profile access properly restricted to same gym',
          {
            gymId: expectedGymId,
            profileCount: allProfiles.length,
            allProfilesMatch: true
          }
        )
      }
    }
    
  } catch (error) {
    logResult('Profile Access Control', 'ERROR', `Test failed: ${error.message}`)
  }
}

async function runComprehensiveRLSTests() {
  console.log('🔒 CRITICAL RLS SECURITY VALIDATION')
  console.log('🚨 TESTING FOR DATA BREACHES AND UNAUTHORIZED ACCESS')
  console.log('=' .repeat(70))
  
  // Setup test users
  console.log('\n👥 SETTING UP TEST USERS')
  console.log('=' .repeat(30))
  
  for (const user of testUsers) {
    await createOrSignInUser(user)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Run security tests
  await testGymDataIsolation()
  await testProfileAccess()
  
  // Generate security report
  console.log('\n📊 SECURITY TEST SUMMARY')
  console.log('=' .repeat(30))
  
  const passedTests = testResults.filter(r => r.status === 'PASS').length
  const failedTests = testResults.filter(r => r.status === 'FAIL').length
  const errorTests = testResults.filter(r => r.status === 'ERROR').length
  const totalTests = testResults.length
  
  console.log(`✅ PASSED: ${passedTests}`)
  console.log(`❌ FAILED: ${failedTests}`)
  console.log(`⚠️ ERRORS: ${errorTests}`)
  console.log(`📊 TOTAL: ${totalTests}`)
  
  if (failedTests > 0) {
    console.log('\n🚨 CRITICAL SECURITY VULNERABILITIES DETECTED!')
    console.log('❌ Your RLS policies have FAILED security validation')
    console.log('⚠️ This represents a MASSIVE LIABILITY - immediate action required!')
    console.log('\nFailed Tests:')
    testResults.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`)
    })
  } else if (errorTests > 0) {
    console.log('\n⚠️ Some tests encountered errors - investigation needed')
  } else {
    console.log('\n✅ ALL SECURITY TESTS PASSED!')
    console.log('🛡️ Your RLS policies are properly preventing data breaches')
    console.log('🎉 Multi-tenant data isolation is working correctly')
  }
  
  // Sign out
  await supabase.auth.signOut()
  
  return { passedTests, failedTests, errorTests, totalTests }
}

// Run the tests
runComprehensiveRLSTests()
  .then(results => {
    console.log('\n🏁 RLS Security Validation Complete')
    process.exit(results.failedTests > 0 ? 1 : 0)
  })
  .catch(error => {
    console.error('\n💥 CRITICAL ERROR during security testing:', error.message)
    process.exit(1)
  })