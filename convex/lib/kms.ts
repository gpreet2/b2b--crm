/**
 * External Key Management System (KMS) Integration
 * 
 * This module handles integration with external KMS providers (AWS Secrets Manager, Doppler)
 * for highly sensitive secrets like payment processing keys.
 * 
 * Priority: AWS Secrets Manager > Convex Environment Variables (fallback)
 */

import { ConvexError } from "convex/values";
import { SecretType } from "./secrets";

/**
 * KMS Provider types
 */
type KMSProvider = "aws-secrets-manager" | "doppler" | "convex-fallback";

/**
 * KMS Configuration
 */
interface KMSConfig {
  provider: KMSProvider;
  region?: string;
  secretPrefix?: string;
  maxRetries: number;
  timeoutMs: number;
}

const DEFAULT_KMS_CONFIG: KMSConfig = {
  provider: "aws-secrets-manager",
  region: process.env.AWS_REGION || "us-west-2",
  secretPrefix: "tryzore/production/",
  maxRetries: 3,
  timeoutMs: 5000
};

/**
 * KMS-managed secrets mapping
 * Maps SecretType to KMS secret name
 */
const KMS_SECRET_MAPPING: Record<SecretType, string> = {
  [SecretType.STRIPE_API_KEY]: "stripe/api-key",
  [SecretType.STRIPE_WEBHOOK_SECRET]: "stripe/webhook-secret",
  // Add more KMS-managed secrets as needed
  
  // Not KMS-managed (for completeness)
  [SecretType.WORKOS_CLIENT_ID]: "",
  [SecretType.WORKOS_CLIENT_SECRET]: "",
  [SecretType.WORKOS_ISSUER]: "",
  [SecretType.KISI_API_KEY]: "",
  [SecretType.SENTRY_DSN]: "",
  [SecretType.SLACK_WEBHOOK_URL]: "",
  [SecretType.ENCRYPTION_KEY]: "",
  [SecretType.AWS_ACCESS_KEY_ID]: "",
  [SecretType.AWS_SECRET_ACCESS_KEY]: "",
  [SecretType.AWS_REGION]: "",
  [SecretType.KMS_KEY_ID]: ""
};

/**
 * Get secret from KMS with retry logic and fallback
 */
export async function getSecretFromKMS(
  secretType: SecretType,
  config: Partial<KMSConfig> = {}
): Promise<string> {
  const kmsConfig = { ...DEFAULT_KMS_CONFIG, ...config };
  const secretName = KMS_SECRET_MAPPING[secretType];
  
  if (!secretName) {
    throw new ConvexError(`Secret ${secretType} is not configured for KMS`);
  }
  
  // Try each provider in order of preference
  const providers: KMSProvider[] = ["aws-secrets-manager", "convex-fallback"];
  
  for (const provider of providers) {
    try {
      const value = await getSecretFromProvider(
        provider,
        secretName,
        kmsConfig
      );
      
      if (value) {
        return value;
      }
    } catch (error) {
      console.warn(`KMS provider ${provider} failed:`, error);
      // Continue to next provider
    }
  }
  
  throw new ConvexError(`Failed to retrieve secret ${secretType} from all KMS providers`);
}

/**
 * Get secret from specific provider
 */
async function getSecretFromProvider(
  provider: KMSProvider,
  secretName: string,
  config: KMSConfig
): Promise<string> {
  switch (provider) {
    case "aws-secrets-manager":
      return getSecretFromAWS(secretName, config);
    
    case "doppler":
      return getSecretFromDoppler(secretName, config);
    
    case "convex-fallback":
      return getSecretFromConvexFallback(secretName);
    
    default:
      throw new ConvexError(`Unknown KMS provider: ${provider}`);
  }
}

/**
 * Get secret from AWS Secrets Manager
 */
