#!/usr/bin/env node

// FINAL RLS SECURITY VALIDATION REPORT
// Tests existing users and data to confirm security

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ulymixjoyuhapqxkcwbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseW1peGpveXVoYXBxeGtjd2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjU1NDQsImV4cCI6MjA2ODkwMTU0NH0.TKwAES_wwzZKSxkD-W7OvS0a_ujtGAuNdSfn0LE-vAM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const testUsers = [
  {
    email: 'gym1admin@testvalidation.com',
    password: 'SecurePass123!',
    gymId: '00000000-0000-0000-0000-000000000001',
    name: 'Gym 1 Admin'
  },
  {
    email: 'gym2admin@testvalidation.com', 
    password: 'SecurePass123!',
    gymId: '00000000-0000-0000-0000-000000000002',
    name: 'Gym 2 Admin'
  }
]

async function testGymIsolationSecurity() {
  console.log('🔒 FINAL SECURITY VALIDATION REPORT')
  console.log('🚨 TESTING MULTI-TENANT DATA ISOLATION')
  console.log('=' .repeat(60))
  
  let criticalVulnerabilities = 0
  let securityIssues = []
  let passedChecks = 0
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i]
    console.log(`\n🔍 Testing ${user.name} (${user.gymId})`)
    console.log('-' .repeat(50))
    
    try {
      // Sign in as test user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (signInError) {
        console.log(`❌ CRITICAL: Cannot authenticate ${user.name}: ${signInError.message}`)
        criticalVulnerabilities++
        continue
      }
      
      console.log(`✅ Authentication successful for ${user.name}`)
      passedChecks++
      
      // Test client data access
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('id, gym_id, email')
        .limit(20) // Get more data to test isolation
      
      if (clientError) {
        console.log(`⚠️ Client access error: ${clientError.message}`)
      } else {
        console.log(`📊 ${user.name} can access ${clients.length} client records`)
        
        if (clients.length > 0) {
          // CRITICAL: Check for cross-gym data access
          const unauthorizedAccess = clients.filter(client => client.gym_id !== user.gymId)
          
          if (unauthorizedAccess.length > 0) {
            console.log(`🚨 CRITICAL VULNERABILITY: ${user.name} has access to ${unauthorizedAccess.length} clients from other gyms!`)
            console.log(`   Unauthorized access to gyms:`, [...new Set(unauthorizedAccess.map(c => c.gym_id))])
            criticalVulnerabilities++
            securityIssues.push({
              user: user.name,
              vulnerability: 'Cross-gym client access',
              severity: 'CRITICAL',
              unauthorizedRecords: unauthorizedAccess.length,
              details: unauthorizedAccess
            })
          } else {
            console.log(`✅ Data properly isolated - all ${clients.length} clients belong to ${user.name}'s gym`)
            passedChecks++
          }
        } else {
          console.log(`✅ No client data returned - proper isolation (no data to leak)`)
          passedChecks++
        }
      }
      
      // Test profile access
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role, gym_id')
        .limit(10)
      
      if (profileError) {
        console.log(`⚠️ Profile access error: ${profileError.message}`)
      } else {
        console.log(`👥 ${user.name} can access ${profiles.length} profile records`)
        
        if (profiles.length > 0) {
          const crossGymProfiles = profiles.filter(p => p.gym_id && p.gym_id !== user.gymId)
          
          if (crossGymProfiles.length > 0) {
            console.log(`🚨 CRITICAL: ${user.name} can access ${crossGymProfiles.length} profiles from other gyms!`)
            criticalVulnerabilities++
            securityIssues.push({
              user: user.name,
              vulnerability: 'Cross-gym profile access',
              severity: 'CRITICAL',
              unauthorizedRecords: crossGymProfiles.length
            })
          } else {
            console.log(`✅ Profile access properly restricted`)
            passedChecks++
          }
        }
      }
      
      // Test gym table access
      const { data: gyms, error: gymError } = await supabase
        .from('gyms')
        .select('id, name')
        .limit(10)
      
      if (gymError) {
        console.log(`⚠️ Gym access error: ${gymError.message}`)
      } else {
        console.log(`🏢 ${user.name} can access ${gyms.length} gym records`)
        
        // For admin users, they should only see their own gym
        const otherGyms = gyms.filter(g => g.id !== user.gymId)
        if (otherGyms.length > 0) {
          console.log(`⚠️ SECURITY CONCERN: ${user.name} can see ${otherGyms.length} other gym records`)
          console.log(`   This may be acceptable for system-wide operations, but verify intentional`)
        } else {
          console.log(`✅ Gym access properly restricted to own gym`)
          passedChecks++
        }
      }
      
    } catch (error) {
      console.log(`❌ Exception testing ${user.name}: ${error.message}`)
      criticalVulnerabilities++
    }
  }
  
  // Final security assessment
  console.log('\n' .repeat(2))
  console.log('🔒 FINAL SECURITY ASSESSMENT')
  console.log('=' .repeat(40))
  console.log(`✅ Security checks passed: ${passedChecks}`)
  console.log(`🚨 Critical vulnerabilities: ${criticalVulnerabilities}`)
  console.log(`⚠️ Security issues detected: ${securityIssues.length}`)
  
  if (criticalVulnerabilities > 0) {
    console.log('\n🚨 CRITICAL SECURITY ALERT!')
    console.log('❌ Your application has CRITICAL vulnerabilities that must be fixed immediately!')
    console.log('⚠️ These represent a MASSIVE LIABILITY and potential for data breaches')
    console.log('\nSecurity Issues Found:')
    securityIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.user}: ${issue.vulnerability} (${issue.severity})`)
      if (issue.unauthorizedRecords) {
        console.log(`   - Unauthorized access to ${issue.unauthorizedRecords} records`)
      }
    })
  } else {
    console.log('\n🎉 SECURITY VALIDATION PASSED!')
    console.log('✅ Your RLS policies are properly preventing data breaches')
    console.log('🛡️ Multi-tenant data isolation is working correctly')
    console.log('🔒 No critical vulnerabilities detected')
  }
  
  await supabase.auth.signOut()
  
  return {
    passed: criticalVulnerabilities === 0,
    vulnerabilities: criticalVulnerabilities,
    passedChecks,
    issues: securityIssues
  }
}

testGymIsolationSecurity()
  .then(results => {
    console.log('\n🏁 RLS Security Validation Complete')
    console.log(`Final Status: ${results.passed ? '✅ SECURE' : '❌ VULNERABLE'}`)
    process.exit(results.passed ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Security testing failed:', error.message)
    process.exit(1)
  })