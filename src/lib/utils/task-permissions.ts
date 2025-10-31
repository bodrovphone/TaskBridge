/**
 * Task Permissions Utility
 *
 * Centralized logic for determining what actions are allowed based on task status.
 * This ensures consistent UI constraints across the entire application.
 */

export type TaskStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'pending_customer_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'

/**
 * Check if a task can be edited by its author
 *
 * Rules:
 * - Only 'open' tasks can be edited
 * - Once a task moves to other statuses, editing is locked
 */
export function canEditTask(status: TaskStatus): boolean {
  return status === 'open'
}

/**
 * Check if a professional can apply to a task
 *
 * Rules:
 * - Only 'open' tasks accept applications
 * - In-progress, completed, or cancelled tasks cannot receive new applications
 */
export function canApplyToTask(status: TaskStatus): boolean {
  return status === 'open'
}

/**
 * Check if a task can be cancelled by its author
 *
 * Rules:
 * - 'open' tasks can be cancelled freely
 * - 'in_progress' tasks can be cancelled but with penalties (handled separately)
 * - Completed, already cancelled, or disputed tasks cannot be cancelled
 */
export function canCancelTask(status: TaskStatus): boolean {
  return status === 'open' || status === 'in_progress'
}

/**
 * Check if a task can accept questions from professionals
 *
 * Rules:
 * - Only 'open' tasks accept questions
 * - Once task moves to other statuses, questions are disabled
 */
export function canAskQuestions(status: TaskStatus): boolean {
  return status === 'open'
}

/**
 * Check if task can be confirmed as completed by customer
 *
 * Rules:
 * - Only 'pending_customer_confirmation' tasks can be confirmed
 */
export function canConfirmCompletion(status: TaskStatus): boolean {
  return status === 'pending_customer_confirmation'
}

/**
 * Check if a task can be reopened
 *
 * Rules:
 * - Only 'cancelled' or 'completed' tasks can be reopened
 */
export function canReopenTask(status: TaskStatus): boolean {
  return status === 'cancelled' || status === 'completed'
}

/**
 * Check if a task can be reviewed
 *
 * Rules:
 * - Only 'completed' tasks can be reviewed
 */
export function canReviewTask(status: TaskStatus): boolean {
  return status === 'completed'
}

/**
 * Get a human-readable reason why an action is disabled
 */
export function getDisabledReason(
  action: 'edit' | 'apply' | 'cancel' | 'ask' | 'confirm' | 'reopen' | 'review',
  status: TaskStatus
): string {
  switch (action) {
    case 'edit':
      return status === 'open'
        ? ''
        : 'Only open tasks can be edited'

    case 'apply':
      if (status === 'in_progress') return 'This task is already in progress'
      if (status === 'completed') return 'This task has been completed'
      if (status === 'cancelled') return 'This task has been cancelled'
      return 'Applications are not accepted for this task'

    case 'cancel':
      if (status === 'completed') return 'Completed tasks cannot be cancelled'
      if (status === 'cancelled') return 'This task is already cancelled'
      return 'This task cannot be cancelled'

    case 'ask':
      return status === 'open'
        ? ''
        : 'Questions can only be asked on open tasks'

    case 'confirm':
      return status === 'pending_customer_confirmation'
        ? ''
        : 'Only tasks pending confirmation can be confirmed'

    case 'reopen':
      return (status === 'cancelled' || status === 'completed')
        ? ''
        : 'Only cancelled or completed tasks can be reopened'

    case 'review':
      return status === 'completed'
        ? ''
        : 'Only completed tasks can be reviewed'

    default:
      return ''
  }
}
