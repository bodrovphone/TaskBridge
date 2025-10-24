// Review system translations
export const reviews = {
  // Review Dialog
  'review.dialog.title': 'Оставить отзыв',
  'review.dialog.subtitle': 'Поделитесь своим опытом с {{professionalName}}',
  'review.dialog.taskLabel': 'Задача',
  'review.dialog.completedLabel': 'Выполнено',
  'review.dialog.ratingLabel': 'Оценка',
  'review.dialog.ratingRequired': 'Пожалуйста, выберите оценку',
  'review.dialog.reviewTextLabel': 'Ваш отзыв',
  'review.dialog.reviewTextPlaceholder': 'Расскажите о вашем опыте...',
  'review.dialog.minCharacters': 'Рекомендуется минимум {{min}} символов',
  'review.dialog.charCount': '{{count}} / {{max}} символов',
  'review.dialog.actualPriceLabel': 'Итоговая цена',
  'review.dialog.actualPricePlaceholder': '0.00',
  'review.dialog.submitButton': 'Отправить отзыв',
  'review.dialog.cancelButton': 'Отмена',
  'review.dialog.submitting': 'Отправка...',

  // Pending Reviews List
  'reviews.pending.title': '{{count}} задача требует вашего отзыва',
  'reviews.pending.title_plural': '{{count}} задач требуют вашего отзыва',
  'reviews.pending.completedDaysAgo': 'Выполнено {{count}} день назад',
  'reviews.pending.completedDaysAgo_plural': 'Выполнено {{count}} дней назад',
  'reviews.pending.completedWeeksAgo': 'Выполнено {{count}} неделю назад',
  'reviews.pending.completedWeeksAgo_plural': 'Выполнено {{count}} недель назад',
  'reviews.pending.completedMonthsAgo': 'Выполнено {{count}} месяц назад',
  'reviews.pending.completedMonthsAgo_plural': 'Выполнено {{count}} месяцев назад',
  'reviews.pending.leaveReviewButton': 'Оставить отзыв',
  'reviews.pending.empty': 'Нет ожидающих отзывов',
  'reviews.pending.emptyMessage': 'Вы всё сделали! Все ваши выполненные задачи получили отзывы.',

  // Enforcement Dialog - Hard Block
  'reviews.enforcement.hardBlock.title': 'Требуется действие',
  'reviews.enforcement.hardBlock.message': 'Специалист отметил вашу задачу как выполненную и ждёт вашего подтверждения. Пожалуйста, подтвердите или отклоните выполнение перед созданием новой задачи.',
  'reviews.enforcement.hardBlock.confirmButton': 'Проверить и подтвердить',
  'reviews.enforcement.hardBlock.viewButton': 'Просмотр деталей',

  // Enforcement Dialog - Soft Block
  'reviews.enforcement.softBlock.title': 'Требуются отзывы',
  'reviews.enforcement.softBlock.message': 'Вы создали {{count}} задач без отзывов на предыдущие работы.',
  'reviews.enforcement.softBlock.pleaseReview': 'Пожалуйста, оставьте отзывы на выполненные задачи перед созданием новых:',
  'reviews.enforcement.softBlock.leaveReviewsButton': 'Оставить отзывы',
  'reviews.enforcement.softBlock.cancelButton': 'Отмена',

  // Progress
  'reviews.progress.reviewing': 'Отзыв {{current}} из {{total}}',
  'reviews.progress.allDone': 'Все отзывы отправлены!',
  'reviews.progress.multipleReviews': '{{count}} задач требуют вашего отзыва. Вы оставите отзывы по одному.',

  // Success/Error Toasts
  'reviews.success': 'Отзыв успешно отправлен!',
  'reviews.successWithRemaining': 'Отзыв отправлен! Осталось ещё {{remaining}}.',
  'reviews.error': 'Не удалось отправить отзыв. Пожалуйста, попробуйте снова.',
};
