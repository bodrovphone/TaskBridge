/**
 * Rabbit Avatar - Minimal geometric rabbit face
 */

interface RabbitAvatarProps {
  size?: number
  className?: string
}

export function RabbitAvatar({ size = 64, className = '' }: RabbitAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#f472b6" />

      {/* Left ear */}
      <ellipse cx="20" cy="14" rx="6" ry="16" fill="#fce7f3" />
      <ellipse cx="20" cy="14" rx="3" ry="12" fill="#fbcfe8" />

      {/* Right ear */}
      <ellipse cx="44" cy="14" rx="6" ry="16" fill="#fce7f3" />
      <ellipse cx="44" cy="14" rx="3" ry="12" fill="#fbcfe8" />

      {/* Face */}
      <circle cx="32" cy="40" r="20" fill="#fce7f3" />

      {/* Left eye */}
      <circle cx="24" cy="38" r="4" fill="#1e293b" />
      <circle cx="25" cy="37" r="1.5" fill="white" />

      {/* Right eye */}
      <circle cx="40" cy="38" r="4" fill="#1e293b" />
      <circle cx="41" cy="37" r="1.5" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="46" rx="3" ry="2" fill="#ec4899" />

      {/* Mouth */}
      <path d="M32 48 L32 50" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 50 Q28 54 26 52" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 50 Q36 54 38 52" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="18" cy="46" r="4" fill="#fbcfe8" />
      <circle cx="46" cy="46" r="4" fill="#fbcfe8" />

      {/* Whiskers */}
      <line x1="10" y1="44" x2="18" y2="46" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="10" y1="48" x2="18" y2="48" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="46" y1="46" x2="54" y2="44" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="46" y1="48" x2="54" y2="48" stroke="#1e293b" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}
