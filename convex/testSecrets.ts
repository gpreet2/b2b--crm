/**
 * Test functions for secret management system
 * These are temporary functions to test and validate the secret management implementation
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { SecretManager, SecretType, validateRequiredSecrets } from "./lib/secrets";
import { performSystemHealthCheck, getFeatureAvailability, validateSecret } from "./lib/secretValidation";
import { testKMSConnectivity } from "./lib/kms";

/**
 * Test secret retrieval (for development/testing)
 */
export const testSecretAccess = query({
  args: {
    secretType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      const secretManager = new SecretManager({ db: ctx.db });
      
      if (args.secretType) {
        // Test specific secret
        const secretType = args.secretType as SecretType;
        
        switch (secretType) {
          case SecretType.WORKOS_CLIENT_ID:
            const clientId = await secretManager.getWorkOSClientId();
            return { 
              secretType, 
              available: !!clientId,
              valueLength: clientId.length,
              preview: clientId ? `${clientId.substring(0, 8)}...` : null
            };
          case SecretType.ENCRYPTION_KEY:
            const encryptionKey = await secretManager.getEncryptionKey();
            return {
              secretType,
              available: !!encryptionKey,
              valueLength: encryptionKey.length,
              preview: encryptionKey ? "***encrypted***" : null
            };
          default:
            throw new Error(`Test not implemented for secret type: ${secretType}`);
        }
      } else {
        // Test all secrets
        const results = await Promise.allSettled([
          secretManager.getWorkOSClientId(),
          secretManager.getWorkOSClientSecret(),
          secretManager.getWorkOSIssuer(),
          secretManager.getStripeApiKey(),
          secretManager.getKisiApiKey(),
          secretManager.getSentryDSN(),
          secretManager.getSlackWebhookUrl(),
          secretManager.getEncryptionKey()
        ]);
        
        const secretTypes = [
          SecretType.WORKOS_CLIENT_ID,
          SecretType.WORKOS_CLIENT_SECRET,
          SecretType.WORKOS_ISSUER,
          SecretType.STRIPE_API_KEY,
          SecretType.KISI_API_KEY,
          SecretType.SENTRY_DSN,
          SecretType.SLACK_WEBHOOK_URL,
          SecretType.ENCRYPTION_KEY
        ];
        
        return results.map((result, index) => ({
          secretType: secretTypes[index],
          status: result.status,
          available: result.status === "fulfilled" && !!result.value,
          valueLength: result.status === "fulfilled" ? result.value.length : 0,
          error: result.status === "rejected" ? result.reason?.message : null
        }));
      }
    } catch (error) {
      throw new Error(`Secret access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Test secret validation
 */
export const testSecretValidation = query({
  args: {
    secretType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      if (args.secretType) {
        const result = await validateSecret(args.secretType as SecretType, { db: ctx.db });
        return result;
      } else {
        // Validate required secrets
        const validation = await validateRequiredSecrets({ db: ctx.db });
        return validation;
      }
    } catch (error) {
      throw new Error(`Secret validation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Test system health check
 */
export const testSystemHealth = query({
  handler: async (ctx) => {
    try {
      const healthSummary = await performSystemHealthCheck({ db: ctx.db });
      return healthSummary;
    } catch (error) {
      throw new Error(`System health test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Test feature availability
 */
export const testFeatureAvailability = query({
  handler: async (ctx) => {
    try {
      const availability = await getFeatureAvailability({ db: ctx.db });
      return availability;
    } catch (error) {
      throw new Error(`Feature availability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Test KMS connectivity
 */
export const testKMS = query({
  handler: async (ctx) => {
    try {
      const connectivity = await testKMSConnectivity();
      return connectivity;
    } catch (error) {
      throw new Error(`KMS connectivity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

/**
 * Perform comprehensive secret system test
 */
export const runComprehensiveTest = query({
  handler: async (ctx) => {
    const results = {
      timestamp: Date.now(),
      tests: {} as Record<string, any>
    };
    
    try {
      // Test 1: Secret access
      const secretManager = new SecretManager({ db: ctx.db });
      const workosId = await secretManager.getWorkOSClientId();
      const encryption = await secretManager.getEncryptionKey();
      
      results.tests.secretAccess = [
        { secretType: "WORKOS_CLIENT_ID", available: !!workosId, valueLength: workosId.length },
        { secretType: "ENCRYPTION_KEY", available: !!encryption, valueLength: encryption.length }
      ];
      
      // Test 2: Secret validation
      results.tests.secretValidation = await validateRequiredSecrets({ db: ctx.db });
      
      // Test 3: System health
      results.tests.systemHealth = await performSystemHealthCheck({ db: ctx.db });
      
      // Test 4: Feature availability
      results.tests.featureAvailability = await getFeatureAvailability({ db: ctx.db });
      
      // Test 5: KMS connectivity
      results.tests.kmsConnectivity = await testKMSConnectivity();
      
      // Overall assessment
      const secretsWorking = Array.isArray(results.tests.secretAccess) 
        ? results.tests.secretAccess.filter((s: any) => s.available).length
        : 0;
      
      const summary = {
        overallStatus: results.tests.systemHealth?.overallStatus || "unknown",
        secretsWorking,
        totalSecrets: Array.isArray(results.tests.secretAccess) ? results.tests.secretAccess.length : 0,
        criticalFeaturesAvailable: results.tests.featureAvailability?.authentication && 
                                   results.tests.featureAvailability?.encryption,
        testsPassed: Object.values(results.tests).filter(t => !t?.error).length,
        testsTotal: Object.keys(results.tests).length
      };
      
      return { ...results, summary };
    } catch (error) {
      results.tests.error = {
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now()
      };
      
      return results;
    }
  }
});

/**
 * Manual health check trigger
 */
export const triggerHealthCheck = mutation({
  handler: async (ctx) => {
    try {
      // This would normally be called via internal mutation
      // For testing, we'll perform a basic health check here
      const healthSummary = await performSystemHealthCheck({ db: ctx.db });
      
      // Record the health check
      await ctx.db.insert("systemHealth", {
        checkType: "secret_management",
        status: healthSummary.overallStatus,
        details: {
          secretsHealthy: healthSummary.secretsHealthy,
          secretsTotal: healthSummary.secretsTotal,
          criticalSecretsAvailable: healthSummary.criticalSecretsAvailable,
          issues: healthSummary.issues,
          kmsConnectivity: healthSummary.kmsConnectivity
        },
        timestamp: Date.now(),
        alertSent: false
      });
      
      return {
        success: true,
        healthSummary,
        message: "Health check completed and recorded"
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
});

// Import API for function calls
// import { api } from "./_generated/api";