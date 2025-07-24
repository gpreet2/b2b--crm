#!/usr/bin/env node

// Test frontend sign-in flow with a real user
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ulymixjoyuhapqxkcwbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseW1peGpveXVoYXBxeGtjd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjU1NDQsImV4cCI6MjA2ODkwMTU0NH0.TKwAES_wwzZKSxkD-W7OvS0a_ujtGAuNdSfn0LE-vAM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function simulateFrontendSignIn() {
  console.log('🔍 SIMULATING FRONTEND SIGN-IN FLOW')
  console.log('=' .repeat(50))
  
  const testEmail = 'gym1admin@testvalidation.com'
  const testPassword = 'SecurePass123!'
  
  let authStateChanges = []
  
  // Listen for auth state changes like the frontend does
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    authStateChanges.push({
      event,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString()
    })
    console.log(`📡 Auth State Change: ${event} - User: ${session?.user?.email || 'none'}`)
  })
  
  try {
    console.log(`\n1. Starting sign-in process...`)
    
    const signInStart = Date.now()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    const signInTime = Date.now() - signInStart
    
    if (error) {
      console.log(`❌ Sign-in failed in ${signInTime}ms: ${error.message}`)
      return
    }
    
    console.log(`✅ Sign-in API call completed in ${signInTime}ms`)
    
    // Wait for auth state changes to settle
    console.log(`\n2. Waiting for auth state changes to complete...`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log(`\n3. Testing profile fetch (simulating fetchUserProfile)...`)
    
    const profileStart = Date.now()
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('gym_id, role, full_name')
      .eq('id', data.user.id)
      .single()
    const profileTime = Date.now() - profileStart
    
    if (profileError) {
      console.log(`❌ Profile fetch failed in ${profileTime}ms: ${profileError.message}`)
      console.log('   This would cause infinite loading in frontend!')
    } else {
      console.log(`✅ Profile fetch successful in ${profileTime}ms`)
      console.log(`   Profile data:`, profile)
    }
    
    console.log(`\n4. Auth state changes captured:`)
    authStateChanges.forEach((change, index) => {
      console.log(`   ${index + 1}. ${change.event} - ${change.userEmail || 'no user'} (${change.timestamp})`)
    })
    
    console.log(`\n🎉 Frontend sign-in simulation completed`)
    console.log(`   Expected flow: SIGNED_IN event should have occurred`)
    console.log(`   Profile should be fetchable without errors`)
    
    // Clean up
    await supabase.auth.signOut()
    subscription.unsubscribe()
    
  } catch (error) {
    console.log(`💥 Exception during frontend sign-in simulation: ${error.message}`)
    subscription.unsubscribe()
  }
}

simulateFrontendSignIn().catch(console.error)