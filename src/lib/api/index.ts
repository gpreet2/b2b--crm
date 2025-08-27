/**
 * API Client Module - Index
 * 
 * This module provides easy access to all API client functions.
 * Import from here to access role and permission management APIs.
 */

// Role Management API
export {
  default as rolesApi,
  RolesApi,
  fetchRoles,
  createRole,
  fetchRolePermissions,
  updateRolePermissions,
  fetchUserRole,
  updateUserRole,
  fetchUserPermissions,
  type Role,
  type Permission,
  type RolePermissions,
  type UserRole,
  type CreateRoleRequest,
  type UpdatePermissionsRequest,
  type UpdateUserRoleRequest,
} from './roles';

// Permissions API
export {
  default as permissionsApi,
  PermissionsApi,
  fetchPermissions,
  fetchPermissionsByResource,
  type Permission as PermissionDetails,
} from './permissions';

// Organizations API
export {
  default as organizationsApi,
  OrganizationsApi,
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  fetchOrganizationSettings,
  updateOrganizationSettings,
  fetchOrganizationLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Organization,
  type Location,
  type OrganizationWithLocations,
  type CreateOrganizationRequest,
  type UpdateOrganizationRequest,
  type CreateLocationRequest,
  type UpdateLocationRequest,
} from './organizations';