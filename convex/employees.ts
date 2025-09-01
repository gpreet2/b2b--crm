import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all employees for an organization
export const getEmployees = query({
  args: {
    organizationId: v.id("organizations"),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get employees for the organization
    const employees = await ctx.db
      .query("employees")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    // Get user details for each employee
    const employeesWithUserData = await Promise.all(
      employees.map(async (employee) => {
        const user = await ctx.db.get(employee.userId);
        return {
          ...employee,
          user,
          // Create fields that match what frontend expects
          first_name: user?.profileData?.firstName || user?.name?.split(' ')[0] || '',
          last_name: user?.profileData?.lastName || user?.name?.split(' ')[1] || '',
          email: user?.email || '',
          role: user?.role || 'employee',
          is_active: employee.status === 'active',
          created_at: new Date(employee.createdAt).toISOString(),
          permissions: user?.permissions || [],
        };
      })
    );

    let filteredEmployees = employeesWithUserData;

    if (args.status) {
      filteredEmployees = filteredEmployees.filter(emp => 
        args.status === 'active' ? emp.is_active : !emp.is_active
      );
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp =>
        emp.first_name.toLowerCase().includes(searchLower) ||
        emp.last_name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      );
    }

    if (args.limit && args.offset !== undefined) {
      filteredEmployees = filteredEmployees.slice(args.offset, args.offset + args.limit);
    }

    return filteredEmployees;
  },
});

// Get a single employee by ID
export const getEmployee = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.id);
    if (!employee) return null;

    const user = await ctx.db.get(employee.userId);
    
    return {
      ...employee,
      user,
      first_name: user?.profileData?.firstName || user?.name?.split(' ')[0] || '',
      last_name: user?.profileData?.lastName || user?.name?.split(' ')[1] || '',
      email: user?.email || '',
      role: user?.role || 'employee',
      is_active: employee.status === 'active',
      created_at: new Date(employee.createdAt).toISOString(),
      permissions: user?.permissions || [],
    };
  },
});

// Create a new employee (this would typically be done during user invitation)
export const createEmployee = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    specialties: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("employees", {
      userId: args.userId,
      organizationId: args.organizationId,
      specialties: args.specialties || [],
      status: (args.status as "active" | "inactive" | "on_leave") || "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update employee status
export const updateEmployeeStatus = mutation({
  args: {
    id: v.id("employees"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status as "active" | "inactive" | "on_leave",
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.id);
  },
});

// Update employee specialties
export const updateEmployeeSpecialties = mutation({
  args: {
    id: v.id("employees"),
    specialties: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      specialties: args.specialties,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.id);
  },
});