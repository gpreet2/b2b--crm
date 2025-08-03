import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function checkTables() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Checking WorkOS tables...');

  try {
    // Check if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.log('Users table does not exist:', usersError.message);
    } else {
      console.log('✓ Users table exists');
    }

    // Check if organizations table exists
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (orgsError) {
      console.log('Organizations table does not exist:', orgsError.message);
    } else {
      console.log('✓ Organizations table exists');
    }

    // Check if user_organizations table exists
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select('count')
      .limit(1);

    if (userOrgsError) {
      console.log('User_organizations table does not exist:', userOrgsError.message);
    } else {
      console.log('✓ User_organizations table exists');
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();