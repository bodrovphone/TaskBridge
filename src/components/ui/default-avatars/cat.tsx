/**
 * Cat Avatar - Minimal geometric cat face
 */

interface CatAvatarProps {
  size?: number
  className?: string
}

export function CatAvatar({ size = 64, className = '' }: CatAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#fbbf24" />

      {/* Left ear */}
      <path d="M14 12 L22 28 L6 28 Z" fill="#d97706" />
      <path d="M15 16 L20 26 L10 26 Z" fill="#fef3c7" />

      {/* Right ear */}
      <path d="M50 12 L58 28 L42 28 Z" fill="#d97706" />
      <path d="M49 16 L54 26 L44 26 Z" fill="#fef3c7" />

      {/* Face */}
      <ellipse cx="32" cy="38" rx="20" ry="18" fill="#fef3c7" />

      {/* Left eye */}
      <ellipse cx="24" cy="36" rx="4" ry="5" fill="#1e293b" />
      <circle cx="25" cy="35" r="1.5" fill="white" />

      {/* Right eye */}
      <ellipse cx="40" cy="36" rx="4" ry="5" fill="#1e293b" />
      <circle cx="41" cy="35" r="1.5" fill="white" />

      {/* Nose */}
      <path d="M32 42 L29 46 L35 46 Z" fill="#f472b6" />

      {/* Mouth */}
      <path d="M32 46 Q28 50 26 48" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 46 Q36 50 38 48" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="8" y1="40" x2="20" y2="42" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="46" x2="20" y2="45" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="42" x2="56" y2="40" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
      <line x1="44" y1="45" x2="56" y2="46" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
