/**
 * Debug authentication function to help diagnose JWT token issues
 */

import { query } from "./_generated/server";

// Debug query to inspect auth context and JWT details
export const debugAuthContext = query({
  args: {},
  handler: async (ctx) => {
    console.log('🔍 DEBUG AUTH - Starting comprehensive auth context inspection...');

    try {
      // Check if auth context exists
      const hasAuth = !!ctx.auth;
      console.log('🔍 DEBUG AUTH - Auth context availability:', { hasAuth });

      if (!hasAuth) {
        return {
          error: "No auth context available",
          hasAuth: false,
          timestamp: Date.now()
        };
      }

      // Try to get user identity
      let identity = null;
      let identityError = null;

      try {
        identity = await ctx.auth.getUserIdentity();
        console.log('🔍 DEBUG AUTH - Identity extraction result:', {
          hasIdentity: !!identity,
          identityKeys: identity ? Object.keys(identity) : null,
          subject: identity?.subject,
          tokenIdentifier: identity?.tokenIdentifier,
          issuer: identity?.iss,
          audience: identity?.aud,
          email: identity?.email,
          name: identity?.name
        });
      } catch (error) {
        identityError = error instanceof Error ? error.message : String(error);
        console.error('🔍 DEBUG AUTH - Identity extraction failed:', identityError);
      }

      // Check environment variables
      const envCheck = {
        hasClientId: !!process.env.WORKOS_CLIENT_ID,
        clientIdLength: process.env.WORKOS_CLIENT_ID?.length || 0,
        clientIdPrefix: process.env.WORKOS_CLIENT_ID?.substring(0, 12) || null
      };

      console.log('🔍 DEBUG AUTH - Environment check:', envCheck);

      return {
        authContext: {
          hasAuth,
          hasIdentity: !!identity,
          identityError,
          identity: identity ? {
            subject: identity.subject,
            tokenIdentifier: identity.tokenIdentifier,
            issuer: identity.iss,
            audience: identity.aud,
            email: identity.email,
            name: identity.name,
            allClaims: Object.keys(identity)
          } : null
        },
        environment: envCheck,
        timestamp: Date.now(),
        success: true
      };

    } catch (globalError) {
      console.error('🔍 DEBUG AUTH - Global error:', globalError);
      return {
        error: globalError instanceof Error ? globalError.message : String(globalError),
        timestamp: Date.now(),
        success: false
      };
    }
  },
});

// Debug query to test auth requirements for database operations
export const debugAuthRequirement = query({
  args: {},
  handler: async (ctx) => {
    console.log('🔍 DEBUG AUTH REQUIREMENT - Testing auth requirement for DB operations...');

    try {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
        return {
          authRequired: true,
          hasIdentity: false,
          canAccessDB: false,
          message: "No identity found - authentication required"
        };
      }

      // Try to query users table (if it exists)
      let dbAccessTest = null;
      try {
        const userCount = await ctx.db.query("users").collect();
        dbAccessTest = {
          success: true,
          userCount: userCount.length,
          message: "Database access successful"
        };
      } catch (dbError) {
        dbAccessTest = {
          success: false,
          error: dbError instanceof Error ? dbError.message : String(dbError),
          message: "Database access failed"
        };
      }

      return {
        authRequired: true,
        hasIdentity: true,
        canAccessDB: dbAccessTest?.success || false,
        identity: {
          subject: identity.subject,
          email: identity.email,
          issuer: identity.iss,
          audience: identity.aud
        },
        dbTest: dbAccessTest,
        timestamp: Date.now()
      };

    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        authRequired: true,
        hasIdentity: false,
        canAccessDB: false,
        timestamp: Date.now()
      };
    }
  },
});