/**
 * Base application error class
 * All custom errors extend from this
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details
    }
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

/**
 * Authorization error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403)
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', 409, details)
  }
}

/**
 * Business logic error (422)
 */
export class BusinessRuleError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details)
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'DATABASE_ERROR', 500, details)
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service '${service}' is unavailable`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      { service }
    )
  }
}

/**
 * Type guard to check if error is AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError
}

/**
 * Convert any error to AppError
 */
export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500)
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500)
}
