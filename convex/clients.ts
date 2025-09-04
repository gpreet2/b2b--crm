import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { withErrorHandling, withErrorHandlingMutation, validateRequired, requireResource } from "./lib/errorHandler";
import { ValidationError, ResourceNotFoundError } from "./lib/errors";

// Get all clients for an organization
export const getClients = query({
  args: {
    organizationId: v.id("organizations"),
    search: v.optional(v.string()),
    membershipStatus: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: withErrorHandling(async (ctx, args) => {
    // Validate organization exists
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);

    let query = ctx.db
      .query("clients")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId));

    if (args.membershipStatus) {
      query = query.filter((q) => q.eq(q.field("membershipStatus"), args.membershipStatus));
    }

    const clients = await query.collect();

    // Apply search filter in JavaScript since Convex doesn't support string operations in queries
    let filteredClients = clients;
    if (args.search) {
      if (args.search.trim().length === 0) {
        throw new ValidationError("Search term cannot be empty", "search");
      }
      
      const searchLower = args.search.toLowerCase();
      filteredClients = clients.filter(client =>
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
      );
    }

    // Validate pagination parameters
    if (args.limit !== undefined && args.limit <= 0) {
      throw new ValidationError("Limit must be greater than 0", "limit");
    }
    if (args.offset !== undefined && args.offset < 0) {
      throw new ValidationError("Offset must be non-negative", "offset");
    }

    if (args.limit && args.offset !== undefined) {
      return filteredClients.slice(args.offset, args.offset + args.limit);
    }

    return filteredClients;
  }, "getClients"),
});

// Get a single client by ID
export const getClient = query({
  args: { id: v.id("clients") },
  handler: withErrorHandling(async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    requireResource(client, "Client", args.id);
    return client;
  }, "getClient"),
});

// Create a new client
export const createClient = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    organizationId: v.id("organizations"),
    membershipType: v.string(),
    membershipStartDate: v.optional(v.number()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate required fields
    validateRequired(args.firstName?.trim(), "firstName");
    validateRequired(args.lastName?.trim(), "lastName");
    validateRequired(args.email?.trim(), "email");
    validateRequired(args.membershipType?.trim(), "membershipType");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    // Validate organization exists
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);

    // Check for duplicate email within organization
    const existingClient = await ctx.db
      .query("clients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .first();
    
    if (existingClient) {
      throw new ValidationError("Client with this email already exists in this organization", "email");
    }

    // Validate phone if provided
    if (args.phone && args.phone.trim().length > 0 && args.phone.trim().length < 10) {
      throw new ValidationError("Phone number must be at least 10 characters", "phone");
    }

    const now = Date.now();
    
    return await ctx.db.insert("clients", {
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      email: args.email.trim().toLowerCase(),
      phone: args.phone?.trim() || undefined,
      organizationId: args.organizationId,
      membershipType: args.membershipType,
      membershipStartDate: args.membershipStartDate || now,
      membershipStatus: "active",
      accessLevel: "full",
      createdAt: now,
      updatedAt: now,
    });
  }, "createClient"),
});

// Update a client
export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    membershipType: v.optional(v.string()),
    membershipStatus: v.optional(v.string()),
    accessLevel: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Validate client exists
    const existingClient = await ctx.db.get(id);
    requireResource(existingClient, "Client", id);

    // Validate email format if provided
    if (updates.email && updates.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new ValidationError("Invalid email format", "email");
      }

      // Check for duplicate email within organization (excluding current client)
      const duplicateClient = await ctx.db
        .query("clients")
        .withIndex("by_email", (q) => q.eq("email", updates.email.trim().toLowerCase()))
        .filter((q) => 
          q.eq(q.field("organizationId"), existingClient.organizationId) &&
          q.neq(q.field("_id"), id)
        )
        .first();
      
      if (duplicateClient) {
        throw new ValidationError("Another client with this email already exists in this organization", "email");
      }
    }

    // Validate phone if provided
    if (updates.phone && updates.phone.trim().length > 0 && updates.phone.trim().length < 10) {
      throw new ValidationError("Phone number must be at least 10 characters", "phone");
    }

    // Validate membership status if provided
    const validStatuses = ["active", "inactive", "frozen", "expired"];
    if (updates.membershipStatus && !validStatuses.includes(updates.membershipStatus)) {
      throw new ValidationError(`Invalid membership status. Must be one of: ${validStatuses.join(", ")}`, "membershipStatus");
    }

    // Validate access level if provided
    const validAccessLevels = ["full", "limited", "none"];
    if (updates.accessLevel && !validAccessLevels.includes(updates.accessLevel)) {
      throw new ValidationError(`Invalid access level. Must be one of: ${validAccessLevels.join(", ")}`, "accessLevel");
    }

    // Filter out undefined values and prepare updates
    const filteredUpdates: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === "string" && value.trim().length > 0) {
          filteredUpdates[key] = key === "email" ? value.trim().toLowerCase() : value.trim();
        } else if (typeof value !== "string") {
          filteredUpdates[key] = value;
        }
      }
    });

    if (Object.keys(filteredUpdates).length > 0) {
      filteredUpdates.updatedAt = Date.now();
      await ctx.db.patch(id, filteredUpdates);
    }

    return await ctx.db.get(id);
  }, "updateClient"),
});

// Delete a client
export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate client exists
    const client = await ctx.db.get(args.id);
    requireResource(client, "Client", args.id);

    // Check for dependent records (bookings, workouts, etc.)
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .first();
    
    if (bookings) {
      throw new ValidationError("Cannot delete client with existing bookings. Please cancel all bookings first.", "id");
    }

    await ctx.db.delete(args.id);
    
    return { success: true, message: "Client deleted successfully" };
  }, "deleteClient"),
});