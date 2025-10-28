/**
 * Result type for functional error handling
 * Inspired by Rust's Result<T, E> pattern
 *
 * Usage:
 *   const result = await someOperation()
 *   if (result.success) {
 *     console.log(result.data)
 *   } else {
 *     console.error(result.error)
 *   }
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Create a successful result
 */
export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data
})

/**
 * Create an error result
 */
export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error
})

/**
 * Helper to check if result is successful
 */
export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
  return result.success
}

/**
 * Helper to check if result is an error
 */
export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return !result.success
}

/**
 * Unwrap result data or throw error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) {
    return result.data
  }
  throw result.error
}

/**
 * Get data or return default value
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (result.success) {
    return result.data
  }
  return defaultValue
}
