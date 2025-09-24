import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Test WorkOS user creation and retrieval
export const testCreateWorkOSUser = mutation({
  args: {
    workosId: v.string(),
    email: v.string(), 
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a test user similar to WorkOS sync
    const userId = await ctx.db.insert("users", {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      profileData: {
        firstName: args.name.split(" ")[0] || "",
        lastName: args.name.split(" ").slice(1).join(" ") || "",
      },
      role: "member",
      permissions: [],
      status: "active",
      // organizationId is optional and will be set during onboarding
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Created test WorkOS user:", userId);
    
    // Log creation in audit log
    await ctx.db.insert("auditLogs", {
      userId,
      action: "user.created",
      resourceType: "user", 
      resourceId: userId,
      details: {
        source: "workos_test",
        workosId: args.workosId,
        email: args.email,
      },
      timestamp: Date.now(),
    });

    return { success: true, userId };
  },
});

// Get users by WorkOS ID
export const getUserByWorkOSId = query({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .unique();
      
    return user;
  },
});

// Test XSS protection in user creation
export const testXSSUserCreation = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // This should fail with XSS detection
      const result = await ctx.db.insert("users", {
        workosId: args.workosId,
        email: args.email,
        name: args.name, // This might contain XSS
        profileData: {
          firstName: args.name.split(" ")[0] || "",
          lastName: args.name.split(" ").slice(1).join(" ") || "",
        },
        role: "member",
        permissions: [],
        status: "active",
        // organizationId is optional and will be set during onboarding
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      return { success: true, userId: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  },
});