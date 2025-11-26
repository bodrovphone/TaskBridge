/**
 * Translation Validation Script
 *
 * Validates that all language translations have the same keys as English (reference).
 * Run this script to ensure translation consistency across all languages.
 *
 * Usage: npx tsx src/lib/intl/validate-translations.ts
 */

import en from './en';
import bg from './bg';
import ru from './ru';
import ua from './ua';

type TranslationObject = Record<string, string>;

function getAllKeys(obj: TranslationObject): string[] {
  return Object.keys(obj).sort();
}

function findMissingKeys(reference: string[], target: string[]): string[] {
  return reference.filter((key) => !target.includes(key));
}

function findExtraKeys(reference: string[], target: string[]): string[] {
  return target.filter((key) => !reference.includes(key));
}

function validateTranslations() {
  console.log('🔍 Validating translation consistency...\n');

  const enKeys = getAllKeys(en);
  const bgKeys = getAllKeys(bg);
  const ruKeys = getAllKeys(ru);
  const uaKeys = getAllKeys(ua);

  console.log(`📊 Translation Key Counts:`);
  console.log(`   English (EN):   ${enKeys.length} keys`);
  console.log(`   Bulgarian (BG): ${bgKeys.length} keys`);
  console.log(`   Russian (RU):   ${ruKeys.length} keys`);
  console.log(`   Ukrainian (UA): ${uaKeys.length} keys\n`);

  let hasErrors = false;

  // Validate Bulgarian
  console.log('🇧🇬 Validating Bulgarian translations...');
  const bgMissing = findMissingKeys(enKeys, bgKeys);
  const bgExtra = findExtraKeys(enKeys, bgKeys);

  if (bgMissing.length > 0) {
    hasErrors = true;
    console.error(`   ❌ Missing ${bgMissing.length} keys in Bulgarian:`);
    bgMissing.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (bgMissing.length > 10) {
      console.error(`      ... and ${bgMissing.length - 10} more`);
    }
  }

  if (bgExtra.length > 0) {
    hasErrors = true;
    console.error(`   ⚠️  Extra ${bgExtra.length} keys in Bulgarian (not in English):`);
    bgExtra.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (bgExtra.length > 10) {
      console.error(`      ... and ${bgExtra.length - 10} more`);
    }
  }

  if (bgMissing.length === 0 && bgExtra.length === 0) {
    console.log(`   ✅ Bulgarian translations are consistent with English\n`);
  } else {
    console.log('');
  }

  // Validate Russian
  console.log('🇷🇺 Validating Russian translations...');
  const ruMissing = findMissingKeys(enKeys, ruKeys);
  const ruExtra = findExtraKeys(enKeys, ruKeys);

  if (ruMissing.length > 0) {
    hasErrors = true;
    console.error(`   ❌ Missing ${ruMissing.length} keys in Russian:`);
    ruMissing.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (ruMissing.length > 10) {
      console.error(`      ... and ${ruMissing.length - 10} more`);
    }
  }

  if (ruExtra.length > 0) {
    hasErrors = true;
    console.error(`   ⚠️  Extra ${ruExtra.length} keys in Russian (not in English):`);
    ruExtra.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (ruExtra.length > 10) {
      console.error(`      ... and ${ruExtra.length - 10} more`);
    }
  }

  if (ruMissing.length === 0 && ruExtra.length === 0) {
    console.log(`   ✅ Russian translations are consistent with English\n`);
  } else {
    console.log('');
  }

  // Validate Ukrainian
  console.log('🇺🇦 Validating Ukrainian translations...');
  const uaMissing = findMissingKeys(enKeys, uaKeys);
  const uaExtra = findExtraKeys(enKeys, uaKeys);

  if (uaMissing.length > 0) {
    hasErrors = true;
    console.error(`   ❌ Missing ${uaMissing.length} keys in Ukrainian:`);
    uaMissing.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (uaMissing.length > 10) {
      console.error(`      ... and ${uaMissing.length - 10} more`);
    }
  }

  if (uaExtra.length > 0) {
    hasErrors = true;
    console.error(`   ⚠️  Extra ${uaExtra.length} keys in Ukrainian (not in English):`);
    uaExtra.slice(0, 10).forEach((key) => console.error(`      - ${key}`));
    if (uaExtra.length > 10) {
      console.error(`      ... and ${uaExtra.length - 10} more`);
    }
  }

  if (uaMissing.length === 0 && uaExtra.length === 0) {
    console.log(`   ✅ Ukrainian translations are consistent with English\n`);
  } else {
    console.log('');
  }

  // Summary
  if (hasErrors) {
    console.error('❌ Translation validation failed! Please fix the issues above.\n');
    process.exit(1);
  } else {
    console.log('✅ All translations are consistent! No missing or extra keys.\n');
    process.exit(0);
  }
}

// Run validation
validateTranslations();
