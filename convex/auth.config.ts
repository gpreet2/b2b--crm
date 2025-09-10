// WorkOS JWT Authentication Configuration - Dual Issuer Support
// This configuration supports both SSO and User Management tokens from WorkOS
const clientId = process.env.WORKOS_CLIENT_ID;

const authConfig = {
  providers: [
    {
      // SSO Provider - for enterprise SSO connections
      type: 'customJwt',
      issuer: `https://api.workos.com/`,
      algorithm: 'RS256',
      applicationID: clientId,
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
    {
      // User Management Provider - for AuthKit authentication
      type: 'customJwt', 
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: 'RS256',
      applicationID: clientId,
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
};

export default authConfig;