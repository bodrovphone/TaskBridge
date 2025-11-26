/**
 * Lion Avatar - Minimal geometric lion face
 */

interface LionAvatarProps {
  size?: number
  className?: string
}

export function LionAvatar({ size = 64, className = '' }: LionAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#eab308" />

      {/* Mane */}
      <circle cx="32" cy="32" r="28" fill="#a16207" />

      {/* Mane spikes */}
      <ellipse cx="32" cy="6" rx="6" ry="8" fill="#a16207" />
      <ellipse cx="12" cy="14" rx="6" ry="8" fill="#a16207" transform="rotate(-45 12 14)" />
      <ellipse cx="52" cy="14" rx="6" ry="8" fill="#a16207" transform="rotate(45 52 14)" />
      <ellipse cx="6" cy="32" rx="6" ry="8" fill="#a16207" transform="rotate(-90 6 32)" />
      <ellipse cx="58" cy="32" rx="6" ry="8" fill="#a16207" transform="rotate(90 58 32)" />
      <ellipse cx="12" cy="50" rx="6" ry="8" fill="#a16207" transform="rotate(-135 12 50)" />
      <ellipse cx="52" cy="50" rx="6" ry="8" fill="#a16207" transform="rotate(135 52 50)" />

      {/* Face */}
      <circle cx="32" cy="36" r="18" fill="#fde047" />

      {/* Left ear */}
      <circle cx="16" cy="22" r="5" fill="#fde047" />
      <circle cx="16" cy="22" r="3" fill="#fbbf24" />

      {/* Right ear */}
      <circle cx="48" cy="22" r="5" fill="#fde047" />
      <circle cx="48" cy="22" r="3" fill="#fbbf24" />

      {/* Left eye */}
      <ellipse cx="25" cy="34" rx="3" ry="4" fill="#1e293b" />
      <circle cx="26" cy="33" r="1" fill="white" />

      {/* Right eye */}
      <ellipse cx="39" cy="34" rx="3" ry="4" fill="#1e293b" />
      <circle cx="40" cy="33" r="1" fill="white" />

      {/* Snout */}
      <ellipse cx="32" cy="44" rx="8" ry="6" fill="#fef3c7" />

      {/* Nose */}
      <path d="M32 40 L28 44 L32 46 L36 44 Z" fill="#1e293b" />

      {/* Mouth */}
      <path d="M32 46 L32 48" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 48 Q28 51 26 49" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 48 Q36 51 38 49" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
