import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { logger } from '@/utils/logger';

const scryptAsync = promisify(scrypt);

// Encryption configuration
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 32,
} as const;

// Get encryption key from environment or generate one for development
function getEncryptionKey(): string {
  const key = process.env.ONBOARDING_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ONBOARDING_ENCRYPTION_KEY environment variable is required in production');
    }
    // Use a consistent development key for testing
    return 'dev-key-32chars-for-testing-only!!';
  }
  return key;
}

/**
 * Encrypt sensitive onboarding state data
 */
export async function encryptState(data: any): Promise<string> {
  try {
    const plaintext = JSON.stringify(data);
    const masterKey = getEncryptionKey();
    
    // Generate salt and derive key
    const salt = randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
    const key = (await scryptAsync(masterKey, salt, ENCRYPTION_CONFIG.KEY_LENGTH)) as Buffer;
    
    // Generate IV
    const iv = randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    
    // Create cipher
    const cipher = createCipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
    
    return combined.toString('base64');
  } catch (error) {
    logger.error('Failed to encrypt onboarding state', { error });
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive onboarding state data
 */
export async function decryptState<T = any>(encryptedData: string): Promise<T> {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    const masterKey = getEncryptionKey();
    
    // Extract components
    const salt = combined.subarray(0, ENCRYPTION_CONFIG.SALT_LENGTH);
    const iv = combined.subarray(
      ENCRYPTION_CONFIG.SALT_LENGTH, 
      ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH
    );
    const tag = combined.subarray(
      ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH,
      ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
    );
    const encrypted = combined.subarray(
      ENCRYPTION_CONFIG.SALT_LENGTH + ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
    );
    
    // Derive key
    const key = (await scryptAsync(masterKey, salt, ENCRYPTION_CONFIG.KEY_LENGTH)) as Buffer;
    
    // Create decipher
    const decipher = createDecipheriv(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    logger.error('Failed to decrypt onboarding state', { error });
    throw new Error('Decryption failed');
  }
}

/**
 * Generate CSRF token for form protection
 */
export function generateCSRFToken(): { token: string; timestamp: number } {
  const token = randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000);
  
  return { token, timestamp };
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  token: string, 
  timestamp: number, 
  maxAgeSeconds: number = 3600
): boolean {
  try {
    // Check for invalid timestamp
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      logger.debug('Invalid timestamp', { timestamp });
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const age = now - timestamp;
    
    // Check if token is not expired
    if (age > maxAgeSeconds) {
      logger.debug('CSRF token expired', { age, maxAgeSeconds });
      return false;
    }
    
    // Basic token format validation
    if (!/^[a-f0-9]{32}$/.test(token)) {
      logger.debug('Invalid CSRF token format');
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('CSRF token validation failed', { error });
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize onboarding state
 */
export function sanitizeOnboardingState(state: any): any {
  if (!state || typeof state !== 'object') {
    return {};
  }
  
  const sanitized = { ...state };
  
  // Sanitize string fields
  if (sanitized.organizationName) {
    sanitized.organizationName = sanitizeInput(sanitized.organizationName);
  }
  if (sanitized.firstName) {
    sanitized.firstName = sanitizeInput(sanitized.firstName);
  }
  if (sanitized.lastName) {
    sanitized.lastName = sanitizeInput(sanitized.lastName);
  }
  
  // Sanitize locations
  if (Array.isArray(sanitized.locations)) {
    sanitized.locations = sanitized.locations.map((location: any) => ({
      id: sanitizeInput(location.id || ''),
      name: sanitizeInput(location.name || ''),
      address: sanitizeInput(location.address || ''),
    }));
  }
  
  return sanitized;
}