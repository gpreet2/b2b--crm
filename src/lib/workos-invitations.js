// CommonJS wrapper for TypeScript workos-invitations module
const { WorkOS } = require('@workos-inc/node');

const workos = new WorkOS(process.env.WORKOS_API_KEY);

async function createInvitation(data) {
  try {
    const invitation = await workos.userManagement.sendInvitation({
      email: data.email,
      organizationId: data.organizationId,
      inviterUserId: data.inviterUserId,
      expiresInDays: data.expiresInDays || 7,
    });

    return invitation;
  } catch (error) {
    console.error('Failed to create invitation:', error);
    throw error;
  }
}

async function listInvitations(organizationId) {
  try {
    const invitations = await workos.userManagement.listInvitations({
      organizationId,
    });

    return invitations;
  } catch (error) {
    console.error('Failed to list invitations:', error);
    throw error;
  }
}

module.exports = {
  createInvitation,
  listInvitations
};