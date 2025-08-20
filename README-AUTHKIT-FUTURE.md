# WorkOS AuthKit Future Integration Branch

## Purpose

This branch exists to prepare for potential future WorkOS AuthKit integration when the Next.js 15 compatibility issue is resolved.

## Current Situation

As of January 2025, WorkOS AuthKit middleware (`@workos-inc/authkit-nextjs`) is **incompatible with Next.js 15** due to OpenTelemetry dependencies that don't work in edge runtime.

**Error encountered:**
```
TypeError: Native module not found: @opentelemetry/api
```

## Main Branch Implementation

The `main` branch uses a **custom WorkOS integration** with:
- WorkOS Node SDK directly (`@workos-inc/node`)
- Custom JWT validation using `jose` library
- Manual session management with HTTP-only cookies
- Direct WorkOS User Management API calls

This implementation provides **identical security and features** to AuthKit but requires manual maintenance.

## When to Use This Branch

Use this branch when/if:
1. WorkOS releases Next.js 15 compatible AuthKit
2. Next.js resolves the edge runtime OpenTelemetry conflicts
3. AuthKit provides significant advantages over custom implementation

## What This Branch Will Contain

When AuthKit becomes compatible, this branch will implement:
- Standard WorkOS AuthKit middleware
- Simplified authentication flow
- Automatic token refresh and session management
- Official WorkOS supported patterns

## Migration Strategy

When ready to migrate:
1. Test AuthKit compatibility on this branch
2. Compare performance vs custom implementation
3. Ensure all existing features work (roles, permissions, multi-tenancy)
4. Create feature flag to toggle between implementations
5. Gradual rollout with fallback to custom approach

## Status: WAITING

Currently waiting for:
- [ ] WorkOS AuthKit Next.js 15 compatibility fix
- [ ] Community confirmation that issues are resolved
- [ ] Stable release with edge runtime support

## Contact

If WorkOS releases a fix, update this branch and test the integration before considering migration from the stable custom implementation.