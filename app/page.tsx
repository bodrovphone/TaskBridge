'use client'

import { useSession } from 'next-auth/react'
import Landing from '@/components/pages/landing'
import Home from '@/components/pages/home'

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Landing />
  }

  return <Home />
}