// Task completion and status management translations
export const taskCompletion = {
  // Task Completion & Status
  'taskStatus.open': 'Відкрите',
  'taskStatus.inProgress': 'У роботі',
  'taskStatus.awaitingConfirmation': 'Очікує підтвердження',
  'taskStatus.completed': 'Завершено',
  'taskStatus.cancelled': 'Скасовано',
  'taskStatus.underReview': 'На розгляді',
  'taskStatus.openTooltip': 'Приймаються заявки від фахівців',
  'taskStatus.inProgressTooltip': 'Робота в процесі виконання',
  'taskStatus.pendingProfessionalTooltip': 'Очікування підтвердження від фахівця',
  'taskStatus.pendingCustomerTooltip': 'Очікування підтвердження від замовника',
  'taskStatus.completedTooltip': 'Завдання успішно завершено',
  'taskStatus.cancelledTooltip': 'Завдання скасовано',
  'taskStatus.disputedTooltip': 'На розгляді адміністратором',

  // Task Completion Actions
  'taskCompletion.markCompleted': 'Позначити як завершене',
  'taskCompletion.confirmCompletion': 'Підтвердити завершення',
  'taskCompletion.alreadyMarkedByYou': 'Ви позначили як завершене',
  'taskCompletion.alreadyConfirmedByYou': 'Ви вже підтвердили',
  'taskCompletion.success': 'Завдання позначено як завершене. Очікуємо підтвердження від замовника.',
  'taskCompletion.error': 'Не вдалося позначити завдання. Будь ласка, спробуйте ще раз.',
  'taskCompletion.error.alreadyCompleted': 'Це завдання вже було завершено іншою стороною.',
  'taskCompletion.error.invalidStatus': 'Це завдання не може бути позначене як завершене у поточному статусі.',

  // Mark Completed Dialog (Professional)
  'taskCompletion.markDialog.title': 'Позначити завдання як завершене?',
  'taskCompletion.markDialog.task': 'Завдання',
  'taskCompletion.markDialog.customer': 'Замовник',
  'taskCompletion.markDialog.payment': 'Оплата',
  'taskCompletion.markDialog.question': 'Ви завершили всю роботу?',
  'taskCompletion.markDialog.checkRequirements': 'Усі вимоги виконано',
  'taskCompletion.markDialog.checkSatisfied': 'Замовник задоволений результатом',
  'taskCompletion.markDialog.photos': 'Завантажте фото завершення (необов\'язково)',
  'taskCompletion.markDialog.addPhotos': 'Додати фото',
  'taskCompletion.markDialog.notes': 'Додаткові нотатки',
  'taskCompletion.markDialog.notesPlaceholder': 'Будь-які заключні нотатки про виконану роботу...',

  // Confirm Completion Dialog (Customer)
  'taskCompletion.confirmDialog.title': 'Підтвердити завершення завдання?',
  'taskCompletion.confirmDialog.professional': 'Фахівець',
  'taskCompletion.confirmDialog.task': 'Завдання',
  'taskCompletion.confirmDialog.confirmMessage': 'Будь ласка, підтвердіть, що роботу виконано на ваше задоволення.',

  // Toast Notifications
  'taskCompletion.confirmSuccess': 'Завдання успішно завершено!',
  'taskCompletion.confirmSuccessDescription': 'Фахівця повідомлено. Ви можете залишити відгук будь-коли.',
  'taskCompletion.confirmError': 'Помилка підтвердження завершення',

  // Pending Confirmation Banner
  'taskCompletion.pending.waitingCustomer': 'Очікування підтвердження замовника',
  'taskCompletion.pending.waitingProfessional': 'Очікування підтвердження фахівця',
  'taskCompletion.pending.professionalMarkedComplete': 'Фахівець позначив завдання як завершене',
  'taskCompletion.pending.customerMarkedComplete': 'Замовник позначив завдання як завершене',
  'taskCompletion.pending.markedComplete': 'позначив це завдання як завершене.',
  'taskCompletion.pending.youMarked': 'Ви позначили це завдання як завершене.',
  'taskCompletion.pending.waitingFor': 'Очікування',
  'taskCompletion.pending.toConfirm': 'для підтвердження.',

  // Success View
  'taskCompletion.success.title': 'Завдання завершено!',
  'taskCompletion.success.message': 'Чудова робота! Завдання позначено як завершене.',
  'taskCompletion.success.reviewPrompt': 'Поділіться досвідом і допоможіть іншим знайти чудових фахівців.',
  'taskCompletion.success.leaveReviewTitle': 'Залиште відгук про',
  'taskCompletion.success.leaveReviewHint': 'Ваш відгук допомагає спільноті',
  'taskCompletion.success.leaveReview': 'Залишити відгук',
  'taskCompletion.success.viewDetails': 'Переглянути деталі завдання',

  // Timeline
  'taskCompletion.timeline.title': 'Прогрес завдання',
  'taskCompletion.timeline.started': 'Розпочато',
  'taskCompletion.timeline.proMarked': 'Фахівець позначив як завершене',
  'taskCompletion.timeline.customerConfirmed': 'Замовник підтвердив',
  'taskCompletion.timeline.completed': 'Завершено',
  'taskCompletion.timeline.pending': 'Очікує',
  'taskCompletion.timeline.totalDuration': 'Загальна тривалість',
};
