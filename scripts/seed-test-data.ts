/**
 * Test Data Seeding Script
 * 
 * This script adds sample employees and clients to the database
 * so you can test the UI with real data.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  try {
    // First, get your user ID and organization
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('workos_user_id', 'user_01K1YHHEGV1YG0H92XE9P54N3X')
      .single();

    if (userError || !user) {
      console.error('❌ Could not find your user:', userError);
      return;
    }

    const { data: userOrg, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (orgError || !userOrg) {
      console.error('❌ Could not find your organization:', orgError);
      return;
    }

    const organizationId = userOrg.organization_id;
    console.log(`✅ Found organization: ${organizationId}`);

    // Create sample users for employees and clients
    const sampleUsers = [
      {
        workos_user_id: 'test_employee_1',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@gym.com',
        user_type: 'employee'
      },
      {
        workos_user_id: 'test_employee_2',
        first_name: 'Mike',
        last_name: 'Rodriguez',
        email: 'mike.rodriguez@gym.com',
        user_type: 'employee'
      },
      {
        workos_user_id: 'test_employee_3',
        first_name: 'Lisa',
        last_name: 'Chen',
        email: 'lisa.chen@gym.com',
        user_type: 'employee'
      },
      {
        workos_user_id: 'test_client_1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        user_type: 'client'
      },
      {
        workos_user_id: 'test_client_2',
        first_name: 'Emma',
        last_name: 'Wilson',
        email: 'emma.wilson@example.com',
        user_type: 'client'
      },
      {
        workos_user_id: 'test_client_3',
        first_name: 'David',
        last_name: 'Brown',
        email: 'david.brown@example.com',
        user_type: 'client'
      }
    ];

    // Insert users (upsert to avoid duplicates)
    console.log('👥 Creating sample users...');
    const { data: createdUsers, error: userCreateError } = await supabase
      .from('users')
      .upsert(sampleUsers, { 
        onConflict: 'workos_user_id',
        ignoreDuplicates: false
      })
      .select('id, workos_user_id, first_name, last_name, user_type');

    if (userCreateError) {
      console.error('❌ Error creating users:', userCreateError);
      return;
    }

    console.log(`✅ Created ${createdUsers?.length || 0} users`);

    // Create employees (add to user_organizations table)
    const employeeUsers = createdUsers?.filter(u => u.user_type === 'employee') || [];
    const clientUsers = createdUsers?.filter(u => u.user_type === 'client') || [];

    if (employeeUsers.length > 0) {
      console.log('👷 Creating employee records...');
      
      const employeeRecords = employeeUsers.map((user, index) => ({
        user_id: user.id,
        organization_id: organizationId,
        role: ['trainer', 'trainer', 'trainer'][index % 3], // Just use trainer for all to test
        is_active: true
      }));

      const { error: empError } = await supabase
        .from('user_organizations')
        .upsert(employeeRecords, { 
          onConflict: 'user_id,organization_id',
          ignoreDuplicates: false
        });

      if (empError) {
        console.error('❌ Error creating employee records:', empError);
      } else {
        console.log(`✅ Created ${employeeRecords.length} employee records`);
      }
    }

    // Create clients
    if (clientUsers.length > 0) {
      console.log('🏃 Creating client records...');
      
      const clientRecords = clientUsers.map(user => ({
        user_id: user.id,
        date_of_birth: '1990-01-01',
        gender: 'prefer_not_to_say',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '+1-555-0123',
        medical_conditions: null,
        preferences: { notifications: true, marketing: false }
      }));

      const { data: createdClients, error: clientError } = await supabase
        .from('clients')
        .upsert(clientRecords, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select('id, user_id');

      if (clientError) {
        console.error('❌ Error creating client records:', clientError);
      } else {
        console.log(`✅ Created ${createdClients?.length || 0} client records`);

        // Create client-organization relationships
        const clientOrgRecords = createdClients?.map((client, index) => ({
          client_id: client.id,
          organization_id: organizationId,
          membership_status: ['active', 'inactive', 'suspended'][index % 3] as 'active' | 'inactive' | 'suspended',
          joined_at: new Date().toISOString(),
          last_visit_at: new Date().toISOString(),
          visit_count: Math.floor(Math.random() * 50) + 1,
          notes: `Test client ${index + 1}`
        })) || [];

        const { error: clientOrgError } = await supabase
          .from('client_organizations')
          .upsert(clientOrgRecords, { 
            onConflict: 'client_id,organization_id',
            ignoreDuplicates: false
          });

        if (clientOrgError) {
          console.error('❌ Error creating client-organization records:', clientOrgError);
        } else {
          console.log(`✅ Created ${clientOrgRecords.length} client-organization relationships`);
        }
      }
    }

    console.log('🎉 Test data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • ${employeeUsers.length} employees added`);
    console.log(`   • ${clientUsers.length} clients added`);
    console.log('');
    console.log('🔄 Now refresh your browser and check the pages:');
    console.log('   • http://localhost:3001/people/employees');
    console.log('   • http://localhost:3001/people/clients');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the seeding
seedTestData();