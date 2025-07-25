import { workos } from './workos-client';
import { Invitation } from '@workos-inc/node';

// Invitation management functions using WorkOS

export async function createInvitation(data: {
  email: string;
  organizationId: string;
  inviterUserId?: string;
  expiresInDays?: number;
}): Promise<Invitation> {
  try {
    const invitation = await workos.userManagement.createInvitation({
      email: data.email,
      organizationId: data.organizationId,
      inviterUserId: data.inviterUserId,
      expiresInDays: data.expiresInDays || 7, // Default to 7 days
    });
    
    return invitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }
}

export async function getInvitation(invitationId: string): Promise<Invitation | null> {
  try {
    const invitation = await workos.userManagement.getInvitation(invitationId);
    return invitation;
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return null;
  }
}

export async function listInvitations(
  organizationId: string,
  options?: {
    limit?: number;
    before?: string;
    after?: string;
  }
): Promise<{
  data: Invitation[];
  hasMore: boolean;
}> {
  try {
    const invitations = await workos.userManagement.listInvitations({
      organizationId,
      ...options,
    });
    
    return {
      data: invitations.data,
      hasMore: invitations.listMetadata?.after ? true : false,
    };
  } catch (error) {
    console.error('Error listing invitations:', error);
    throw new Error('Failed to list invitations');
  }
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  try {
    await workos.userManagement.revokeInvitation(invitationId);
  } catch (error) {
    console.error('Error revoking invitation:', error);
    throw new Error('Failed to revoke invitation');
  }
}

// Helper function to create invitation with role assignment
export async function createStaffInvitation(data: {
  email: string;
  organizationId: string;
  role: 'owner' | 'manager' | 'trainer';
  inviterUserId?: string;
  gymId: string;
}): Promise<{
  invitation: Invitation;
  invitationRecord: any;
}> {
  try {
    // Create WorkOS invitation
    const invitation = await createInvitation({
      email: data.email,
      organizationId: data.organizationId,
      inviterUserId: data.inviterUserId,
    });
    
    // Store invitation details in our database for role assignment
    // This will be created in the API endpoint
    const invitationRecord = {
      id: invitation.id,
      email: data.email,
      role: data.role,
      gym_id: data.gymId,
      workos_invitation_id: invitation.id,
      workos_organization_id: data.organizationId,
      expires_at: invitation.expiresAt,
      status: 'pending',
    };
    
    return {
      invitation,
      invitationRecord,
    };
  } catch (error) {
    console.error('Error creating staff invitation:', error);
    throw error;
  }
}

// Helper function to check if email is already invited
export async function isEmailInvited(
  email: string,
  organizationId: string
): Promise<boolean> {
  try {
    const invitations = await listInvitations(organizationId, { limit: 100 });
    
    return invitations.data.some(
      inv => inv.email === email && 
      inv.state === 'pending' &&
      new Date(inv.expiresAt) > new Date()
    );
  } catch (error) {
    console.error('Error checking invitation status:', error);
    return false;
  }
}

// Helper function to get pending invitations count
export async function getPendingInvitationsCount(
  organizationId: string
): Promise<number> {
  try {
    const invitations = await listInvitations(organizationId, { limit: 100 });
    
    return invitations.data.filter(
      inv => inv.state === 'pending' &&
      new Date(inv.expiresAt) > new Date()
    ).length;
  } catch (error) {
    console.error('Error counting pending invitations:', error);
    return 0;
  }
}