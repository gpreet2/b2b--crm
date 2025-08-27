/**
 * Comprehensive Test Data Seeding Script
 * 
 * Creates a full dataset with varied roles, permissions, and statuses
 * for thorough testing of the CRM system.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedComprehensiveData() {
  console.log('🌱 Starting comprehensive test data seeding...');

  try {
    // Get organization ID
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

    // Comprehensive employee dataset - using only allowed roles: trainer, admin, owner
    const employeeUsers = [
      // Trainers
      { workos_user_id: 'test_trainer_1', first_name: 'Alex', last_name: 'Thompson', email: 'alex.thompson@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_2', first_name: 'Jordan', last_name: 'Williams', email: 'jordan.williams@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_3', first_name: 'Taylor', last_name: 'Davis', email: 'taylor.davis@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_4', first_name: 'Casey', last_name: 'Miller', email: 'casey.miller@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_5', first_name: 'Morgan', last_name: 'Garcia', email: 'morgan.garcia.new@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_6', first_name: 'Riley', last_name: 'Martinez', email: 'riley.martinez.new@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_7', first_name: 'Sage', last_name: 'Anderson', email: 'sage.anderson.new@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_8', first_name: 'Avery', last_name: 'Wilson', email: 'avery.wilson.new@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_9', first_name: 'Parker', last_name: 'Lee', email: 'parker.lee.new@gym.com', user_type: 'employee', role: 'trainer' },
      { workos_user_id: 'test_trainer_10', first_name: 'Quinn', last_name: 'Taylor', email: 'quinn.taylor.new@gym.com', user_type: 'employee', role: 'trainer' },
      
      // Admins
      { workos_user_id: 'test_admin_1', first_name: 'Cameron', last_name: 'Brown', email: 'cameron.brown@gym.com', user_type: 'employee', role: 'admin' },
      { workos_user_id: 'test_admin_2', first_name: 'Drew', last_name: 'Johnson', email: 'drew.johnson@gym.com', user_type: 'employee', role: 'admin' },
      { workos_user_id: 'test_admin_3', first_name: 'Emery', last_name: 'Clark', email: 'emery.clark@gym.com', user_type: 'employee', role: 'admin' },
      { workos_user_id: 'test_admin_4', first_name: 'Finley', last_name: 'White', email: 'finley.white@gym.com', user_type: 'employee', role: 'admin' },
      
      // Owners
      { workos_user_id: 'test_owner_1', first_name: 'Harper', last_name: 'Smith', email: 'harper.smith@gym.com', user_type: 'employee', role: 'owner' },
    ];

    // Comprehensive client dataset
    const clientUsers = [
      // Active clients
      { workos_user_id: 'test_client_active_1', first_name: 'James', last_name: 'Rodriguez', email: 'james.rodriguez@example.com', user_type: 'client', status: 'active' },
      { workos_user_id: 'test_client_active_2', first_name: 'Maria', last_name: 'Garcia', email: 'maria.garcia@example.com', user_type: 'client', status: 'active' },
      { workos_user_id: 'test_client_active_3', first_name: 'Robert', last_name: 'Johnson', email: 'robert.johnson@example.com', user_type: 'client', status: 'active' },
      { workos_user_id: 'test_client_active_4', first_name: 'Jennifer', last_name: 'Williams', email: 'jennifer.williams@example.com', user_type: 'client', status: 'active' },
      { workos_user_id: 'test_client_active_5', first_name: 'Michael', last_name: 'Brown', email: 'michael.brown@example.com', user_type: 'client', status: 'active' },
      { workos_user_id: 'test_client_active_6', first_name: 'Linda', last_name: 'Davis', email: 'linda.davis@example.com', user_type: 'client', status: 'active' },
      
      // Inactive clients
      { workos_user_id: 'test_client_inactive_1', first_name: 'Christopher', last_name: 'Miller', email: 'christopher.miller@example.com', user_type: 'client', status: 'inactive' },
      { workos_user_id: 'test_client_inactive_2', first_name: 'Barbara', last_name: 'Wilson', email: 'barbara.wilson@example.com', user_type: 'client', status: 'inactive' },
      { workos_user_id: 'test_client_inactive_3', first_name: 'Daniel', last_name: 'Moore', email: 'daniel.moore@example.com', user_type: 'client', status: 'inactive' },
      
      // Suspended clients
      { workos_user_id: 'test_client_suspended_1', first_name: 'Jessica', last_name: 'Taylor', email: 'jessica.taylor@example.com', user_type: 'client', status: 'suspended' },
      { workos_user_id: 'test_client_suspended_2', first_name: 'Matthew', last_name: 'Anderson', email: 'matthew.anderson@example.com', user_type: 'client', status: 'suspended' },
      { workos_user_id: 'test_client_suspended_3', first_name: 'Ashley', last_name: 'Thomas', email: 'ashley.thomas@example.com', user_type: 'client', status: 'suspended' },
      { workos_user_id: 'test_client_suspended_4', first_name: 'Joshua', last_name: 'Jackson', email: 'joshua.jackson@example.com', user_type: 'client', status: 'suspended' },
      { workos_user_id: 'test_client_suspended_5', first_name: 'Amanda', last_name: 'White', email: 'amanda.white@example.com', user_type: 'client', status: 'suspended' },
    ];

    // Insert all users
    const allUsers = [...employeeUsers, ...clientUsers];
    console.log(`👥 Creating ${allUsers.length} users...`);
    
    const { data: createdUsers, error: userCreateError } = await supabase
      .from('users')
      .upsert(allUsers.map(u => ({
        workos_user_id: u.workos_user_id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        user_type: u.user_type
      })), { 
        onConflict: 'workos_user_id',
        ignoreDuplicates: false
      })
      .select('id, workos_user_id, first_name, last_name, user_type');

    if (userCreateError) {
      console.error('❌ Error creating users:', userCreateError);
      return;
    }

    console.log(`✅ Created ${createdUsers?.length || 0} users`);

    // Create employee records with varied active status
    const employeeData = createdUsers?.filter(u => u.user_type === 'employee') || [];
    const clientData = createdUsers?.filter(u => u.user_type === 'client') || [];

    if (employeeData.length > 0) {
      console.log('👷 Creating employee records with varied permissions...');
      
      const employeeRecords = employeeData.map((user, index) => {
        const originalUser = employeeUsers.find(eu => eu.workos_user_id === user.workos_user_id);
        return {
          user_id: user.id,
          organization_id: organizationId,
          role: originalUser?.role || 'trainer',
          is_active: index % 4 !== 3, // Make every 4th employee inactive for testing
          permissions: {
            // Varied permissions based on role
            ...(originalUser?.role === 'owner' && {
              all_permissions: true,
              manage_users: true,
              manage_settings: true,
              view_reports: true,
              manage_billing: true
            }),
            ...(originalUser?.role === 'admin' && {
              manage_users: true,
              manage_settings: true,
              view_reports: true,
              manage_billing: false
            }),
            ...(originalUser?.role === 'manager' && {
              manage_users: false,
              manage_settings: false,
              view_reports: true,
              manage_staff: true
            }),
            ...((['trainer', 'coach'].includes(originalUser?.role || '')) && {
              view_clients: true,
              manage_classes: true,
              view_schedule: true
            }),
            ...(originalUser?.role === 'front_desk' && {
              view_clients: true,
              check_in_clients: true,
              manage_tours: true
            })
          }
        };
      });

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

    // Create client records with varied membership data
    if (clientData.length > 0) {
      console.log('🏃 Creating client records with varied membership statuses...');
      
      const clientRecords = clientData.map((user, index) => ({
        user_id: user.id,
        date_of_birth: new Date(1985 + (index % 15), index % 12, (index % 28) + 1).toISOString().split('T')[0],
        gender: ['male', 'female', 'prefer_not_to_say'][index % 3],
        emergency_contact_name: `Emergency Contact ${index + 1}`,
        emergency_contact_phone: `+1-555-${String(index).padStart(4, '0')}`,
        medical_conditions: index % 5 === 0 ? 'None reported' : null,
        preferences: { 
          notifications: index % 2 === 0, 
          marketing: index % 3 === 0,
          preferred_workout_time: ['morning', 'afternoon', 'evening'][index % 3]
        }
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

        // Create client-organization relationships with varied statuses
        const clientOrgRecords = createdClients?.map((client, index) => {
          const originalUser = clientUsers.find(cu => {
            const userData = clientData.find(cd => cd.id === client.user_id);
            return cu.workos_user_id === userData?.workos_user_id;
          });
          
          const joinDate = new Date();
          joinDate.setDate(joinDate.getDate() - (index * 10 + Math.floor(Math.random() * 30)));
          
          const lastVisitDate = new Date();
          lastVisitDate.setDate(lastVisitDate.getDate() - Math.floor(Math.random() * 7));

          return {
            client_id: client.id,
            organization_id: organizationId,
            membership_status: originalUser?.status || 'active',
            joined_at: joinDate.toISOString(),
            last_visit_at: originalUser?.status === 'inactive' ? null : lastVisitDate.toISOString(),
            visit_count: originalUser?.status === 'inactive' ? 0 : Math.floor(Math.random() * 100) + 1,
            notes: `Test client ${index + 1} - Status: ${originalUser?.status || 'active'}`
          };
        }) || [];

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

    console.log('🎉 Comprehensive test data seeding completed!');
    console.log('');
    console.log('📊 Final Summary:');
    console.log(`   • ${employeeData.length} employees (varied roles & permissions)`);
    console.log(`   • ${clientData.length} clients (varied membership statuses)`);
    console.log('');
    console.log('🎭 Role Distribution:');
    console.log('   • Trainers: 10 (mixed active/inactive)');
    console.log('   • Admins: 4 (mixed active/inactive)');
    console.log('   • Owner: 1');
    console.log('');
    console.log('🏷️ Client Status Distribution:');
    console.log('   • Active: 6');
    console.log('   • Inactive: 3');
    console.log('   • Suspended: 5');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the comprehensive seeding
seedComprehensiveData();