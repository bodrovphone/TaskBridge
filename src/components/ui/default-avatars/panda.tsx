/**
 * Panda Avatar - Minimal geometric panda face
 */

interface PandaAvatarProps {
  size?: number
  className?: string
}

export function PandaAvatar({ size = 64, className = '' }: PandaAvatarProps) {
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
      <circle cx="32" cy="32" r="32" fill="#f1f5f9" />

      {/* Left ear */}
      <circle cx="12" cy="14" r="8" fill="#0f172a" />

      {/* Right ear */}
      <circle cx="52" cy="14" r="8" fill="#0f172a" />

      {/* Face */}
      <circle cx="32" cy="36" r="22" fill="white" />

      {/* Left eye patch */}
      <ellipse cx="22" cy="32" rx="8" ry="10" fill="#0f172a" transform="rotate(-15 22 32)" />

      {/* Right eye patch */}
      <ellipse cx="42" cy="32" rx="8" ry="10" fill="#0f172a" transform="rotate(15 42 32)" />

      {/* Left eye */}
      <circle cx="22" cy="32" r="4" fill="white" />
      <circle cx="22" cy="32" r="2.5" fill="#0f172a" />
      <circle cx="23" cy="31" r="1" fill="white" />

      {/* Right eye */}
      <circle cx="42" cy="32" r="4" fill="white" />
      <circle cx="42" cy="32" r="2.5" fill="#0f172a" />
      <circle cx="43" cy="31" r="1" fill="white" />

      {/* Nose */}
      <ellipse cx="32" cy="44" rx="5" ry="4" fill="#0f172a" />
      <ellipse cx="33" cy="43" rx="1.5" ry="1" fill="#334155" />

      {/* Mouth */}
      <path d="M32 48 Q28 52 26 50" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 48 Q36 52 38 50" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
