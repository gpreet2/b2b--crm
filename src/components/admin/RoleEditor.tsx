'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { createRole, type Role, type CreateRoleRequest } from '@/lib/api/roles';
import { cn } from '@/lib/utils';

export interface RoleEditorProps {
  role?: Role | null; // null for create, Role for edit
  onSave?: (role: Role) => void;
  onCancel?: () => void;
  className?: string;
}

const RoleEditor = React.forwardRef<HTMLDivElement, RoleEditorProps>(
  ({ 
    role, 
    onSave, 
    onCancel, 
    className 
  }, ref) => {
    const [formData, setFormData] = useState<CreateRoleRequest>({
      name: '',
      slug: '',
      description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const isEditMode = Boolean(role);

    useEffect(() => {
      if (role) {
        setFormData({
          name: role.name,
          slug: role.slug,
          description: role.description || '',
        });
      }
    }, [role]);

    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    const handleNameChange = (name: string) => {
      setFormData(prev => ({
        ...prev,
        name,
        // Auto-generate slug only for new roles and if slug is empty or auto-generated
        slug: !isEditMode && (!prev.slug || prev.slug === generateSlug(prev.name)) 
          ? generateSlug(name) 
          : prev.slug,
      }));
      
      // Clear validation errors
      if (validationErrors.name) {
        setValidationErrors(prev => ({ ...prev, name: '' }));
      }
    };

    const handleSlugChange = (slug: string) => {
      // Only allow valid slug characters
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, slug: cleanSlug }));
      
      // Clear validation errors
      if (validationErrors.slug) {
        setValidationErrors(prev => ({ ...prev, slug: '' }));
      }
    };

    const handleDescriptionChange = (description: string) => {
      setFormData(prev => ({ ...prev, description }));
    };

    const validateForm = (): boolean => {
      const errors: Record<string, string> = {};

      if (!formData.name.trim()) {
        errors.name = 'Role name is required';
      } else if (formData.name.length > 100) {
        errors.name = 'Role name must be 100 characters or less';
      }

      if (!formData.slug.trim()) {
        errors.slug = 'Role slug is required';
      } else if (formData.slug.length > 50) {
        errors.slug = 'Role slug must be 50 characters or less';
      } else if (!/^[a-z0-9_]+$/.test(formData.slug)) {
        errors.slug = 'Role slug can only contain lowercase letters, numbers, and underscores';
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isEditMode) {
          // TODO: Implement updateRole API call when backend supports it
          throw new Error('Role editing is not yet supported');
        } else {
          const newRole = await createRole(formData);
          onSave?.(newRole);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save role');
      } finally {
        setLoading(false);
      }
    };

    const handleReset = () => {
      if (role) {
        setFormData({
          name: role.name,
          slug: role.slug,
          description: role.description || '',
        });
      } else {
        setFormData({
          name: '',
          slug: '',
          description: '',
        });
      }
      setValidationErrors({});
      setError(null);
    };

    return (
      <Card className={cn("p-6", className)} ref={ref}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary-text">
            {isEditMode ? `Edit Role: ${role?.name}` : 'Create New Role'}
          </h2>
          <p className="text-sm text-secondary-text mt-1">
            {isEditMode 
              ? 'Modify the role details below. Note: System roles cannot be edited.'
              : 'Create a new role to organize user permissions within your organization.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {isEditMode && role?.is_system && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-yellow-800">
                This is a system role and cannot be modified.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-text mb-2">
              Role Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Manager, Staff, Administrator"
              disabled={loading || (isEditMode && role?.is_system)}
              className={validationErrors.name ? 'border-red-300' : ''}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-primary-text mb-2">
              Role Slug
              <span className="text-secondary-text text-xs ml-1">(used in code and URLs)</span>
            </label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g., manager, staff, administrator"
              disabled={loading || (isEditMode && role?.is_system)}
              className={validationErrors.slug ? 'border-red-300' : ''}
            />
            {validationErrors.slug && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
            )}
            <p className="mt-1 text-xs text-secondary-text">
              Only lowercase letters, numbers, and underscores allowed
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary-text mb-2">
              Description
              <span className="text-secondary-text text-xs ml-1">(optional)</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="Describe the role's purpose and responsibilities..."
              disabled={loading || (isEditMode && role?.is_system)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={isEditMode && role?.is_system}
            >
              {isEditMode ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Card>
    );
  }
);

RoleEditor.displayName = 'RoleEditor';

export default RoleEditor;