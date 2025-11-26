'use client'

import { useState } from 'react'
import { CircleUser } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/server/domain/user/user.types'

// Simplified user type for avatar display
interface AvatarUser {
 id: string
 email: string
 fullName?: string | null
 avatarUrl?: string | null
}

export interface UserAvatarProps {
 user?: UserProfile | AvatarUser | null
 size?: 'sm' | 'md' | 'lg'
 showOnlineStatus?: boolean
 className?: string
 onClick?: () => void
 isClickable?: boolean
}

const sizeClasses = {
 sm: 'w-8 h-8 text-xs',
 md: 'w-10 h-10 text-sm',
 lg: 'w-16 h-16 text-lg'
}

const statusSizes = {
 sm: 'w-2 h-2',
 md: 'w-2.5 h-2.5',
 lg: 'w-3 h-3'
}

export default function UserAvatar({
 user,
 size = 'md',
 showOnlineStatus = false,
 className,
 onClick,
 isClickable = false
}: UserAvatarProps) {
 const [imageError, setImageError] = useState(false)

 // Generate a consistent color based on user ID
 const getAvatarColor = (userId: string): string => {
  const colors = [
   'bg-blue-500',
   'bg-green-500',
   'bg-purple-500',
   'bg-pink-500',
   'bg-indigo-500',
   'bg-yellow-500',
   'bg-red-500',
   'bg-teal-500'
  ]

  const hash = userId.split('').reduce((a, b) => {
   a = ((a << 5) - a) + b.charCodeAt(0)
   return a & a
  }, 0)

  return colors[Math.abs(hash) % colors.length]
 }

 const hasValidImage = user?.avatarUrl && !imageError

 // Determine background color:
 // - User with avatar: no background (image covers)
 // - User without avatar: colored background for icon
 const getBackgroundClass = () => {
  if (hasValidImage) return '' // Image covers everything
  if (user) return getAvatarColor(user.id || user.email) // Colored bg for icon
  return 'bg-gray-400' // Fallback gray
 }

 return (
  <div className="relative inline-flex">
   <div
    className={cn(
     'relative flex items-center justify-center rounded-full border-2 border-white shadow-sm transition-all duration-200 overflow-hidden',
     sizeClasses[size],
     isClickable && 'cursor-pointer hover:scale-105 hover:shadow-md',
     getBackgroundClass(),
     className
    )}
    onClick={onClick}
    role={isClickable ? 'button' : undefined}
    tabIndex={isClickable ? 0 : undefined}
    onKeyDown={isClickable ? (e) => {
     if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
     }
    } : undefined}
   >
    {hasValidImage ? (
     <img
      src={user.avatarUrl!}
      alt={user.fullName || user.email}
      className="w-full h-full rounded-full object-cover"
      onError={() => setImageError(true)}
     />
    ) : (
     /* Show person icon for users without custom avatar */
     <CircleUser className="text-white w-full h-full" />
    )}

    {/* Online Status Indicator */}
    {showOnlineStatus && (
     <div
      className={cn(
       'absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500',
       statusSizes[size]
      )}
     />
    )}
   </div>
  </div>
 )
}