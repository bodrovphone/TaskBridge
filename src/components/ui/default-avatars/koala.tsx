/**
 * Koala Avatar - Minimal geometric koala face
 */

interface KoalaAvatarProps {
  size?: number
  className?: string
}

export function KoalaAvatar({ size = 64, className = '' }: KoalaAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#94a3b8" />

      {/* Left ear */}
      <circle cx="10" cy="22" r="10" fill="#64748b" />
      <circle cx="10" cy="22" r="6" fill="#cbd5e1" />

      {/* Right ear */}
      <circle cx="54" cy="22" r="10" fill="#64748b" />
      <circle cx="54" cy="22" r="6" fill="#cbd5e1" />

      {/* Face */}
      <circle cx="32" cy="38" r="22" fill="#e2e8f0" />

      {/* Left eye */}
      <ellipse cx="24" cy="34" rx="4" ry="5" fill="#1e293b" />
      <circle cx="25" cy="33" r="1.5" fill="white" />

      {/* Right eye */}
      <ellipse cx="40" cy="34" rx="4" ry="5" fill="#1e293b" />
      <circle cx="41" cy="33" r="1.5" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="44" rx="7" ry="5" fill="#1e293b" />
      <ellipse cx="34" cy="43" rx="2" ry="1.5" fill="#475569" />

      {/* Mouth */}
      <path d="M32 49 Q28 53 26 51" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M32 49 Q36 53 38 51" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