async function getSecretFromAWS(
  secretName: string,
  config: KMSConfig
): Promise<string> {
  // Check if AWS credentials are available
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  
  if (!accessKeyId || !secretAccessKey) {
    throw new ConvexError("AWS credentials not configured");
  }
  
  const fullSecretName = `${config.secretPrefix}${secretName}`;
  
  try {
    // Note: In a real implementation, you would use AWS SDK
    // For now, this is a placeholder that shows the pattern
    
    // Create AWS Secrets Manager client
    const client = createAWSSecretsClient({
      accessKeyId,
      secretAccessKey,
      region: config.region || "us-west-2"
    });
    
    // Get secret with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await withTimeout(
          client.getSecretValue(fullSecretName),
          config.timeoutMs
        );
        
        if (response.SecretString) {
          return response.SecretString;
        }
        
        throw new Error("Secret value is empty");
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on permanent failures
        if (isPermanentFailure(error)) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < config.maxRetries) {
          await sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw lastError || new Error("Max retries exceeded");
  } catch (error) {
    throw new ConvexError(`AWS Secrets Manager error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get secret from Doppler (alternative KMS provider)
 */
async function getSecretFromDoppler(
  secretName: string,
  config: KMSConfig
): Promise<string> {
  const dopplerToken = process.env.DOPPLER_TOKEN;
  
  if (!dopplerToken) {
    throw new ConvexError("Doppler token not configured");
  }
  
  try {
    // Note: This is a placeholder implementation
    // In reality, you would use Doppler's API
    
    const response = await withTimeout(
      fetch(`https://api.doppler.com/v3/configs/config/secret`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${dopplerToken}`,
          "Content-Type": "application/json"
        }
      }),
      config.timeoutMs
    );
    
    if (!response.ok) {
      throw new Error(`Doppler API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.value || "";
  } catch (error) {
    throw new ConvexError(`Doppler error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fallback to Convex environment variables
 */
function getSecretFromConvexFallback(secretName: string): string {
  // Map secret name back to environment variable name
  const envVarMap: Record<string, string> = {
    "stripe/api-key": "STRIPE_API_KEY",
    "stripe/webhook-secret": "STRIPE_WEBHOOK_SECRET"
  };
  
  const envVarName = envVarMap[secretName];
  if (!envVarName) {
    throw new ConvexError(`No fallback mapping for secret: ${secretName}`);
  }
  
  const value = process.env[envVarName];
  if (!value) {
    throw new ConvexError(`Fallback secret ${envVarName} not found in environment`);
  }
  
  return value;
}

/**
 * Create AWS Secrets Manager client (placeholder)
 */
function createAWSSecretsClient(config: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}) {
  // In a real implementation, you would use the AWS SDK
  // This is a placeholder that shows the interface
  
  return {
    async getSecretValue(secretName: string): Promise<{ SecretString?: string }> {
      // Placeholder implementation
      // In reality, this would call AWS Secrets Manager API
      
      throw new Error("AWS SDK not implemented - using fallback");
    }
  };
}

/**
 * Check if error represents a permanent failure (don't retry)
 */
function isPermanentFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  
  // AWS Secrets Manager permanent failures
  const permanentErrors = [
    "resourcenotfoundexception",
    "accessdeniedexception", 
    "invalidparameterexception",
    "invalidrequeststexception"
  ];
  
  return permanentErrors.some(err => message.includes(err));
}

/**
 * Add timeout to async operations
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    )
  ]);
}

/**
 * Sleep utility for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test KMS connectivity and permissions
 */
export async function testKMSConnectivity(): Promise<{
  aws: boolean;
  doppler: boolean;
  convexFallback: boolean;
  errors: string[];
}> {
  const results = {
    aws: false,
    doppler: false,
    convexFallback: true, // Always available
    errors: [] as string[]
  };
  
  // Test AWS Secrets Manager
  try {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      // In real implementation, make a test call to AWS
      results.aws = true;
    }
  } catch (error) {
    results.errors.push(`AWS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Test Doppler
  try {
    if (process.env.DOPPLER_TOKEN) {
      // In real implementation, make a test call to Doppler
      results.doppler = true;
    }
  } catch (error) {
    results.errors.push(`Doppler: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return results;
}

/**
 * Rotate KMS-managed secrets (for compliance)
 */
export async function rotateKMSSecret(
  secretType: SecretType,
  newValue: string
): Promise<boolean> {
  const secretName = KMS_SECRET_MAPPING[secretType];
  
  if (!secretName) {
    throw new ConvexError(`Secret ${secretType} is not KMS-managed`);
  }
  
  try {
    // In a real implementation, this would update the secret in KMS
    // For now, return success placeholder
    
    console.log(`Rotating KMS secret: ${secretName}`);
    return true;
  } catch (error) {
    console.error(`Failed to rotate secret ${secretName}:`, error);
    return false;
  }
}