/**
 * Bulgarian Cyrillic to Latin transliteration
 * Based on the official Bulgarian transliteration system (Streamlined System)
 * Used to generate consistent URL-safe slugs regardless of input language
 */

const CYRILLIC_TO_LATIN: Record<string, string> = {
  // Uppercase
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F',
  'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y',
  'Ю': 'Yu', 'Я': 'Ya',
  // Lowercase
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
  'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y',
  'ю': 'yu', 'я': 'ya',
  // Russian additions (for Ukrainian/Russian city names)
  'Ы': 'Y', 'ы': 'y', 'Э': 'E', 'э': 'e', 'Ё': 'Yo', 'ё': 'yo',
  // Ukrainian additions
  'І': 'I', 'і': 'i', 'Ї': 'Yi', 'ї': 'yi', 'Є': 'Ye', 'є': 'ye',
  'Ґ': 'G', 'ґ': 'g',
}

/**
 * Transliterate Cyrillic text to Latin characters
 */
export function transliterate(text: string): string {
  return text
    .split('')
    .map(char => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
}

/**
 * Generate a URL-safe slug from any text (handles Cyrillic, diacritics, etc.)
 * Always produces consistent Latin-based slugs regardless of input language
 *
 * Examples:
 * - "Бургас" → "burgas"
 * - "Варна" → "varna"
 * - "Стара Загора" → "stara-zagora"
 * - "Sunny Beach" → "sunny-beach"
 * - "Слънчев бряг" → "slanchev-bryag"
 */
export function generateCitySlug(name: string): string {
  return transliterate(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '')         // Remove leading/trailing hyphens
}
