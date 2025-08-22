'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { fetchRoles, type Role } from '@/lib/api/roles';
import { cn } from '@/lib/utils';

export interface RolesListProps {
  onCreateRole?: () => void;
  onEditRole?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
  className?: string;
}

const RolesList = React.forwardRef<HTMLDivElement, RolesListProps>(
  ({ 
    onCreateRole, 
    onEditRole, 
    onManagePermissions, 
    className 
  }, ref) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      loadRoles();
    }, []);

    const loadRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rolesData = await fetchRoles();
        setRoles(rolesData.roles);
      } catch (err) {
        console.error('[ROLES LIST] Fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load roles');
      } finally {
        setLoading(false);
      }
    };

    const handleRefresh = () => {
      loadRoles();
    };

    if (loading) {
      return (
        <Card className={cn("p-8", className)} ref={ref}>
          <div className="flex items-center justify-center">
            <Spinner size="lg" />
            <span className="ml-2 text-secondary-text">Loading roles...</span>
          </div>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={cn(className)} ref={ref}>
          <ErrorMessage title="Failed to Load Roles">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </div>
          </ErrorMessage>
        </Card>
      );
    }

    return (
      <div className={cn(className)} ref={ref}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-primary-text">Roles Management</h2>
            <p className="text-sm text-secondary-text mt-1">
              Manage user roles and their permissions within your organization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Refresh
            </Button>
            {onCreateRole && (
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateRole}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Create Role
              </Button>
            )}
          </div>
        </div>

        {roles.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-secondary-text opacity-50">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-primary-text mb-2">No Roles Found</h3>
              <p className="text-secondary-text mb-4">
                Get started by creating your first role to organize user permissions.
              </p>
              {onCreateRole && (
                <Button variant="primary" onClick={onCreateRole}>
                  Create Your First Role
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="p-6" variant="outlined">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-primary-text">{role.name}</h3>
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
                      <p className="text-sm text-secondary-text">{role.description}</p>
                    )}
                    <div className="mt-2 text-xs text-secondary-text">
                      Slug: <code className="bg-accent px-1 py-0.5 rounded text-xs">{role.slug}</code>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {onManagePermissions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManagePermissions(role)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        }
                      >
                        Permissions
                      </Button>
                    )}
                    {onEditRole && !role.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRole(role)}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
);

RolesList.displayName = 'RolesList';

export default RolesList;