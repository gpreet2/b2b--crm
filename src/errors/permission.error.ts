import { BaseError } from './base.error';

export class PermissionError extends BaseError {
  constructor(
    message: string,
    requiredPermission?: string,
    userPermissions?: string[]
  ) {
    super(message, 403, 'PERMISSION_ERROR', true, {
      requiredPermission,
      userPermissions
    });
    this.name = 'PermissionError';
  }
}

export class ForbiddenError extends PermissionError {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class InsufficientPermissionsError extends PermissionError {
  constructor(
    requiredPermission: string,
    userPermissions: string[] = []
  ) {
    super(
      `Insufficient permissions. Required: ${requiredPermission}`,
      requiredPermission,
      userPermissions
    );
    this.name = 'InsufficientPermissionsError';
  }
}

export class OrganizationAccessError extends BaseError {
  constructor(organizationId: string, userId: string) {
    super(
      'User does not have access to this organization',
      403,
      'ORGANIZATION_ACCESS_ERROR',
      true,
      { 
        organizationId, 
        userId,
        requiredPermission: 'organization.access',
        userPermissions: []
      }
    );
    this.name = 'OrganizationAccessError';
  }
}

export class ResourceOwnershipError extends BaseError {
  constructor(resourceType: string, resourceId: string) {
    super(
      `You do not own this ${resourceType}`,
      403,
      'RESOURCE_OWNERSHIP_ERROR',
      true,
      { 
        resourceType, 
        resourceId,
        requiredPermission: `${resourceType}.owner`,
        userPermissions: []
      }
    );
    this.name = 'ResourceOwnershipError';
  }
}