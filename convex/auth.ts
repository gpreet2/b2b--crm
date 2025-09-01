import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get current user from auth context
export async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosId", identity.subject))
    .unique();

  return user;
}

// Helper function to require authentication
export async function requireAuth(ctx: any) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

// Helper function to check organization access
export async function requireOrganizationAccess(
  ctx: any,
  organizationId: string,
  permission?: string
) {
  const user = await requireAuth(ctx);
  
  if (user.organizationId !== organizationId) {
    throw new Error("Access denied: Wrong organization");
  }

  if (permission && !user.permissions.includes(permission)) {
    throw new Error(`Access denied: Missing permission ${permission}`);
  }

  return user;
}

// Query to get current user with organization data
export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      return null;
    }

    // Get organization data if user belongs to one
    let organization = null;
    if (user.organizationId) {
      organization = await ctx.db.get(user.organizationId);
    }

    return {
      id: user._id,
      workosId: user.workosId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      profileData: user.profileData,
      organization,
      organizationId: user.organizationId,
      hasOrganization: !!user.organizationId,
      hasPermissions: user.permissions.length > 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

// Query to get user permissions for a specific organization
export const getUserPermissions = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      return { permissions: [], role: null };
    }

    // If organization ID is provided, verify access
    if (args.organizationId && user.organizationId !== args.organizationId) {
      return { permissions: [], role: null };
    }

    return {
      permissions: user.permissions,
      role: user.role,
      organizationId: user.organizationId,
    };
  },
});

// Query to check if user has specific permission
export const hasPermission = query({
  args: { 
    permission: v.string(),
    organizationId: v.optional(v.id("organizations"))
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      return false;
    }

    if (args.organizationId && user.organizationId !== args.organizationId) {
      return false;
    }

    return user.permissions.includes(args.permission);
  },
});

// Mutation to update user organization during onboarding
export const setUserOrganization = mutation({
  args: { 
    organizationId: v.id("organizations"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("employee"), v.literal("member")),
    permissions: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    
    // Verify the organization exists
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update user with organization and role
    await ctx.db.patch(user._id, {
      organizationId: args.organizationId,
      role: args.role,
      permissions: args.permissions,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      organizationId: args.organizationId,
      action: "user.organization_assigned",
      resourceType: "user",
      resourceId: user._id,
      details: {
        newValues: {
          organizationId: args.organizationId,
          role: args.role,
          permissions: args.permissions,
        },
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Mutation to update user permissions
export const updateUserPermissions = mutation({
  args: { 
    userId: v.id("users"),
    permissions: v.array(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("employee"), v.literal("member")))
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    
    // Get the target user
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error("User not found");
    }

    // Verify organization access and permission to manage users
    await requireOrganizationAccess(ctx, targetUser.organizationId!, "users.manage");

    const updates: any = {
      permissions: args.permissions,
      updatedAt: Date.now(),
    };

    if (args.role) {
      updates.role = args.role;
    }

    await ctx.db.patch(args.userId, updates);

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      organizationId: targetUser.organizationId!,
      action: "user.permissions_updated",
      resourceType: "user",
      resourceId: args.userId,
      details: {
        oldValues: {
          permissions: targetUser.permissions,
          role: targetUser.role,
        },
        newValues: updates,
      },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Query to get organization members (for admin use)
export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId, "users.view");
    
    const members = await ctx.db
      .query("users")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect();

    return members.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      profileData: user.profileData,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },
});