import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all clients for an organization
export const getClients = query({
  args: {
    organizationId: v.id("organizations"),
    search: v.optional(v.string()),
    membershipStatus: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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
      const searchLower = args.search.toLowerCase();
      filteredClients = clients.filter(client =>
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
      );
    }

    if (args.limit && args.offset !== undefined) {
      return filteredClients.slice(args.offset, args.offset + args.limit);
    }

    return filteredClients;
  },
});

// Get a single client by ID
export const getClient = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
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
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("clients", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      organizationId: args.organizationId,
      membershipType: args.membershipType,
      membershipStartDate: args.membershipStartDate || now,
      membershipStatus: "active",
      accessLevel: "full",
      createdAt: now,
      updatedAt: now,
    });
  },
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
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates: any = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length > 0) {
      filteredUpdates.updatedAt = Date.now();
      await ctx.db.patch(id, filteredUpdates);
    }

    return await ctx.db.get(id);
  },
});

// Delete a client
export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});