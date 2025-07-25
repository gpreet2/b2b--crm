// CommonJS wrapper for TypeScript permissions module
const PERMISSIONS = {
    // Staff Management
    MANAGE_STAFF: 'manage_staff',
    VIEW_STAFF: 'view_staff',
    INVITE_STAFF: 'invite_staff',
    REMOVE_STAFF: 'remove_staff',
    
    // Financial Management
    VIEW_FINANCIALS: 'view_financials',
    MANAGE_FINANCIALS: 'manage_financials',
    EXPORT_FINANCIAL_DATA: 'export_financial_data',
    
    // Client Management
    VIEW_ALL_CLIENTS: 'view_all_clients',
    VIEW_ASSIGNED_CLIENTS: 'view_assigned_clients',
    MANAGE_CLIENTS: 'manage_clients',
    
    // Class Management
    VIEW_CLASSES: 'view_classes',
    MANAGE_CLASSES: 'manage_classes',
    BOOK_CLASSES: 'book_classes',
    CANCEL_ANY_BOOKING: 'cancel_any_booking',
    
    // Performance Management
    VIEW_ALL_PERFORMANCE: 'view_all_performance',
    VIEW_OWN_PERFORMANCE: 'view_own_performance',
    MANAGE_PERFORMANCE: 'manage_performance',
    
    // Analytics
    VIEW_ANALYTICS: 'view_analytics',
    EXPORT_ANALYTICS: 'export_analytics',
    
    // System Settings
    MANAGE_GYM_SETTINGS: 'manage_gym_settings',
    MANAGE_INTEGRATIONS: 'manage_integrations',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    MANAGE_BILLING: 'manage_billing',
};

const ROLE_PERMISSIONS = {
    owner: [
      // All permissions
      'manage_staff', 'view_staff', 'invite_staff', 'remove_staff',
      'view_financials', 'manage_financials', 'export_financial_data',
      'view_all_clients', 'view_assigned_clients', 'manage_clients',
      'view_classes', 'manage_classes', 'book_classes', 'cancel_any_booking',
      'view_all_performance', 'view_own_performance', 'manage_performance',
      'view_analytics', 'export_analytics',
      'manage_gym_settings', 'manage_integrations', 'view_audit_logs', 'manage_billing'
    ],
    manager: [
      // Can view and invite staff, but not remove
      'view_staff', 'invite_staff',
      // Full financial access
      'view_financials', 'manage_financials', 'export_financial_data',
      // Full client access
      'view_all_clients', 'manage_clients',
      // Full class management
      'view_classes', 'manage_classes', 'book_classes', 'cancel_any_booking',
      // Can view all performance data
      'view_all_performance', 'manage_performance',
      // Analytics access
      'view_analytics', 'export_analytics',
    ],
    trainer: [
      // Can only view assigned clients
      'view_assigned_clients',
      // Can view and book classes
      'view_classes', 'book_classes',
      // Can manage performance for assigned clients
      'view_own_performance', 'manage_performance',
    ],
    member: [
      // Can book classes
      'book_classes',
      // Can view own performance
      'view_own_performance',
      // Can view classes
      'view_classes',
    ],
};

function roleHasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

function roleHasAllPermissions(role, requiredPermissions) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return requiredPermissions.every(permission => permissions.includes(permission));
}

function roleHasAnyPermission(role, requiredPermissions) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return requiredPermissions.some(permission => permissions.includes(permission));
}

function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  roleHasPermission,
  roleHasAllPermissions,
  roleHasAnyPermission,
  getRolePermissions
};