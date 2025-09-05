/**
 * TryZore Input Sanitization Framework
 * 
 * Security-focused sanitization helpers for preventing XSS, injection attacks,
 * and ensuring data integrity in the fitness management system.
 */

import { ValidationError } from "./errors";

// ====================
// XSS PREVENTION
// ====================

/**
 * HTML entities that need to be escaped to prevent XSS
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#61;',
};

/**
 * Escapes HTML entities to prevent XSS attacks
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError("Input must be a string", "sanitization");
  }
  
  return input.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Strips all HTML tags from input
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    throw new ValidationError("Input must be a string", "sanitization");
  }
  
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Comprehensive XSS prevention - strips HTML and escapes remaining content
 */
export function preventXss(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // First strip HTML tags
  let sanitized = stripHtml(input);
  
  // Then escape any remaining HTML entities
  sanitized = escapeHtml(sanitized);
  
  // Remove javascript: and data: URLs
  sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, '');
  
  return sanitized;
}

/**
 * Detects common XSS attack patterns
 */
export function detectXssAttempt(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<img[\s\S]*?onerror[\s\S]*?>/gi,
    /<svg[\s\S]*?onload[\s\S]*?>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi,
  ];
  
  return xssPatterns.some((pattern) => pattern.test(input));
}

// ====================
// SQL INJECTION PREVENTION
// ====================

/**
 * Detects potential SQL injection patterns
 * Note: Convex doesn't use SQL, but good to prevent in text fields
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  const sqlPatterns = [
    /('|(\\'))|(;)|(\/\*)|(\*\/)|(--)|(\|)/gi,
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
    /\b(script|javascript|vbscript|onload|onerror|onclick)\b/gi,
  ];
  
  return sqlPatterns.some((pattern) => pattern.test(input));
}

// ====================
// INPUT NORMALIZATION
// ====================

/**
 * Normalizes text input - trims whitespace, handles null/undefined
 */
export function normalizeText(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }
  
  if (typeof input !== 'string') {
    return String(input).trim();
  }
  
  return input.trim();
}

/**
 * Normalizes email addresses
 */
export function normalizeEmail(email: string): string {
  if (typeof email !== 'string') {
    throw new ValidationError("Email must be a string", "email");
  }
  
  const normalized = email.trim().toLowerCase();
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new ValidationError("Invalid email format", "email");
  }
  
  return normalized;
}

/**
 * Normalizes phone numbers to E.164 format
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) {
    return null;
  }
  
  if (typeof phone !== 'string') {
    phone = String(phone);
  }
  
  // Remove all non-digit characters except +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // If no country code, assume US (+1)
  if (!normalized.startsWith('+')) {
    // If it's 10 digits, assume US number
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    }
  }
  
  // Validate international phone format (E.164)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(normalized)) {
    throw new ValidationError("Invalid phone number format", "phone");
  }
  
  return normalized;
}

/**
 * Normalizes names - trims, capitalizes properly, preserves international characters
 */
