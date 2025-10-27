/**
 * Result Pattern for error handling
 * Inspired by Rust's Result<T, E> pattern
 *
 * Usage:
 * - Success: Result.ok(value)
 * - Failure: Result.error(error)
 */

export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
    private readonly _isSuccess: boolean = true
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, undefined, true)
  }

  static error<E extends Error>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error, false)
  }

  isOk(): this is { value: T } {
    return this._isSuccess
  }

  isError(): this is { error: E } {
    return !this._isSuccess
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from error result')
    }
    return this._value!
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from success result')
    }
    return this._error!
  }

  /**
   * Map the value if success, otherwise return error
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.ok(fn(this._value!))
    }
    return Result.error(this._error!)
  }

  /**
   * Chain operations that return Results
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value!)
    }
    return Result.error(this._error!)
  }

  /**
   * Get value or default
   */
  unwrapOr(defaultValue: T): T {
    return this._isSuccess ? this._value! : defaultValue
  }

  /**
   * Get value or throw error
   */
  unwrap(): T {
    if (!this._isSuccess) {
      throw this._error
    }
    return this._value!
  }
}
