import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireAuth } from "./auth";
import { withErrorHandling, withErrorHandlingMutation, validateRequired, requireResource } from "./lib/errorHandler";
import { ValidationError, ResourceNotFoundError } from "./lib/errors";
import { 
  createUserValidator, 
  userRoleValidator, 
  userStatusValidator,
  emailValidator,
  userProfileValidator 
} from "./lib/validators";
import { 
  normalizeEmail, 
  normalizeName, 
  sanitizeInput,
  detectXssAttempt,
  preventXss 
} from "./lib/sanitization";

// Create or update user from WorkOS identity
export const createOrUpdateUser = mutation({
  args: {
    workosId: v.string(),
    email: emailValidator,
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate required fields
    validateRequired(args.workosId?.trim(), "workosId");
    validateRequired(args.email?.trim(), "email");
    validateRequired(args.name?.trim(), "name");

    // Check for XSS attempts in text fields
    if (detectXssAttempt(args.name)) {
      throw new ValidationError("Name contains potentially malicious content", "name");
    }
    if (args.firstName && detectXssAttempt(args.firstName)) {
      throw new ValidationError("First name contains potentially malicious content", "firstName");
    }
    if (args.lastName && detectXssAttempt(args.lastName)) {
      throw new ValidationError("Last name contains potentially malicious content", "lastName");
    }

    // Sanitize and normalize inputs
    const sanitizedWorkosId = sanitizeInput(args.workosId, "workosId", { maxLength: 100 });
    const normalizedEmail = normalizeEmail(args.email);
    const sanitizedName = sanitizeInput(args.name, "name", { maxLength: 100 });
    const sanitizedFirstName = args.firstName ? normalizeName(args.firstName) : undefined;
    const sanitizedLastName = args.lastName ? normalizeName(args.lastName) : undefined;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", sanitizedWorkosId))
      .unique();

    const now = Date.now();
    
    const userData = {
      workosId: sanitizedWorkosId,
      email: normalizedEmail,
      name: sanitizedName,
      profileData: {
        firstName: sanitizedFirstName || sanitizedName.split(" ")[0] || "",
        lastName: sanitizedLastName || sanitizedName.split(" ").slice(1).join(" ") || "",
      },
      updatedAt: now,
    };

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, userData);
      
      // Log the update
      await ctx.db.insert("auditLogs", {
        userId: existingUser._id,
        organizationId: existingUser.organizationId,
        action: "user.profile_updated",
        resourceType: "user",
        resourceId: existingUser._id,
        details: {
          source: "workos_sync",
          updatedFields: Object.keys(userData),
        },
        timestamp: now,
      });

      return existingUser._id;
    } else {
      // Create new user
      const newUserId = await ctx.db.insert("users", {
        ...userData,
        role: "member", // Default role - will be updated during onboarding
        permissions: [], // No permissions initially
        status: "active",
        createdAt: now,
      });

      // Log user creation
      await ctx.db.insert("auditLogs", {
        userId: newUserId,
        action: "user.created",
        resourceType: "user",
        resourceId: newUserId,
        details: {
          source: "workos_sync",
          email: normalizedEmail,
          name: sanitizedName,
        },
        timestamp: now,
      });

      return newUserId;
    }
  }, "createOrUpdateUser"),
});

// Get users for an organization
export const getUsers = query({
  args: { organizationId: v.id("organizations") },
  handler: withErrorHandling(async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    
    // Verify user has access to this organization
    if (currentUser.organizationId !== args.organizationId) {
      throw new ValidationError("Access denied: Wrong organization", "organizationId");
    }

    // Check if user has permission to view users
    if (!currentUser.permissions.includes("users.view")) {
      throw new ValidationError("Access denied: Missing permission users.view", "permissions");
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return users.map(user => ({
      id: user._id,
      workosId: user.workosId,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      profileData: user.profileData,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }, "getUsers"),
});

// Update user role and permissions (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
    permissions: v.array(v.string()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    
    // Validate permissions array
    if (args.permissions.some(perm => detectXssAttempt(perm))) {
      throw new ValidationError("Permissions contain potentially malicious content", "permissions");
    }

    // Sanitize permission strings
    const sanitizedPermissions = args.permissions.map(perm => 
      sanitizeInput(perm, "permission", { maxLength: 100 })
    );
    
    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    requireResource(targetUser, "User", args.userId);

    // Verify organization access and admin permissions
    if (currentUser.organizationId !== targetUser.organizationId) {
      throw new ValidationError("Access denied: Wrong organization", "userId");
    }

    if (!currentUser.permissions.includes("users.manage")) {
      throw new ValidationError("Access denied: Missing permission users.manage", "permissions");
    }

    // Update user
    await ctx.db.patch(args.userId, {
      role: args.role,
      permissions: sanitizedPermissions,
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      organizationId: targetUser.organizationId!,
      action: "user.role_updated",
      resourceType: "user",
      resourceId: args.userId,
      details: {
        oldValues: {
          role: targetUser.role,
          permissions: targetUser.permissions,
        },
        newValues: {
          role: args.role,
          permissions: sanitizedPermissions,
        },
      },
      timestamp: Date.now(),
    });

    return { success: true };
  }, "updateUserRole"),
});

// Remove user from organization
export const removeUserFromOrganization = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    
    // Get target user
    const targetUser = await ctx.db.get(args.userId);
    requireResource(targetUser, "User", args.userId);

    // Verify organization access and admin permissions
    if (currentUser.organizationId !== targetUser.organizationId) {
      throw new ValidationError("Access denied: Wrong organization", "userId");
    }

    if (!currentUser.permissions.includes("users.manage")) {
      throw new ValidationError("Access denied: Missing permission users.manage", "permissions");
    }

    // Can't remove yourself
    if (currentUser._id === args.userId) {
      throw new ValidationError("Cannot remove yourself from organization", "userId");
    }

    // Update user to remove organization association
    await ctx.db.patch(args.userId, {
      organizationId: undefined,
      role: "member",
      permissions: [],
      updatedAt: Date.now(),
    });

    // Log the action
    await ctx.db.insert("auditLogs", {
      userId: currentUser._id,
      organizationId: targetUser.organizationId!,
      action: "user.removed_from_organization",
      resourceType: "user",
      resourceId: args.userId,
      details: {
        removedUser: {
          email: targetUser.email,
          name: targetUser.name,
        },
      },
      timestamp: Date.now(),
    });

    return { success: true };
  }, "removeUserFromOrganization"),
});