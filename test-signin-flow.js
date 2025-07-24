#!/usr/bin/env node

// Test sign-in with existing user
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignIn() {
  console.log('🔐 Testing sign-in with existing user...')
  
  // Use the Gurnoor user we saw in profiles
  const testEmail = 'gurnoor@b2bfit.ca'
  const testPassword = 'test123' // We'll need to reset this password
  
  console.log(`\n📧 Attempting sign-in with: ${testEmail}`)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })
  
  if (error) {
    console.error('❌ Sign-in failed:', error.message)
    console.log('\n🔧 Let\'s create a new test user with known credentials...')
    
    // Create a new user
    const newEmail = `testuser${Math.floor(Math.random() * 10000)}@gmail.com`
    const newPassword = 'TestPass123!'
    
    console.log(`\n📝 Creating new user: ${newEmail}`)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'admin'
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ Sign-up failed:', signUpError.message)
      return
    }
    
    console.log('✅ User created successfully!')
    console.log('   User ID:', signUpData.user?.id)
    
    // Wait for profile to be created
    console.log('\n⏳ Waiting for profile creation...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Try to sign in with new user
    console.log('\n🔑 Testing sign-in with new user...')
    const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
      email: newEmail,
      password: newPassword
    })
    
    if (newSignInError) {
      console.error('❌ New user sign-in failed:', newSignInError.message)
      return
    }
    
    console.log('✅ Sign-in successful!')
    console.log('   User:', newSignInData.user?.email)
    console.log('   Session:', newSignInData.session ? 'Active' : 'None')
    
    console.log('\n📋 Test Credentials for Frontend:')
    console.log(`   Email: ${newEmail}`)
    console.log(`   Password: ${newPassword}`)
    console.log('\n🌐 Go to http://localhost:3000/signin and test with these credentials')
    
    // Sign out
    await supabase.auth.signOut()
    console.log('\n✅ Signed out successfully')
    
  } else {
    console.log('✅ Sign-in successful!')
    console.log('   User:', data.user?.email)
    console.log('   Session:', data.session ? 'Active' : 'None')
  }
}

testSignIn()