// Task completion and status management translations
export const taskCompletion = {
  // Task Completion & Status
  'taskStatus.open': 'Open',
  'taskStatus.inProgress': 'In Progress',
  'taskStatus.awaitingConfirmation': 'Awaiting Confirmation',
  'taskStatus.completed': 'Completed',
  'taskStatus.cancelled': 'Cancelled',
  'taskStatus.underReview': 'Under Review',
  'taskStatus.openTooltip': 'Accepting applications from professionals',
  'taskStatus.inProgressTooltip': 'Work is currently in progress',
  'taskStatus.pendingProfessionalTooltip': 'Waiting for professional to confirm completion',
  'taskStatus.pendingCustomerTooltip': 'Waiting for customer to confirm completion',
  'taskStatus.completedTooltip': 'Task completed successfully',
  'taskStatus.cancelledTooltip': 'Task was cancelled',
  'taskStatus.disputedTooltip': 'Under review by admin',

  // Task Completion Actions
  'taskCompletion.markCompleted': 'Mark as Completed',
  'taskCompletion.confirmCompletion': 'Confirm Completion',
  'taskCompletion.alreadyMarkedByYou': 'You marked as complete',
  'taskCompletion.alreadyConfirmedByYou': 'You already confirmed',
  'taskCompletion.success': 'Task marked as completed. Waiting for customer confirmation.',
  'taskCompletion.error': 'Failed to mark task as completed. Please try again.',
  'taskCompletion.error.alreadyCompleted': 'This task has already been completed by the other party.',
  'taskCompletion.error.invalidStatus': 'This task cannot be marked as completed in its current status.',

  // Mark Completed Dialog (Professional)
  'taskCompletion.markDialog.title': 'Mark Task as Completed?',
  'taskCompletion.markDialog.task': 'Task',
  'taskCompletion.markDialog.customer': 'Customer',
  'taskCompletion.markDialog.payment': 'Payment',
  'taskCompletion.markDialog.question': 'Have you finished all work?',
  'taskCompletion.markDialog.checkRequirements': 'All requirements completed',
  'taskCompletion.markDialog.checkSatisfied': 'Customer satisfied with result',
  'taskCompletion.markDialog.photos': 'Upload completion photos (optional)',
  'taskCompletion.markDialog.addPhotos': 'Add Photos',
  'taskCompletion.markDialog.notes': 'Additional notes',
  'taskCompletion.markDialog.notesPlaceholder': 'Any final notes about the completed work...',

  // Confirm Completion Dialog (Customer)
  'taskCompletion.confirmDialog.title': 'Confirm Task Completion?',
  'taskCompletion.confirmDialog.professional': 'Professional',
  'taskCompletion.confirmDialog.task': 'Task',
  'taskCompletion.confirmDialog.confirmMessage': 'Please confirm that the work has been completed to your satisfaction.',

  // Toast Notifications
  'taskCompletion.confirmSuccess': 'Task Completed Successfully!',
  'taskCompletion.confirmSuccessDescription': 'The professional has been notified. You can leave a review anytime.',
  'taskCompletion.confirmError': 'Failed to Confirm Completion',

  // Pending Confirmation Banner
  'taskCompletion.pending.waitingCustomer': 'Waiting for Customer Confirmation',
  'taskCompletion.pending.waitingProfessional': 'Waiting for Professional Confirmation',
  'taskCompletion.pending.professionalMarkedComplete': 'Professional Marked Task Complete',
  'taskCompletion.pending.customerMarkedComplete': 'Customer Marked Task Complete',
  'taskCompletion.pending.markedComplete': 'marked this task as completed.',
  'taskCompletion.pending.youMarked': 'You marked this task as completed.',
  'taskCompletion.pending.waitingFor': 'Waiting for',
  'taskCompletion.pending.toConfirm': 'to confirm.',

  // Success View
  'taskCompletion.success.title': 'Task Completed!',
  'taskCompletion.success.message': 'Great work! The task has been marked as completed.',
  'taskCompletion.success.reviewPrompt': 'Share your experience and help others find great professionals.',
  'taskCompletion.success.leaveReviewTitle': 'Leave a review for',
  'taskCompletion.success.leaveReviewHint': 'Your feedback helps the community',
  'taskCompletion.success.leaveReview': 'Leave Review',
  'taskCompletion.success.viewDetails': 'View Task Details',

  // Timeline
  'taskCompletion.timeline.title': 'Task Progress',
  'taskCompletion.timeline.started': 'Started',
  'taskCompletion.timeline.proMarked': 'Professional Marked Complete',
  'taskCompletion.timeline.customerConfirmed': 'Customer Confirmed',
  'taskCompletion.timeline.completed': 'Completed',
  'taskCompletion.timeline.pending': 'Pending',
  'taskCompletion.timeline.totalDuration': 'Total Duration',
};
