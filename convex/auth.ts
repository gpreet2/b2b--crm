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
            .withIndex("by_workos_id", (q: any) => q.eq("workosId", workosId))
            .unique();

          if (!user) {
            console.log('🔍 CONVEX getCurrentUser - User with alternative subject not found, returning null (needs sync)');
            return null;
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
      .withIndex("by_workos_id", (q: any) => q.eq("workosId", identity.subject))
      .unique();

    // If user doesn't exist, return null (user needs to be synced via mutation)
    if (!user) {
      console.log('🔍 CONVEX getCurrentUser - User not found, returning null (needs sync)');
      return null;
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
      .withIndex("by_organization", (q: any) => q.eq("organizationId", args.organizationId))
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

// Mutation to sync WorkOS user to Convex database
export const syncUser = mutation({
  args: {
    workosId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('🔗 CONVEX syncUser - Starting user sync:', {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      timestamp: Date.now()
    });

    try {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_workos_id", (q: any) => q.eq("workosId", args.workosId))
        .unique();

      if (existingUser) {
        console.log('🔗 CONVEX syncUser - User exists, updating data:', existingUser._id);

        // Update user with any new information
        const updates: any = {
          updatedAt: Date.now()
        };

        if (args.email && args.email !== existingUser.email) {
          updates.email = args.email;
        }

        if (args.name && args.name !== existingUser.name) {
          updates.name = args.name;
        }

        if (Object.keys(updates).length > 1) { // More than just updatedAt
          await ctx.db.patch(existingUser._id, updates);
          console.log('🔗 CONVEX syncUser - Updated user data');
        }

        return {
          success: true,
          user: existingUser,
          action: 'updated'
        };
      }

      // Create new user
      console.log('🔗 CONVEX syncUser - Creating new user');
      const newUserData = {
        workosId: args.workosId,
        email: args.email || "unknown@example.com",
        name: args.name || args.email?.split("@")[0] || "Unknown User",
        role: "member" as const,
        permissions: ["basic.access"],
        status: "active" as const,
        // organizationId is optional and will be set during onboarding
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newUserId = await ctx.db.insert("users", newUserData);
      const createdUser = await ctx.db.get(newUserId);

      console.log('🔗 CONVEX syncUser - Created new user:', createdUser?._id);

      // Log the user creation
      await ctx.db.insert("auditLogs", {
        userId: createdUser?._id,
        // organizationId is optional for global actions
        action: "user.created",
        resourceType: "user",
        resourceId: createdUser?._id,
        details: {
          source: "workos_sync",
          workosId: args.workosId,
          email: args.email,
        },
        timestamp: Date.now(),
      });

      return {
        success: true,
        user: createdUser,
        action: 'created'
      };

    } catch (error) {
      console.error('🔗 CONVEX syncUser - Error syncing user:', error);
      throw new Error(`Failed to sync user: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Complete onboarding by assigning user to organization
export const completeOnboarding = mutation({
  args: {
    organizationName: v.string(),
    ownerInfo: v.object({
      firstName: v.string(),
      lastName: v.string(),
      phone: v.optional(v.string()),
    }),
    businessInfo: v.object({
      type: v.string(),
      size: v.string(),
      timezone: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log('🏢 CONVEX completeOnboarding - Starting onboarding completion:', {
      organizationName: args.organizationName,
      ownerInfo: args.ownerInfo,
      businessInfo: args.businessInfo,
      timestamp: Date.now()
    });

    try {
      // Get current user
      const user = await requireAuth(ctx);

      if (user.organizationId) {
        console.log('🏢 CONVEX completeOnboarding - User already has organization:', user.organizationId);
        throw new Error("User is already associated with an organization");
      }

      // Import ownerAccounts function
      const { createOrSyncOwnerAccount } = await import("./ownerAccounts");

      // Create or get owner account
      const ownerResult = await createOrSyncOwnerAccount(ctx, {
        workosId: user.workosId,
        email: user.email,
        name: `${args.ownerInfo.firstName} ${args.ownerInfo.lastName}`,
      });

      if (!ownerResult.success || !ownerResult.ownerAccount) {
        throw new Error("Failed to create or sync owner account");
      }

      console.log('🏢 CONVEX completeOnboarding - Owner account ready:', ownerResult.ownerAccount._id);

      // Create organization
      const { createOrganization } = await import("./organizations");

      const organizationId = await createOrganization(ctx, {
        name: args.organizationName,
        ownerAccountId: ownerResult.ownerAccount._id,
        settings: {
          timezone: args.businessInfo.timezone,
          businessHours: {
            monday: { open: "06:00", close: "22:00", enabled: true },
            tuesday: { open: "06:00", close: "22:00", enabled: true },
            wednesday: { open: "06:00", close: "22:00", enabled: true },
            thursday: { open: "06:00", close: "22:00", enabled: true },
            friday: { open: "06:00", close: "22:00", enabled: true },
            saturday: { open: "08:00", close: "20:00", enabled: true },
            sunday: { open: "08:00", close: "20:00", enabled: true },
          },
        },
      });

      console.log('🏢 CONVEX completeOnboarding - Organization created:', organizationId);

      // Update user with organization and owner role
      await ctx.db.patch(user._id, {
        organizationId: organizationId,
        role: "owner",
        permissions: ["*"], // Owner has all permissions
        profileData: {
          firstName: args.ownerInfo.firstName,
          lastName: args.ownerInfo.lastName,
          phone: args.ownerInfo.phone,
        },
        updatedAt: Date.now(),
      });

      console.log('🏢 CONVEX completeOnboarding - User updated with organization');

      // Log the completion
      await ctx.db.insert("auditLogs", {
        userId: user._id,
        organizationId: organizationId,
        action: "onboarding.completed",
        resourceType: "user",
        resourceId: user._id,
        details: {
          organizationName: args.organizationName,
          businessInfo: args.businessInfo,
          ownerInfo: args.ownerInfo,
        },
        timestamp: Date.now(),
      });

      console.log('🏢 CONVEX completeOnboarding - Onboarding completed successfully');

      return {
        success: true,
        organizationId: organizationId,
        message: "Onboarding completed successfully"
      };

    } catch (error) {
      console.error('🏢 CONVEX completeOnboarding - Error completing onboarding:', error);
      throw new Error(`Failed to complete onboarding: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});