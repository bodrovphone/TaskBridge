import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

export function useAuth() {
  const { data: session, status } = useSession()
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: !!session?.user?.id,
    retry: false,
  })

  const isLoading = status === 'loading' || userLoading

  return {
    user: user || session?.user,
    isLoading,
    isAuthenticated: !!session?.user,
    session,
  }
}
