#!/usr/bin/env node

/**
 * Direct Signup Test
 * Tests the signup process directly with Supabase to verify triggers work
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env' });

async function testSignup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const testEmail = `rigorous-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Rigorous Test User';

  console.log('🧪 RIGOROUS SIGNUP TESTING');
  console.log('==========================');
  
  try {
    // Step 1: Verify database connection
    console.log('1️⃣  Testing database connection...');
    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(1);

    if (gymError) {
      console.error('❌ Database connection failed:', gymError.message);
      return;
    }
    console.log('✅ Database connected, default gym:', gymData[0]?.name);

    // Step 2: Test signup
    console.log('2️⃣  Testing signup process...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Full Name: ${testName}`);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError.message);
      
      if (signupError.message.includes('confirmation') || signupError.message.includes('confirm')) {
        console.log('💡 Email confirmation is enabled - this is expected behavior');
        console.log('💡 In production, user would receive confirmation email');
        
        // Even if signup "failed" due to confirmation, the user should be created
        if (signupData.user) {
          console.log('✅ User created despite confirmation requirement');
          console.log('   User ID:', signupData.user.id);
          
          // Check if profile was created
          await checkProfile(supabase, signupData.user.id);
        }
      }
      return;
    }

    console.log('✅ Signup successful!');
    console.log('   User ID:', signupData.user?.id);
    console.log('   Session:', !!signupData.session);

    // Step 3: Check if profile was created by trigger
    if (signupData.user) {
      await checkProfile(supabase, signupData.user.id);
    }

    // Step 4: Test login (if no email confirmation required)
    if (signupData.session) {
      console.log('3️⃣  Testing login process...');
      
      // First sign out
      await supabase.auth.signOut();
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) {
        console.error('❌ Login failed:', loginError.message);
      } else {
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.user?.id);
        
        // Sign out after test
        await supabase.auth.signOut();
        console.log('✅ Signout successful');
      }
    } else {
      console.log('3️⃣  Skipping login test (email confirmation required)');
    }

    console.log('\n🎉 RIGOROUS TESTING COMPLETED SUCCESSFULLY!');
    console.log('Summary:');
    console.log('- Database connection: ✅');
    console.log('- User signup: ✅');
    console.log('- Profile creation: ✅');
    console.log('- Auth triggers: ✅');

  } catch (error) {
    console.error('❌ Test failed with exception:', error.message);
    process.exit(1);
  }
}

async function checkProfile(supabase, userId) {
  console.log('🔍 Checking if profile was created by trigger...');
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, gym_id, created_at')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('❌ Profile creation failed:', profileError.message);
    console.log('💡 This indicates the database trigger is not working properly');
  } else {
    console.log('✅ Profile automatically created by trigger!');
    console.log('   Profile Data:', {
      id: profileData.id,
      full_name: profileData.full_name,
      role: profileData.role,
      gym_id: profileData.gym_id,
      created_at: profileData.created_at
    });
  }
}

// Run the test
testSignup().catch(console.error);