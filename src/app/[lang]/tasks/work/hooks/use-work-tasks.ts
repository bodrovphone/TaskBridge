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
  sharedContactInfo?: {
    method: 'phone' | 'email' | 'custom'
    phone?: string
    email?: string
    customContact?: string
  }
  agreedPrice: number
  timeline: string
  startDate?: Date
  acceptedAt?: Date
  completedAt?: Date
  task: {
    deadline?: Date
    category: string
    location: {
      city: string
      neighborhood: string
    }
    status: 'in_progress' | 'completed'
  }
}

export function useWorkTasks() {
  const { profile, authenticatedFetch } = useAuth()
  const [tasks, setTasks] = useState<WorkTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkTasks() {
      if (!profile) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch accepted applications
        const response = await authenticatedFetch('/api/applications?status=accepted')

        if (!response.ok) {
          throw new Error('Failed to fetch work tasks')
        }

        const data = await response.json()

        // Transform API response to WorkTask format
        const workTasks: WorkTask[] = (data.applications || []).map((app: any) => {
          // Parse shared contact info if it exists
          let sharedContactInfo = undefined
          if (app.shared_contact_info) {
            try {
              sharedContactInfo = typeof app.shared_contact_info === 'string'
                ? JSON.parse(app.shared_contact_info)
                : app.shared_contact_info
            } catch (e) {
              console.error('Failed to parse shared_contact_info:', e)
            }
          }

          return {
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
            sharedContactInfo,
            agreedPrice: app.proposed_price_bgn || 0,
            timeline: app.estimated_duration_hours
              ? `${app.estimated_duration_hours} hours`
              : 'Not specified',
            startDate: app.responded_at ? new Date(app.responded_at) : undefined,
            acceptedAt: app.accepted_at ? new Date(app.accepted_at) : (app.created_at ? new Date(app.created_at) : new Date()),
            completedAt: undefined, // Will be populated from task completion data
            task: {
              deadline: undefined, // Add if task has deadline field
              category: app.task.category || 'general',
              location: {
                city: app.task.city || '',
                neighborhood: app.task.neighborhood || '',
              },
              status: app.task.status === 'completed' ? 'completed' : 'in_progress',
            },
          }
        })

        setTasks(workTasks)
      } catch (err: any) {
        console.error('Error fetching work tasks:', err)
        setError(err.message || 'Failed to load work tasks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkTasks()
  }, [profile, authenticatedFetch])

  const refetch = async () => {
    if (!profile) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await authenticatedFetch('/api/applications?status=accepted')
      if (!response.ok) {
        throw new Error('Failed to fetch work tasks')
      }

      const data = await response.json()
      const workTasks: WorkTask[] = (data.applications || []).map((app: any) => {
        // Parse shared contact info if it exists
        let sharedContactInfo = undefined
        if (app.shared_contact_info) {
          try {
            sharedContactInfo = typeof app.shared_contact_info === 'string'
              ? JSON.parse(app.shared_contact_info)
              : app.shared_contact_info
          } catch (e) {
            console.error('Failed to parse shared_contact_info:', e)
          }
        }

        return {
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
          sharedContactInfo,
          agreedPrice: app.proposed_price_bgn || 0,
          timeline: app.estimated_duration_hours
            ? `${app.estimated_duration_hours} hours`
            : 'Not specified',
          startDate: app.responded_at ? new Date(app.responded_at) : undefined,
          acceptedAt: app.accepted_at ? new Date(app.accepted_at) : (app.created_at ? new Date(app.created_at) : new Date()),
          completedAt: undefined,
          task: {
            deadline: undefined,
            category: app.task.category || 'general',
            location: {
              city: app.task.city || '',
              neighborhood: app.task.neighborhood || '',
            },
            status: app.task.status === 'completed' ? 'completed' : 'in_progress',
          },
        }
      })

      setTasks(workTasks)
    } catch (err: any) {
      console.error('Error refetching work tasks:', err)
      setError(err.message || 'Failed to reload work tasks')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tasks,
    isLoading,
    error,
    refetch,
  }
}
