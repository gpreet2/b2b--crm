import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR', true, { fields });
    this.name = 'ValidationError';
  }

  static fromFieldErrors(fields: Record<string, string[]>): ValidationError {
    const fieldCount = Object.keys(fields).length;
    const message =
      fieldCount === 1
        ? 'Validation failed for 1 field'
        : `Validation failed for ${fieldCount} fields`;

    return new ValidationError(message, fields);
  }
}

export class InvalidInputError extends BaseError {
  constructor(field: string, value?: any, expectedType?: string) {
    const message = expectedType
      ? `Invalid ${field}: expected ${expectedType}`
      : `Invalid ${field}`;

    const fields = { [field]: [message] };
    super(message, 400, 'INVALID_INPUT', true, { fields, field, value, expectedType });
    this.name = 'InvalidInputError';
  }
}

export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, {
      [field]: ['This field is required'],
    });
    this.name = 'MissingFieldError';
  }
}

export class InvalidFormatError extends BaseError {
  constructor(field: string, format: string, value?: string) {
    const message = `Invalid ${field} format. Expected: ${format}`;
    const fields = { [field]: [message] };
    super(message, 400, 'INVALID_FORMAT', true, { fields, field, format, value });
    this.name = 'InvalidFormatError';
  }
}
