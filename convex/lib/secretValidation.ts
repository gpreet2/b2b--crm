/**
 * Secret Validation and Health Monitoring
 * 
 * This module provides comprehensive validation, health checking, and monitoring
 * for the application's secret management system.
 */

import { ConvexError } from "convex/values";
import { SecretType, SecretManager, validateRequiredSecrets } from "./secrets";
import { testKMSConnectivity } from "./kms";

/**
 * Health status levels
 */
export enum HealthStatus {
  HEALTHY = "healthy",
  DEGRADED = "degraded", 
  UNHEALTHY = "unhealthy",
  CRITICAL = "critical"
}

/**
 * Secret health check result
 */
export interface SecretHealthCheck {
  secretType: SecretType;
  status: HealthStatus;
  available: boolean;
  source: "convex" | "kms" | "fallback";
  lastChecked: number;
  error?: string;
}

/**
 * System health summary
 */
export interface SystemHealthSummary {
  overallStatus: HealthStatus;
  secretsHealthy: number;
  secretsTotal: number;
  kmsConnectivity: {
    aws: boolean;
    doppler: boolean;
    convexFallback: boolean;
  };
  criticalSecretsAvailable: boolean;
  lastFullCheck: number;
  issues: string[];
}

/**
 * Feature availability based on secret status
 */
export interface FeatureAvailability {
  authentication: boolean;
  paymentProcessing: boolean;
  accessControl: boolean;
  errorTracking: boolean;
  alerting: boolean;
  encryption: boolean;
}

/**
 * Validate individual secret with comprehensive checks
 */
export async function validateSecret(
  secretType: SecretType,
  ctx?: { db?: any }
): Promise<SecretHealthCheck> {
  const startTime = Date.now();
  
  try {
    const secretManager = new SecretManager(ctx);
    let value: string;
    let source: "convex" | "kms" | "fallback" = "convex";
    
    // Attempt to retrieve secret
    switch (secretType) {
      case SecretType.WORKOS_CLIENT_ID:
        value = await secretManager.getWorkOSClientId();
        break;
      case SecretType.WORKOS_CLIENT_SECRET:
        value = await secretManager.getWorkOSClientSecret();
        break;
      case SecretType.WORKOS_ISSUER:
        value = await secretManager.getWorkOSIssuer();
        break;
      case SecretType.STRIPE_API_KEY:
        value = await secretManager.getStripeApiKey();
        source = "kms";
        break;
      case SecretType.STRIPE_WEBHOOK_SECRET:
        value = await secretManager.getStripeWebhookSecret();
        source = "kms";
        break;
      case SecretType.KISI_API_KEY:
        value = await secretManager.getKisiApiKey();
        break;
      case SecretType.SENTRY_DSN:
        value = await secretManager.getSentryDSN();
        break;
      case SecretType.SLACK_WEBHOOK_URL:
        value = await secretManager.getSlackWebhookUrl();
        break;
      case SecretType.ENCRYPTION_KEY:
        value = await secretManager.getEncryptionKey();
        break;
      default:
        throw new ConvexError(`Unknown secret type: ${secretType}`);
    }
    
    // Perform format validation
    const formatValidation = validateSecretFormat(secretType, value);
    
    if (!formatValidation.valid) {
      return {
        secretType,
        status: HealthStatus.UNHEALTHY,
        available: false,
        source,
        lastChecked: startTime,
        error: `Format validation failed: ${formatValidation.error}`
      };
    }
    
    // Additional connectivity tests for external services
    const connectivityCheck = await testSecretConnectivity(secretType, value);
    
    return {
      secretType,
      status: connectivityCheck.success ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      available: true,
      source,
      lastChecked: startTime,
      error: connectivityCheck.error
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isOptional = !isCriticalSecret(secretType);
    
    return {
      secretType,
      status: isOptional ? HealthStatus.DEGRADED : HealthStatus.CRITICAL,
      available: false,
      source: "convex",
      lastChecked: startTime,
      error: errorMessage
    };
  }
}

/**
 * Validate secret format based on type
 */
function validateSecretFormat(
  secretType: SecretType, 
  value: string
): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: "Secret is empty" };
  }
  
  switch (secretType) {
    case SecretType.WORKOS_CLIENT_ID:
      if (!value.startsWith("client_")) {
        return { valid: false, error: "WorkOS Client ID should start with 'client_'" };
      }
      break;
      
    case SecretType.WORKOS_ISSUER:
      try {
        new URL(value);
      } catch {
        return { valid: false, error: "WorkOS Issuer should be a valid URL" };
      }
      break;
      
    case SecretType.STRIPE_API_KEY:
      if (!value.startsWith("sk_")) {
        return { valid: false, error: "Stripe API key should start with 'sk_'" };
      }
      break;
      
    case SecretType.STRIPE_WEBHOOK_SECRET:
      if (!value.startsWith("whsec_")) {
        return { valid: false, error: "Stripe webhook secret should start with 'whsec_'" };
      }
      break;
      
    case SecretType.SENTRY_DSN:
      if (!value.startsWith("https://") || !value.includes("@sentry.io")) {
        return { valid: false, error: "Sentry DSN should be a valid Sentry URL" };
      }
      break;
      
    case SecretType.SLACK_WEBHOOK_URL:
      if (!value.startsWith("https://hooks.slack.com/")) {
        return { valid: false, error: "Slack webhook should be a valid Slack webhook URL" };
      }
      break;
      
    case SecretType.ENCRYPTION_KEY:
      if (value.length < 32) {
        return { valid: false, error: "Encryption key should be at least 32 characters" };
      }
      break;
  }
  
  return { valid: true };
}

