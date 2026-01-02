/**
 * Feature Flags Configuration
 *
 * Simple environment variable-based feature flags.
 * Future: Can be upgraded to database-backed for per-user/premium features.
 */

export interface FeatureFlags {
  /** Enable auto-invite matching professionals when task is created */
  autoInviteProfessionals: boolean
  /** Maximum number of professionals to auto-invite per task */
  autoInviteMaxPerTask: number
}

/**
 * Get all feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    autoInviteProfessionals:
      process.env.FEATURE_AUTO_INVITE_PROFESSIONALS === 'true',
    autoInviteMaxPerTask: parseInt(
      process.env.FEATURE_AUTO_INVITE_MAX_PER_TASK || '10',
      10
    ),
  }
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(
  feature: keyof Pick<FeatureFlags, 'autoInviteProfessionals'>
): boolean {
  const flags = getFeatureFlags()
  return !!flags[feature]
}
