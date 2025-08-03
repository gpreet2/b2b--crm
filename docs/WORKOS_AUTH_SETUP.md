# WorkOS Authentication Setup

## Overview

This project uses WorkOS AuthKit for enterprise-grade authentication with support for:
- Email/password authentication
- Enterprise SSO (SAML, OIDC)
- Multi-organization support
- Session management
- User impersonation

## Key Components

### 1. Middleware (`middleware.ts`)
- Protects all routes by default
- Allows unauthenticated access to specific paths
- Handles session refresh automatically

### 2. Authentication Callback (`/api/auth/callback`)
- Handles the OAuth callback from WorkOS
- Creates/updates user in database
- Associates users with organizations
- Logs authentication events

### 3. Authentication Utilities (`/auth/workos.ts`)
- `getCurrentUser()` - Get authenticated user
- `requireOrganization()` - Enforce organization membership
- `switchOrganization()` - Switch between organizations
- `getUserOrganizations()` - List user's organizations
- `hasRole()` - Check user permissions
- `inviteToOrganization()` - Send invitations

### 4. Components
- `ImpersonationBanner` - Shows when admin is impersonating
- `OrganizationSwitcher` - Switch between organizations
- `SignOutButton` - Sign out functionality

## Database Schema

### Users Table
- Stores WorkOS user ID
- Email, name, profile picture
- Email verification status
- Metadata and timestamps

### Organizations Table
- WorkOS organization ID
- Name, slug, domain
- Settings and metadata

### User Organizations Junction
- Links users to organizations
- Stores role (owner, admin, member)
- Tracks membership status

## Configuration

### Environment Variables
```env
WORKOS_CLIENT_ID=client_...          # From WorkOS dashboard
WORKOS_API_KEY=sk_...               # From WorkOS dashboard  
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=...          # 32+ character secret
```

### Redirect URI Setup
1. Go to WorkOS Dashboard > Redirects
2. Add your callback URL: `http://localhost:3000/api/auth/callback`
3. For production, add: `https://yourdomain.com/api/auth/callback`

## Email Verification

**Important**: WorkOS handles email verification as part of the authentication flow. 

When users sign up:
1. They enter their email/password
2. WorkOS sends a verification email automatically
3. Users must click the link to verify
4. Only then can they sign in

The `emailVerified` field tracks this status. You don't need a separate email service for authentication emails - WorkOS handles this.

## Additional Email Service

You may want an email service for:
- Transactional emails (receipts, notifications)
- Marketing emails
- Custom notifications

Popular options:
- SendGrid
- Postmark
- Amazon SES
- Resend

But this is **not required** for authentication - WorkOS handles all auth-related emails.

## Usage Examples

### Protected Page
```typescript
import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function ProtectedPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  
  return <div>Welcome {user.email}!</div>;
}
```

### API Route Protection
```typescript
import { requireAuth, requireRole } from '@/middleware/auth.middleware';

router.post('/api/admin/users',
  requireAuth,
  requireRole('admin'),
  async (req, res) => {
    // Only admins can access this
  }
);
```

### Organization Context
```typescript
const { user, organizationId } = await withAuth();

if (organizationId) {
  // User is in organization context
  const org = await getOrganization(organizationId);
}
```

## Security Best Practices

1. **Always verify organization membership** before granting access
2. **Use role-based access control** for sensitive operations
3. **Log authentication events** for audit trails
4. **Handle session expiry** gracefully
5. **Implement proper error handling** for auth failures

## Testing

To test the authentication flow:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign Up" to create an account
4. Check your email for verification link
5. After verification, sign in
6. You'll be redirected to `/dashboard` or `/onboarding`

## Troubleshooting

### "No authorization header" error
- Ensure middleware is configured correctly
- Check that cookies are enabled
- Verify WORKOS_COOKIE_PASSWORD is set

### "Invalid token" error  
- Check WORKOS_API_KEY is correct
- Ensure redirect URI matches dashboard config
- Verify cookie domain settings

### Users can't sign in
- Check if email is verified
- Ensure user exists in database
- Verify organization membership

### Session issues
- Check cookie settings in middleware
- Ensure HTTPS in production
- Verify cookie password is consistent