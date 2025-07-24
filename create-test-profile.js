#!/usr/bin/env node

// Create a test profile manually to test sign-in flow
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ulymixjoyuhapqxkcwbi.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestProfile() {
  console.log('🔧 Checking existing profiles...')
  
  // Get the default gym ID
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .select('id')
    .limit(1)
    .single()
  
  if (gymError) {
    console.error('❌ Could not get gym:', gymError.message)
    return
  }
  
  console.log('✅ Default gym found:', gym.id)
  
  // Check existing profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, gym_id, role, full_name')
    .limit(10)
  
  if (profilesError) {
    console.error('❌ Could not fetch profiles:', profilesError.message)
    return
  }
  
  console.log(`\n📋 Found ${profiles.length} profiles:`)
  profiles.forEach(p => {
    console.log(`   ID: ${p.id}`)
    console.log(`   Name: ${p.full_name}`)
    console.log(`   Role: ${p.role}`)
    console.log(`   Gym: ${p.gym_id}`)
    console.log('   ---')
  })
  
  // Look for our test user
  const testUserId = '4cf4723a-5ff9-4a1a-ac24-8fa6b2fc8b43'
  const existingProfile = profiles.find(p => p.id === testUserId)
  
  if (existingProfile) {
    console.log('\n✅ Test user profile already exists!')
    console.log('\n📧 Use these credentials to test sign-in:')
    console.log('   Email: testuser5089@gmail.com')
    console.log('   Password: TestPass123!')
    console.log('   User ID:', testUserId)
  } else {
    console.log('\n⚠️ Test user profile not found, creating...')
    const testProfile = {
      id: testUserId,
      gym_id: gym.id,
      role: 'admin',
      full_name: 'Test Admin User'
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Could not create profile:', profileError.message)
      return
    }
    
    console.log('✅ Test profile created:', profile)
    console.log('\n📧 Use these credentials to test sign-in:')
    console.log('   Email: testuser5089@gmail.com')
    console.log('   Password: TestPass123!')
    console.log('   User ID:', testUserId)
  }
}

createTestProfile()