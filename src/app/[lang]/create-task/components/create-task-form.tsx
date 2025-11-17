'use client'

import { TaskForm } from '@/components/tasks/task-form'

interface CreateTaskFormProps {
  initialData?: any
  isReopening?: boolean
  inviteProfessionalId?: string
}

export function CreateTaskForm({
  initialData,
  isReopening,
  inviteProfessionalId
}: CreateTaskFormProps) {
  return (
    <TaskForm
      mode="create"
      initialData={initialData}
      isReopening={isReopening}
      inviteProfessionalId={inviteProfessionalId}
    />
  )
}
