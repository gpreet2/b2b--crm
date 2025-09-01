import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Owner accounts (top level)
  ownerAccounts: defineTable({
    email: v.string(),
    name: v.string(),
    workosId: v.string(),
    planType: v.union(v.literal("starter"), v.literal("professional"), v.literal("enterprise")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workos_id", ["workosId"]),

  // Organizations (gyms/businesses)
  organizations: defineTable({
    name: v.string(),
    ownerAccountId: v.id("ownerAccounts"),
    settings: v.object({
      timezone: v.string(),
      businessHours: v.object({
        monday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        tuesday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        wednesday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        thursday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        friday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        saturday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
        sunday: v.object({ open: v.string(), close: v.string(), enabled: v.boolean() }),
      }),
      currency: v.optional(v.string()),
      locale: v.optional(v.string()),
    }),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerAccountId"]),

  // Users (employees and admins)
  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    name: v.string(),
    organizationId: v.optional(v.id("organizations")),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("employee"), v.literal("member")),
    permissions: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
    profileData: v.optional(v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      profilePictureUrl: v.optional(v.string()),
    })),
    consentPreferences: v.optional(v.object({
      marketing: v.boolean(),
      analytics: v.boolean(),
      dataProcessing: v.boolean(),
      lastUpdated: v.string(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_organization", ["organizationId"])
    .index("by_org_and_role", ["organizationId", "role"]),

  // Clients (gym members)
  clients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    organizationId: v.id("organizations"),
    membershipType: v.string(), // "monthly", "annual", "day_pass", etc.
    membershipStartDate: v.number(), // timestamp
    membershipStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("frozen"), v.literal("expired")),
    accessLevel: v.union(v.literal("full"), v.literal("limited"), v.literal("none")),
    profileData: v.optional(v.object({
      dateOfBirth: v.optional(v.string()),
      emergencyContact: v.optional(v.object({
        name: v.string(),
        phone: v.string(),
        relationship: v.string(),
      })),
      medicalInfo: v.optional(v.string()),
      goals: v.optional(v.string()),
    })),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_and_status", ["organizationId", "membershipStatus"])
    .index("by_email", ["email"]),

  // Employees with specialties and assignments
  employees: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    specialties: v.array(v.string()),
    certifications: v.optional(v.array(v.object({
      name: v.string(),
      issuer: v.string(),
      dateObtained: v.string(),
      expiryDate: v.optional(v.string()),
    }))),
    schedule: v.optional(v.object({
      availability: v.array(v.object({
        dayOfWeek: v.number(), // 0 = Sunday, 1 = Monday, etc.
        startTime: v.string(),
        endTime: v.string(),
      })),
    })),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("on_leave")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"]),

  // Events (classes, tours, appointments)
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    instructorId: v.optional(v.id("employees")),
    eventType: v.union(v.literal("class"), v.literal("tour"), v.literal("appointment"), v.literal("workshop")),
    startTime: v.number(),
    endTime: v.number(),
    capacity: v.number(),
    currentBookings: v.number(),
    location: v.optional(v.string()),
    status: v.union(v.literal("scheduled"), v.literal("cancelled"), v.literal("completed")),
    metadata: v.optional(v.object({
      tourType: v.optional(v.union(v.literal("individual"), v.literal("family"), v.literal("group"))),
      leadSource: v.optional(v.union(v.literal("walk-in"), v.literal("website"), v.literal("referral"))),
      difficulty: v.optional(v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced"))),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_org_and_date", ["organizationId", "startTime"])
    .index("by_instructor", ["instructorId"]),

  // Event bookings
  bookings: defineTable({
    eventId: v.id("events"),
    clientId: v.id("clients"),
    organizationId: v.id("organizations"),
    status: v.union(v.literal("confirmed"), v.literal("waitlisted"), v.literal("cancelled"), v.literal("no_show")),
    bookingTime: v.number(),
    checkedIn: v.optional(v.boolean()),
    checkedInAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_client", ["clientId"])
    .index("by_organization", ["organizationId"]),

  // Memberships
  memberships: defineTable({
    clientId: v.id("clients"),
    organizationId: v.id("organizations"),
    membershipType: v.union(v.literal("monthly"), v.literal("annual"), v.literal("day_pass"), v.literal("class_pack")),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("suspended"), v.literal("cancelled")),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    autoRenew: v.boolean(),
    price: v.number(),
    currency: v.string(),
    remainingCredits: v.optional(v.number()),
    stripeSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_organization", ["organizationId"])
    .index("by_org_and_status", ["organizationId", "status"]),

  // Roles and permissions
  roles: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    permissions: v.array(v.string()),
    description: v.optional(v.string()),
    isSystemRole: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  // Audit logs for compliance
  auditLogs: defineTable({
    userId: v.optional(v.id("users")), // Optional for system actions
    organizationId: v.optional(v.id("organizations")), // Optional for global actions
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    details: v.optional(v.any()), // Flexible for various audit types
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    source: v.optional(v.string()), // e.g., "secret_manager", "user_action"
    severity: v.optional(v.union(v.literal("info"), v.literal("warning"), v.literal("error"))),
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_action", ["action"])
    .index("by_source", ["source"])
    .index("by_org_and_action", ["organizationId", "action"]),

  // Circuit breakers for external API resilience
  circuitBreakers: defineTable({
    serviceName: v.string(),
    organizationId: v.optional(v.id("organizations")),
    state: v.union(v.literal("closed"), v.literal("open"), v.literal("half_open")),
    failureCount: v.number(),
    lastFailure: v.optional(v.number()),
    lastSuccess: v.optional(v.number()),
    nextRetryAt: v.optional(v.number()),
    config: v.object({
      failureThreshold: v.number(),
      recoveryTimeout: v.number(),
      monitoringWindow: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_service", ["serviceName"])
    .index("by_org_and_service", ["organizationId", "serviceName"]),

  // Dead letter queue for failed operations
  deadLetterQueue: defineTable({
    jobType: v.string(),
    payload: v.any(),
    originalError: v.string(),
    attemptCount: v.number(),
    organizationId: v.optional(v.id("organizations")),
    scheduledFor: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("resolved"), v.literal("abandoned")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_job_type", ["jobType"])
    .index("by_scheduled", ["scheduledFor"]),

  // Onboarding sessions
  onboardingSessions: defineTable({
    token: v.string(),
    workosUserId: v.optional(v.string()),
    currentStep: v.number(),
    totalSteps: v.number(),
    data: v.object({
      organizationName: v.optional(v.string()),
      ownerInfo: v.optional(v.object({
        firstName: v.string(),
        lastName: v.string(),
        phone: v.optional(v.string()),
      })),
      businessInfo: v.optional(v.object({
        type: v.string(),
        size: v.string(),
        timezone: v.string(),
      })),
    }),
    status: v.union(v.literal("in_progress"), v.literal("completed"), v.literal("expired")),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_workos_user", ["workosUserId"])
    .index("by_expires", ["expiresAt"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_unread", ["userId", "read"]),

  // Documents and waivers
  documents: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.string(),
    uploadedBy: v.id("users"),
    category: v.union(v.literal("waiver"), v.literal("agreement"), v.literal("form"), v.literal("general")),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("required")),
    downloadCount: v.number(),
    version: v.number(),
    isTemplate: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_category", ["category"]),

  // Document signatures
  documentSignatures: defineTable({
    documentId: v.id("documents"),
    clientId: v.id("clients"),
    organizationId: v.id("organizations"),
    signatureData: v.string(), // Base64 signature
    ipAddress: v.string(),
    userAgent: v.string(),
    signedAt: v.number(),
    witnessId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_client", ["clientId"])
    .index("by_organization", ["organizationId"]),

  // Workouts and sessions
  workouts: defineTable({
    clientId: v.id("clients"),
    organizationId: v.id("organizations"),
    instructorId: v.optional(v.id("employees")),
    name: v.string(),
    type: v.union(v.literal("strength"), v.literal("cardio"), v.literal("yoga"), v.literal("pilates"), v.literal("hiit"), v.literal("sports"), v.literal("other")),
    duration: v.number(), // in minutes
    caloriesBurned: v.optional(v.number()),
    exercises: v.optional(v.array(v.object({
      name: v.string(),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      notes: v.optional(v.string()),
    }))),
    intensity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    notes: v.optional(v.string()),
    completedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_organization", ["organizationId"])
    .index("by_instructor", ["instructorId"])
    .index("by_completed_date", ["completedAt"]),

  // Financial transactions
  transactions: defineTable({
    organizationId: v.id("organizations"),
    clientId: v.optional(v.id("clients")),
    membershipId: v.optional(v.id("memberships")),
    type: v.union(v.literal("payment"), v.literal("refund"), v.literal("adjustment"), v.literal("fee")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    paymentMethod: v.optional(v.union(v.literal("card"), v.literal("cash"), v.literal("bank_transfer"), v.literal("other"))),
    stripeTransactionId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
    processedAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_client", ["clientId"])
    .index("by_membership", ["membershipId"])
    .index("by_status", ["status"])
    .index("by_processed_date", ["processedAt"]),

  // Client segments for marketing
  clientSegments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id("organizations"),
    criteria: v.object({
      membershipStatus: v.optional(v.array(v.string())),
      accessLevel: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
      joinedAfter: v.optional(v.number()),
      joinedBefore: v.optional(v.number()),
      lastVisitAfter: v.optional(v.number()),
      lastVisitBefore: v.optional(v.number()),
      totalVisits: v.optional(v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      })),
      ageRange: v.optional(v.object({
        min: v.optional(v.number()),
        max: v.optional(v.number()),
      })),
    }),
    clientCount: v.number(),
    lastCalculated: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_active", ["isActive"]),

  // Digital waivers
  waivers: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    documentId: v.id("documents"),
    isRequired: v.boolean(),
    validityPeriod: v.optional(v.number()), // days
    reminderDays: v.optional(v.number()), // days before expiry to remind
    categories: v.array(v.string()), // e.g., ["general", "minors", "personal_training"]
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("draft")),
    version: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"]),

  // Financial reconciliation log
  reconciliationLog: defineTable({
    organizationId: v.id("organizations"),
    reconciliationType: v.union(v.literal("daily"), v.literal("monthly"), v.literal("manual")),
    period: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("failed")),
    summary: v.object({
      totalTransactions: v.number(),
      totalAmount: v.number(),
      currency: v.string(),
      discrepancies: v.number(),
      resolvedDiscrepancies: v.number(),
    }),
    details: v.optional(v.object({
      stripeTransactions: v.optional(v.number()),
      cashTransactions: v.optional(v.number()),
      refunds: v.optional(v.number()),
      fees: v.optional(v.number()),
      discrepancyList: v.optional(v.array(v.object({
        transactionId: v.string(),
        expectedAmount: v.number(),
        actualAmount: v.number(),
        reason: v.string(),
        resolved: v.boolean(),
      }))),
    })),
    reconciledBy: v.optional(v.id("users")),
    reconciledAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_period", ["period.startDate", "period.endDate"]),

  // System health monitoring
  systemHealth: defineTable({
    checkType: v.union(v.literal("secret_management"), v.literal("external_apis"), v.literal("database"), v.literal("general")),
    status: v.union(v.literal("healthy"), v.literal("degraded"), v.literal("unhealthy"), v.literal("critical")),
    details: v.any(), // Flexible structure for different health check types
    timestamp: v.number(),
    alertSent: v.boolean(),
  })
    .index("by_check_type", ["checkType"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"]),
});