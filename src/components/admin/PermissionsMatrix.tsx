'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  fetchRolePermissions, 
  updateRolePermissions, 
  type Role, 
  type Permission, 
  type RolePermissions,
  type UpdatePermissionsRequest 
} from '@/lib/api/roles';
import { cn } from '@/lib/utils';

export interface PermissionsMatrixProps {
  role: Role;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

interface PermissionsByResource {
  [resource: string]: Permission[];
}

const PermissionsMatrix = React.forwardRef<HTMLDivElement, PermissionsMatrixProps>(
  ({ 
    role, 
    onSave, 
    onCancel, 
    className 
  }, ref) => {
    const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
    const [permissionsByResource, setPermissionsByResource] = useState<PermissionsByResource>({});
    const [changedPermissions, setChangedPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      loadRolePermissions();
    }, [role.id]);

    const loadRolePermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRolePermissions(role.id);
        setRolePermissions(data);
        
        // Group permissions by resource
        const grouped: PermissionsByResource = {};
        data.permissions.forEach(permission => {
          if (!grouped[permission.resource]) {
            grouped[permission.resource] = [];
          }
          grouped[permission.resource].push(permission);
        });
        
        setPermissionsByResource(grouped);
        setChangedPermissions(new Set());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    const handlePermissionToggle = (permissionId: string, granted: boolean) => {
      if (!rolePermissions) return;

      // Update permissions state
      const updatedPermissions = rolePermissions.permissions.map(permission =>
        permission.id === permissionId ? { ...permission, granted } : permission
      );

      // Update grouped permissions
      const newGrouped: PermissionsByResource = {};
      updatedPermissions.forEach(permission => {
        if (!newGrouped[permission.resource]) {
          newGrouped[permission.resource] = [];
        }
        newGrouped[permission.resource].push(permission);
      });

      setRolePermissions({
        ...rolePermissions,
        permissions: updatedPermissions,
      });
      setPermissionsByResource(newGrouped);

      // Track changed permissions
      setChangedPermissions(prev => new Set(prev).add(permissionId));
    };

    const handleSave = async () => {
      if (!rolePermissions || changedPermissions.size === 0) return;

      try {
        setSaving(true);
        setError(null);

        const updateData: UpdatePermissionsRequest = {
          permissions: rolePermissions.permissions.map(permission => ({
            permissionId: permission.id,
            granted: permission.granted,
          })),
        };

        await updateRolePermissions(role.id, updateData);
        setChangedPermissions(new Set());
        onSave?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update permissions');
      } finally {
        setSaving(false);
      }
    };

    const handleReset = () => {
      loadRolePermissions();
    };

    const getResourceDisplayName = (resource: string): string => {
      return resource.charAt(0).toUpperCase() + resource.slice(1).replace('_', ' ');
    };

    const getActionDisplayName = (action: string): string => {
      return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getGrantedCount = (permissions: Permission[]): number => {
      return permissions.filter(p => p.granted).length;
    };

    if (loading) {
      return (
        <Card className={cn("p-8", className)} ref={ref}>
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2 text-secondary-text">Loading permissions...</span>
          </div>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={cn(className)} ref={ref}>
          <ErrorMessage title="Failed to Load Permissions">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRolePermissions}
              >
                Try Again
              </Button>
            </div>
          </ErrorMessage>
        </Card>
      );
    }

    if (!rolePermissions) {
      return (
        <Card className={cn("p-8", className)} ref={ref}>
          <div className="text-center text-secondary-text">
            No permissions data available
          </div>
        </Card>
      );
    }

    const hasChanges = changedPermissions.size > 0;
    const totalPermissions = rolePermissions.permissions.length;
    const grantedPermissions = rolePermissions.permissions.filter(p => p.granted).length;

    return (
      <div className={cn(className)} ref={ref}>
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-primary-text">
                Permissions for: {role.name}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">
                  {grantedPermissions} of {totalPermissions} permissions granted
                </Badge>
                {role.is_system && (
                  <Badge variant="secondary" size="sm">
                    System Role
                  </Badge>
                )}
                {hasChanges && (
                  <Badge variant="danger" size="sm">
                    {changedPermissions.size} unsaved changes
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={saving}
                >
                  Reset
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges || role.is_system}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {role.is_system && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  System role permissions cannot be modified.
                </span>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {Object.entries(permissionsByResource).map(([resource, permissions]) => (
            <Card key={resource} className="p-6" variant="outlined">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-primary-text">
                    {getResourceDisplayName(resource)}
                  </h3>
                  <Badge variant="outline" size="sm">
                    {getGrantedCount(permissions)} of {permissions.length} granted
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                {permissions.map((permission) => (
                  <div 
                    key={permission.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      changedPermissions.has(permission.id)
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-100 bg-gray-50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-text">
                          {getActionDisplayName(permission.action)}
                        </span>
                        {changedPermissions.has(permission.id) && (
                          <Badge variant="primary" size="sm">
                            Changed
                          </Badge>
                        )}
                      </div>
                      {permission.description && (
                        <p className="text-sm text-secondary-text mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                    
                    <Switch
                      checked={permission.granted}
                      onCheckedChange={(checked) => 
                        handlePermissionToggle(permission.id, checked)
                      }
                      disabled={role.is_system || saving}
                      className="ml-4"
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
);

PermissionsMatrix.displayName = 'PermissionsMatrix';

export default PermissionsMatrix;