/**
 * TryZore Data Validation Framework
 * 
 * Comprehensive validation patterns using Convex validators for secure, type-safe data handling.
 * Prevents bad data at function entry with business-specific validation rules.
 */

import { v } from "convex/values";
import { Infer } from "convex/values";

// ====================
// PRIMITIVE VALIDATORS
// ====================

/**
 * Email validation with RFC compliant regex
 */
export const emailValidator = v.string();

/**
 * Phone number validation (international format)
 * Supports: +1234567890, +1-234-567-8900, +1 (234) 567-8900
 */
export const phoneValidator = v.optional(v.string());

/**
 * URL validation
 */
export const urlValidator = v.string();

/**
 * UUID validation (v4 format)
 */
export const uuidValidator = v.string();

/**
 * Currency amount validation (stored as cents to avoid float precision issues)
 */
export const currencyAmountValidator = v.number();

/**
 * Timezone validation (IANA timezone identifiers)
 */
export const timezoneValidator = v.string();

/**
 * ISO date string validation (YYYY-MM-DD)
 */
export const dateStringValidator = v.string();

/**
 * Time string validation (HH:MM format)
 */
export const timeStringValidator = v.string();

// ====================
// BUSINESS VALIDATORS
// ====================

/**
 * Business hours validator for a single day
 */
export const businessDayValidator = v.object({
  open: timeStringValidator,
  close: timeStringValidator,
  enabled: v.boolean(),
});

/**
 * Complete business hours validator (all days of week)
 */
export const businessHoursValidator = v.object({
  monday: businessDayValidator,
  tuesday: businessDayValidator,
  wednesday: businessDayValidator,
  thursday: businessDayValidator,
  friday: businessDayValidator,
  saturday: businessDayValidator,
  sunday: businessDayValidator,
});

/**
 * Organization settings validator
 */
export const organizationSettingsValidator = v.object({
  timezone: timezoneValidator,
  businessHours: businessHoursValidator,
  currency: v.optional(v.string()),
  locale: v.optional(v.string()),
});

/**
 * Emergency contact validator
 */
export const emergencyContactValidator = v.object({
  name: v.string(),
  phone: phoneValidator,
  relationship: v.string(),
});

/**
 * Client profile data validator
 */
export const clientProfileValidator = v.optional(v.object({
  dateOfBirth: v.optional(dateStringValidator),
  emergencyContact: v.optional(emergencyContactValidator),
  medicalInfo: v.optional(v.string()),
  goals: v.optional(v.string()),
}));

/**
 * User profile data validator
 */
export const userProfileValidator = v.optional(v.object({
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: phoneValidator,
  profilePictureUrl: v.optional(urlValidator),
}));

/**
 * GDPR consent preferences validator
 */
export const consentPreferencesValidator = v.optional(v.object({
  marketing: v.boolean(),
  analytics: v.boolean(),
  dataProcessing: v.boolean(),
  lastUpdated: v.string(), // ISO timestamp
}));

/**
 * Address validator (complete address)
 */
export const addressValidator = v.object({
  street: v.string(),
  street2: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  zipCode: v.string(),
  country: v.string(),
});

// ====================
// ENUM VALIDATORS
// ====================

/**
 * User role validator
 */
export const userRoleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("employee"),
  v.literal("member")
);

/**
 * User status validator
 */
export const userStatusValidator = v.union(
  v.literal("active"),
  v.literal("invited"),
  v.literal("suspended")
);

/**
 * Organization status validator
 */
export const organizationStatusValidator = v.union(
  v.literal("active"),
  v.literal("suspended"),
  v.literal("inactive")
);

/**
 * Membership status validator
 */
export const membershipStatusValidator = v.union(
  v.literal("active"),
  v.literal("inactive"),
  v.literal("frozen"),
  v.literal("expired")
);

/**
 * Access level validator
 */
export const accessLevelValidator = v.union(
  v.literal("full"),
  v.literal("limited"),
  v.literal("none")
);

/**
 * Plan type validator
 */
export const planTypeValidator = v.union(
  v.literal("starter"),
  v.literal("professional"),
  v.literal("enterprise")
);

/**
 * Event status validator
 */
export const eventStatusValidator = v.union(
  v.literal("scheduled"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled")
);

/**
 * Audit log severity validator
 */
export const auditSeverityValidator = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("error")
);

// ====================
// PAGINATION & SEARCH VALIDATORS
// ====================

/**
 * Pagination parameters validator
 */
export const paginationValidator = v.object({
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
});

