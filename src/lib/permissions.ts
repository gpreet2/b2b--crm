// Permission definitions for the gym management system

export const PERMISSIONS = {
  // Staff Management
  MANAGE_STAFF: 'manage_staff',
  VIEW_STAFF: 'view_staff',
  INVITE_STAFF: 'invite_staff',
  REMOVE_STAFF: 'remove_staff',
  
  // Gym Settings
  MANAGE_GYM_SETTINGS: 'manage_gym_settings',
  VIEW_GYM_SETTINGS: 'view_gym_settings',
  
  // Financial
  VIEW_FINANCIALS: 'view_financials',
  MANAGE_FINANCIALS: 'manage_financials',
  PROCESS_PAYMENTS: 'process_payments',
  VIEW_REPORTS: 'view_reports',
  
  // Classes
  MANAGE_CLASSES: 'manage_classes',
  VIEW_CLASSES: 'view_classes',
  BOOK_CLASSES: 'book_classes',
  MANAGE_PROGRAMS: 'manage_programs',
  
  // Clients
  VIEW_ALL_CLIENTS: 'view_all_clients',
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_CLIENT_DETAILS: 'view_client_details',
  
  // Performance Tracking
  VIEW_ALL_PERFORMANCE: 'view_all_performance',
  MANAGE_PERFORMANCE: 'manage_performance',
  VIEW_OWN_PERFORMANCE: 'view_own_performance',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Access Control
  MANAGE_ACCESS: 'manage_access',
  VIEW_ACCESS_LOGS: 'view_access_logs',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions with their associated permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    // Owners have all permissions
    ...Object.values(PERMISSIONS),
  ],
  
  manager: [
    // Staff Management (limited)
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.INVITE_STAFF,
    
    // Gym Settings (view only)
    PERMISSIONS.VIEW_GYM_SETTINGS,
    
    // Financial (view only)
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_REPORTS,
    
    // Classes (full)
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.BOOK_CLASSES,
    PERMISSIONS.MANAGE_PROGRAMS,
    
    // Clients (full)
    PERMISSIONS.VIEW_ALL_CLIENTS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_CLIENT_DETAILS,
    
    // Performance (view all)
    PERMISSIONS.VIEW_ALL_PERFORMANCE,
    PERMISSIONS.MANAGE_PERFORMANCE,
    
    // Analytics (view only)
    PERMISSIONS.VIEW_ANALYTICS,
    
    // Access Control (view only)
    PERMISSIONS.VIEW_ACCESS_LOGS,
  ],
  
  trainer: [
    // Staff (view only own profile)
    PERMISSIONS.VIEW_STAFF,
    
    // Classes (manage own, view all)
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.BOOK_CLASSES,
    
    // Clients (view assigned)
    PERMISSIONS.VIEW_CLIENT_DETAILS,
    
    // Performance (manage for assigned clients)
    PERMISSIONS.MANAGE_PERFORMANCE,
    PERMISSIONS.VIEW_OWN_PERFORMANCE,
  ],
  
  member: [
    // Members/Clients have minimal permissions
    PERMISSIONS.BOOK_CLASSES,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_OWN_PERFORMANCE,
  ],
};

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Helper function to check multiple permissions (AND operation)
export function roleHasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(permission => roleHasPermission(role, permission));
}

// Helper function to check multiple permissions (OR operation)
export function roleHasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(permission => roleHasPermission(role, permission));
}

// Type guard for checking if a string is a valid permission
export function isValidPermission(permission: string): permission is Permission {
  return Object.values(PERMISSIONS).includes(permission as Permission);
}

// Get human-readable permission name
export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    [PERMISSIONS.MANAGE_STAFF]: 'Manage Staff',
    [PERMISSIONS.VIEW_STAFF]: 'View Staff',
    [PERMISSIONS.INVITE_STAFF]: 'Invite Staff',
    [PERMISSIONS.REMOVE_STAFF]: 'Remove Staff',
    [PERMISSIONS.MANAGE_GYM_SETTINGS]: 'Manage Gym Settings',
    [PERMISSIONS.VIEW_GYM_SETTINGS]: 'View Gym Settings',
    [PERMISSIONS.VIEW_FINANCIALS]: 'View Financials',
    [PERMISSIONS.MANAGE_FINANCIALS]: 'Manage Financials',
    [PERMISSIONS.PROCESS_PAYMENTS]: 'Process Payments',
    [PERMISSIONS.VIEW_REPORTS]: 'View Reports',
    [PERMISSIONS.MANAGE_CLASSES]: 'Manage Classes',
    [PERMISSIONS.VIEW_CLASSES]: 'View Classes',
    [PERMISSIONS.BOOK_CLASSES]: 'Book Classes',
    [PERMISSIONS.MANAGE_PROGRAMS]: 'Manage Programs',
    [PERMISSIONS.VIEW_ALL_CLIENTS]: 'View All Clients',
    [PERMISSIONS.MANAGE_CLIENTS]: 'Manage Clients',
    [PERMISSIONS.VIEW_CLIENT_DETAILS]: 'View Client Details',
    [PERMISSIONS.VIEW_ALL_PERFORMANCE]: 'View All Performance Data',
    [PERMISSIONS.MANAGE_PERFORMANCE]: 'Manage Performance Tracking',
    [PERMISSIONS.VIEW_OWN_PERFORMANCE]: 'View Own Performance',
    [PERMISSIONS.VIEW_ANALYTICS]: 'View Analytics',
    [PERMISSIONS.EXPORT_DATA]: 'Export Data',
    [PERMISSIONS.MANAGE_ACCESS]: 'Manage Access Control',
    [PERMISSIONS.VIEW_ACCESS_LOGS]: 'View Access Logs',
  };
  
  return labels[permission] || permission;
}