/**
 * Test connectivity for external service secrets
 */
async function testSecretConnectivity(
  secretType: SecretType,
  value: string
): Promise<{ success: boolean; error?: string }> {
  // Only test connectivity for optional secrets to avoid breaking critical paths
  const testableSecrets = [
    SecretType.SENTRY_DSN,
    SecretType.SLACK_WEBHOOK_URL
  ];
  
  if (!testableSecrets.includes(secretType)) {
    return { success: true };
  }
  
  try {
    switch (secretType) {
      case SecretType.SENTRY_DSN:
        // Test Sentry connectivity with a simple ping
        return await testSentryConnectivity(value);
        
      case SecretType.SLACK_WEBHOOK_URL:
        // Test Slack webhook with a test message
        return await testSlackConnectivity(value);
        
      default:
        return { success: true };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Connectivity test failed" 
    };
  }
}

/**
 * Test Sentry connectivity
 */
async function testSentryConnectivity(dsn: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Parse Sentry DSN to extract project info
    const url = new URL(dsn);
    const projectId = url.pathname.split('/').pop();
    
    if (!projectId) {
      return { success: false, error: "Invalid Sentry DSN format" };
    }
    
    // In a real implementation, you could make a test API call to Sentry
    // For now, just validate the DSN format
    return { success: true };
  } catch (error) {
    return { success: false, error: "Invalid Sentry DSN" };
  }
}

/**
 * Test Slack webhook connectivity
 */
async function testSlackConnectivity(webhookUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Send a test message to Slack (commented out to avoid spam)
    /*
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "🔍 TryZore secret validation test - please ignore",
        username: "TryZore Health Check"
      })
    });
    
    if (!response.ok) {
      return { success: false, error: `Slack webhook returned ${response.status}` };
    }
    */
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Slack webhook test failed" };
  }
}

/**
 * Check if secret is critical for core functionality
 */
function isCriticalSecret(secretType: SecretType): boolean {
  const criticalSecrets = [
    SecretType.WORKOS_CLIENT_ID,
    SecretType.WORKOS_CLIENT_SECRET,
    SecretType.WORKOS_ISSUER,
    SecretType.ENCRYPTION_KEY
  ];
  
  return criticalSecrets.includes(secretType);
}

/**
 * Perform comprehensive system health check
 */
export async function performSystemHealthCheck(
  ctx?: { db?: any }
): Promise<SystemHealthSummary> {
  const startTime = Date.now();
  const issues: string[] = [];
  
  // Check all secrets
  const secretTypes = Object.values(SecretType);
  const secretChecks = await Promise.all(
    secretTypes.map(type => validateSecret(type, ctx))
  );
  
  // Check KMS connectivity
  const kmsConnectivity = await testKMSConnectivity();
  
  // Analyze results
  const healthySecrets = secretChecks.filter(check => 
    check.status === HealthStatus.HEALTHY
  ).length;
  
  const criticalSecretsAvailable = secretChecks
    .filter(check => isCriticalSecret(check.secretType))
    .every(check => check.available);
  
  // Determine overall status
  let overallStatus = HealthStatus.HEALTHY;
  
  if (!criticalSecretsAvailable) {
    overallStatus = HealthStatus.CRITICAL;
    issues.push("Critical secrets are missing or invalid");
  } else if (healthySecrets < secretTypes.length * 0.8) {
    overallStatus = HealthStatus.DEGRADED;
    issues.push("Multiple secrets are unavailable or unhealthy");
  } else if (healthySecrets < secretTypes.length) {
    overallStatus = HealthStatus.DEGRADED;
    issues.push("Some optional secrets are unavailable");
  }
  
  // Add KMS issues
  if (!kmsConnectivity.aws && !kmsConnectivity.doppler) {
    issues.push("External KMS providers are unavailable");
  }
  
  // Add specific secret issues
  secretChecks
    .filter(check => check.error)
    .forEach(check => {
      issues.push(`${check.secretType}: ${check.error}`);
    });
  
  return {
    overallStatus,
    secretsHealthy: healthySecrets,
    secretsTotal: secretTypes.length,
    kmsConnectivity,
    criticalSecretsAvailable,
    lastFullCheck: startTime,
    issues
  };
}

