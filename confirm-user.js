#!/usr/bin/env node

// Manually confirm a user in Supabase
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmUser() {
  const email = process.argv[2] || 'gunny00@proton.me'
  
  console.log(`🔧 Manually confirming user: ${email}`)
  
  // Get the user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('❌ Error listing users:', listError.message)
    return
  }
  
  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.error(`❌ User not found: ${email}`)
    console.log('\n📋 Available users:')
    users.forEach(u => {
      console.log(`   - ${u.email} (confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'})`)
    })
    return
  }
  
  if (user.email_confirmed_at) {
    console.log('✅ User is already confirmed!')
    console.log(`   Confirmed at: ${user.email_confirmed_at}`)
    return
  }
  
  // Update user to set email as confirmed
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { 
      email_confirmed_at: new Date().toISOString(),
      email: user.email
    }
  )
  
  if (updateError) {
    console.error('❌ Error confirming user:', updateError.message)
    return
  }
  
  console.log('✅ User confirmed successfully!')
  console.log(`   Email: ${email}`)
  console.log(`   User ID: ${user.id}`)
  console.log('\n🎉 You can now sign in with this user!')
}

// Also provide info about the email confirmation setting
async function checkEmailSettings() {
  console.log('\n📌 IMPORTANT: Email Confirmation Setting')
  console.log('   To permanently disable email confirmation:')
  console.log('   1. Go to Supabase Dashboard → Authentication')
  console.log('   2. Click on "Providers" tab')
  console.log('   3. Under "Email", toggle OFF "Confirm email"')
  console.log('   4. Save changes')
  console.log('\n   Note: Settings may take a few minutes to propagate.')
}

confirmUser()
checkEmailSettings()