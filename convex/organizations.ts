import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireOrganizationAccess } from "./auth";

// Get organization by ID
export const getOrganization = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get organizations for current user
export const getCurrentUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    
    if (!user.organizationId) {
      return [];
    }
    
    const organization = await ctx.db.get(user.organizationId);
    return organization ? [organization] : [];
  },
});

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string(),
    ownerAccountId: v.id("ownerAccounts"),
    settings: v.optional(v.object({
      timezone: v.string(),
      currency: v.optional(v.string()),
      locale: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
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
      name: args.name,
      ownerAccountId: args.ownerAccountId,
      settings: defaultSettings,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update organization settings
export const updateOrganizationSettings = mutation({
  args: {
    id: v.id("organizations"),
    settings: v.object({
      timezone: v.optional(v.string()),
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
  handler: async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.id, "organization.manage");
    
    const org = await ctx.db.get(args.id);
    if (!org) {
      throw new Error("Organization not found");
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
  },
});

// Get organization locations (for multi-location businesses)
export const getOrganizationLocations = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId, "locations.view");
    
    // For now, return a mock location since we don't have a locations table yet
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
  },
});

// Get organization statistics
export const getOrganizationStats = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId, "stats.view");
    
    // Get counts for various entities
    const clientsCount = await ctx.db
      .query("clients")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect()
      .then(clients => clients.length);
    
    const employeesCount = await ctx.db
      .query("employees")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect()
      .then(employees => employees.length);
    
    const eventsCount = await ctx.db
      .query("events")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect()
      .then(events => events.length);

    return {
      clients: clientsCount,
      employees: employeesCount,
      events: eventsCount,
      activeMembers: clientsCount, // Simplified for now
    };
  },
});