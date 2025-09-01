# Convex Development Patterns (August 2025)

## Table of Contents
- [Project Setup](#project-setup)
- [Authentication (WorkOS + Convex AuthKit)](#authentication)
- [Schema Design Patterns](#schema-design-patterns)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Server Functions](#server-functions)
- [Error Handling](#error-handling)
- [File Uploads](#file-uploads)
- [Testing Patterns](#testing-patterns)
- [Migration from Mock APIs](#migration-from-mock-apis)

## Project Setup

### Next.js 15 + App Router Integration

```typescript
// convex/convex.config.ts
import { defineConfig } from "convex/server";

export default defineConfig();
```

```typescript
// lib/convex.ts
import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

```typescript
// app/layout.tsx
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexProvider } from "convex/react";
import { convex } from "@/lib/convex";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ConvexProvider client={convex}>
          <ConvexAuthProvider>
            {children}
          </ConvexAuthProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
```

## Authentication (WorkOS + Convex AuthKit)

### Recommended Architecture
- **AuthN (Authentication)**: WorkOS AuthKit handles "who are you?"
- **AuthZ (Authorization)**: Convex handles "what can you do?"

### Setup Pattern

```typescript
// convex/auth.config.ts
import WorkOS from "@convex-dev/auth/providers/WorkOS";

export default {
  providers: [WorkOS({
    domain: process.env.WORKOS_DOMAIN!,
    clientId: process.env.WORKOS_CLIENT_ID!,
  })],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Sync WorkOS identity to Convex
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_workos_id", q => q.eq("workosId", args.profile.id))
        .unique();

      if (existingUser) {
        await ctx.db.patch(existingUser._id, {
          email: args.profile.email,
          name: args.profile.name,
          updatedAt: Date.now(),
        });
        return existingUser._id;
      }

      return await ctx.db.insert("users", {
        workosId: args.profile.id,
        email: args.profile.email,
        name: args.profile.name,
        role: "member", // Default role
        organizationId: null, // Set during onboarding
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
  },
};
```

### Frontend Auth Hook

```typescript
// hooks/use-auth.ts
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const currentUser = useQuery(api.auth.getCurrentUser);
  
  return {
    user: currentUser,
    signIn: () => signIn("workos"),
    signOut,
    isLoading: currentUser === undefined,
    isAuthenticated: currentUser !== null,
  };
}
```

## Schema Design Patterns

### Multi-tenant Schema

```typescript
// convex/schema.ts
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
        monday: v.object({ open: v.string(), close: v.string() }),
        tuesday: v.object({ open: v.string(), close: v.string() }),
        // ... other days
      }),
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
    organizationId: v.id("organizations"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("employee")),
    permissions: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_organization", ["organizationId"]),

  // Clients (gym members)
  clients: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    organizationId: v.id("organizations"),
    membershipStatus: v.union(v.literal("active"), v.literal("inactive"), v.literal("frozen")),
    accessLevel: v.union(v.literal("full"), v.literal("limited"), v.literal("none")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),
});
```

## Real-time Subscriptions

### Query Hook Pattern

```typescript
// Replace: fetch('/api/clients')
// With: useQuery hook for real-time updates

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ClientsList() {
  const clients = useQuery(api.clients.getByOrganization, {
    organizationId: "org_123"
  });

  if (clients === undefined) return <LoadingSpinner />;

  return (
    <div>
      {clients.map(client => (
        <ClientCard key={client._id} client={client} />
      ))}
    </div>
  );
}
```

### Mutation Hook Pattern

```typescript
// Replace: fetch('/api/clients', { method: 'POST' })
// With: useMutation hook for optimistic updates

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CreateClientForm() {
  const createClient = useMutation(api.clients.create);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      await createClient({
        name: data.name,
        email: data.email,
        organizationId: data.organizationId,
      });
      toast.success("Client created successfully");
    } catch (error) {
      toast.error("Failed to create client");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Server Functions

### Query Pattern with Permissions

```typescript
// convex/clients.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Permission check
    const user = await getCurrentUser(ctx);
    await requireOrganizationAccess(ctx, user, args.organizationId, "clients.view");

    // Query with proper indexing
    return await ctx.db
      .query("clients")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .filter(q => q.eq(q.field("status"), "active"))
      .collect();
  },
});
```

### Mutation Pattern with Audit Logging

```typescript
// convex/clients.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    // Permission check
    const user = await getCurrentUser(ctx);
    await requireOrganizationAccess(ctx, user, args.organizationId, "clients.create");

    // Create client
    const clientId = await ctx.db.insert("clients", {
      ...args,
      membershipStatus: "active",
      accessLevel: "full",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "client.created",
      resourceType: "client",
      resourceId: clientId,
      organizationId: args.organizationId,
      timestamp: Date.now(),
    });

    return clientId;
  },
});
```

### Action Pattern for External APIs

```typescript
// convex/actions/stripe.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createSubscription = action({
  args: {
    customerId: v.string(),
    priceId: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: args.customerId,
        items: [{ price: args.priceId }],
      });

      // Update database
      await ctx.runMutation(internal.billing.updateSubscription, {
        organizationId: args.organizationId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
      });

      return subscription;
    } catch (error) {
      // Circuit breaker pattern - queue for retry
      await ctx.scheduler.runAfter(300000, internal.billing.retrySubscriptionCreation, {
        customerId: args.customerId,
        priceId: args.priceId,
        organizationId: args.organizationId,
      });
      
      throw new Error("Subscription creation queued for retry");
    }
  },
});
```

## Error Handling

### Permission Helper Functions

```typescript
// convex/lib/permissions.ts
import { getUserByClerkId } from "./auth";

export async function requireOrganizationAccess(
  ctx: any,
  user: any,
  organizationId: string,
  permission: string
) {
  if (user.organizationId !== organizationId) {
    throw new Error("Access denied: Wrong organization");
  }

  if (!user.permissions.includes(permission)) {
    throw new Error(`Access denied: Missing permission ${permission}`);
  }
}

export async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", q => q.eq("workosId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}
```

## File Uploads

### File Upload Pattern

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Permission check
    const user = await getCurrentUser(ctx);
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileMetadata = mutation({
  args: {
    storageId: v.string(),
    filename: v.string(),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await requireOrganizationAccess(ctx, user, args.organizationId, "files.upload");

    return await ctx.db.insert("files", {
      storageId: args.storageId,
      filename: args.filename,
      organizationId: args.organizationId,
      uploadedBy: user._id,
      createdAt: Date.now(),
    });
  },
});
```

## Testing Patterns

### Test Setup

```typescript
// convex.test.ts
import { convexTest } from "convex-test";
import { test, expect } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

test("client creation with permissions", async () => {
  const t = convexTest(schema);

  // Setup test data
  const orgId = await t.mutation(api.organizations.create, {
    name: "Test Gym",
    ownerAccountId: "test_owner"
  });

  // Test client creation
  const clientId = await t.mutation(api.clients.create, {
    name: "John Doe",
    email: "john@example.com",
    organizationId: orgId,
  });

  // Verify creation
  const client = await t.query(api.clients.get, { id: clientId });
  expect(client.name).toBe("John Doe");
});
```

## Migration from Mock APIs

### Step-by-Step Migration Pattern

1. **Replace fetch() with useQuery/useMutation**:
```typescript
// Before (Mock API):
const [clients, setClients] = useState([]);
useEffect(() => {
  fetch('/api/clients')
    .then(res => res.json())
    .then(data => setClients(data));
}, []);

// After (Convex):
const clients = useQuery(api.clients.getByOrganization, {
  organizationId: currentUser?.organizationId
});
```

2. **Replace API routes with Convex functions**:
```typescript
// Before: src/app/api/clients/route.ts
export async function GET() {
  return NextResponse.json({ data: mockClients });
}

// After: convex/clients.ts
export const getByOrganization = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_organization", q => q.eq("organizationId", args.organizationId))
      .collect();
  },
});
```

### Migration Checklist per API Route:
- [ ] Create Convex function with proper validation
- [ ] Add permission checks
- [ ] Add audit logging for mutations
- [ ] Replace frontend fetch with Convex hooks
- [ ] Test real-time updates
- [ ] Remove mock API route

## Common Patterns Summary

### Authentication Flow:
1. WorkOS handles identity verification
2. Convex syncs user data via callbacks
3. Frontend uses Convex auth hooks
4. All functions check permissions

### Data Access Pattern:
1. Every query/mutation validates user permissions
2. Multi-tenant data isolation by organizationId
3. Real-time subscriptions with useQuery
4. Optimistic updates with useMutation

### External API Integration:
1. Use Convex actions for external calls
2. Implement circuit breaker pattern
3. Queue failed operations with ctx.scheduler
4. Log all external API interactions

### Error Handling:
1. Throw descriptive errors from functions
2. Handle errors gracefully in UI
3. Queue retry operations for failed external calls
4. Log all errors for debugging

This documentation ensures we follow August 2025 best practices for Convex development while maintaining consistency across the project.