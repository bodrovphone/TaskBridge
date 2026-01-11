import Link from 'next/link'
import { ReactNode } from 'react'

interface ButtonLinkProps {
  href: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  endContent?: ReactNode
  startContent?: ReactNode
}

/**
 * A styled link that looks like a button.
 * Use this in Server Components where NextUI Button can't be imported.
 */
export function ButtonLink({
  href,
  children,
  size = 'md',
  variant = 'primary',
  className = '',
  endContent,
  startContent,
}: ButtonLinkProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  }

  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-colors duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {startContent}
      {children}
      {endContent}
    </Link>
  )
}
