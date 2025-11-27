/**
 * Default Avatars
 *
 * Shows a person icon with random gradient colors based on userId
 */

import { CircleUser } from 'lucide-react'

// Color gradients for default avatars - selected to be visually distinct
const avatarGradients = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
  'from-sky-500 to-indigo-600',
  'from-red-500 to-rose-600',
]

/**
 * Get consistent gradient index from userId
 */
function getGradientIndex(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % avatarGradients.length
}

/**
 * Render the default avatar for a user
 * Shows a person icon with a consistent random gradient based on userId
 */
export function DefaultAvatar({
  userId = '',
  size = 64,
  className = '',
}: {
  userId?: string
  size?: number
  className?: string
}) {
  const gradientIndex = userId ? getGradientIndex(userId) : 0
  const gradient = avatarGradients[gradientIndex]

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <CircleUser className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  )
}

// @todo Re-enable these exports when animal avatars are ready
// export { CatAvatar } from './cat'
// export { DogAvatar } from './dog'
// ... etc
