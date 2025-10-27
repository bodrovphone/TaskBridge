/**
 * Base error classes for domain layer
 * Framework-agnostic error handling
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR')
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, code?: string) {
    super(message, code || 'BUSINESS_RULE_VIOLATION')
  }
}

export class NotFoundError extends DomainError {
  constructor(entityName: string, identifier?: string) {
    super(
      identifier
        ? `${entityName} with identifier '${identifier}' not found`
        : `${entityName} not found`,
      'NOT_FOUND'
    )
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED')
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT')
  }
}
