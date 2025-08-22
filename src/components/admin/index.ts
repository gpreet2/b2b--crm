/**
 * Admin Components - Index
 * 
 * This module provides easy access to all admin/settings components.
 * Import from here to access role management UI components.
 */

export { default as RolesList } from './RolesList';
export { default as RoleEditor } from './RoleEditor';
export { default as PermissionsMatrix } from './PermissionsMatrix';
export { default as UserRoleAssignment } from './UserRoleAssignment';

export type { RolesListProps } from './RolesList';
export type { RoleEditorProps } from './RoleEditor';
export type { PermissionsMatrixProps } from './PermissionsMatrix';
export type { UserRoleAssignmentProps } from './UserRoleAssignment';