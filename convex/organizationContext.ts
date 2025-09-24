import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./auth";
import { withErrorHandling, withErrorHandlingMutation, requireResource } from "./lib/errorHandler";
import { ValidationError } from "./lib/errors";

// Get the current user's active organization
export const getActiveOrganization = query({
  args: {},
  handler: withErrorHandling(async (ctx) => {
    const user = await requireAuth(ctx);

    if (!user.organizationId) {
      return null;
    }

    const organization = await ctx.db.get(user.organizationId);
    if (!organization) {
      return null;
    }

    return {
      id: organization._id,
      name: organization.name,
      status: organization.status,
      settings: organization.settings,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    };
  }, "getActiveOrganization"),
});

// Get all organizations the current user has access to
export const getUserOrganizations = query({
  args: {},
  handler: withErrorHandling(async (ctx) => {
    const user = await requireAuth(ctx);

    // For now, users belong to a single organization
    // In the future, we could expand this to support multiple organization memberships
    if (!user.organizationId) {
      return [];
    }

    const organization = await ctx.db.get(user.organizationId);
    if (!organization) {
      return [];
    }

    return [{
      id: organization._id,
      name: organization.name,
      status: organization.status,
      role: user.role,
      permissions: user.permissions,
      isActive: true, // Currently active organization
      joinedAt: user.createdAt,
    }];
  }, "getUserOrganizations"),
});

// Set active organization (for future multi-org support)
export const setActiveOrganization = mutation({
  args: { organizationId: v.id("organizations") },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Verify the user has access to this organization
    if (user.organizationId !== args.organizationId) {
      throw new ValidationError("Access denied: User does not belong to this organization");
    }

    // Verify organization exists and is active
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);

    if (organization.status !== "active") {
      throw new ValidationError("Cannot switch to inactive organization");
    }

    // For now, this is a no-op since users belong to single organization
    // In the future, this would update user's activeOrganizationId field

    // Log the organization context switch
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      organizationId: args.organizationId,
      action: "organization.context_switched",
      resourceType: "organization",
      resourceId: args.organizationId,
      details: {
        previousOrganizationId: user.organizationId,
        newOrganizationId: args.organizationId,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      activeOrganization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
      },
    };
  }, "setActiveOrganization"),
});

// Check if user can access specific organization
export const canAccessOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: withErrorHandling(async (ctx, args) => {
    const user = await requireAuth(ctx);

    // Check if user belongs to this organization
    const hasAccess = user.organizationId === args.organizationId;

    if (!hasAccess) {
      return {
        canAccess: false,
        reason: "User does not belong to this organization",
      };
    }

    // Verify organization exists and is accessible
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      return {
        canAccess: false,
        reason: "Organization not found",
      };
    }

    if (organization.status !== "active") {
      return {
        canAccess: false,
        reason: "Organization is not active",
      };
    }

    return {
      canAccess: true,
      userRole: user.role,
      userPermissions: user.permissions,
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
      },
    };
  }, "canAccessOrganization"),
});

// Get organization context for current user (includes permissions and role)
export const getOrganizationContext = query({
  args: {},
  handler: withErrorHandling(async (ctx) => {
    const user = await requireAuth(ctx);

    if (!user.organizationId) {
      return {
        hasOrganization: false,
        needsOnboarding: true,
      };
    }

    const organization = await ctx.db.get(user.organizationId);
    if (!organization) {
      return {
        hasOrganization: false,
        needsOnboarding: true,
      };
    }

    return {
      hasOrganization: true,
      needsOnboarding: false,
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
        settings: organization.settings,
      },
      user: {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        email: user.email,
        name: user.name,
      },
      access: {
        canManageOrganization: user.permissions.includes("organization.manage") || user.permissions.includes("*"),
        canManageUsers: user.permissions.includes("users.manage") || user.permissions.includes("*"),
        canViewReports: user.permissions.includes("reports.view") || user.permissions.includes("*"),
        canManageClients: user.permissions.includes("clients.manage") || user.permissions.includes("*"),
        isOwner: user.role === "owner",
        isAdmin: user.role === "admin" || user.role === "owner",
      },
    };
  }, "getOrganizationContext"),
});