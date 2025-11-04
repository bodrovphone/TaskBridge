/**
 * Category utility functions
 */

/**
 * Normalizes category keys to include 'categories.' prefix
 * Handles both database format (without prefix) and mock data (with prefix)
 *
 * @param categoryKey - Category key from database or mock data
 * @returns Normalized category key with 'categories.' prefix
 *
 * @example
 * normalizeCategoryKey('plumbing') // 'categories.plumbing'
 * normalizeCategoryKey('categories.plumbing') // 'categories.plumbing'
 */
export function normalizeCategoryKey(categoryKey: string): string {
  if (!categoryKey) return '';
  return categoryKey.startsWith('categories.')
    ? categoryKey
    : `categories.${categoryKey}`;
}

/**
 * Normalizes an array of category keys
 *
 * @param categories - Array of category keys
 * @returns Array of normalized category keys with 'categories.' prefix
 */
export function normalizeCategoryKeys(categories: string[] | null | undefined): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map(normalizeCategoryKey);
}
