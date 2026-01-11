'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@nextui-org/react'
import { ArrowRight } from 'lucide-react'

const AuthSlideOver = dynamic(() => import('@/components/ui/auth-slide-over'), {
  ssr: false,
  loading: () => null,
})

interface RelatedLink {
  text: string
  href: string
}

interface ArticleRelatedLinksProps {
  links: RelatedLink[]
  title?: string
}

/**
 * Client component for rendering article related links with auth support.
 * Special href values:
 * - "#register" - Opens auth slide-over for registration
 * - Any other href - Normal navigation
 */
export function ArticleRelatedLinks({ links, title = 'Полезни връзки' }: ArticleRelatedLinksProps) {
  const [showAuth, setShowAuth] = useState(false)

  // Set professional intent before showing auth
  const handleRegisterClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trudify_registration_intent', 'professional')
    }
    setShowAuth(true)
  }

  if (links.length === 0) return null

  return (
    <>
      <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-wrap gap-3">
          {links.map((link, index) => {
            // Special action: open registration auth
            if (link.href === '#register') {
              return (
                <Button
                  key={index}
                  variant="solid"
                  className="bg-blue-600 text-white"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={handleRegisterClick}
                >
                  {link.text}
                </Button>
              )
            }

            // Normal link
            return (
              <Button
                key={index}
                as={Link}
                href={link.href}
                variant="solid"
                className="bg-blue-600 text-white"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                {link.text}
              </Button>
            )
          })}
        </div>
      </div>

      <AuthSlideOver isOpen={showAuth} onClose={() => setShowAuth(false)} action="join-professional" />
    </>
  )
}
