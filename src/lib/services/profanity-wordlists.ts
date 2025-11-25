/**
 * Profanity Word Lists
 *
 * Custom word lists for Bulgarian and Ukrainian profanity detection.
 * These supplement the built-in English and Russian lists in glin-profanity.
 *
 * Sources:
 * - Bulgarian: https://github.com/Behiwzad/swearify (135 words)
 * - Ukrainian: https://github.com/thisandagain/washyourmouthoutwithsoap
 * - Additional: https://github.com/dsojevic/profanity-list
 *
 * NOTE: These lists should be reviewed and validated by native speakers
 * to ensure accuracy and appropriate severity classification.
 */

/**
 * Bulgarian Profanity List
 *
 * Common Bulgarian profane words and phrases in Cyrillic script.
 * Source: swearify + community validation
 */
export const BULGARIAN_PROFANITY: string[] = [
  // Severe profanity only - explicit sexual terms and serious slurs
  'путка',
  'пичка',
  'курва',
  'курви',
  'педал',
  'педали',
  'копеле',
  'копелета',
  'шибан',
  'шибаняк',
  'майната',
  'майна',
  'гъз',
  'гъзове',
  'дупе',
  'дупета',
  'ебавам',
  'ебаване',
  'ебал',
  'ебеш',
  'еби',
  'ебач',
  'хуй',
  'хуйня',
  'путкаво',
  'лайно',
  'лайна',
  'кучка',
  'кучки',
  'говно',
  'говна',

  // Obfuscation variations for severe words only
  'pu4ka',
  'kurva',
  'pi4ka',
  'guz',
  'dupe',
  'hui',
];

/**
 * Russian Profanity List
 *
 * Common Russian profane words and phrases in Cyrillic script (мат).
 * Sources:
 * - rominf/profanity-filter
 * - nickname76/russian-swears
 * - denexapp/russian-bad-words
 * - Common Russian mat vocabulary
 */
export const RUSSIAN_PROFANITY: string[] = [
  // Severe profanity only (основной мат - core mat)
  // These are explicit sexual terms that should always be blocked
  'хуй',
  'хуя',
  'хуе',
  'хуем',
  'хую',
  'хуи',
  'хуёв',
  'хуйня',
  'хуйло',
  'хуёво',
  'хуёвый',
  'пизда',
  'пизде',
  'пизду',
  'пиздой',
  'пизды',
  'пиздец',
  'пиздеть',
  'пиздёж',
  'пиздато',
  'пиздюк',
  'ебать',
  'ебал',
  'ебала',
  'ебали',
  'ебало',
  'ебаный',
  'ебанный',
  'ёб',
  'ёбаный',
  'ёбнутый',
  'выебать',
  'наебать',
  'уебок',
  'уёбище',
  'бля',
  'блядь',
  'блядина',
  'блять',

  // Strong slurs
  'сука',
  'сучка',
  'мудак',
  'мудаки',
  'мудила',
  'педик',
  'пидор',
  'пидорас',
  'пидарас',
  'гандон',
  'долбоёб',

  // Body-related severe
  'жопа',
  'залупа',
  'говно',
  'говна',

  // Phrases
  'ёб твою мать',
];

/**
 * Ukrainian Profanity List
 *
 * Common Ukrainian profane words and phrases in Cyrillic script.
 * Source: washyourmouthoutwithsoap + cross-reference with Russian
 */
export const UKRAINIAN_PROFANITY: string[] = [
  // Severe profanity only - explicit sexual terms
  'хуй',
  'хуя',
  'хуї',
  'хуйло',
  'пизда',
  'пиздець',
  'їбати',
  'їбав',
  'їбаний',
  'бляд',
  'блядь',
  'блять',
  'сука',
  'сучка',
  'гівно',
  'гавно',
  'жопа',
  'жопи',
  'мудак',
  'мудаки',
  'мудила',
  'гандон',
  'гандони',
  'курва',
  'курви',
  'довбоїб',
  'нахуй',

  // Strong slurs
  'педик',
  'пидор',
  'підарас',

  // Obfuscation variations for severe words
  'xuj',
  'pizda',
  'blyad',
];

/**
 * Common Cyrillic obfuscation patterns
 *
 * Maps Cyrillic characters to their common leetspeak/obfuscation variants.
 * Used to detect profanity that uses numbers or Latin characters to bypass filters.
 *
 * Example: "хуй" → "xuj", "хuj", "xu1"
 */
export const CYRILLIC_OBFUSCATION_MAP: Record<string, string[]> = {
  'а': ['a', '@', '4'],
  'б': ['b', '6'],
  'в': ['v', 'w'],
  'г': ['g', 'r'],
  'д': ['d'],
  'е': ['e', '3', 'ё'],
  'ж': ['zh', 'j'],
  'з': ['z', '3'],
  'и': ['i', '1', 'u'],
  'й': ['j', 'i'],
  'к': ['k'],
  'л': ['l', '1'],
  'м': ['m'],
  'н': ['n', 'h'],
  'о': ['o', '0'],
  'п': ['p'],
  'р': ['r', 'p'],
  'с': ['s', 'c', '5', '$'],
  'т': ['t'],
  'у': ['u', 'y'],
  'ф': ['f', 'ph'],
  'х': ['x', 'h', 'kh'],
  'ц': ['c', 'ts'],
  'ч': ['ch', '4'],
  'ш': ['sh'],
  'щ': ['sch', 'shch'],
  'ъ': [''],
  'ы': ['y', 'i'],
  'ь': [''],
  'э': ['e', '3'],
  'ю': ['yu', 'ju', 'u'],
  'я': ['ya', 'ja', 'ia'],

  // Ukrainian-specific
  'є': ['ye', 'ie', 'e'],
  'і': ['i', '1'],
  'ї': ['yi', 'i'],
  'ґ': ['g'],
};

/**
 * Whitelist of legitimate words that might match profanity patterns
 * These should NOT be flagged as profane
 *
 * Example: "Scunthorpe problem" - legitimate place names with bad substrings
 */
export const PROFANITY_WHITELIST: string[] = [
  // Bulgarian legitimate words
  'република', // "republic" contains "пуб" (pub)
  'кооперация', // "cooperation" contains "пера"

  // Ukrainian legitimate words
  'публіка', // "public" contains suspicious substring
  'копіювання', // "copying"

  // Add more legitimate words that trigger false positives
  // @todo ENHANCEMENT: Build comprehensive whitelist through testing
];

/**
 * Get severity level for a detected profane word
 * Since we now only track severe profanity, this returns 'severe' for all matches
 *
 * @param word - Detected profane word
 * @param _language - Language code (unused, kept for API compatibility)
 * @returns Severity level - always 'severe' since we only track explicit profanity
 */
export function getProfanitySeverity(
  word: string,
  _language: string
): 'mild' | 'moderate' | 'severe' {
  // Since we've removed mild/moderate words from the lists,
  // any match is now considered severe (explicit profanity)
  if (word && word.trim().length > 0) {
    return 'severe';
  }
  return 'mild';
}
