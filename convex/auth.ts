import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";

// Helper function to get current user from JWT auth context
export async function getCurrentUser(ctx: any) {
  console.log('🔍 CONVEX getCurrentUser - Starting...', {
    hasAuth: !!ctx.auth,
    authType: typeof ctx.auth,
    authMethods: ctx.auth ? Object.getOwnPropertyNames(Object.getPrototypeOf(ctx.auth)) : [],
    timestamp: Date.now()
  });
  
  try {
    const identity = await ctx.auth.getUserIdentity();
    console.log('🔍 CONVEX getCurrentUser - Identity:', {
      hasIdentity: !!identity,
      identityType: typeof identity,
      identityKeys: identity ? Object.keys(identity) : [],
      subject: identity?.subject,
      email: identity?.email,
      name: identity?.name,
      tokenIdentifier: identity?.tokenIdentifier,
      issuer: identity?.issuer,
      aud: identity?.aud,
      exp: identity?.exp,
      iat: identity?.iat,
      customClaims: identity ? Object.keys(identity).filter(k => k.startsWith('urn:')) : [],
      timestamp: Date.now()
    });
  } catch (authError) {
    console.error('🔍 CONVEX getCurrentUser - Auth error:', {
      error: authError instanceof Error ? authError.message : String(authError),
      errorType: authError instanceof Error ? authError.constructor.name : typeof authError,
      timestamp: Date.now()
    });
    return null;
  }

  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    console.log('🔍 CONVEX getCurrentUser - No identity, returning null');
    return null;
  }

  // Find user by workosId (the subject from JWT)
  console.log('🔍 CONVEX getCurrentUser - Querying users by workosId:', identity.subject);
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
    .unique();

  // If user doesn't exist, create them from JWT claims
  if (!user) {
    console.log('🔍 CONVEX getCurrentUser - User not found, creating new user');
    const newUserData = {
      workosId: identity.subject,
      email: identity.email || identity["urn:myapp:email"],
      name: identity.name || identity["urn:myapp:full_name"] || identity.email?.split("@")[0] || "Unknown User",
      role: "member",
      permissions: ["basic.access"],
      status: "active",
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
}

// Mutation to create or update user from auth provider
export const createOrUpdateUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
    providerId: v.string(),
    providerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name || existingUser.name,
        picture: args.picture || existingUser.picture,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name || args.email.split("@")[0],
        picture: args.picture,
        role: "member",
        permissions: ["basic.access"],
        status: "active",
        profileData: {},
        organizationId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Log user creation
      await ctx.db.insert("auditLogs", {
        userId,
        organizationId: null,
        action: "user.created",
        resourceType: "user",
        resourceId: userId,
        details: {
          provider: args.providerId,
          email: args.email,
        },
        timestamp: Date.now(),
      });

      return userId;
    }
  },
});

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