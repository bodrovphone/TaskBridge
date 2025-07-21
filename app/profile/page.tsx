'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Profile from '@/components/pages/profile'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to view your profile.",
        variant: "destructive",
      })
      router.push('/')
      return
    }
  }, [session, status, router, toast])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <Profile />
}