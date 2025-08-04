import { Response } from 'express';

import { getRequestId } from '../middleware/request-id.middleware';
import {
  SuccessResponse,
  ErrorResponse,
  ResponseMetadata,
  StatusCodes,
} from '../types/error-response.types';

/**
 * Send a standardized success response
 */
export function sendSuccess<T = unknown>(
  res: Response,
  data: T,
  statusCode: number = StatusCodes.OK,
  meta?: Partial<ResponseMetadata>
): Response {
  const requestId = getRequestId(res);

  const response: SuccessResponse<T> = {
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated success response
 */
export function sendPaginatedSuccess<T = unknown>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  statusCode: number = StatusCodes.OK
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return sendSuccess(res, data, statusCode, {
    pagination: {
      ...pagination,
      totalPages,
    },
  });
}

/**
 * Send a created response (201)
 */
export function sendCreated<T = unknown>(res: Response, data: T, location?: string): Response {
  if (location) {
    res.setHeader('Location', location);
  }

  return sendSuccess(res, data, StatusCodes.CREATED);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: Response): Response {
  return res.status(StatusCodes.NO_CONTENT).send();
}

/**
 * Response builder for chaining
 */
export class ResponseBuilder<T = unknown> {
  private readonly data: T;
  private statusCode: number = StatusCodes.OK;
  private meta: Partial<ResponseMetadata> = {};
  private headers: Record<string, string> = {};

  constructor(data: T) {
    this.data = data;
  }

  static success<T>(data: T): ResponseBuilder<T> {
    return new ResponseBuilder(data);
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  withMeta(meta: Partial<ResponseMetadata>): this {
    this.meta = { ...this.meta, ...meta };
    return this;
  }

  withPagination(pagination: { page: number; limit: number; total: number }): this {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    this.meta.pagination = { ...pagination, totalPages };
    return this;
  }

  withHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  send(res: Response): Response {
    // Set any custom headers
    Object.entries(this.headers).forEach(([name, value]) => {
      res.setHeader(name, value);
    });

    return sendSuccess(res, this.data, this.statusCode, this.meta);
  }
}

/**
 * Type guards for response types
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return !!(response && typeof response === 'object' && 'error' in response);
}

export function isSuccessResponse<T = unknown>(response: unknown): response is SuccessResponse<T> {
  return !!(response && typeof response === 'object' && 'data' in response);
}

/**
 * Transform data for consistent API responses
 */
export function transformResponse<T>(
  data: T | T[],
  options: {
    fields?: string[];
    exclude?: string[];
    transform?: (item: T) => unknown;
  } = {}
): unknown {
  const { fields, exclude, transform } = options;

  if (Array.isArray(data)) {
    return data.map(item => transformResponse(item, options));
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  let result: unknown = data;

  // Apply custom transform first
  if (transform) {
    result = transform(result);
  }

  // Include only specified fields
  if (fields && fields.length > 0) {
    const filtered: Record<string, unknown> = {};
    fields.forEach(field => {
      if (field in result) {
        filtered[field] = result[field];
      }
    });
    result = filtered;
  }

  // Exclude specified fields
  if (exclude && exclude.length > 0) {
    exclude.forEach(field => {
      delete result[field];
    });
  }

  return result;
}
