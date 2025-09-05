import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireOrganizationAccess } from "./auth";
import { withErrorHandling, withErrorHandlingMutation, validateRequired, requireResource } from "./lib/errorHandler";
import { ValidationError, ResourceNotFoundError } from "./lib/errors";
import { 
  createOrganizationValidator, 
  organizationSettingsValidator,
  organizationStatusValidator,
  timezoneValidator,
  businessHoursValidator 
} from "./lib/validators";
import { 
  sanitizeBusinessName, 
  sanitizeInput,
  detectXssAttempt,
  preventXss 
} from "./lib/sanitization";

// Get organization by ID
export const getOrganization = query({
  args: { id: v.id("organizations") },
  handler: withErrorHandling(async (ctx, args) => {
    const organization = await ctx.db.get(args.id);
    requireResource(organization, "Organization", args.id);
    return organization;
  }, "getOrganization"),
});

// Get organizations for current user
export const getCurrentUserOrganizations = query({
  args: {},
  handler: withErrorHandling(async (ctx) => {
    const user = await requireAuth(ctx);
    
    if (!user.organizationId) {
      return [];
    }
    
    const organization = await ctx.db.get(user.organizationId);
    return organization ? [organization] : [];
  }, "getCurrentUserOrganizations"),
});

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    ownerAccountId: v.id("ownerAccounts"),
    settings: v.optional(organizationSettingsValidator),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate required fields
    validateRequired(args.name?.trim(), "name");
    validateRequired(args.ownerAccountId, "ownerAccountId");

    // Check for XSS attempts
    if (detectXssAttempt(args.name)) {
      throw new ValidationError("Organization name contains potentially malicious content", "name");
    }

    // Sanitize organization name using business-specific sanitizer
    const sanitizedName = sanitizeBusinessName(args.name);

    // Validate owner account exists
    const ownerAccount = await ctx.db.get(args.ownerAccountId);
    requireResource(ownerAccount, "OwnerAccount", args.ownerAccountId);

    const now = Date.now();
    
    const defaultSettings = {
      timezone: args.settings?.timezone || "UTC",
      businessHours: {
        monday: { open: "09:00", close: "17:00", enabled: true },
        tuesday: { open: "09:00", close: "17:00", enabled: true },
        wednesday: { open: "09:00", close: "17:00", enabled: true },
        thursday: { open: "09:00", close: "17:00", enabled: true },
        friday: { open: "09:00", close: "17:00", enabled: true },
        saturday: { open: "09:00", close: "17:00", enabled: false },
        sunday: { open: "09:00", close: "17:00", enabled: false },
      },
      currency: args.settings?.currency || "USD",
      locale: args.settings?.locale || "en-US",
    };

    return await ctx.db.insert("organizations", {
      name: sanitizedName,
      ownerAccountId: args.ownerAccountId,
      settings: defaultSettings,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  }, "createOrganization"),
});

// Update organization basic info (name, etc.)
export const updateOrganization = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    status: v.optional(organizationStatusValidator),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.id, "organization.manage");
    
    const org = await ctx.db.get(args.id);
    requireResource(org, "Organization", args.id);

    const updates: any = {};

    // Validate and sanitize name if provided
    if (args.name !== undefined) {
      validateRequired(args.name?.trim(), "name");
      
      // Check for XSS attempts
      if (detectXssAttempt(args.name)) {
        throw new ValidationError("Organization name contains potentially malicious content", "name");
      }
      
      // Sanitize organization name using business-specific sanitizer
      updates.name = sanitizeBusinessName(args.name);
    }

    // Validate status if provided
    if (args.status !== undefined) {
      updates.status = args.status;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(args.id, updates);
    }

    return await ctx.db.get(args.id);
  }, "updateOrganization"),
});