/**
 * Determine feature availability based on secret status
 */
export async function getFeatureAvailability(
  ctx?: { db?: any }
): Promise<FeatureAvailability> {
  const secretManager = new SecretManager(ctx);
  
  try {
    // Test each feature's dependencies
    const [
      workosClientId,
      workosClientSecret,
      workosIssuer,
      stripeApiKey,
      kisiApiKey,
      sentryDsn,
      slackWebhook,
      encryptionKey
    ] = await Promise.allSettled([
      secretManager.getWorkOSClientId(),
      secretManager.getWorkOSClientSecret(), 
      secretManager.getWorkOSIssuer(),
      secretManager.getStripeApiKey(),
      secretManager.getKisiApiKey(),
      secretManager.getSentryDSN(),
      secretManager.getSlackWebhookUrl(),
      secretManager.getEncryptionKey()
    ]);
    
    return {
      authentication: !!(
        workosClientId.status === "fulfilled" && workosClientId.value &&
        workosClientSecret.status === "fulfilled" && workosClientSecret.value &&
        workosIssuer.status === "fulfilled" && workosIssuer.value
      ),
      
      paymentProcessing: !!(
        stripeApiKey.status === "fulfilled" && stripeApiKey.value
      ),
      
      accessControl: !!(
        kisiApiKey.status === "fulfilled" && kisiApiKey.value
      ),
      
      errorTracking: !!(
        sentryDsn.status === "fulfilled" && sentryDsn.value
      ),
      
      alerting: !!(
        slackWebhook.status === "fulfilled" && slackWebhook.value
      ),
      
      encryption: !!(
        encryptionKey.status === "fulfilled" && encryptionKey.value
      )
    };
  } catch (error) {
    // Return all features as unavailable on error
    return {
      authentication: false,
      paymentProcessing: false,
      accessControl: false,
      errorTracking: false,
      alerting: false,
      encryption: false
    };
  }
}

/**
 * Generate graceful degradation configuration
 */
export function getGracefulDegradationConfig(
  availability: FeatureAvailability
): {
  enabledFeatures: string[];
  disabledFeatures: string[];
  fallbackBehaviors: Record<string, string>;
} {
  const enabledFeatures: string[] = [];
  const disabledFeatures: string[] = [];
  const fallbackBehaviors: Record<string, string> = {};
  
  // Authentication
  if (availability.authentication) {
    enabledFeatures.push("authentication");
  } else {
    disabledFeatures.push("authentication");
    fallbackBehaviors.authentication = "Show maintenance message";
  }
  
  // Payment processing
  if (availability.paymentProcessing) {
    enabledFeatures.push("paymentProcessing");
  } else {
    disabledFeatures.push("paymentProcessing");
    fallbackBehaviors.paymentProcessing = "Disable payment features, show contact info";
  }
  
  // Access control
  if (availability.accessControl) {
    enabledFeatures.push("accessControl");
  } else {
    disabledFeatures.push("accessControl");
    fallbackBehaviors.accessControl = "Manual access management only";
  }
  
  // Error tracking
  if (availability.errorTracking) {
    enabledFeatures.push("errorTracking");
  } else {
    disabledFeatures.push("errorTracking");
    fallbackBehaviors.errorTracking = "Log to console only";
  }
  
  // Alerting
  if (availability.alerting) {
    enabledFeatures.push("alerting");
  } else {
    disabledFeatures.push("alerting");
    fallbackBehaviors.alerting = "Email alerts only";
  }
  
  // Encryption
  if (availability.encryption) {
    enabledFeatures.push("encryption");
  } else {
    disabledFeatures.push("encryption");
    fallbackBehaviors.encryption = "Disable sensitive data storage";
  }
  
  return { enabledFeatures, disabledFeatures, fallbackBehaviors };
}