import { WorkOS } from '@workos-inc/node';

if (!process.env.WORKOS_API_KEY) {
  throw new Error('WORKOS_API_KEY is required');
}

export const workos = new WorkOS(process.env.WORKOS_API_KEY);

export const WORKOS_CONFIG = {
  clientId: process.env.WORKOS_CLIENT_ID!,
  redirectUri: process.env.WORKOS_REDIRECT_URI!,
};

// Helper function to determine if email domain has SSO
export async function getOrganizationByEmail(email: string): Promise<string | null> {
  try {
    const domain = email.split('@')[1];
    
    // Check if organization exists for this domain
    const organizations = await workos.organizations.listOrganizations({
      domains: [domain],
    });
    
    if (organizations.data.length > 0) {
      return organizations.data[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking organization:', error);
    return null;
  }
}