/**
 * Get the correct plural form for Russian numbers
 *
 * Russian plural rules:
 * - 1: singular (год)
 * - 2-4: few (года)
 * - 5+: many (лет)
 * - Exception: 11-14 always use "many" form
 */
export function getRussianPluralForm(count: number, one: string, few: string, many: string): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Special case for 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many;
  }

  // 1, 21, 31, etc.
  if (lastDigit === 1) {
    return one;
  }

  // 2-4, 22-24, 32-34, etc.
  if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  }

  // 5-20, 25-30, etc.
  return many;
}

/**
 * Format years with proper pluralization for Russian
 * Falls back to simple translation for other languages
 */
export function formatYearsExperience(
  years: number,
  language: string,
  t: (key: string, fallback?: string) => string
): string {
  if (language === 'ru') {
    const form = getRussianPluralForm(
      years,
      'год', // 1 year
      'года', // 2-4 years
      'лет'   // 5+ years
    );
    return `${years} ${form}`;
  }

  // For BG and EN, use the translation key
  return `${years} ${t('professionalDetail.stats.yearsExperienceLabel', 'years')}`;
}

/**
 * Format tasks with proper pluralization for Russian
 */
export function formatTasksCompleted(
  tasks: number,
  language: string,
  t: (key: string, fallback?: string) => string
): string {
  if (language === 'ru') {
    const form = getRussianPluralForm(
      tasks,
      'задача', // 1 task
      'задачи', // 2-4 tasks
      'задач'   // 5+ tasks
    );
    return `${tasks} ${form}`;
  }

  // For BG and EN, use the translation key
  return `${tasks} ${t('professionalDetail.stats.tasksLabel', 'tasks')}`;
}
