import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
  constructor(
    resource: string,
    identifier?: string | number
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, 404, 'NOT_FOUND', true, { resource, identifier });
    this.name = 'NotFoundError';
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super('User', userId);
    this.name = 'UserNotFoundError';
  }
}

export class OrganizationNotFoundError extends NotFoundError {
  constructor(organizationId: string) {
    super('Organization', organizationId);
    this.name = 'OrganizationNotFoundError';
  }
}

export class ClientNotFoundError extends NotFoundError {
  constructor(clientId: string) {
    super('Client', clientId);
    this.name = 'ClientNotFoundError';
  }
}

export class EventNotFoundError extends NotFoundError {
  constructor(eventId: string) {
    super('Event', eventId);
    this.name = 'EventNotFoundError';
  }
}

export class MembershipNotFoundError extends NotFoundError {
  constructor(membershipId: string) {
    super('Membership', membershipId);
    this.name = 'MembershipNotFoundError';
  }
}

export class RouteNotFoundError extends BaseError {
  constructor(method: string, path: string) {
    super(
      `Route ${method} ${path} not found`,
      404,
      'ROUTE_NOT_FOUND',
      true,
      { resource: 'Route', identifier: `${method} ${path}`, method, path }
    );
    this.name = 'RouteNotFoundError';
  }
}