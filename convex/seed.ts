import { mutation } from "./_generated/server";

// Seed data for development
export const seedDevelopmentData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingOrgs = await ctx.db.query("organizations").collect();
    if (existingOrgs.length > 0) {
      return { message: "Development data already exists", organizationId: existingOrgs[0]._id };
    }

    // Create owner account
    const ownerAccountId = await ctx.db.insert("ownerAccounts", {
      workosId: "dev_owner_workos_id",
      email: "dev@example.com",
      name: "Dev Owner",
      planType: "professional",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: "Dev Fitness Center",
      ownerAccountId,
      status: "active",
      settings: {
        timezone: "America/Los_Angeles",
        businessHours: {
          monday: { enabled: true, open: "06:00", close: "22:00" },
          tuesday: { enabled: true, open: "06:00", close: "22:00" },
          wednesday: { enabled: true, open: "06:00", close: "22:00" },
          thursday: { enabled: true, open: "06:00", close: "22:00" },
          friday: { enabled: true, open: "06:00", close: "22:00" },
          saturday: { enabled: true, open: "08:00", close: "20:00" },
          sunday: { enabled: true, open: "08:00", close: "20:00" }
        }
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Create a demo user
    const userId = await ctx.db.insert("users", {
      workosId: "dev_user_workos_id",
      email: "dev@example.com",
      name: "Dev User",
      organizationId,
      role: "owner",
      permissions: ["*"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return {
      message: "Development data seeded successfully",
      ownerAccountId,
      organizationId,
      userId
    };
  },
});