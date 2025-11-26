/**
 * Dog Avatar - Minimal geometric dog face
 */

interface DogAvatarProps {
  size?: number
  className?: string
}

export function DogAvatar({ size = 64, className = '' }: DogAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#d97706" />

      {/* Left ear */}
      <ellipse cx="12" cy="28" rx="8" ry="14" fill="#92400e" />

      {/* Right ear */}
      <ellipse cx="52" cy="28" rx="8" ry="14" fill="#92400e" />

      {/* Face */}
      <circle cx="32" cy="36" r="20" fill="#fef3c7" />

      {/* Snout */}
      <ellipse cx="32" cy="44" rx="10" ry="8" fill="#fde68a" />

      {/* Left eye */}
      <circle cx="24" cy="34" r="4" fill="#1e293b" />
      <circle cx="25" cy="33" r="1.5" fill="white" />

      {/* Right eye */}
      <circle cx="40" cy="34" r="4" fill="#1e293b" />
      <circle cx="41" cy="33" r="1.5" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="42" rx="4" ry="3" fill="#1e293b" />
      <ellipse cx="33" cy="41" rx="1" ry="0.8" fill="#475569" />

      {/* Mouth */}
      <path d="M32 45 L32 48" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 48 Q28 52 25 50" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 48 Q36 52 39 50" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Tongue */}
      <ellipse cx="32" cy="52" rx="3" ry="4" fill="#f472b6" />
    </svg>
  )
}
