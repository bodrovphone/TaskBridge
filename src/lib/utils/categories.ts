/**
 * Category utility functions
 */

/**
 * Converts kebab-case to camelCase
 * @example kebabToCamel('baking-desserts') // 'bakingDesserts'
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Normalizes category keys to include 'categories.' or 'categories.sub.' prefix
 * Handles both database format (kebab-case) and translation format (camelCase with prefix)
 *
 * @param categoryKey - Category key from database or mock data
 * @returns Normalized category key with proper prefix and camelCase format
 *
 * @example
 * normalizeCategoryKey('plumbing') // 'categories.sub.plumber' (subcategory)
 * normalizeCategoryKey('baking-desserts') // 'categories.sub.bakingDesserts' (subcategory)
 * normalizeCategoryKey('categories.plumbing') // 'categories.plumbing' (already normalized)
 */
export function normalizeCategoryKey(categoryKey: string): string {
  if (!categoryKey) return '';

  // Already normalized
  if (categoryKey.startsWith('categories.')) {
    return categoryKey;
  }

  // Convert kebab-case to camelCase
  const camelCase = kebabToCamel(categoryKey);

  // All user service_categories are subcategories, so use 'categories.sub.' prefix
  return `categories.sub.${camelCase}`;
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