// Update organization settings
export const updateOrganizationSettings = mutation({
  args: {
    id: v.id("organizations"),
    settings: v.object({
      timezone: v.optional(timezoneValidator),
      currency: v.optional(v.string()),
      locale: v.optional(v.string()),
      businessHours: v.optional(v.object({
        monday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        tuesday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        wednesday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        thursday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        friday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        saturday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
        sunday: v.optional(v.object({ open: v.string(), close: v.string(), enabled: v.boolean() })),
      })),
    }),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.id, "organization.manage");
    
    const org = await ctx.db.get(args.id);
    requireResource(org, "Organization", args.id);

    // Validate timezone if provided
    if (args.settings.timezone) {
      const validTimezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin'];
      if (!validTimezones.includes(args.settings.timezone)) {
        throw new ValidationError(`Invalid timezone. Must be one of: ${validTimezones.join(", ")}`, "timezone");
      }
    }

    // Validate currency if provided
    if (args.settings.currency) {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
      if (!validCurrencies.includes(args.settings.currency)) {
        throw new ValidationError(`Invalid currency. Must be one of: ${validCurrencies.join(", ")}`, "currency");
      }
    }

    // Validate locale if provided
    if (args.settings.locale) {
      const validLocales = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'es-ES', 'fr-FR', 'de-DE'];
      if (!validLocales.includes(args.settings.locale)) {
        throw new ValidationError(`Invalid locale. Must be one of: ${validLocales.join(", ")}`, "locale");
      }
    }

    // Validate business hours time format if provided
    if (args.settings.businessHours) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      Object.entries(args.settings.businessHours).forEach(([day, hours]) => {
        if (hours && typeof hours === 'object' && 'open' in hours && 'close' in hours) {
          const typedHours = hours as { open: string; close: string; enabled: boolean };
          if (!timeRegex.test(typedHours.open)) {
            throw new ValidationError(`Invalid open time format for ${day}. Use HH:MM format`, "businessHours");
          }
          if (!timeRegex.test(typedHours.close)) {
            throw new ValidationError(`Invalid close time format for ${day}. Use HH:MM format`, "businessHours");
          }
        }
      });
    }

    const updatedSettings = { ...org.settings };
    
    if (args.settings.timezone) {
      updatedSettings.timezone = args.settings.timezone;
    }
    if (args.settings.currency) {
      updatedSettings.currency = args.settings.currency;
    }
    if (args.settings.locale) {
      updatedSettings.locale = args.settings.locale;
    }
    if (args.settings.businessHours) {
      updatedSettings.businessHours = { ...updatedSettings.businessHours, ...args.settings.businessHours };
    }

    await ctx.db.patch(args.id, {
      settings: updatedSettings,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.id);
  }, "updateOrganizationSettings"),
});

// Get organization locations (for multi-location businesses)
export const getOrganizationLocations = query({
  args: { organizationId: v.id("organizations") },
  handler: withErrorHandling(async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId, "locations.view");
    
    // For now, return a mock location since we don't have a locations table yet
    // Note: When this becomes dynamic data, ensure XSS validation is applied
    return [
      {
        id: "main-location",
        name: "Main Location",
        address: "123 Main St",
        city: "Demo City",
        state: "CA",
        zipCode: "12345",
        phone: "(555) 123-4567",
        isDefault: true,
      }
    ];
  }, "getOrganizationLocations"),
});

// Get organization statistics
export const getOrganizationStats = query({
  args: { organizationId: v.id("organizations") },
  handler: withErrorHandling(async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId, "stats.view");
    
    // Validate organization exists
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);
    
    // Get counts for various entities
    const clientsCount = await ctx.db
      .query("clients")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect()
      .then((clients) => clients.length);
    
    const employeesCount = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect()
      .then((employees) => employees.length);
    
    const eventsCount = await ctx.db
      .query("events")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect()
      .then((events) => events.length);

    return {
      clients: clientsCount,
      employees: employeesCount,
      events: eventsCount,
      activeMembers: clientsCount, // Simplified for now
    };
  }, "getOrganizationStats"),
});