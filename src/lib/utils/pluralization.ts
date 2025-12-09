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

/**
 * Format response time with proper pluralization for all languages
 *
 * @param hours - Response time in hours (can be null/undefined)
 * @param language - Current language code (en, bg, ru)
 * @param t - Translation function
 * @returns Formatted response time string
 */
export function formatResponseTime(
  hours: number | null | undefined,
  language: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  // Default to 2 hours if not specified
  const effectiveHours = hours ?? 2;

  if (effectiveHours < 1) {
    // Less than 1 hour - show in minutes
    const minutes = Math.round(effectiveHours * 60);
    return t('profile.statistics.responseTime.minutes', { minutes });
  }

  if (effectiveHours === 1) {
    return t('profile.statistics.responseTime.hour');
  }

  // For Russian, use proper pluralization
  if (language === 'ru') {
    const form = getRussianPluralForm(
      effectiveHours,
      'час',   // 1 hour
      'часа',  // 2-4 hours
      'часов'  // 5+ hours
    );
    return `${effectiveHours} ${form}`;
  }

  // For Bulgarian, use proper pluralization
  if (language === 'bg') {
    const form = effectiveHours === 1 ? 'час' : 'часа';
    return `${effectiveHours} ${form}`;
  }

  // For English and others, use translation with interpolation
  return t('profile.statistics.responseTime.hours', { hours: effectiveHours });
}
