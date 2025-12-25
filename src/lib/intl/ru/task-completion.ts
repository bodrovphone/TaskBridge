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
  'taskCompletion.markCompleted': 'Завершить',
  'taskCompletion.confirmCompletion': 'Подтвердить завершение',
  'taskCompletion.alreadyMarkedByYou': 'Вы уже отметили как завершённую',
  'taskCompletion.alreadyConfirmedByYou': 'Вы уже подтвердили завершение',
  'taskCompletion.successMessage': 'Задача отмечена как завершённая. Ожидаем подтверждения от клиента.',
  'taskCompletion.errorMessage': 'Не удалось отметить задачу. Пожалуйста, попробуйте снова.',
  'taskCompletion.error.alreadyCompleted': 'Эта задача уже была завершена другой стороной.',
  'taskCompletion.error.invalidStatus': 'Эта задача не может быть отмечена как завершённая в её текущем статусе.',

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
  'taskCompletion.confirmDialog.confirmMessage': 'Пожалуйста, подтвердите, что работа выполнена согласно вашим ожиданиям.',

  // Toast Notifications
  'taskCompletion.confirmSuccess': 'Задача успешно завершена!',
  'taskCompletion.confirmSuccessDescription': 'Специалист уведомлён. Вы можете оставить отзыв в любое время.',
  'taskCompletion.confirmError': 'Ошибка подтверждения',

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
  'taskCompletion.success.message': 'Отличная работа! Задача отмечена как завершённая.',
  'taskCompletion.success.reviewPrompt': 'Поделитесь опытом и помогите другим найти отличных специалистов.',
  'taskCompletion.success.leaveReviewTitle': 'Оставьте отзыв о',
  'taskCompletion.success.leaveReviewHint': 'Ваш отзыв помогает сообществу',
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
