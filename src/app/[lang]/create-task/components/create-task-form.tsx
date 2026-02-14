'use client'

import { TaskForm } from '@/components/tasks/task-form'

interface CreateTaskFormProps {
  initialData?: any
  isReopening?: boolean
  inviteProfessionalId?: string
  restoreAndSubmit?: boolean
}

export function CreateTaskForm({
  initialData,
  isReopening,
  inviteProfessionalId,
  restoreAndSubmit
}: CreateTaskFormProps) {
  return (
    <TaskForm
      mode="create"
      initialData={initialData}
      isReopening={isReopening}
      inviteProfessionalId={inviteProfessionalId}
      restoreAndSubmit={restoreAndSubmit}
    />
  )
}
