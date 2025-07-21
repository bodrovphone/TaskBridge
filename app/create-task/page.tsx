'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CreateTask from '@/components/pages/create-task'
import { useToast } from '@/hooks/use-toast'

export default function CreateTaskPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to create a task.",
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

  return <CreateTask />
}