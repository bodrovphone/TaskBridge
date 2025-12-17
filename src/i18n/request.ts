import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type NestedMessages = { [key: string]: string | NestedMessages };

/**
 * Convert flat dot-notation keys to nested objects
 * e.g., { 'landing.hero.title': 'Hello' } -> { landing: { hero: { title: 'Hello' } } }
 */
function unflattenMessages(messages: Record<string, unknown>): NestedMessages {
  const result: NestedMessages = {};

  for (const [key, value] of Object.entries(messages)) {
    // Skip if value is not a string (might be nested already)
    if (typeof value !== 'string') {
      if (typeof value === 'object' && value !== null) {
        // Recursively unflatten nested objects
        result[key] = unflattenMessages(value as Record<string, unknown>);
      }
      continue;
    }

    const parts = key.split('.');
    let current: NestedMessages = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] === 'string') {
        current[part] = {};
      }
      current = current[part] as NestedMessages;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * next-intl request configuration
 * Loads translations for each request based on the locale
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request (set by middleware)
  let locale = await requestLocale;

  // Validate locale, fallback to default if invalid
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  // Load messages for the locale
  // Using dynamic import to load from existing TypeScript translation files
  const flatMessages = (await import(`@/lib/intl/${locale}/index`)).default;

  // Convert flat dot-notation keys to nested objects for next-intl
  const messages = unflattenMessages(flatMessages);

  return {
    locale,
    messages,
  };
});
