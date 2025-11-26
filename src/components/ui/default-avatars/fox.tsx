/**
 * Fox Avatar - Minimal geometric fox face
 */

interface FoxAvatarProps {
  size?: number
  className?: string
}

export function FoxAvatar({ size = 64, className = '' }: FoxAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#f97316" />

      {/* Left ear */}
      <path d="M10 8 L20 30 L4 26 Z" fill="#c2410c" />
      <path d="M12 14 L18 28 L8 25 Z" fill="#fed7aa" />

      {/* Right ear */}
      <path d="M54 8 L60 26 L44 30 Z" fill="#c2410c" />
      <path d="M52 14 L56 25 L46 28 Z" fill="#fed7aa" />

      {/* Face */}
      <ellipse cx="32" cy="38" rx="20" ry="18" fill="#fed7aa" />

      {/* White face markings */}
      <path d="M32 28 L22 50 L32 56 L42 50 Z" fill="white" />

      {/* Left eye */}
      <ellipse cx="24" cy="36" rx="3" ry="4" fill="#1e293b" />
      <circle cx="25" cy="35" r="1" fill="white" />

      {/* Right eye */}
      <ellipse cx="40" cy="36" rx="3" ry="4" fill="#1e293b" />
      <circle cx="41" cy="35" r="1" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="46" rx="4" ry="3" fill="#1e293b" />
      <ellipse cx="33" cy="45" rx="1" ry="0.8" fill="#475569" />

      {/* Mouth */}
      <path d="M32 49 Q28 53 26 51" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 49 Q36 53 38 51" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
