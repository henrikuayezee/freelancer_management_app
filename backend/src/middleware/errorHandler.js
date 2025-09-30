/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

import { errorResponse } from '../utils/responses.js';

export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return errorResponse(res, 'A record with that value already exists', 400);
    }
    if (err.code === 'P2025') {
      return errorResponse(res, 'Record not found', 404);
    }
    return errorResponse(res, 'Database error occurred', 500);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation failed', 400, err.errors);
  }

  // Default error
  return errorResponse(
    res,
    err.message || 'An unexpected error occurred',
    err.statusCode || 500
  );
}