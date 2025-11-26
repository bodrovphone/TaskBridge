/**
 * Default Avatar Utility
 * Deterministically assigns animal avatars to users based on their ID
 */

// Animal avatar names - order matters for consistent assignment
export const DEFAULT_AVATARS = [
  'cat',
  'dog',
  'owl',
  'fox',
  'bear',
  'rabbit',
  'penguin',
  'koala',
  'panda',
  'lion',
] as const

export type DefaultAvatarName = typeof DEFAULT_AVATARS[number]

// Background colors for each avatar (Tailwind classes)
export const AVATAR_COLORS: Record<DefaultAvatarName, { bg: string; accent: string }> = {
  cat: { bg: '#fbbf24', accent: '#d97706' },      // amber-400, amber-600
  dog: { bg: '#d97706', accent: '#92400e' },      // amber-600, amber-800
  owl: { bg: '#8b5cf6', accent: '#6d28d9' },      // violet-500, violet-700
  fox: { bg: '#f97316', accent: '#c2410c' },      // orange-500, orange-700
  bear: { bg: '#78716c', accent: '#57534e' },     // stone-500, stone-600
  rabbit: { bg: '#f472b6', accent: '#db2777' },   // pink-400, pink-600
  penguin: { bg: '#0ea5e9', accent: '#1e293b' },  // sky-500, slate-800
  koala: { bg: '#94a3b8', accent: '#64748b' },    // slate-400, slate-500
  panda: { bg: '#f1f5f9', accent: '#0f172a' },    // slate-100, slate-900
  lion: { bg: '#eab308', accent: '#a16207' },     // yellow-500, yellow-700
}

/**
 * Simple hash function to convert user ID to a number
 * Uses djb2 algorithm for consistent hashing
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Get the avatar index (0-9) for a user ID
 * Same user ID always returns the same index
 */
export function getDefaultAvatarIndex(userId: string): number {
  return hashString(userId) % DEFAULT_AVATARS.length
}

/**
 * Get the avatar name for a user ID
 */
export function getDefaultAvatarName(userId: string): DefaultAvatarName {
  const index = getDefaultAvatarIndex(userId)
  return DEFAULT_AVATARS[index]
}

/**
 * Get the avatar colors for a user ID
 */
export function getDefaultAvatarColors(userId: string): { bg: string; accent: string } {
  const name = getDefaultAvatarName(userId)
  return AVATAR_COLORS[name]
}
