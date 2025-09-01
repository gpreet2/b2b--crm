// Placeholder permissions API module to fix import error

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export class PermissionsApi {
  // This will be implemented in Task 7: Permission System
  checkPermission = () => false;
  getUserPermissions = () => [];
  hasRole = () => false;
}

export const fetchPermissions = async () => [];
export const fetchPermissionsByResource = async () => [];

export const permissions = {
  checkPermission: () => false,
  getUserPermissions: () => [],
  hasRole: () => false,
};

export default permissions;