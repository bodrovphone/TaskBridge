/**
 * Profanity Filter Service
 *
 * Provides profanity detection and filtering for user-generated content.
 * Supports Bulgarian, Russian, Ukrainian, and English languages with Cyrillic script support.
 *
 * Uses glin-profanity for English and Russian (built-in) with custom word lists
 * for Bulgarian and Ukrainian.
 */

import * as glinProfanity from 'glin-profanity';
import { BULGARIAN_PROFANITY, UKRAINIAN_PROFANITY } from './profanity-wordlists';

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  detectedWords: string[];
  cleanedText: string;
  language: string;
}

/**
 * Language mapping for profanity detection
 * Maps locale codes to glin-profanity language strings
 */
const LANGUAGE_MAP: Record<string, string[]> = {
  en: ['en'],           // English (built-in)
  bg: ['bg', 'en'],     // Bulgarian (custom) + English fallback
  ru: ['ru', 'en'],     // Russian (built-in) + English fallback
  uk: ['uk', 'ru', 'en'], // Ukrainian (custom) + Russian + English fallback
};

// Cache for custom word list matching
let customWordListCache: { bg: RegExp[], uk: RegExp[] } | null = null;

/**
 * Initialize custom word list patterns
 */
function getCustomWordListPatterns(): { bg: RegExp[], uk: RegExp[] } {
  if (!customWordListCache) {
    customWordListCache = {
      bg: BULGARIAN_PROFANITY.map(word => new RegExp(word, 'gi')),
      uk: UKRAINIAN_PROFANITY.map(word => new RegExp(word, 'gi'))
    };
  }
  return customWordListCache;
}

/**
 * Check text against custom word list
 */
function checkCustomWordList(text: string, locale: string): { found: boolean, matches: string[] } {
  const patterns = getCustomWordListPatterns();
  const localePatterns = locale === 'bg' ? patterns.bg : locale === 'uk' ? patterns.uk : [];

  const matches: string[] = [];

  for (const pattern of localePatterns) {
    const match = text.match(pattern);
    if (match) {
      matches.push(...match);
    }
  }

  return {
    found: matches.length > 0,
    matches
  };
}

/**
 * Check text for profanity in the specified language
 *
 * @param text - Text to check for profanity
 * @param locale - Language locale (en, bg, ru, uk)
 * @returns Profanity check result with severity and detected words
 *
 * @example
 * ```typescript
 * const result = await checkTextForProfanity('Some text here', 'en');
 * if (result.hasProfanity) {
 *   console.log('Detected profanity:', result.detectedWords);
 *   console.log('Severity:', result.severity);
 * }
 * ```
 */
export function checkTextForProfanity(
  text: string,
  locale: string = 'en'
): ProfanityCheckResult {
  if (!text || text.trim().length === 0) {
    return {
      hasProfanity: false,
      severity: 'none',
      detectedWords: [],
      cleanedText: text,
      language: locale,
    };
  }

  try {
    let hasProfanity = false;
    let detectedWords: string[] = [];
    let cleanedText = text;

    // Check for custom Bulgarian or Ukrainian profanity first
    if (locale === 'bg' || locale === 'uk') {
      const customCheck = checkCustomWordList(text, locale);
      if (customCheck.found) {
        hasProfanity = true;
        detectedWords = customCheck.matches;

        // Censor detected words
        cleanedText = text;
        for (const word of detectedWords) {
          const censored = '*'.repeat(word.length);
          cleanedText = cleanedText.replace(new RegExp(word, 'gi'), censored);
        }
      }
    }

    // Check with glin-profanity for English and Russian
    if (locale === 'en' || locale === 'ru' || (!hasProfanity && (locale === 'bg' || locale === 'uk'))) {
      try {
        // Use glin-profanity check function
        const glinCheck = (glinProfanity as any).check(text, locale === 'ru' ? 'ru' : 'en');

        if (glinCheck && glinCheck.isProfane) {
          hasProfanity = true;
          cleanedText = glinCheck.censored || cleanedText;

          // Extract censored words if available
          if (glinCheck.matches) {
            detectedWords.push(...glinCheck.matches);
          }
        }
      } catch (glinError) {
        // If glin-profanity fails, continue with custom check results
        console.warn('glin-profanity check failed:', glinError);
      }
    }

    // Determine severity based on number and type of profane words
    let severity: ProfanityCheckResult['severity'] = 'none';

    if (hasProfanity) {
      // Count censored sections in cleaned text to estimate severity
      const censoredCount = (cleanedText.match(/\*{2,}/g) || []).length;
      const detectedWordsCount = detectedWords.length;

      if (censoredCount >= 3 || detectedWordsCount >= 3) {
        severity = 'severe';
      } else if (censoredCount >= 2 || detectedWordsCount >= 2) {
        severity = 'moderate';
      } else {
        severity = 'mild';
      }
    }

    return {
      hasProfanity,
      severity,
      detectedWords,
      cleanedText,
      language: locale,
    };
  } catch (error) {
    console.error('Profanity check error:', error);

    // Fail open (allow content) if profanity check fails
    return {
      hasProfanity: false,
      severity: 'none',
      detectedWords: [],
      cleanedText: text,
      language: locale,
    };
  }
}

/**
 * Validate text for profanity and return error if found
 * Helper function for form validation
 *
 * @param text - Text to validate
 * @param locale - Language locale
 * @param allowMild - Whether to allow mild profanity (default: false)
 * @returns Validation result with error message if profanity detected
 *
 * @example
 * ```typescript
 * const validation = validateProfanity(formData.title, 'en');
 * if (!validation.valid) {
 *   setError(validation.error);
 * }
 * ```
 */
export function validateProfanity(
  text: string,
  locale: string = 'en',
  allowMild: boolean = false
): { valid: boolean; error?: string; severity?: ProfanityCheckResult['severity'] } {
  const result = checkTextForProfanity(text, locale);

  // Check if profanity was detected
  if (result.hasProfanity) {
    // Allow mild profanity if specified
    if (allowMild && result.severity === 'mild') {
      return { valid: true };
    }

    // Block moderate and severe profanity
    return {
      valid: false,
      error: 'validation.profanityDetected',
      severity: result.severity,
    };
  }

  return { valid: true };
}

/**
 * Batch check multiple texts for profanity
 * Useful for checking multiple form fields at once
 *
 * @param texts - Array of texts to check
 * @param locale - Language locale
 * @returns Array of profanity check results
 *
 * @example
 * ```typescript
 * const results = batchCheckProfanity([
 *   formData.title,
 *   formData.description
 * ], 'en');
 *
 * const hasProfanity = results.some(r => r.hasProfanity);
 * ```
 */
export function batchCheckProfanity(
  texts: string[],
  locale: string = 'en'
): ProfanityCheckResult[] {
  return texts.map(text => checkTextForProfanity(text, locale));
}

/**
 * Clean text by replacing profanity with asterisks
 *
 * @param text - Text to clean
 * @param locale - Language locale
 * @returns Cleaned text with profanity censored
 *
 * @example
 * ```typescript
 * const cleaned = cleanProfanity('Some bad text here', 'en');
 * console.log(cleaned); // "Some *** text here"
 * ```
 */
export function cleanProfanity(text: string, locale: string = 'en'): string {
  const result = checkTextForProfanity(text, locale);
  return result.cleanedText;
}
