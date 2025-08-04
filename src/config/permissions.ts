/**
 * Permission structure configuration for the CRM system
 * Defines all available resources and actions for permission checks
 */

export interface Permission {
  resource: string;
  action: string;
  description?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  granted: boolean;
}

/**
 * Available resources in the system
 */
export const RESOURCES = {
  ANALYTICS: 'analytics',
  CLIENTS: 'clients',
  DOCUMENTS: 'documents',
  EVENTS: 'events',
  MEMBERSHIPS: 'memberships',
  NOTIFICATIONS: 'notifications',
  ORGANIZATION: 'organization',
  SYSTEM: 'system',
  WORKOUTS: 'workouts',
} as const;

export type ResourceType = typeof RESOURCES[keyof typeof RESOURCES];

/**
 * Available actions per resource
 */
export const ACTIONS = {
  // Analytics actions
  ANALYTICS: {
    VIEW_BASIC: 'view_basic',
    VIEW_DETAILED: 'view_detailed',
    EXPORT: 'export',
  },
  
  // Client actions
  CLIENTS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    EXPORT: 'export',
  },
  
  // Document actions
  DOCUMENTS: {
    VIEW: 'view',
    UPLOAD: 'upload',
    DELETE: 'delete',
  },
  
  // Event actions
  EVENTS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    BOOK: 'book',
    CANCEL_BOOKING: 'cancel_booking',
  },
  
  // Membership actions
  MEMBERSHIPS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    SUSPEND: 'suspend',
  },
  
  // Notification actions
  NOTIFICATIONS: {
    SEND: 'send',
    MANAGE_TEMPLATES: 'manage_templates',
  },
  
  // Organization actions
  ORGANIZATION: {
    VIEW: 'view',
    UPDATE: 'update',
    BILLING: 'billing',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_STAFF: 'manage_staff',
  },
  
  // System actions
  SYSTEM: {
    ACCESS_ADMIN_PANEL: 'access_admin_panel',
    MANAGE_INTEGRATIONS: 'manage_integrations',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
  },
  
  // Workout actions
  WORKOUTS: {
    VIEW: 'view',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    ASSIGN: 'assign',
  },
} as const;

/**
 * Permission definitions with descriptions
 * Maps to the permissions table in the database
 */
export const PERMISSION_DEFINITIONS: Record<string, Record<string, string>> = {
  [RESOURCES.ANALYTICS]: {
    [ACTIONS.ANALYTICS.VIEW_BASIC]: 'View basic analytics and reports',
    [ACTIONS.ANALYTICS.VIEW_DETAILED]: 'View detailed analytics',
    [ACTIONS.ANALYTICS.EXPORT]: 'Export analytics data',
  },
  
  [RESOURCES.CLIENTS]: {
    [ACTIONS.CLIENTS.VIEW]: 'View client profiles and information',
    [ACTIONS.CLIENTS.CREATE]: 'Create new client accounts',
    [ACTIONS.CLIENTS.UPDATE]: 'Update client information',
    [ACTIONS.CLIENTS.DELETE]: 'Delete client accounts',
    [ACTIONS.CLIENTS.EXPORT]: 'Export client data',
  },
  
  [RESOURCES.DOCUMENTS]: {
    [ACTIONS.DOCUMENTS.VIEW]: 'View documents',
    [ACTIONS.DOCUMENTS.UPLOAD]: 'Upload new documents',
    [ACTIONS.DOCUMENTS.DELETE]: 'Delete documents',
  },
  
  [RESOURCES.EVENTS]: {
    [ACTIONS.EVENTS.VIEW]: 'View events and classes',
    [ACTIONS.EVENTS.CREATE]: 'Create new events and classes',
    [ACTIONS.EVENTS.UPDATE]: 'Update event information',
    [ACTIONS.EVENTS.DELETE]: 'Delete events and classes',
    [ACTIONS.EVENTS.BOOK]: 'Book clients into events',
    [ACTIONS.EVENTS.CANCEL_BOOKING]: 'Cancel event bookings',
  },
  
  [RESOURCES.MEMBERSHIPS]: {
    [ACTIONS.MEMBERSHIPS.VIEW]: 'View membership information',
    [ACTIONS.MEMBERSHIPS.CREATE]: 'Create new memberships',
    [ACTIONS.MEMBERSHIPS.UPDATE]: 'Update membership details',
    [ACTIONS.MEMBERSHIPS.DELETE]: 'Delete memberships',
    [ACTIONS.MEMBERSHIPS.SUSPEND]: 'Suspend or resume memberships',
  },
  
  [RESOURCES.NOTIFICATIONS]: {
    [ACTIONS.NOTIFICATIONS.SEND]: 'Send notifications to users',
    [ACTIONS.NOTIFICATIONS.MANAGE_TEMPLATES]: 'Manage notification templates',
  },
  
  [RESOURCES.ORGANIZATION]: {
    [ACTIONS.ORGANIZATION.VIEW]: 'View organization settings',
    [ACTIONS.ORGANIZATION.UPDATE]: 'Update organization settings',
    [ACTIONS.ORGANIZATION.BILLING]: 'Manage billing and subscriptions',
    [ACTIONS.ORGANIZATION.MANAGE_ROLES]: 'Manage roles and permissions',
    [ACTIONS.ORGANIZATION.MANAGE_STAFF]: 'Manage staff members',
  },
  
  [RESOURCES.SYSTEM]: {
    [ACTIONS.SYSTEM.ACCESS_ADMIN_PANEL]: 'Access admin panel',
    [ACTIONS.SYSTEM.MANAGE_INTEGRATIONS]: 'Manage third-party integrations',
    [ACTIONS.SYSTEM.VIEW_AUDIT_LOGS]: 'View audit logs',
  },
  
  [RESOURCES.WORKOUTS]: {
    [ACTIONS.WORKOUTS.VIEW]: 'View workout plans and history',
    [ACTIONS.WORKOUTS.CREATE]: 'Create workout plans',
    [ACTIONS.WORKOUTS.UPDATE]: 'Update workout plans',
    [ACTIONS.WORKOUTS.DELETE]: 'Delete workout plans',
    [ACTIONS.WORKOUTS.ASSIGN]: 'Assign workouts to clients',
  },
};

/**
 * Helper function to get permission string
 */
export function getPermissionString(resource: string, action: string): string {
  return `${resource}.${action}`;
}

/**
 * Helper function to parse permission string
 */
export function parsePermissionString(permission: string): { resource: string; action: string } | null {
  const parts = permission.split('.');
  if (parts.length !== 2) {
    return null;
  }
  return {
    resource: parts[0],
    action: parts[1],
  };
}

/**
 * Check if a permission string is valid
 */
export function isValidPermission(resource: string, action: string): boolean {
  return PERMISSION_DEFINITIONS[resource]?.[action] !== undefined;
}

/**
 * Get all permissions as an array
 */
export function getAllPermissions(): Permission[] {
  const permissions: Permission[] = [];
  
  for (const [resource, actions] of Object.entries(PERMISSION_DEFINITIONS)) {
    for (const [action, description] of Object.entries(actions)) {
      permissions.push({
        resource,
        action,
        description,
      });
    }
  }
  
  return permissions;
}

/**
 * Get permissions by resource
 */
export function getPermissionsByResource(resource: string): Permission[] {
  const actions = PERMISSION_DEFINITIONS[resource];
  if (!actions) {
    return [];
  }
  
  return Object.entries(actions).map(([action, description]) => ({
    resource,
    action,
    description,
  }));
}