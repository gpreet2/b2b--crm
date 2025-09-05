import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { withErrorHandling, withErrorHandlingMutation, validateRequired, requireResource } from "./lib/errorHandler";
import { ValidationError, ResourceNotFoundError } from "./lib/errors";
import { 
  userStatusValidator,
  organizationContextValidator 
} from "./lib/validators";
import { 
  sanitizeInput,
  sanitizeTags,
  detectXssAttempt,
  preventXss 
} from "./lib/sanitization";

// Get all employees for an organization
export const getEmployees = query({
  args: {
    organizationId: v.id("organizations"),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: withErrorHandling(async (ctx, args) => {
    // Validate organization exists
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);

    // Validate search parameter
    if (args.search && args.search.trim().length === 0) {
      throw new ValidationError("Search term cannot be empty", "search");
    }
    if (args.search && detectXssAttempt(args.search)) {
      throw new ValidationError("Search contains potentially malicious content", "search");
    }

    // Validate pagination parameters
    if (args.limit !== undefined && args.limit <= 0) {
      throw new ValidationError("Limit must be greater than 0", "limit");
    }
    if (args.offset !== undefined && args.offset < 0) {
      throw new ValidationError("Offset must be non-negative", "offset");
    }

    // Validate status parameter
    const validStatuses = ['active', 'inactive'];
    if (args.status && !validStatuses.includes(args.status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, "status");
    }
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
  }, "getEmployees"),
});

// Get a single employee by ID
export const getEmployee = query({
  args: { id: v.id("employees") },
  handler: withErrorHandling(async (ctx, args) => {
    const employee = await ctx.db.get(args.id);
    requireResource(employee, "Employee", args.id);

    const user = await ctx.db.get(employee.userId);
    requireResource(user, "User", employee.userId);
    
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
  }, "getEmployee"),
});

// Create a new employee (this would typically be done during user invitation)
export const createEmployee = mutation({
  args: {
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    specialties: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate required fields
    validateRequired(args.userId, "userId");
    validateRequired(args.organizationId, "organizationId");

    // Validate that user and organization exist
    const user = await ctx.db.get(args.userId);
    requireResource(user, "User", args.userId);
    
    const organization = await ctx.db.get(args.organizationId);
    requireResource(organization, "Organization", args.organizationId);

    // Validate status if provided
    const validStatuses = ["active", "inactive", "on_leave"];
    if (args.status && !validStatuses.includes(args.status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, "status");
    }

    // Validate and sanitize specialties
    let sanitizedSpecialties: string[] = [];
    if (args.specialties && args.specialties.length > 0) {
      // Check for XSS in specialties
      if (args.specialties.some(spec => detectXssAttempt(spec))) {
        throw new ValidationError("Specialties contain potentially malicious content", "specialties");
      }
      
      // Sanitize specialty tags
      const validSpecialties = sanitizeTags(args.specialties);
      sanitizedSpecialties = validSpecialties || [];
    }

    // Check if employee already exists
    const existingEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existingEmployee) {
      throw new ValidationError("Employee record already exists for this user", "userId");
    }

    const now = Date.now();
    
    return await ctx.db.insert("employees", {
      userId: args.userId,
      organizationId: args.organizationId,
      specialties: sanitizedSpecialties,
      status: (args.status as "active" | "inactive" | "on_leave") || "active",
      createdAt: now,
      updatedAt: now,
    });
  }, "createEmployee"),
});

// Update employee status
export const updateEmployeeStatus = mutation({
  args: {
    id: v.id("employees"),
    status: v.string(),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate employee exists
    const employee = await ctx.db.get(args.id);
    requireResource(employee, "Employee", args.id);

    // Validate status
    const validStatuses = ["active", "inactive", "on_leave"];
    if (!validStatuses.includes(args.status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, "status");
    }

    await ctx.db.patch(args.id, {
      status: args.status as "active" | "inactive" | "on_leave",
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.id);
  }, "updateEmployeeStatus"),
});

// Update employee specialties
export const updateEmployeeSpecialties = mutation({
  args: {
    id: v.id("employees"),
    specialties: v.array(v.string()),
  },
  handler: withErrorHandlingMutation(async (ctx, args) => {
    // Validate employee exists
    const employee = await ctx.db.get(args.id);
    requireResource(employee, "Employee", args.id);

    // Validate and sanitize specialties
    if (args.specialties.some(spec => detectXssAttempt(spec))) {
      throw new ValidationError("Specialties contain potentially malicious content", "specialties");
    }
    
    // Sanitize specialty tags
    const sanitizedSpecialties = sanitizeTags(args.specialties) || [];

    await ctx.db.patch(args.id, {
      specialties: sanitizedSpecialties,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args.id);
  }, "updateEmployeeSpecialties"),
});