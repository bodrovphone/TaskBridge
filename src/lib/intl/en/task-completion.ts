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
  'taskCompletion.rejectCompletion': 'Reject Completion',
  'taskCompletion.alreadyMarkedByYou': 'You marked as complete',
  'taskCompletion.alreadyConfirmedByYou': 'You already confirmed',

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
  'taskCompletion.confirmDialog.question': 'Is the work completed to your satisfaction?',
  'taskCompletion.confirmDialog.yes': 'Yes, I\'m satisfied',
  'taskCompletion.confirmDialog.no': 'No, there are issues',
  'taskCompletion.confirmDialog.greatMessage': 'Great! Thank you for confirming.',
  'taskCompletion.confirmDialog.reviewReminder': 'You\'ll be able to leave a review after confirmation.',

  // Rejection Flow
  'taskCompletion.reject.title': 'Please explain the issue',
  'taskCompletion.reject.reason': 'Why are you rejecting?',
  'taskCompletion.reject.notCompleted': 'Work not completed',
  'taskCompletion.reject.poorQuality': 'Poor quality',
  'taskCompletion.reject.differentScope': 'Different from agreed scope',
  'taskCompletion.reject.other': 'Other issues',
  'taskCompletion.reject.explain': 'Describe the issue',
  'taskCompletion.reject.explainPlaceholder': 'Please provide details about what needs to be fixed...',
  'taskCompletion.reject.warning': 'Task will return to "In Progress". You can discuss with the professional and they can rework it.',
  'taskCompletion.reject.disclaimer': 'This task will return to "In Progress" status and may become visible to other professionals again if work cannot be completed with the current professional.',
  'taskCompletion.reject.button': 'Reject',

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
  'taskCompletion.success.message': 'Great work! Both parties have confirmed task completion.',
  'taskCompletion.success.nextSteps': 'Next Steps',
  'taskCompletion.success.step1': 'Leave a review',
  'taskCompletion.success.step1Description': 'Share your experience working with {{name}}',
  'taskCompletion.success.step2': 'Task archived in 30 days',
  'taskCompletion.success.step2Description': 'Task will be automatically archived',
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
