// Task completion and status management translations
export const taskCompletion = {
  // Task Completion & Status
  'taskStatus.open': 'Открыта',
  'taskStatus.inProgress': 'В процессе',
  'taskStatus.awaitingConfirmation': 'Ожидание подтверждения',
  'taskStatus.completed': 'Завершена',
  'taskStatus.cancelled': 'Отменена',
  'taskStatus.underReview': 'На рассмотрении',
  'taskStatus.openTooltip': 'Задача открыта для заявок специалистов',
  'taskStatus.inProgressTooltip': 'Специалист работает над этой задачей',
  'taskStatus.pendingProfessionalTooltip': 'Ожидание подтверждения завершения от специалиста',
  'taskStatus.pendingCustomerTooltip': 'Ожидание подтверждения завершения от клиента',
  'taskStatus.completedTooltip': 'Обе стороны подтвердили завершение задачи',
  'taskStatus.cancelledTooltip': 'Задача была отменена',
  'taskStatus.disputedTooltip': 'Возникли разногласия, требуется разрешение',

  // Task Completion Actions
  'taskCompletion.markCompleted': 'Отметить как завершённую',
  'taskCompletion.confirmCompletion': 'Подтвердить завершение',
  'taskCompletion.rejectCompletion': 'Отклонить завершение',
  'taskCompletion.alreadyMarkedByYou': 'Вы уже отметили как завершённую',
  'taskCompletion.alreadyConfirmedByYou': 'Вы уже подтвердили завершение',

  // Mark Completed Dialog (Professional)
  'taskCompletion.markDialog.title': 'Отметить задачу как завершённую',
  'taskCompletion.markDialog.task': 'Задача',
  'taskCompletion.markDialog.customer': 'Клиент',
  'taskCompletion.markDialog.payment': 'Оплата',
  'taskCompletion.markDialog.question': 'Вы закончили всю работу?',
  'taskCompletion.markDialog.checkRequirements': 'Все требования выполнены',
  'taskCompletion.markDialog.checkSatisfied': 'Клиент удовлетворён результатом',
  'taskCompletion.markDialog.photos': 'Загрузить фотографии завершения (необязательно)',
  'taskCompletion.markDialog.addPhotos': 'Добавить фотографии',
  'taskCompletion.markDialog.notes': 'Дополнительные заметки',
  'taskCompletion.markDialog.notesPlaceholder': 'Любые заключительные заметки о выполненной работе...',

  // Confirm Completion Dialog (Customer)
  'taskCompletion.confirmDialog.title': 'Подтвердить завершение задачи',
  'taskCompletion.confirmDialog.professional': 'Специалист',
  'taskCompletion.confirmDialog.task': 'Задача',
  'taskCompletion.confirmDialog.question': 'Вы удовлетворены выполненной работой?',
  'taskCompletion.confirmDialog.yes': 'Да, я удовлетворён',
  'taskCompletion.confirmDialog.no': 'Нет, у меня есть замечания',
  'taskCompletion.confirmDialog.greatMessage': 'Отлично! Спасибо за подтверждение.',
  'taskCompletion.confirmDialog.reviewReminder': 'Вы сможете оставить отзыв после подтверждения.',

  // Rejection Flow
  'taskCompletion.reject.title': 'Пожалуйста, объясните проблему',
  'taskCompletion.reject.reason': 'Почему вы отклоняете?',
  'taskCompletion.reject.notCompleted': 'Работа не завершена',
  'taskCompletion.reject.poorQuality': 'Плохое качество',
  'taskCompletion.reject.differentScope': 'Отличается от согласованного объема',
  'taskCompletion.reject.other': 'Другие проблемы',
  'taskCompletion.reject.explain': 'Опишите проблему',
  'taskCompletion.reject.explainPlaceholder': 'Пожалуйста, укажите детали того, что нужно исправить...',
  'taskCompletion.reject.warning': 'Задача вернётся к статусу "В процессе". Вы можете обсудить это со специалистом и он сможет переделать.',
  'taskCompletion.reject.disclaimer': 'Эта задача вернётся к статусу "В процессе" и может снова стать видимой для других специалистов, если работа не может быть завершена с текущим специалистом.',
  'taskCompletion.reject.button': 'Отклонить',

  // Pending Confirmation Banner
  'taskCompletion.pending.waitingCustomer': 'Ожидание подтверждения клиента',
  'taskCompletion.pending.waitingProfessional': 'Ожидание подтверждения специалиста',
  'taskCompletion.pending.professionalMarkedComplete': 'Специалист отметил задачу как завершённую',
  'taskCompletion.pending.customerMarkedComplete': 'Клиент отметил задачу как завершённую',
  'taskCompletion.pending.markedComplete': 'отметил эту задачу как завершённую.',
  'taskCompletion.pending.youMarked': 'Вы отметили эту задачу как завершённую.',
  'taskCompletion.pending.waitingFor': 'Ожидание',
  'taskCompletion.pending.toConfirm': 'для подтверждения.',

  // Success View
  'taskCompletion.success.title': 'Задача завершена!',
  'taskCompletion.success.message': 'Отличная работа! Обе стороны подтвердили завершение задачи.',
  'taskCompletion.success.nextSteps': 'Следующие шаги',
  'taskCompletion.success.step1': 'Оставить отзыв',
  'taskCompletion.success.step1Description': 'Поделитесь своим опытом работы с {{name}}',
  'taskCompletion.success.step2': 'Задача будет архивирована через 30 дней',
  'taskCompletion.success.step2Description': 'Задача будет автоматически архивирована',
  'taskCompletion.success.leaveReview': 'Оставить отзыв',
  'taskCompletion.success.viewDetails': 'Просмотреть детали задачи',

  // Timeline
  'taskCompletion.timeline.title': 'Прогресс задачи',
  'taskCompletion.timeline.started': 'Начата',
  'taskCompletion.timeline.proMarked': 'Специалист отметил как завершённую',
  'taskCompletion.timeline.customerConfirmed': 'Клиент подтвердил',
  'taskCompletion.timeline.completed': 'Завершена',
  'taskCompletion.timeline.pending': 'В ожидании',
  'taskCompletion.timeline.totalDuration': 'Общая продолжительность',
};
