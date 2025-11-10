'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth'

export interface WorkTask {
  id: string
  taskId: string
  taskTitle: string
  taskDescription: string
  customer: {
    name: string
    avatar?: string
    phone?: string
    email?: string
  }
  agreedPrice: number
  timeline: string
  startDate?: Date
  completedAt?: Date
  task: {
    deadline?: Date
    category: string
    location: {
      city: string
      neighborhood: string
    }
    status: 'in_progress' | 'pending_professional_confirmation' | 'completed'
  }
}

export function useWorkTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<WorkTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkTasks() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch accepted applications
        const response = await fetch('/api/applications?status=accepted')

        if (!response.ok) {
          throw new Error('Failed to fetch work tasks')
        }

        const data = await response.json()

        // Transform API response to WorkTask format
        const workTasks: WorkTask[] = (data.applications || []).map((app: any) => ({
          id: app.id,
          taskId: app.task.id,
          taskTitle: app.task.title,
          taskDescription: app.task.description,
          customer: {
            name: app.task.customer?.full_name || 'Unknown',
            avatar: app.task.customer?.avatar_url,
            phone: app.task.customer?.phone,
            email: app.task.customer?.email,
          },
          agreedPrice: app.proposed_price_bgn || 0,
          timeline: app.estimated_duration_hours
            ? `${app.estimated_duration_hours} hours`
            : 'Not specified',
          startDate: app.responded_at ? new Date(app.responded_at) : undefined,
          completedAt: undefined, // Will be populated from task completion data
          task: {
            deadline: undefined, // Add if task has deadline field
            category: app.task.category || 'general',
            location: {
              city: app.task.city || '',
              neighborhood: app.task.neighborhood || '',
            },
            status: app.task.status === 'in_progress'
              ? 'in_progress'
              : app.task.status === 'pending_professional_confirmation'
              ? 'pending_professional_confirmation'
              : app.task.status === 'completed'
              ? 'completed'
              : 'in_progress', // Default fallback
          },
        }))

        setTasks(workTasks)
      } catch (err: any) {
        console.error('Error fetching work tasks:', err)
        setError(err.message || 'Failed to load work tasks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkTasks()
  }, [user])

  const refetch = async () => {
    setIsLoading(true)
    // Re-trigger the effect by forcing a state change
    setTasks([])
  }

  return {
    tasks,
    isLoading,
    error,
    refetch,
  }
}
