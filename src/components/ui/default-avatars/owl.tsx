/**
 * Owl Avatar - Minimal geometric owl face
 */

interface OwlAvatarProps {
  size?: number
  className?: string
}

export function OwlAvatar({ size = 64, className = '' }: OwlAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="32" fill="#8b5cf6" />

      {/* Ear tufts */}
      <path d="M16 10 L20 22 L12 22 Z" fill="#6d28d9" />
      <path d="M48 10 L52 22 L44 22 Z" fill="#6d28d9" />

      {/* Body/face */}
      <ellipse cx="32" cy="38" rx="22" ry="20" fill="#ddd6fe" />

      {/* Left eye circle */}
      <circle cx="22" cy="34" r="10" fill="white" />
      <circle cx="22" cy="34" r="8" fill="#fbbf24" />
      <circle cx="22" cy="34" r="4" fill="#1e293b" />
      <circle cx="23" cy="33" r="1.5" fill="white" />

      {/* Right eye circle */}
      <circle cx="42" cy="34" r="10" fill="white" />
      <circle cx="42" cy="34" r="8" fill="#fbbf24" />
      <circle cx="42" cy="34" r="4" fill="#1e293b" />
      <circle cx="43" cy="33" r="1.5" fill="white" />

      {/* Beak */}
      <path d="M32 42 L28 48 L32 54 L36 48 Z" fill="#f97316" />

      {/* Chest feathers */}
      <path d="M24 52 Q32 58 40 52" stroke="#c4b5fd" strokeWidth="2" fill="none" />
      <path d="M26 56 Q32 60 38 56" stroke="#c4b5fd" strokeWidth="2" fill="none" />
    </svg>
  )
}
