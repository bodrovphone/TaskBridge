/**
 * Default Avatars
 *
 * @todo Replace Handshake placeholder with proper custom avatars
 * Animal avatar components are available in this folder but temporarily disabled
 */

import { Handshake } from 'lucide-react'

// @todo Re-enable animal avatars later - they're ready to use in ./cat.tsx, ./dog.tsx, etc.
// import { CatAvatar } from './cat'
// import { DogAvatar } from './dog'
// import { OwlAvatar } from './owl'
// import { FoxAvatar } from './fox'
// import { BearAvatar } from './bear'
// import { RabbitAvatar } from './rabbit'
// import { PenguinAvatar } from './penguin'
// import { KoalaAvatar } from './koala'
// import { PandaAvatar } from './panda'
// import { LionAvatar } from './lion'
// import { getDefaultAvatarIndex, type DefaultAvatarName } from '@/lib/utils/default-avatar'

/**
 * Render the default avatar for a user
 *
 * @todo Replace with proper avatar system (animal avatars are ready in this folder)
 */
export function DefaultAvatar({
  size = 64,
  className = '',
}: {
  userId?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Handshake className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  )
}

// @todo Re-enable these exports when animal avatars are ready
// export { CatAvatar } from './cat'
// export { DogAvatar } from './dog'
// ... etc
