import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getSessionFromCookie } from '@/lib/session';
import { createOrganization, updateOrganization, createOrganizationMembership } from '@/lib/workos-organizations';
import { workos } from '@/lib/workos-client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request data
    const { name, address, phone, email } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Gym name is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Start a transaction
    const gymId = uuidv4();
    
    try {
      // Create WorkOS organization for the gym
      const organization = await createOrganization({
        name,
        gymId,
      });
      
      // Create gym in database
      const { data: gym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          id: gymId,
          name,
          address,
          phone,
          email,
          workos_organization_id: organization.id,
        })
        .select()
        .single();
      
      if (gymError) {
        // If gym creation fails, delete the WorkOS organization
        await workos.organizations.deleteOrganization(organization.id);
        throw gymError;
      }
      
      // Update user profile to be owner of this gym
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gym_id: gymId,
          role: 'owner',
          workos_organization_id: organization.id,
        })
        .eq('id', user.id);
      
      if (profileError) {
        // Rollback: delete gym and organization
        await supabase.from('gyms').delete().eq('id', gymId);
        await workos.organizations.deleteOrganization(organization.id);
        throw profileError;
      }
      
      // Create organization membership in WorkOS
      if (user.workos_user_id) {
        try {
          const membership = await createOrganizationMembership({
            organizationId: organization.id,
            userId: user.workos_user_id,
            roleSlug: 'owner',
          });
          
          // Update profile with membership ID
          await supabase
            .from('profiles')
            .update({
              organization_membership_id: membership.id,
            })
            .eq('id', user.id);
        } catch (membershipError) {
          console.error('Error creating organization membership:', membershipError);
          // Non-critical error, continue
        }
      }
      
      return NextResponse.json({
        success: true,
        gym,
        organization: {
          id: organization.id,
          name: organization.name,
        },
      });
      
    } catch (error) {
      console.error('Error in gym creation process:', error);
      return NextResponse.json(
        { error: 'Failed to create gym' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Create gym error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Update gym (including WorkOS organization)
export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is owner
    if (user.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only gym owners can update gym information' },
        { status: 403 }
      );
    }
    
    const { gymId, name, address, phone, email } = await request.json();
    
    if (!gymId) {
      return NextResponse.json(
        { error: 'Gym ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Get gym with organization ID
    const { data: gym, error: fetchError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();
    
    if (fetchError || !gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      );
    }
    
    // Update gym in database
    const { data: updatedGym, error: updateError } = await supabase
      .from('gyms')
      .update({
        name,
        address,
        phone,
        email,
      })
      .eq('id', gymId)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Update WorkOS organization if it exists
    if (gym.workos_organization_id) {
      try {
        await updateOrganization(gym.workos_organization_id, {
          name,
        });
      } catch (orgError) {
        console.error('Error updating WorkOS organization:', orgError);
        // Non-critical error, continue
      }
    }
    
    return NextResponse.json({
      success: true,
      gym: updatedGym,
    });
    
  } catch (error) {
    console.error('Update gym error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}