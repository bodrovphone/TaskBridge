'use client'

import { TaskForm } from '@/components/tasks/task-form'

interface CreateTaskFormProps {
  initialData?: any
  isReopening?: boolean
}

export function CreateTaskForm({ initialData, isReopening }: CreateTaskFormProps) {
  return <TaskForm mode="create" initialData={initialData} isReopening={isReopening} />
}
