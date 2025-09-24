import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";
import { withErrorHandling, withErrorHandlingMutation, validateRequired, requireResource } from "./lib/errorHandler";
import { ValidationError, ResourceNotFoundError } from "./lib/errors";
import {
  sanitizeBusinessName,
  sanitizeInput,
  detectXssAttempt
} from "./lib/sanitization";

// Get owner account by ID
export const getOwnerAccount = query({
  args: { id: v.id("ownerAccounts") },
  handler: withErrorHandling(async (ctx, args) => {
    const ownerAccount = await ctx.db.get(args.id);
    requireResource(ownerAccount, "OwnerAccount", args.id);
    return ownerAccount;
  }, "getOwnerAccount"),
});

// Get owner account by WorkOS ID
export const getOwnerAccountByWorkOSId = query({
  args: { workosId: v.string() },
  handler: withErrorHandling(async (ctx, args) => {
    const ownerAccount = await ctx.db
      .query("ownerAccounts")
      .withIndex("by_workos_id", (q: any) => q.eq("workosId", args.workosId))
      .unique();

    return ownerAccount;
  }, "getOwnerAccountByWorkOSId"),
});

// Create a new owner account
export const createOwnerAccount = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
    planType: v.optional(v.union(v.literal("starter"), v.literal("professional"), v.literal("enterprise")))
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate required fields
    validateRequired(args.workosId?.trim(), "workosId");
    validateRequired(args.email?.trim(), "email");
    validateRequired(args.name?.trim(), "name");

    // Check for XSS attempts
    if (detectXssAttempt(args.name)) {
      throw new ValidationError("Owner name contains potentially malicious content", "name");
    }
    if (detectXssAttempt(args.email)) {
      throw new ValidationError("Email contains potentially malicious content", "email");
    }

    // Check if owner account already exists
    const existingOwner = await ctx.db
      .query("ownerAccounts")
      .withIndex("by_workos_id", (q: any) => q.eq("workosId", args.workosId))
      .unique();

    if (existingOwner) {
      throw new ValidationError("Owner account already exists for this WorkOS user", "workosId");
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(args.name);
    const sanitizedEmail = sanitizeInput(args.email);

    const now = Date.now();

    return await ctx.db.insert("ownerAccounts", {
      workosId: args.workosId,
      email: sanitizedEmail,
      name: sanitizedName,
      planType: args.planType || "starter",
      createdAt: now,
      updatedAt: now,
    });
  }, "createOwnerAccount"),
});

// Get all organizations for an owner account
export const getOwnerOrganizations = query({
  args: { ownerAccountId: v.id("ownerAccounts") },
  handler: withErrorHandling(async (ctx, args) => {
    // Verify owner account exists
    const ownerAccount = await ctx.db.get(args.ownerAccountId);
    requireResource(ownerAccount, "OwnerAccount", args.ownerAccountId);

    // Get all organizations for this owner
    const organizations = await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q: any) => q.eq("ownerAccountId", args.ownerAccountId))
      .collect();

    return organizations.map(org => ({
      id: org._id,
      name: org.name,
      status: org.status,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      settings: org.settings,
    }));
  }, "getOwnerOrganizations"),
});

// Update owner account basic info
export const updateOwnerAccount = mutation({
  args: {
    id: v.id("ownerAccounts"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    planType: v.optional(v.union(v.literal("starter"), v.literal("professional"), v.literal("enterprise")))
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Get current owner account
    const ownerAccount = await ctx.db.get(args.id);
    requireResource(ownerAccount, "OwnerAccount", args.id);

    const updates: any = {};

    // Validate and sanitize name if provided
    if (args.name !== undefined) {
      validateRequired(args.name?.trim(), "name");

      if (detectXssAttempt(args.name)) {
        throw new ValidationError("Owner name contains potentially malicious content", "name");
      }

      updates.name = sanitizeInput(args.name);
    }

    // Validate and sanitize email if provided
    if (args.email !== undefined) {
      validateRequired(args.email?.trim(), "email");

      if (detectXssAttempt(args.email)) {
        throw new ValidationError("Email contains potentially malicious content", "email");
      }

      updates.email = sanitizeInput(args.email);
    }

    // Update plan type if provided
    if (args.planType !== undefined) {
      updates.planType = args.planType;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Date.now();
      await ctx.db.patch(args.id, updates);
    }

    return await ctx.db.get(args.id);
  }, "updateOwnerAccount"),
});

// Create owner account from WorkOS user (used during first onboarding)
export const createOrSyncOwnerAccount = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    console.log('🔗 CONVEX createOrSyncOwnerAccount - Starting owner sync:', {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      timestamp: Date.now()
    });

    try {
      // Check if owner account already exists
      const existingOwner = await ctx.db
        .query("ownerAccounts")
        .withIndex("by_workos_id", (q: any) => q.eq("workosId", args.workosId))
        .unique();

      if (existingOwner) {
        console.log('🔗 CONVEX createOrSyncOwnerAccount - Owner exists, updating data:', existingOwner._id);

        // Update owner with any new information
        const updates: any = {
          updatedAt: Date.now()
        };

        if (args.email && args.email !== existingOwner.email) {
          updates.email = sanitizeInput(args.email);
        }

        if (args.name && args.name !== existingOwner.name) {
          updates.name = sanitizeInput(args.name);
        }

        if (Object.keys(updates).length > 1) { // More than just updatedAt
          await ctx.db.patch(existingOwner._id, updates);
          console.log('🔗 CONVEX createOrSyncOwnerAccount - Updated owner data');
        }

        return {
          success: true,
          ownerAccount: existingOwner,
          action: 'updated'
        };
      }

      // Create new owner account
      console.log('🔗 CONVEX createOrSyncOwnerAccount - Creating new owner account');

      // Validate and sanitize inputs
      validateRequired(args.workosId?.trim(), "workosId");
      validateRequired(args.email?.trim(), "email");
      validateRequired(args.name?.trim(), "name");

      if (detectXssAttempt(args.name) || detectXssAttempt(args.email)) {
        throw new ValidationError("Input contains potentially malicious content");
      }

      const newOwnerData = {
        workosId: args.workosId,
        email: sanitizeInput(args.email),
        name: sanitizeInput(args.name),
        planType: "starter" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newOwnerId = await ctx.db.insert("ownerAccounts", newOwnerData);
      const createdOwner = await ctx.db.get(newOwnerId);

      console.log('🔗 CONVEX createOrSyncOwnerAccount - Created new owner account:', createdOwner?._id);

      return {
        success: true,
        ownerAccount: createdOwner,
        action: 'created'
      };

    } catch (error) {
      console.error('🔗 CONVEX createOrSyncOwnerAccount - Error syncing owner account:', error);
      throw new Error(`Failed to sync owner account: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, "createOrSyncOwnerAccount"),
});