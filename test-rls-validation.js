#!/usr/bin/env node

// Quick RLS validation script to test our security
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  {
    id: 'gym1-admin',
    email: 'gym1-admin@test.com',
    password: 'testpass123',
    gymId: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
    fullName: 'Gym 1 Admin'
  },
  {
    id: 'gym2-admin',
    email: 'gym2-admin@test.com',
    password: 'testpass123',
    gymId: '00000000-0000-0000-0000-000000000002',
    role: 'admin',
    fullName: 'Gym 2 Admin'
  }
]

async function createTestUser(user) {
  // Try to sign in first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password
  })
  
  if (!signInError) {
    console.log(`✅ User ${user.id} already exists`)
    return true
  }
  
  // Create user if doesn't exist
  const { data, error } = await supabase.auth.signUp({
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
  
  if (error) {
    console.error(`❌ Failed to create ${user.id}:`, error.message)
    return false
  }
  
  console.log(`✅ Created user ${user.id}`)
  return true
}

async function testGymIsolation() {
  console.log('\n🔒 Testing Gym Data Isolation...')
  
  try {
    // Test Gym 1 Admin
    await supabase.auth.signInWithPassword({
      email: testUsers[0].email,
      password: testUsers[0].password
    })
    
    const { data: gym1Clients, error: gym1Error } = await supabase
      .from('clients')
      .select('id, gym_id')
      .limit(10)
    
    if (gym1Error) {
      console.log('⚠️ No clients table access or no data (expected for new system)')
      return
    }
    
    console.log(`📊 Gym 1 Admin sees ${gym1Clients.length} clients`)
    
    if (gym1Clients.length > 0) {
      const allGym1 = gym1Clients.every(c => c.gym_id === testUsers[0].gymId)
      if (allGym1) {
        console.log('✅ Gym 1 data properly isolated')
      } else {
        console.log('❌ CRITICAL: Cross-gym data access detected!')
        console.log('Clients found:', gym1Clients)
      }
    }
    
    // Test Gym 2 Admin
    await supabase.auth.signInWithPassword({
      email: testUsers[1].email,
      password: testUsers[1].password
    })
    
    const { data: gym2Clients, error: gym2Error } = await supabase
      .from('clients')
      .select('id, gym_id')
      .limit(10)
    
    if (!gym2Error && gym2Clients.length > 0) {
      const allGym2 = gym2Clients.every(c => c.gym_id === testUsers[1].gymId)
      if (allGym2) {
        console.log('✅ Gym 2 data properly isolated')
      } else {
        console.log('❌ CRITICAL: Cross-gym data access detected!')
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

async function runRLSTests() {
  console.log('🔒 CRITICAL RLS SECURITY VALIDATION')
  console.log('=' .repeat(50))
  
  // Create test users
  console.log('\n👥 Creating test users...')
  for (const user of testUsers) {
    await createTestUser(user)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Test gym isolation
  await testGymIsolation()
  
  // Sign out
  await supabase.auth.signOut()
  
  console.log('\n✅ RLS validation completed')
  console.log('Navigate to http://localhost:3000/test-rls for comprehensive dashboard testing')
}

runRLSTests().catch(console.error)