export function normalizeName(name: string): string {
  if (typeof name !== 'string') {
    throw new ValidationError("Name must be a string", "name");
  }
  
  // Trim and normalize whitespace
  let normalized = name.trim().replace(/\s+/g, ' ');
  
  // Remove dangerous characters but preserve Unicode letters, spaces, hyphens, apostrophes, and periods
  // Unicode property escapes: \p{L} matches any Unicode letter
  normalized = normalized.replace(/[^\p{L}\s'.-]/gu, '');
  
  // Capitalize first letter of each word (works with Unicode)
  normalized = normalized.replace(/\b\p{L}/gu, char => char.toUpperCase());
  
  if (normalized.length === 0) {
    throw new ValidationError("Name cannot be empty", "name");
  }
  
  if (normalized.length > 50) {
    throw new ValidationError("Name is too long (max 50 characters)", "name");
  }
  
  return normalized;
}

/**
 * Removes control characters that could cause issues
 */
export function removeControlCharacters(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove control characters but keep tabs, newlines, and carriage returns
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// ====================
// BUSINESS-SPECIFIC SANITIZATION
// ====================

/**
 * Sanitizes gym/business names
 */
export function sanitizeBusinessName(name: string): string {
  if (typeof name !== 'string') {
    throw new ValidationError("Business name must be a string", "businessName");
  }
  
  // Prevent XSS
  let sanitized = preventXss(name);
  
  // Normalize text
  sanitized = normalizeText(sanitized);
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Validate length
  if (sanitized.length === 0) {
    throw new ValidationError("Business name cannot be empty", "businessName");
  }
  
  if (sanitized.length > 100) {
    throw new ValidationError("Business name is too long (max 100 characters)", "businessName");
  }
  
  return sanitized;
}

/**
 * Sanitizes and validates membership types against business rules
 */
export function sanitizeMembershipType(type: string): string {
  if (typeof type !== 'string') {
    throw new ValidationError("Membership type must be a string", "membershipType");
  }
  
  const sanitized = normalizeText(type).toLowerCase();
  
  // Comprehensive allowed membership types for fitness business
  const allowedTypes = [
    // Standard memberships
    'monthly', 'annual', 'quarterly', 'weekly',
    // Day passes and trials
    'day_pass', 'trial', 'guest_pass',
    // Discounted memberships
    'student', 'senior', 'military', 'corporate', 'family',
    // Premium tiers
    'premium', 'vip', 'platinum', 'gold', 'silver',
    // Specialty programs
    'personal_training', 'group_classes', 'yoga', 'pilates',
    // Enterprise options
    'enterprise', 'unlimited', 'off_peak'
  ];
  
  if (!allowedTypes.includes(sanitized)) {
    throw new ValidationError(`Invalid membership type '${sanitized}'. Allowed types: ${allowedTypes.join(', ')}`, "membershipType");
  }
  
  return sanitized;
}

/**
 * Sanitizes workout/exercise notes with minimal formatting disruption
 */
export function sanitizeNotes(notes: string | null | undefined): string | null {
  if (!notes) {
    return null;
  }
  
  if (typeof notes !== 'string') {
    notes = String(notes);
  }
  
  // Check for dangerous XSS patterns first
  if (detectXssAttempt(notes)) {
    throw new ValidationError("Notes contain potentially malicious content", "notes");
  }
  
  // Strip HTML tags but preserve common safe characters
  let sanitized = stripHtml(notes);
  
  // Remove control characters but keep newlines, tabs, and common punctuation
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Only escape the most dangerous characters, preserve common punctuation like /
  sanitized = sanitized.replace(/[<>&"'`]/g, (match) => {
    const safeReplacements: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#96;',
    };
    return safeReplacements[match] || match;
  });
  
  // Trim and normalize
  sanitized = sanitized.trim();
  
  // Limit length for performance
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...';
  }
  
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Sanitizes tags/labels
 */
export function sanitizeTag(tag: string): string {
  if (typeof tag !== 'string') {
    throw new ValidationError("Tag must be a string", "tag");
  }
  
  // Prevent XSS and normalize
  let sanitized = preventXss(tag.trim().toLowerCase());
  
  // Remove special characters except hyphens and underscores
  sanitized = sanitized.replace(/[^a-z0-9_-]/g, '');
  
  if (sanitized.length === 0) {
    throw new ValidationError("Tag cannot be empty", "tag");
  }
  
  if (sanitized.length > 30) {
    throw new ValidationError("Tag is too long (max 30 characters)", "tag");
  }
  
  return sanitized;
}

/**
 * Sanitizes array of tags
 */
export function sanitizeTags(tags: string[] | null | undefined): string[] | null {
  if (!tags || !Array.isArray(tags)) {
    return null;
  }
  
  const sanitized = tags
    .map(tag => {
      try {
        return sanitizeTag(tag);
      } catch {
        return null; // Skip invalid tags
      }
    })
    .filter(tag => tag !== null) as string[];
  
  // Remove duplicates
  return [...new Set(sanitized)];
}

// ====================
// VALIDATION HELPERS
// ====================

/**
 * Validates string length with context
 */
export function validateStringLength(
  input: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 255
): void {
  if (typeof input !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  
  if (input.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`, fieldName);
  }
  
  if (input.length > maxLength) {
    throw new ValidationError(`${fieldName} must not exceed ${maxLength} characters`, fieldName);
  }
}

/**
 * Comprehensive input sanitization for any text field
 */
export function sanitizeInput(
  input: string,
  fieldName: string,
  options: {
    preventXss?: boolean;
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    normalize?: boolean;
  } = {}
): string {
  const {
    preventXss: shouldPreventXss = true,
    maxLength = 255,
    minLength = 0,
    allowHtml = false,
    normalize = true,
  } = options;
  
  if (typeof input !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  
  let sanitized = input;
  
  // Detect XSS attempts
  if (detectXssAttempt(sanitized)) {
    throw new ValidationError(`${fieldName} contains potentially malicious content`, fieldName);
  }
  
  // Detect SQL injection attempts
  if (detectSqlInjection(sanitized)) {
    throw new ValidationError(`${fieldName} contains potentially malicious SQL patterns`, fieldName);
  }
  
  // Apply XSS prevention
  if (shouldPreventXss && !allowHtml) {
    sanitized = preventXss(sanitized);
  }
  
  // Normalize
  if (normalize) {
    sanitized = normalizeText(sanitized);
  }
  
  // Remove control characters
  sanitized = removeControlCharacters(sanitized);
  
  // Validate length
  validateStringLength(sanitized, fieldName, minLength, maxLength);
  
  return sanitized;
}

// ====================
// EXPORTS
// ====================

// All functions are already exported individually above,
// no need for a duplicate export block.