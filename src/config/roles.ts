/**
 * Default role configuration for the CRM system
 * These roles are created during system initialization
 */

export interface Role {
  id?: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
}

/**
 * System-defined default roles
 */
export const DEFAULT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  TRAINER: 'trainer',
  FRONT_DESK: 'front_desk',
  MEMBER: 'member',
} as const;

export type DefaultRoleType = (typeof DEFAULT_ROLES)[keyof typeof DEFAULT_ROLES];

/**
 * Default role definitions
 */
export const ROLE_DEFINITIONS: Record<DefaultRoleType, Omit<Role, 'id'>> = {
  [DEFAULT_ROLES.OWNER]: {
    name: 'Owner',
    slug: 'owner',
    description: 'Full access to all organization features',
    isSystem: true,
  },
  [DEFAULT_ROLES.ADMIN]: {
    name: 'Administrator',
    slug: 'admin',
    description: 'Administrative access except billing',
    isSystem: true,
  },
  [DEFAULT_ROLES.TRAINER]: {
    name: 'Trainer',
    slug: 'trainer',
    description: 'Manage clients, events, and workouts',
    isSystem: true,
  },
  [DEFAULT_ROLES.FRONT_DESK]: {
    name: 'Front Desk',
    slug: 'front_desk',
    description: 'Basic client and event management',
    isSystem: true,
  },
  [DEFAULT_ROLES.MEMBER]: {
    name: 'Member',
    slug: 'member',
    description: 'Basic member access',
    isSystem: true,
  },
};

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<DefaultRoleType, DefaultRoleType[]> = {
  [DEFAULT_ROLES.OWNER]: [
    DEFAULT_ROLES.ADMIN,
    DEFAULT_ROLES.TRAINER,
    DEFAULT_ROLES.FRONT_DESK,
    DEFAULT_ROLES.MEMBER,
  ],
  [DEFAULT_ROLES.ADMIN]: [DEFAULT_ROLES.TRAINER, DEFAULT_ROLES.FRONT_DESK, DEFAULT_ROLES.MEMBER],
  [DEFAULT_ROLES.TRAINER]: [DEFAULT_ROLES.MEMBER],
  [DEFAULT_ROLES.FRONT_DESK]: [DEFAULT_ROLES.MEMBER],
  [DEFAULT_ROLES.MEMBER]: [],
};

/**
 * Get role by slug
 */
export function getRoleBySlug(slug: string): Omit<Role, 'id'> | undefined {
  return ROLE_DEFINITIONS[slug as DefaultRoleType];
}

/**
 * Check if a role is a system role
 */
export function isSystemRole(slug: string): boolean {
  return Object.values(DEFAULT_ROLES).includes(slug as DefaultRoleType);
}

/**
 * Get inherited roles for a given role
 */
export function getInheritedRoles(roleSlug: string): DefaultRoleType[] {
  return ROLE_HIERARCHY[roleSlug as DefaultRoleType] || [];
}

/**
 * Check if a role has a specific permission through inheritance
 */
export function roleInheritsFrom(roleSlug: string, targetRoleSlug: string): boolean {
  const inheritedRoles = getInheritedRoles(roleSlug);
  return inheritedRoles.includes(targetRoleSlug as DefaultRoleType);
}

/**
 * Permission sets for default roles
 * Maps role slugs to their assigned permissions
 */
export const ROLE_PERMISSIONS = {
  [DEFAULT_ROLES.OWNER]: [
    // All permissions - owner has access to everything
    '*.*',
  ],

  [DEFAULT_ROLES.ADMIN]: [
    // All permissions except billing
    'analytics.*',
    'clients.*',
    'documents.*',
    'events.*',
    'memberships.*',
    'notifications.*',
    'organization.view',
    'organization.update',
    'organization.manage_roles',
    'organization.manage_staff',
    'system.*',
    'workouts.*',
  ],

  [DEFAULT_ROLES.TRAINER]: [
    // Client and event management
    'clients.view',
    'clients.create',
    'clients.update',
    'events.*',
    'workouts.*',
    'analytics.view_basic',
    'documents.view',
    'documents.upload',
    'memberships.view',
    'memberships.create',
    'memberships.update',
  ],

  [DEFAULT_ROLES.FRONT_DESK]: [
    // Basic operations
    'clients.view',
    'clients.create',
    'events.view',
    'events.book',
    'events.cancel_booking',
    'memberships.view',
    'analytics.view_basic',
  ],

  [DEFAULT_ROLES.MEMBER]: [
    // View-only access
    'events.view',
    'workouts.view',
  ],
};
