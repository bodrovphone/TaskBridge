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
  // Tier 1: Severe profanity
  'путка',
  'пичка',
  'курва',
  'курви',
  'мръсник',
  'педал',
  'педали',
  'копеле',
  'копелета',
  'шибан',
  'шибаняк',
  'майната',
  'майна',
  'простак',
  'простачина',
  'боклук',
  'боклуци',
  'задник',
  'гъз',
  'гъзове',
  'дупе',
  'дупета',
  'смотан',
  'тъпак',
  'тъпанар',
  'идиот',
  'идиотина',
  'кретен',
  'дебил',
  'дебили',
  'глупак',
  'глупачо',
  'магаре',
  'магарета',
  'луд',
  'луда',
  'луди',
  'ебавам',
  'ебаване',
  'ебал',
  'ебеш',
  'еби',
  'ебач',
  'дърт',
  'драсна',
  'хуй',
  'хуйня',
  'путкаво',
  'мокър',
  'лайно',
  'лайна',
  'гадина',
  'гад',
  'гадове',
  'скот',
  'скотина',
  'скотове',
  'свиня',
  'свине',
  'куче',
  'кучка',
  'кучки',
  'мръсен',
  'мръсна',
  'мръсни',
  'говно',
  'говна',
  'пърдя',
  'пърдене',
  'пръдня',
  'шкембе',
  'шкембета',
  'долен',
  'долна',
  'долни',
  'отвратен',
  'отвратна',
  'отвратни',
  'гнусен',
  'гнусна',
  'гнусни',
  'проклет',
  'проклета',
  'проклети',
  'дявол',
  'дяволи',
  'демон',
  'демони',
  'зъл',
  'зла',
  'зли',
  'мръсотия',
  'мръсотии',
  'боклук',
  'боклуци',

  // Tier 2: Moderate profanity (insults)
  'глупост',
  'глупости',
  'безобразие',
  'безобразия',
  'скандал',
  'скандали',
  'срам',
  'срамота',
  'позор',
  'позори',

  // Tier 3: Mild (borderline offensive)
  'манияк',
  'маниак',
  'психопат',
  'луди',

  // Common obfuscation variations (leetspeak, symbols)
  'pu4ka',
  'kurva',
  'pi4ka',
  'guz',
  'dupe',
  'hui',
  'la1no',
  'govn0',

  // @todo ENHANCEMENT: Native speaker review needed for:
  // 1. Regional variations (Sofia vs Burgas vs Varna)
  // 2. Slang and modern internet language
  // 3. Context-dependent words that may not always be offensive
  // 4. False positive filtering (legitimate words with profane substrings)
];

/**
 * Ukrainian Profanity List
 *
 * Common Ukrainian profane words and phrases in Cyrillic script.
 * Source: washyourmouthoutwithsoap + cross-reference with Russian
 */
export const UKRAINIAN_PROFANITY: string[] = [
  // Tier 1: Severe profanity
  'хуй',
  'хуя',
  'хуї',
  'хуйло',
  'пизда',
  'піда',
  'пиздець',
  'їбати',
  'їбав',
  'їбаний',
  'бляд',
  'блядь',
  'блять',
  'сука',
  'суки',
  'гівно',
  'гавно',
  'лайно',
  'лайна',
  'срака',
  'сраки',
  'жопа',
  'жопи',
  'мудак',
  'мудаки',
  'мудила',
  'дебіл',
  'дебіли',
  'ідіот',
  'ідіоти',
  'кретин',
  'кретини',
  'тупий',
  'тупа',
  'тупі',
  'дурень',
  'дурня',
  'дурні',
  'гандон',
  'гандони',
  'падла',
  'падли',
  'сволоч',
  'сволочі',
  'засранець',
  'покидьок',
  'виродок',
  'виродки',
  'сучка',
  'сучки',
  'курва',
  'курви',
  'шльондра',
  'шльондри',
  'повія',
  'повії',
  'блядюга',
  'розпусник',
  'розпусники',
  'мудько',
  'хрін',
  'фігня',
  'дупа',
  'дупи',
  'пердун',
  'пердуни',
  'довбоїб',
  'мозкоїб',
  'ублюдок',
  'ублюдки',
  'виблядок',
  'їбанько',
  'похуїст',
  'нахуй',
  'нахер',
  'пішов',
  'пішла',
  'відпиздень',

  // Tier 2: Moderate profanity (insults)
  'скотина',
  'скотиняка',
  'свиня',
  'свині',
  'бидло',
  'бидла',
  'тварюка',
  'мерзота',
  'мерзотник',
  'підарас',
  'підараси',
  'покидьок',
  'недоумок',
  'недоумки',
  'дурило',
  'придурок',
  'придурки',

  // Tier 3: Mild (borderline offensive)
  'чорт',
  'чорти',
  'біс',
  'біси',
  'халепа',
  'лихо',

  // Common obfuscation variations
  'xuj',
  'xуй',
  'pizda',
  'pіzda',
  'bl@d',
  'blyad',
  'su4ka',
  'mudak',
  'g0vno',
  'zhopa',

  // Russian variants commonly used in Ukraine
  'хер',
  'херня',
  'чмо',
  'чмошник',
  'долбоёб',
  'уёбок',
  'пидор',
  'пидораc',

  // @todo ENHANCEMENT: Native speaker review needed for:
  // 1. Regional dialects (Eastern vs Western Ukraine)
  // 2. Modern slang and internet language
  // 3. Russian-Ukrainian mixed language (surzhyk)
  // 4. Context-dependent words
  // 5. Political/sensitive terms that may not be offensive in all contexts
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
 * Used to categorize profanity by severity
 *
 * @param word - Detected profane word
 * @param language - Language code (bg, uk, ru, en)
 * @returns Severity level (mild, moderate, severe)
 */
export function getProfanitySeverity(
  word: string,
  language: string
): 'mild' | 'moderate' | 'severe' {
  // Normalize word for comparison
  const normalized = word.toLowerCase().trim();

  // Severe words (explicit sexual/violent content)
  const severePatterns = [
    'хуй', 'пизда', 'їбати', 'курва', 'ебал', 'ебавам', 'путка', 'пичка'
  ];

  // Moderate words (strong insults)
  const moderatePatterns = [
    'мудак', 'дебил', 'идиот', 'педал', 'сука', 'гівно', 'говно', 'лайно'
  ];

  // Check severity
  if (severePatterns.some(pattern => normalized.includes(pattern))) {
    return 'severe';
  }

  if (moderatePatterns.some(pattern => normalized.includes(pattern))) {
    return 'moderate';
  }

  // Default to mild
  return 'mild';
}
