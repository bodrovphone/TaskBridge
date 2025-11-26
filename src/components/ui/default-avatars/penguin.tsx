/**
 * Penguin Avatar - Minimal geometric penguin face
 */

interface PenguinAvatarProps {
  size?: number
  className?: string
}

export function PenguinAvatar({ size = 64, className = '' }: PenguinAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#0ea5e9" />

      {/* Body - black */}
      <ellipse cx="32" cy="38" rx="22" ry="22" fill="#1e293b" />

      {/* White belly */}
      <ellipse cx="32" cy="44" rx="14" ry="16" fill="white" />

      {/* Left eye */}
      <circle cx="22" cy="30" r="6" fill="white" />
      <circle cx="22" cy="30" r="4" fill="#1e293b" />
      <circle cx="23" cy="29" r="1.5" fill="white" />

      {/* Right eye */}
      <circle cx="42" cy="30" r="6" fill="white" />
      <circle cx="42" cy="30" r="4" fill="#1e293b" />
      <circle cx="43" cy="29" r="1.5" fill="white" />

      {/* Beak */}
      <path d="M32 36 L26 44 L32 42 L38 44 Z" fill="#f97316" />

      {/* Cheeks */}
      <ellipse cx="18" cy="38" rx="4" ry="3" fill="#fbbf24" opacity="0.6" />
      <ellipse cx="46" cy="38" rx="4" ry="3" fill="#fbbf24" opacity="0.6" />
    </svg>
  )
}
