// Task completion and status management translations
export const taskCompletion = {
  // Task Completion & Status
  'taskStatus.open': 'Отворена',
  'taskStatus.inProgress': 'В процес',
  'taskStatus.awaitingConfirmation': 'Очаква потвърждение',
  'taskStatus.completed': 'Завършена',
  'taskStatus.cancelled': 'Отменена',
  'taskStatus.underReview': 'В процес на преглед',
  'taskStatus.openTooltip': 'Приема кандидатури от специалисти',
  'taskStatus.inProgressTooltip': 'Работата в момента е в процес',
  'taskStatus.pendingProfessionalTooltip': 'Изчаква специалистът да потвърди завършването',
  'taskStatus.pendingCustomerTooltip': 'Изчаква клиентът да потвърди завършването',
  'taskStatus.completedTooltip': 'Задачата е завършена успешно',
  'taskStatus.cancelledTooltip': 'Задачата беше отменена',
  'taskStatus.disputedTooltip': 'В процес на преглед от администратор',

  // Task Completion Actions
  'taskCompletion.markCompleted': 'Маркирай като завършена',
  'taskCompletion.confirmCompletion': 'Потвърди завършването',
  'taskCompletion.alreadyMarkedByYou': 'Вие маркирахте като завършена',
  'taskCompletion.alreadyConfirmedByYou': 'Вече сте потвърдили',
  'taskCompletion.successMessage': 'Задачата е маркирана като завършена. Очаква се потвърждение от клиента.',
  'taskCompletion.errorMessage': 'Неуспешно маркиране на задачата. Моля, опитайте отново.',
  'taskCompletion.error.alreadyCompleted': 'Тази задача вече е завършена от другата страна.',
  'taskCompletion.error.invalidStatus': 'Тази задача не може да бъде маркирана като завършена в текущия ѝ статус.',

  // Mark Completed Dialog (Professional)
  'taskCompletion.markDialog.title': 'Маркиране на задача като завършена?',
  'taskCompletion.markDialog.task': 'Задача',
  'taskCompletion.markDialog.customer': 'Клиент',
  'taskCompletion.markDialog.payment': 'Плащане',
  'taskCompletion.markDialog.question': 'Завършихте ли цялата работа?',
  'taskCompletion.markDialog.checkRequirements': 'Всички изисквания са изпълнени',
  'taskCompletion.markDialog.checkSatisfied': 'Клиентът е доволен от резултата',
  'taskCompletion.markDialog.photos': 'Качете снимки на завършената работа (по избор)',
  'taskCompletion.markDialog.addPhotos': 'Добави снимки',
  'taskCompletion.markDialog.notes': 'Допълнителни бележки',
  'taskCompletion.markDialog.notesPlaceholder': 'Финални бележки относно завършената работа...',

  // Confirm Completion Dialog (Customer)
  'taskCompletion.confirmDialog.title': 'Потвърждаване на завършването?',
  'taskCompletion.confirmDialog.professional': 'Специалист',
  'taskCompletion.confirmDialog.task': 'Задача',
  'taskCompletion.confirmDialog.confirmMessage': 'Моля, потвърдете, че работата е завършена според вашите очаквания.',

  // Toast Notifications
  'taskCompletion.confirmSuccess': 'Задачата е завършена успешно!',
  'taskCompletion.confirmSuccessDescription': 'Специалистът е уведомен. Можете да оставите отзив по всяко време.',
  'taskCompletion.confirmError': 'Грешка при потвърждаване',

  // Pending Confirmation Banner
  'taskCompletion.pending.waitingCustomer': 'Изчаква потвърждение от клиента',
  'taskCompletion.pending.waitingProfessional': 'Изчаква потвърждение от специалиста',
  'taskCompletion.pending.professionalMarkedComplete': 'Специалистът маркира задачата като завършена',
  'taskCompletion.pending.customerMarkedComplete': 'Клиентът маркира задачата като завършена',
  'taskCompletion.pending.markedComplete': 'маркира тази задача като завършена.',
  'taskCompletion.pending.youMarked': 'Вие маркирахте тази задача като завършена.',
  'taskCompletion.pending.waitingFor': 'Изчаква',
  'taskCompletion.pending.toConfirm': 'да потвърди.',

  // Success View
  'taskCompletion.success.title': 'Задачата е завършена!',
  'taskCompletion.success.message': 'Браво! Задачата е маркирана като завършена.',
  'taskCompletion.success.reviewPrompt': 'Споделете опита си и помогнете на другите да намерят страхотни специалисти.',
  'taskCompletion.success.leaveReviewTitle': 'Оставете отзив за',
  'taskCompletion.success.leaveReviewHint': 'Вашият отзив помага на общността',
  'taskCompletion.success.leaveReview': 'Остави отзив',
  'taskCompletion.success.viewDetails': 'Виж детайли',

  // Timeline
  'taskCompletion.timeline.title': 'Напредък на задачата',
  'taskCompletion.timeline.started': 'Започната',
  'taskCompletion.timeline.proMarked': 'Специалистът маркира като завършена',
  'taskCompletion.timeline.customerConfirmed': 'Клиентът потвърди',
  'taskCompletion.timeline.completed': 'Завършена',
  'taskCompletion.timeline.pending': 'Чака',
  'taskCompletion.timeline.totalDuration': 'Обща продължителност',
};
