/**
 * Feature Flags Configuration
 *
 * Simple environment variable-based feature flags.
 * Future: Can be upgraded to database-backed for per-user/premium features.
 */

export interface FeatureFlags {
  /** Maximum number of professionals to auto-invite per task */
  autoInviteMaxPerTask: number
}

/**
 * Get all feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    autoInviteMaxPerTask: parseInt(
      process.env.FEATURE_AUTO_INVITE_MAX_PER_TASK || '10',
      10
    ),
  }
}
