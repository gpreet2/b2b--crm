/**
 * Authentication functions for WorkOS + Convex integration
 * 
 * This uses the @convex-dev/workos package approach where WorkOS AuthKit
 * handles authentication and passes tokens to Convex through ConvexProviderWithAuthKit
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get current user from Convex auth context
export async function getCurrentUser(ctx: any) {
  console.log('🔍 CONVEX getCurrentUser - Starting with WorkOS token...', {
    hasAuth: !!ctx.auth,
    authContext: ctx.auth ? 'present' : 'missing',
    timestamp: Date.now()
  });

  try {
    // Log the raw auth context to debug what's available
    console.log('🔍 CONVEX getCurrentUser - Auth context details:', {
      authKeys: ctx.auth ? Object.keys(ctx.auth) : 'no auth context',
      timestamp: Date.now()
    });

    const identity = await ctx.auth.getUserIdentity();
    console.log('🔍 CONVEX getCurrentUser - Identity from WorkOS:', {
      hasIdentity: !!identity,
      identity: identity ? Object.keys(identity) : 'null',
      subject: identity?.subject,
      email: identity?.email,
      name: identity?.name,
      tokenIdentifier: identity?.tokenIdentifier,
      aud: identity?.aud,
      iss: identity?.iss,
      timestamp: Date.now()
    });

    if (!identity || !identity.subject) {
      console.log('🔍 CONVEX getCurrentUser - No identity or subject, checking for alternative fields');

      // Check if identity exists but subject is in a different field
      if (identity) {
        console.log('🔍 CONVEX getCurrentUser - Raw identity object:', identity);

        // Try common JWT claim names
        const possibleSubjects = [
          identity.subject,
          identity.sub,
          identity.user_id,
          identity.id,
          identity.workos_user_id
        ].filter(Boolean);

        if (possibleSubjects.length > 0) {
          console.log('🔍 CONVEX getCurrentUser - Found potential subjects:', possibleSubjects);
          // Use the first available subject
          const workosId = possibleSubjects[0];

          // Find user by workosId
          const user = await ctx.db
            .query("users")
            .withIndex("by_workos_id", (q) => q.eq("workosId", workosId))
            .unique();

          if (!user) {
            // Create new user with available identity data
            const newUserData = {
              workosId: workosId,
              email: identity.email || identity.preferred_username || "unknown@example.com",
              name: identity.name || identity.given_name || identity.email?.split("@")[0] || "Unknown User",
              role: "member" as const,
              permissions: ["basic.access"],
              status: "active" as const,
              profileData: {},
              organizationId: null,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            console.log('🔍 CONVEX getCurrentUser - Creating user with alternative subject:', newUserData);
            const newUserId = await ctx.db.insert("users", newUserData);
            const createdUser = await ctx.db.get(newUserId);
            console.log('🔍 CONVEX getCurrentUser - Created new user:', createdUser?._id);
            return createdUser;
          }

          console.log('🔍 CONVEX getCurrentUser - Found existing user with alternative subject:', user._id);
          return user;
        }
      }

      console.log('🔍 CONVEX getCurrentUser - No valid identity found, returning null');
      return null;
    }

    // Standard flow with identity.subject
    console.log('🔍 CONVEX getCurrentUser - Querying users by workosId:', identity.subject);
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .unique();

    // If user doesn't exist, create them from WorkOS token claims
    if (!user) {
      console.log('🔍 CONVEX getCurrentUser - User not found, creating new user');
      const newUserData = {
        workosId: identity.subject,
        email: identity.email || "unknown@example.com",
        name: identity.name || identity.email?.split("@")[0] || "Unknown User",
        role: "member" as const,
        permissions: ["basic.access"],
        status: "active" as const,
        profileData: {},
        organizationId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log('🔍 CONVEX getCurrentUser - Creating user with data:', newUserData);
      const newUserId = await ctx.db.insert("users", newUserData);

      const createdUser = await ctx.db.get(newUserId);
      console.log('🔍 CONVEX getCurrentUser - Created new user:', createdUser?._id);
      return createdUser;
    }

    console.log('🔍 CONVEX getCurrentUser - Found existing user:', user._id);
    return user;
  } catch (authError) {
    console.error('🔍 CONVEX getCurrentUser - Auth error:', {
      error: authError instanceof Error ? authError.message : String(authError),
      stack: authError instanceof Error ? authError.stack : undefined,
      timestamp: Date.now()
    });
    return null;
  }
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