#!/usr/bin/env node

// COMPREHENSIVE SIGN-IN FLOW TEST
// Tests the exact user that exists in database with full logging

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ulymixjoyuhapqxkcwbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseW1peGpveXVoYXBxeGtjd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjU1NDQsImV4cCI6MjA2ODkwMTU0NH0.TKwAES_wwzZKSxkD-W7OvS0a_ujtGAuNdSfn0LE-vAM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test with the exact user we know exists
const testUser = {
  email: 'gym1admin@testvalidation.com',
  password: 'SecurePass123!',
  expectedUserId: 'e7afb0d0-417c-420f-9aae-a84f6d7d6656',
  expectedGymId: '00000000-0000-0000-0000-000000000001',
  expectedRole: 'admin',
  expectedName: 'Gym 1 Admin'
}

let testResults = {
  signInSuccess: false,
  signInTime: 0,
  profileFetchSuccess: false,
  profileFetchTime: 0,
  authStateChangeReceived: false,
  totalTime: 0,
  errors: []
}

function log(message, data = null) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${message}`)
  if (data) {
    console.log('  Data:', JSON.stringify(data, null, 2))
  }
}

async function testCompleteSignInFlow() {
  log('🔍 STARTING COMPREHENSIVE SIGN-IN TEST')
  log('=' .repeat(60))
  
  const overallStart = Date.now()
  
  // Set up auth state change listener
  let authStateChanges = []
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    authStateChanges.push({
      event,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      timestamp: Date.now()
    })
    log(`📡 Auth State Change: ${event}`, {
      hasUser: !!session?.user,
      userEmail: session?.user?.email
    })
    
    if (event === 'SIGNED_IN') {
      testResults.authStateChangeReceived = true
    }
  })

  try {
    log('1️⃣ STEP 1: Testing Database Connection')
    
    // Test database connection first
    const { data: testQuery, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      log('❌ Database connection failed', { error: testError.message })
      testResults.errors.push('Database connection failed')
      return testResults
    }
    
    log('✅ Database connection successful')

    log('\n2️⃣ STEP 2: Investigating Database State')
    
    // Check if there are any auth users
    log('🔍 Checking auth.users...')
    try {
      const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users')
      if (authError) {
        log('⚠️ Cannot access auth.users directly (expected)', { error: authError.message })
      } else {
        log('📋 Auth users found:', authUsers)
      }
    } catch (e) {
      log('⚠️ auth.users check failed (expected)')
    }

    log('\n3️⃣ STEP 3: Finding Available Test Users')
    
    // First, let's see what users actually exist
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role, gym_id')
      .limit(10)
    
    if (allProfilesError) {
      log('❌ Failed to fetch profiles', { error: allProfilesError.message })
      testResults.errors.push('Failed to fetch profiles')
      return testResults
    }
    
    log('📋 Available profiles in database:', { 
      count: allProfiles?.length || 0,
      profiles: allProfiles 
    })
    
    if (allProfiles?.length === 0) {
      log('🚨 CRITICAL: No profiles found! Testing profile creation...')
      
      // Test creating a new user to see if profiles are created
      const testEmail = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`
      const testPassword = 'TestPass123!'
      
      log(`🔧 Creating test user: ${testEmail}`)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User',
            gym_id: '00000000-0000-0000-0000-000000000001'
          }
        }
      })
      
      if (signUpError) {
        log('❌ Test user creation failed', { error: signUpError.message })
        testResults.errors.push('Test user creation failed')
        return testResults
      }
      
      log('✅ Test user created', { userId: signUpData.user?.id })
      
      // Wait a moment for profile creation trigger
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if profile was created
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, gym_id')
        .eq('id', signUpData.user?.id)
        .single()
      
      if (newProfileError) {
        log('❌ Profile not created automatically', { error: newProfileError.message })
        testResults.errors.push('Profile creation trigger not working')
        return testResults
      }
      
      log('✅ Profile created successfully:', newProfile)
      
      // Use this new user for testing
      testUser.email = testEmail
      testUser.password = testPassword
      testUser.expectedUserId = signUpData.user?.id
      testUser.expectedGymId = newProfile.gym_id
      testUser.expectedRole = newProfile.role
      testUser.expectedName = newProfile.full_name
    } else {
      // Find a user we can test with (use the gym1admin user we know exists)
      const knownUser = allProfiles?.find(p => p.id === 'e7afb0d0-417c-420f-9aae-a84f6d7d6656')
      if (knownUser) {
        testUser.expectedUserId = knownUser.id
        testUser.expectedGymId = knownUser.gym_id
        testUser.expectedRole = knownUser.role
        testUser.expectedName = knownUser.full_name
        log('✅ Found known test user in profiles:', knownUser)
      } else {
        log('⚠️ Known test user not found in profiles, using any available user')
        const availableUser = allProfiles?.find(p => p.role)
        if (!availableUser) {
          log('❌ No suitable test user found')
          testResults.errors.push('No suitable test user found')
          return testResults
        }
        testUser.expectedUserId = availableUser.id
        testUser.expectedGymId = availableUser.gym_id
        testUser.expectedRole = availableUser.role
        testUser.expectedName = availableUser.full_name
      }
    }
    
    log('✅ Using test user:', {
      email: testUser.email,
      id: testUser.expectedUserId,
      role: testUser.expectedRole,
      gym_id: testUser.expectedGymId
    })

    log('\n4️⃣ STEP 4: Testing Sign-In API Call')
    
    const signInStart = Date.now()
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })
    testResults.signInTime = Date.now() - signInStart

    if (signInError) {
      log('❌ Sign-in failed', { 
        error: signInError.message, 
        duration: testResults.signInTime 
      })
      testResults.errors.push(`Sign-in failed: ${signInError.message}`)
      return testResults
    }

    testResults.signInSuccess = true
    log('✅ Sign-in successful', {
      userId: signInData.user?.id,
      email: signInData.user?.email,
      duration: testResults.signInTime
    })

    // Verify user ID matches
    if (signInData.user?.id !== testUser.expectedUserId) {
      log('⚠️ User ID mismatch', {
        expected: testUser.expectedUserId,
        actual: signInData.user?.id
      })
    }

    log('\n5️⃣ STEP 5: Testing Profile Fetch (like auth context does)')
    
    const profileStart = Date.now()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id, role, full_name')
      .eq('id', signInData.user.id)
      .single()
    testResults.profileFetchTime = Date.now() - profileStart

    if (profileError) {
      log('❌ Profile fetch failed', { 
        error: profileError.message, 
        duration: testResults.profileFetchTime 
      })
      testResults.errors.push(`Profile fetch failed: ${profileError.message}`)
    } else {
      testResults.profileFetchSuccess = true
      log('✅ Profile fetch successful', {
        profile,
        duration: testResults.profileFetchTime
      })

      // Verify profile data
      const verifications = [
        { field: 'role', expected: testUser.expectedRole, actual: profile.role },
        { field: 'gym_id', expected: testUser.expectedGymId, actual: profile.gym_id },
        { field: 'full_name', expected: testUser.expectedName, actual: profile.full_name }
      ]

      verifications.forEach(({ field, expected, actual }) => {
        if (expected === actual) {
          log(`✅ ${field} matches: ${actual}`)
        } else {
          log(`⚠️ ${field} mismatch`, { expected, actual })
        }
      })
    }

    log('\n6️⃣ STEP 6: Testing Session Persistence')
    
    // Wait a moment for auth state to settle
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      log('✅ Session persisted', {
        userEmail: sessionData.session.user?.email,
        expiresAt: new Date(sessionData.session.expires_at * 1000).toISOString()
      })
    } else {
      log('❌ Session not persisted')
      testResults.errors.push('Session not persisted')
    }

    log('\n7️⃣ STEP 7: Auth State Changes Summary')
    
    log(`Captured ${authStateChanges.length} auth state changes:`)
    authStateChanges.forEach((change, index) => {
      log(`  ${index + 1}. ${change.event} - ${change.userEmail || 'no user'}`)
    })

    if (!testResults.authStateChangeReceived) {
      log('⚠️ SIGNED_IN auth state change not received')
      testResults.errors.push('SIGNED_IN auth state change not received')
    }

    log('\n8️⃣ STEP 8: Testing Sign-Out')
    
    await supabase.auth.signOut()
    log('✅ Signed out successfully')

  } catch (error) {
    log('💥 Exception during test', { error: error.message })
    testResults.errors.push(`Exception: ${error.message}`)
  } finally {
    subscription.unsubscribe()
    testResults.totalTime = Date.now() - overallStart
  }

  log('\n📊 FINAL TEST RESULTS')
  log('=' .repeat(40))
  log(`✅ Sign-in Success: ${testResults.signInSuccess}`)
  log(`⏱️ Sign-in Time: ${testResults.signInTime}ms`)
  log(`✅ Profile Fetch Success: ${testResults.profileFetchSuccess}`)
  log(`⏱️ Profile Fetch Time: ${testResults.profileFetchTime}ms`)
  log(`📡 Auth State Change Received: ${testResults.authStateChangeReceived}`)
  log(`⏱️ Total Test Time: ${testResults.totalTime}ms`)
  log(`❌ Errors: ${testResults.errors.length}`)
  
  if (testResults.errors.length > 0) {
    log('\n🚨 ERRORS DETECTED:')
    testResults.errors.forEach((error, index) => {
      log(`  ${index + 1}. ${error}`)
    })
  }

  const isFullySuccessful = testResults.signInSuccess && 
                           testResults.profileFetchSuccess && 
                           testResults.authStateChangeReceived && 
                           testResults.errors.length === 0

  log(`\n🎯 OVERALL STATUS: ${isFullySuccessful ? '✅ FULLY SUCCESSFUL' : '❌ HAS ISSUES'}`)

  if (isFullySuccessful) {
    log('✅ The backend auth flow is working perfectly!')
    log('✅ If UI is still loading infinitely, it\'s a frontend issue.')
  } else {
    log('❌ There are backend issues that need to be fixed.')
  }

  return testResults
}

testCompleteSignInFlow()
  .then(results => {
    process.exit(results.errors.length > 0 ? 1 : 0)
  })
  .catch(error => {
    log('💥 Test script failed', { error: error.message })
    process.exit(1)
  })