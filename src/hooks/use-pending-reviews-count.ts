import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'

export function usePendingReviewsCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['pendingReviewsCount'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/pending')
      if (!res.ok) return 0
      const data = await res.json()
      return data.length || 0
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: true
  })
}
