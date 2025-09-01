/**
 * Enterprise Secret Management System
 * 
 * This module provides secure access to application secrets using Convex environment variables
 * as the primary storage mechanism, with external KMS integration for highly sensitive
 * payment processing keys.
 */

import { ConvexError } from "convex/values";

/**
 * Enum defining all secret types used in the application
 */
export enum SecretType {
  // WorkOS Authentication
  WORKOS_CLIENT_ID = "WORKOS_CLIENT_ID",
  WORKOS_CLIENT_SECRET = "WORKOS_CLIENT_SECRET", 
  WORKOS_ISSUER = "WORKOS_ISSUER",
  
  // Stripe Payment Processing (KMS-backed)
  STRIPE_API_KEY = "STRIPE_API_KEY",
  STRIPE_WEBHOOK_SECRET = "STRIPE_WEBHOOK_SECRET",
  
  // Kisi Access Control
  KISI_API_KEY = "KISI_API_KEY",
  
  // Monitoring & Alerts
  SENTRY_DSN = "SENTRY_DSN",
  SLACK_WEBHOOK_URL = "SLACK_WEBHOOK_URL",
  
  // Encryption
  ENCRYPTION_KEY = "ENCRYPTION_KEY",
  
  // External KMS
  AWS_ACCESS_KEY_ID = "AWS_ACCESS_KEY_ID",
  AWS_SECRET_ACCESS_KEY = "AWS_SECRET_ACCESS_KEY",
  AWS_REGION = "AWS_REGION",
  KMS_KEY_ID = "KMS_KEY_ID"
}

/**
 * Configuration for each secret type
 */
interface SecretConfig {
  required: boolean;
  useKMS: boolean;
  description: string;
  fallbackAllowed: boolean;
}

const SECRET_CONFIGS: Record<SecretType, SecretConfig> = {
  [SecretType.WORKOS_CLIENT_ID]: {
    required: true,
    useKMS: false,
    description: "WorkOS authentication client ID",
    fallbackAllowed: false
  },
  [SecretType.WORKOS_CLIENT_SECRET]: {
    required: true,
    useKMS: false,
    description: "WorkOS authentication client secret",
    fallbackAllowed: false
  },
  [SecretType.WORKOS_ISSUER]: {
    required: true,
    useKMS: false,
    description: "WorkOS issuer URL",
    fallbackAllowed: false
  },
  [SecretType.STRIPE_API_KEY]: {
    required: false, // Optional until payments implemented
    useKMS: true,
    description: "Stripe API key for payment processing",
    fallbackAllowed: true
  },
  [SecretType.STRIPE_WEBHOOK_SECRET]: {
    required: false,
    useKMS: true,
    description: "Stripe webhook verification secret",
    fallbackAllowed: true
  },
  [SecretType.KISI_API_KEY]: {
    required: false, // Optional until access control implemented
    useKMS: false,
    description: "Kisi API key for access control",
    fallbackAllowed: true
  },
  [SecretType.SENTRY_DSN]: {
    required: false,
    useKMS: false,
    description: "Sentry DSN for error tracking",
    fallbackAllowed: true
  },
  [SecretType.SLACK_WEBHOOK_URL]: {
    required: false,
    useKMS: false,
    description: "Slack webhook URL for alerts",
    fallbackAllowed: true
  },
  [SecretType.ENCRYPTION_KEY]: {
    required: true,
    useKMS: false,
    description: "Application encryption key",
    fallbackAllowed: false
  },
  [SecretType.AWS_ACCESS_KEY_ID]: {
    required: false, // Only needed if using KMS
    useKMS: false,
    description: "AWS access key for KMS",
    fallbackAllowed: false
  },
  [SecretType.AWS_SECRET_ACCESS_KEY]: {
    required: false,
    useKMS: false,
    description: "AWS secret key for KMS",
    fallbackAllowed: false
  },
  [SecretType.AWS_REGION]: {
    required: false,
    useKMS: false,
    description: "AWS region for KMS",
    fallbackAllowed: false
  },
  [SecretType.KMS_KEY_ID]: {
    required: false,
    useKMS: false,
    description: "AWS KMS key ID",
    fallbackAllowed: false
  }
};

/**
 * In-memory cache for non-sensitive configuration values
 * Note: Payment keys and other sensitive data are never cached
 */
const secretCache = new Map<SecretType, { value: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a secret value with proper error handling and audit logging
 */
export async function getSecret(
  secretType: SecretType,
  ctx?: { db?: any; logger?: any }
): Promise<string> {
  const config = SECRET_CONFIGS[secretType];
  
  // Log access attempt (audit trail)
  if (ctx?.db) {
    await logSecretAccess(ctx.db, secretType, "access_attempt");
  }
  
  try {
    let value: string | undefined;
    
    // Check cache first (only for non-sensitive secrets)
    if (!config.useKMS && shouldUseCache(secretType)) {
      const cached = secretCache.get(secretType);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        value = cached.value;
      }
    }
    
    // Get from environment if not cached
    if (!value) {
      if (config.useKMS) {
        // Use KMS for highly sensitive secrets
        value = await getSecretFromKMS(secretType);
      } else {
        // Use Convex environment variables
        value = process.env[secretType];
      }
      
      // Cache non-sensitive values
      if (value && !config.useKMS && shouldUseCache(secretType)) {
        secretCache.set(secretType, { value, timestamp: Date.now() });
      }
    }
    
    // Validate secret exists
    if (!value) {
      if (config.required && !config.fallbackAllowed) {
        const error = new ConvexError(`Required secret ${secretType} is missing`);
        if (ctx?.db) {
          await logSecretAccess(ctx.db, secretType, "missing_required");
        }
        throw error;
      }
      
      // Return empty string for optional secrets
      if (ctx?.db) {
        await logSecretAccess(ctx.db, secretType, "missing_optional");
      }
      return "";
    }
    
    // Log successful access
    if (ctx?.db) {
      await logSecretAccess(ctx.db, secretType, "success");
    }
    
    return value;
  } catch (error) {
    // Log error (without exposing secret value)
    if (ctx?.db) {
      await logSecretAccess(ctx.db, secretType, "error", 
        error instanceof Error ? error.message : "Unknown error");
    }
    
    // Re-throw or provide fallback
    if (config.required && !config.fallbackAllowed) {
      throw error;
    }
    
    return "";
  }
}

