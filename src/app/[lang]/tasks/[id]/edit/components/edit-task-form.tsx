'use client'

import { TaskForm } from '@/components/tasks/task-form'

interface EditTaskFormProps {
  taskData: {
    id: string
    title: string
    description: string
    category: string
    subcategory?: string
    city: string
    neighborhood?: string
    exactAddress?: string
    budgetType: 'fixed' | 'range' | 'unclear'
    budgetMin?: number | null
    budgetMax?: number | null
    urgency: 'same_day' | 'within_week' | 'flexible'
    deadline?: Date
    images?: string[]
    requirements?: string
  }
}

export function EditTaskForm({ taskData }: EditTaskFormProps) {
  return (
    <TaskForm
      mode="edit"
      initialData={taskData}
      taskId={taskData.id}
    />
  )
}
