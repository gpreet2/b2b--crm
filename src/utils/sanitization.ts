import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization utilities for user input
 */

// Text sanitization options
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripTags?: boolean;
  maxLength?: number;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string, options: SanitizeOptions = {}): string {
  const config: any = {
    ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: options.allowedAttributes || { 'a': ['href', 'target'] },
    KEEP_CONTENT: !options.stripTags,
    RETURN_TRUSTED_TYPE: false // Ensure we get a string back, not TrustedHTML
  };

  let sanitized = DOMPurify.sanitize(input, config) as unknown as string;
  
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string, maxLength?: number): string {
  // Remove any HTML tags and their content for script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove other HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize and normalize email addresses
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
}

/**
 * Sanitize and normalize phone numbers
 */
export function sanitizePhone(phone: string, addCountryCode: boolean = true): string {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + for international format
  if (cleaned.length > 0 && !cleaned.startsWith('+') && addCountryCode) {
    // Assume US number if no country code
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
  }
  
  return cleaned;
}

/**
 * Sanitize URL to ensure it's safe
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Prevent javascript: and data: URLs
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      throw new Error('Unsafe URL');
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Sanitize file name to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any path separators
  let sanitized = fileName.replace(/[\/\\]/g, '');
  
  // Remove special characters that could cause issues
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 250 - extension.length) + '.' + extension;
  }
  
  return sanitized || 'unnamed';
}

/**
 * Sanitize and validate hex color
 */
export function sanitizeHexColor(color: string): string {
  const cleaned = color.replace(/[^0-9A-Fa-f#]/g, '');
  
  if (cleaned.match(/^#?[0-9A-Fa-f]{6}$/)) {
    return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
  }
  
  // Return default color if invalid
  return '#000000';
}

/**
 * Sanitize object by removing null/undefined values and empty strings
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'string') {
        cleaned[key as keyof T] = sanitizeText(value) as T[keyof T];
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key as keyof T] = sanitizeObject(value) as T[keyof T];
      } else {
        cleaned[key as keyof T] = value;
      }
    }
  }
  
  return cleaned;
}

/**
 * Sanitize array by removing duplicates and empty values
 */
export function sanitizeArray<T>(arr: T[]): T[] {
  return arr
    .filter(item => item !== null && item !== undefined && item !== '')
    .filter((item, index, self) => self.indexOf(item) === index);
}

/**
 * Sanitize SQL identifier (table/column names)
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Create a slug from text (URL-safe version)
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could break search
  let sanitized = query.replace(/[<>\"'`;()\/]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }
  
  return sanitized;
}

/**
 * Sanitize JSON string
 */
export function sanitizeJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return '{}';
  }
}

/**
 * Create initials from name
 */
export function createInitials(firstName: string, lastName: string): string {
  const first = sanitizeText(firstName).charAt(0).toUpperCase();
  const last = sanitizeText(lastName).charAt(0).toUpperCase();
  return `${first}${last}`;
}

/**
 * Mask sensitive data (e.g., for logs)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const visible = data.substring(0, visibleChars);
  const masked = '*'.repeat(Math.max(data.length - visibleChars, 4));
  return `${visible}${masked}`;
}

/**
 * Sanitize credit card number (remove spaces, validate format)
 */
export function sanitizeCreditCard(cardNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Basic validation (length between 13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return '';
  }
  
  return cleaned;
}

/**
 * Export all sanitizers as a single object for convenience
 */
export const sanitizers = {
  html: sanitizeHtml,
  text: sanitizeText,
  email: sanitizeEmail,
  phone: sanitizePhone,
  url: sanitizeUrl,
  fileName: sanitizeFileName,
  hexColor: sanitizeHexColor,
  object: sanitizeObject,
  array: sanitizeArray,
  sqlIdentifier: sanitizeSqlIdentifier,
  slug: createSlug,
  searchQuery: sanitizeSearchQuery,
  json: sanitizeJson,
  initials: createInitials,
  mask: maskSensitiveData,
  creditCard: sanitizeCreditCard
};