/**
 * Get secret from external KMS (AWS Secrets Manager)
 */
async function getSecretFromKMS(secretType: SecretType): Promise<string> {
  // This will be implemented in the KMS module
  // For now, fallback to environment variable
  const value = process.env[secretType];
  if (!value) {
    throw new ConvexError(`KMS secret ${secretType} not available`);
  }
  return value;
}

/**
 * Determine if a secret should be cached
 */
function shouldUseCache(secretType: SecretType): boolean {
  // Never cache sensitive secrets
  const noCacheSecrets = [
    SecretType.WORKOS_CLIENT_SECRET,
    SecretType.STRIPE_API_KEY,
    SecretType.STRIPE_WEBHOOK_SECRET,
    SecretType.KISI_API_KEY,
    SecretType.ENCRYPTION_KEY,
    SecretType.AWS_SECRET_ACCESS_KEY
  ];
  
  return !noCacheSecrets.includes(secretType);
}

/**
 * Log secret access for audit trail
 */
async function logSecretAccess(
  db: any,
  secretType: SecretType,
  accessType: "access_attempt" | "success" | "missing_required" | "missing_optional" | "error",
  errorMessage?: string
): Promise<void> {
  try {
    // Check if db has insert method (Convex query context)
    if (db && typeof db.insert === 'function') {
      await db.insert("auditLogs", {
        action: "secret_access",
        details: {
          secretType,
          accessType,
          error: errorMessage || null,
          timestamp: Date.now()
        },
        timestamp: Date.now(),
        source: "secret_manager",
        severity: accessType === "error" || accessType === "missing_required" ? "error" : "info"
      });
    } else {
      // Fallback for testing or when db context is not available
      console.log(`Secret access: ${secretType} - ${accessType}${errorMessage ? ` (${errorMessage})` : ''}`);
    }
  } catch (err) {
    // Don't let audit logging failures break the application
    console.error("Failed to log secret access:", err);
  }
}

/**
 * Typed getters for specific secrets
 */
export class SecretManager {
  constructor(private ctx?: { db?: any; logger?: any }) {}
  
  async getWorkOSClientId(): Promise<string> {
    return getSecret(SecretType.WORKOS_CLIENT_ID, this.ctx);
  }
  
  async getWorkOSClientSecret(): Promise<string> {
    return getSecret(SecretType.WORKOS_CLIENT_SECRET, this.ctx);
  }
  
  async getWorkOSIssuer(): Promise<string> {
    return getSecret(SecretType.WORKOS_ISSUER, this.ctx);
  }
  
  async getStripeApiKey(): Promise<string> {
    return getSecret(SecretType.STRIPE_API_KEY, this.ctx);
  }
  
  async getStripeWebhookSecret(): Promise<string> {
    return getSecret(SecretType.STRIPE_WEBHOOK_SECRET, this.ctx);
  }
  
  async getKisiApiKey(): Promise<string> {
    return getSecret(SecretType.KISI_API_KEY, this.ctx);
  }
  
  async getSentryDSN(): Promise<string> {
    return getSecret(SecretType.SENTRY_DSN, this.ctx);
  }
  
  async getSlackWebhookUrl(): Promise<string> {
    return getSecret(SecretType.SLACK_WEBHOOK_URL, this.ctx);
  }
  
  async getEncryptionKey(): Promise<string> {
    return getSecret(SecretType.ENCRYPTION_KEY, this.ctx);
  }
}

/**
 * Validate all required secrets on application startup
 */
export async function validateRequiredSecrets(ctx?: { db?: any }): Promise<{
  valid: boolean;
  missing: SecretType[];
  errors: string[];
}> {
  const missing: SecretType[] = [];
  const errors: string[] = [];
  
  for (const [secretType, config] of Object.entries(SECRET_CONFIGS)) {
    if (config.required) {
      try {
        const value = await getSecret(secretType as SecretType, ctx);
        if (!value) {
          missing.push(secretType as SecretType);
        }
      } catch (error) {
        errors.push(`${secretType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
  
  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors
  };
}

/**
 * Clear secret cache (useful for testing or key rotation)
 */
export function clearSecretCache(): void {
  secretCache.clear();
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats(): {
  size: number;
  entries: Array<{ secretType: string; age: number }>;
} {
  const entries = Array.from(secretCache.entries()).map(([secretType, { timestamp }]) => ({
    secretType,
    age: Date.now() - timestamp
  }));
  
  return { size: secretCache.size, entries };
}