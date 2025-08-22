'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { 
  fetchRoles, 
  fetchUserRole, 
  updateUserRole, 
  type Role, 
  type UserRole, 
  type UpdateUserRoleRequest 
} from '@/lib/api/roles';
import { cn } from '@/lib/utils';

export interface UserRoleAssignmentProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  onRoleChanged?: (userRole: UserRole) => void;
  onCancel?: () => void;
  className?: string;
}

const UserRoleAssignment = React.forwardRef<HTMLDivElement, UserRoleAssignmentProps>(
  ({ 
    userId, 
    userName, 
    userEmail, 
    onRoleChanged, 
    onCancel, 
    className 
  }, ref) => {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      loadData();
    }, [userId]);

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user's current role and available roles in parallel
        const [userRoleData, rolesData] = await Promise.all([
          fetchUserRole(userId),
          fetchRoles(),
        ]);

        setUserRole(userRoleData);
        setAvailableRoles(rolesData.roles);
        setSelectedRoleId(userRoleData.role.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user role data');
      } finally {
        setLoading(false);
      }
    };

    const handleRoleChange = (roleId: string) => {
      setSelectedRoleId(roleId);
    };

    const handleSave = async () => {
      if (!selectedRoleId || selectedRoleId === userRole?.role.id) return;

      try {
        setSaving(true);
        setError(null);

        const updateData: UpdateUserRoleRequest = {
          roleId: selectedRoleId,
        };

        await updateUserRole(userId, updateData);
        
        // Reload user role data to get updated information
        const updatedUserRole = await fetchUserRole(userId);
        setUserRole(updatedUserRole);
        onRoleChanged?.(updatedUserRole);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user role');
      } finally {
        setSaving(false);
      }
    };

    const handleReset = () => {
      setSelectedRoleId(userRole?.role.id || '');
      setError(null);
    };

    const getSelectedRole = (): Role | undefined => {
      return availableRoles.find(role => role.id === selectedRoleId);
    };

    const hasChanges = selectedRoleId !== userRole?.role.id;

    if (loading) {
      return (
        <Card className={cn("p-8", className)} ref={ref}>
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2 text-secondary-text">Loading user role...</span>
          </div>
        </Card>
      );
    }

    if (error && !userRole) {
      return (
        <Card className={cn(className)} ref={ref}>
          <ErrorMessage title="Failed to Load User Role">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadData}
              >
                Try Again
              </Button>
            </div>
          </ErrorMessage>
        </Card>
      );
    }

    if (!userRole) {
      return (
        <Card className={cn("p-8", className)} ref={ref}>
          <div className="text-center text-secondary-text">
            No user role data available
          </div>
        </Card>
      );
    }

    const selectedRole = getSelectedRole();

    return (
      <Card className={cn("p-6", className)} ref={ref}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary-text">
            Assign Role
          </h2>
          <div className="mt-2">
            <div className="text-sm text-secondary-text">
              User: {userName || userEmail || userRole.user.email}
            </div>
            {userName && userEmail && (
              <div className="text-xs text-secondary-text">{userEmail}</div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        <div className="space-y-6">
          {/* Current Role Display */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-3">
              Current Role
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="font-medium">{userRole.role.name}</span>
                <Badge 
                  variant={userRole.role.is_system ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {userRole.role.is_system ? 'System' : 'Custom'}
                </Badge>
              </div>
              {userRole.role.description && (
                <p className="text-sm text-secondary-text mt-1">
                  {userRole.role.description}
                </p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-3">
              Select New Role
            </label>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <div
                  key={role.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedRoleId === role.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => handleRoleChange(role.id)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`role-${role.id}`}
                      name="role"
                      value={role.id}
                      checked={selectedRoleId === role.id}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`role-${role.id}`} 
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        <Badge 
                          variant={role.is_system ? 'secondary' : 'primary'}
                          size="sm"
                        >
                          {role.is_system ? 'System' : 'Custom'}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {role.permissionCount} permissions
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-sm text-secondary-text mt-1">
                          {role.description}
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Role Preview */}
          {hasChanges && selectedRole && (
            <div>
              <label className="block text-sm font-medium text-primary-text mb-3">
                New Role Preview
              </label>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-green-800">
                    Will be assigned: {selectedRole.name}
                  </span>
                  <Badge variant="outline" size="sm">
                    {selectedRole.permissionCount} permissions
                  </Badge>
                </div>
                {selectedRole.description && (
                  <p className="text-sm text-green-700 mt-1 ml-7">
                    {selectedRole.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
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
            disabled={!hasChanges}
          >
            Update Role
          </Button>
        </div>
      </Card>
    );
  }
);

UserRoleAssignment.displayName = 'UserRoleAssignment';

export default UserRoleAssignment;