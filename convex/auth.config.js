export default {
  providers: [
    {
      domain: "https://api.workos.com",
      applicationID: "client_01J4RF77PVR4TB5ZZG5FPSBF19",
    }
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Sync WorkOS identity to Convex users table
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_workos_id", q => q.eq("workosId", args.profile.id))
        .unique();

      if (existingUser) {
        // Update existing user with latest WorkOS data
        await ctx.db.patch(existingUser._id, {
          email: args.profile.email,
          name: args.profile.first_name && args.profile.last_name
            ? `${args.profile.first_name} ${args.profile.last_name}`
            : args.profile.email,
          profileData: {
            firstName: args.profile.first_name || null,
            lastName: args.profile.last_name || null,
            profilePictureUrl: args.profile.profile_picture_url || null,
          },
          updatedAt: Date.now(),
        });
        return existingUser._id;
      }

      // Create new user
      const newUserId = await ctx.db.insert("users", {
        workosId: args.profile.id,
        email: args.profile.email,
        name: args.profile.first_name && args.profile.last_name
          ? `${args.profile.first_name} ${args.profile.last_name}`
          : args.profile.email,
        organizationId: undefined, // Will be set during onboarding
        role: "member", // Default role
        permissions: [], // Will be set based on role
        status: "active",
        profileData: {
          firstName: args.profile.first_name || null,
          lastName: args.profile.last_name || null,
          profilePictureUrl: args.profile.profile_picture_url || null,
        },
        consentPreferences: {
          marketing: false,
          analytics: false,
          dataProcessing: true, // Required for core functionality
          lastUpdated: new Date().toISOString(),
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return newUserId;
    },
  },
};