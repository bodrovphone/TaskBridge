/**
 * Bear Avatar - Minimal geometric bear face
 */

interface BearAvatarProps {
  size?: number
  className?: string
}

export function BearAvatar({ size = 64, className = '' }: BearAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#78716c" />

      {/* Left ear */}
      <circle cx="12" cy="16" r="8" fill="#57534e" />
      <circle cx="12" cy="16" r="5" fill="#a8a29e" />

      {/* Right ear */}
      <circle cx="52" cy="16" r="8" fill="#57534e" />
      <circle cx="52" cy="16" r="5" fill="#a8a29e" />

      {/* Face */}
      <circle cx="32" cy="36" r="22" fill="#d6d3d1" />

      {/* Snout */}
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="#fef3c7" />

      {/* Left eye */}
      <circle cx="22" cy="32" r="4" fill="#1e293b" />
      <circle cx="23" cy="31" r="1.5" fill="white" />

      {/* Right eye */}
      <circle cx="42" cy="32" r="4" fill="#1e293b" />
      <circle cx="43" cy="31" r="1.5" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="42" rx="5" ry="4" fill="#1e293b" />
      <ellipse cx="33" cy="41" rx="1.5" ry="1" fill="#475569" />

      {/* Mouth */}
      <path d="M32 46 L32 48" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 48 Q28 52 26 50" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 48 Q36 52 38 50" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
