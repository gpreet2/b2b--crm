import { NextRequest } from 'next/server';
import { Response } from 'express';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get request ID from headers or generate a new one
 */
export function getRequestId(request: NextRequest | Response): string {
  if ('headers' in request && typeof request.headers.get === 'function') {
    // NextRequest
    const existingId = request.headers.get('x-request-id');
    return existingId || generateRequestId();
  } else {
    // Express Response - check request headers
    const expressRes = request as Response;
    const existingId = expressRes.get('x-request-id');
    return existingId || generateRequestId();
  }
}