/**
 * Search parameters validator
 */
export const searchValidator = v.object({
  search: v.optional(v.string()),
  filters: v.optional(v.object({})),
  sortBy: v.optional(v.string()),
  sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
});

// ====================
// ORGANIZATION CONTEXT VALIDATORS
// ====================

/**
 * Organization context validator - ensures user has access to organization
 */
export const organizationContextValidator = v.object({
  organizationId: v.id("organizations"),
});

/**
 * Multi-org context validator - for cross-org operations (admin only)
 */
export const multiOrgContextValidator = v.object({
  organizationIds: v.array(v.id("organizations")),
});

// ====================
// BATCH OPERATION VALIDATORS
// ====================

/**
 * Batch operation validator
 */
export const batchOperationValidator = v.object({
  operations: v.array(v.object({
    id: v.string(),
    operation: v.union(v.literal("create"), v.literal("update"), v.literal("delete")),
    data: v.optional(v.object({})),
  })),
});

// ====================
// FILE UPLOAD VALIDATORS
// ====================

/**
 * File metadata validator
 */
export const fileMetadataValidator = v.object({
  filename: v.string(),
  contentType: v.string(),
  size: v.number(),
  checksum: v.optional(v.string()),
});

// ====================
// TYPE EXPORTS
// ====================

// Export TypeScript types inferred from validators
export type Email = Infer<typeof emailValidator>;
export type Phone = Infer<typeof phoneValidator>;
export type URL = Infer<typeof urlValidator>;
export type UUID = Infer<typeof uuidValidator>;
export type CurrencyAmount = Infer<typeof currencyAmountValidator>;
export type Timezone = Infer<typeof timezoneValidator>;
export type DateString = Infer<typeof dateStringValidator>;
export type TimeString = Infer<typeof timeStringValidator>;

export type BusinessDay = Infer<typeof businessDayValidator>;
export type BusinessHours = Infer<typeof businessHoursValidator>;
export type OrganizationSettings = Infer<typeof organizationSettingsValidator>;
export type EmergencyContact = Infer<typeof emergencyContactValidator>;
export type ClientProfile = Infer<typeof clientProfileValidator>;
export type UserProfile = Infer<typeof userProfileValidator>;
export type ConsentPreferences = Infer<typeof consentPreferencesValidator>;
export type Address = Infer<typeof addressValidator>;

export type UserRole = Infer<typeof userRoleValidator>;
export type UserStatus = Infer<typeof userStatusValidator>;
export type OrganizationStatus = Infer<typeof organizationStatusValidator>;
export type MembershipStatus = Infer<typeof membershipStatusValidator>;
export type AccessLevel = Infer<typeof accessLevelValidator>;
export type PlanType = Infer<typeof planTypeValidator>;
export type EventStatus = Infer<typeof eventStatusValidator>;
export type AuditSeverity = Infer<typeof auditSeverityValidator>;

export type Pagination = Infer<typeof paginationValidator>;
export type Search = Infer<typeof searchValidator>;
export type OrganizationContext = Infer<typeof organizationContextValidator>;
export type MultiOrgContext = Infer<typeof multiOrgContextValidator>;
export type BatchOperation = Infer<typeof batchOperationValidator>;
export type FileMetadata = Infer<typeof fileMetadataValidator>;

// ====================
// COMPOSITE VALIDATORS
// ====================

/**
 * Complete client creation validator
 */
export const createClientValidator = v.object({
  firstName: v.string(),
  lastName: v.string(),
  email: emailValidator,
  phone: phoneValidator,
  organizationId: v.id("organizations"),
  membershipType: v.string(),
  membershipStartDate: v.optional(v.number()),
  profileData: clientProfileValidator,
  tags: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
});

/**
 * Complete user creation validator
 */
export const createUserValidator = v.object({
  workosId: v.string(),
  email: emailValidator,
  name: v.string(),
  organizationId: v.optional(v.id("organizations")),
  role: userRoleValidator,
  permissions: v.array(v.string()),
  profileData: userProfileValidator,
  consentPreferences: consentPreferencesValidator,
});

/**
 * Complete organization creation validator
 */
export const createOrganizationValidator = v.object({
  name: v.string(),
  ownerAccountId: v.id("ownerAccounts"),
  settings: organizationSettingsValidator,
});

export type CreateClient = Infer<typeof createClientValidator>;
export type CreateUser = Infer<typeof createUserValidator>;
export type CreateOrganization = Infer<typeof createOrganizationValidator>;