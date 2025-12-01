/**
 * Process Category Feedback Script
 *
 * Analyzes feedback from users who manually selected categories when keyword matching failed.
 * Updates the category-keywords.ts file with top 10 most common missing keywords.
 *
 * Usage: npx tsx scripts/process-category-feedback.ts [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be updated without making changes
 *
 * Run monthly to improve category search accuracy.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to keywords file
const KEYWORDS_FILE = resolve(__dirname, '../src/features/categories/lib/category-keywords.ts');

interface FeedbackRecord {
  id: string;
  title: string;
  matched_subcategory: string;
  language: string;
  created_at: string;
}

interface GroupedFeedback {
  subcategory: string;
  language: 'en' | 'bg' | 'ru';
  titles: string[];
  count: number;
}

/**
 * Extract keywords from a title
 * Splits title into meaningful words, filters out common stop words
 */
function extractKeywords(title: string, language: string): string[] {
  const stopWords: Record<string, Set<string>> = {
    en: new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'please', 'help', 'want', 'looking']),
    bg: new Set(['а', 'и', 'в', 'на', 'за', 'от', 'с', 'по', 'е', 'са', 'се', 'да', 'не', 'като', 'или', 'но', 'ако', 'това', 'този', 'тази', 'тези', 'който', 'която', 'което', 'които', 'ми', 'ме', 'моя', 'ни', 'наш', 'ваш', 'техен', 'при', 'през', 'след', 'преди', 'между', 'под', 'над', 'до', 'без', 'към', 'още', 'вече', 'само', 'много', 'малко', 'някой', 'нещо', 'всичко', 'тук', 'там', 'когато', 'къде', 'защо', 'как', 'искам', 'търся', 'моля']),
    ru: new Set(['а', 'и', 'в', 'на', 'за', 'от', 'с', 'по', 'к', 'у', 'из', 'о', 'об', 'до', 'без', 'для', 'под', 'над', 'при', 'про', 'через', 'между', 'перед', 'после', 'что', 'как', 'где', 'когда', 'почему', 'кто', 'который', 'это', 'этот', 'эта', 'эти', 'тот', 'та', 'те', 'он', 'она', 'оно', 'они', 'мы', 'вы', 'я', 'ты', 'мне', 'меня', 'мой', 'моя', 'наш', 'ваш', 'их', 'его', 'её', 'не', 'да', 'но', 'или', 'если', 'же', 'ли', 'бы', 'был', 'была', 'было', 'были', 'быть', 'есть', 'нет', 'все', 'всё', 'уже', 'ещё', 'только', 'очень', 'можно', 'нужно', 'надо', 'хочу', 'ищу', 'пожалуйста']),
  };

  const lang = language.substring(0, 2) as 'en' | 'bg' | 'ru';
  const stops = stopWords[lang] || stopWords.en;

  // Split into words, lowercase, filter
  const words = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ') // Keep letters, numbers, spaces, hyphens
    .split(/\s+/)
    .filter(word => word.length > 2 && !stops.has(word));

  // Also extract 2-word phrases
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }

  return [...words, ...phrases];
}

/**
 * Read current keywords from file
 */
function readCurrentKeywords(): Record<string, { en: string[]; bg: string[]; ru: string[] }> {
  const content = readFileSync(KEYWORDS_FILE, 'utf-8');

  // Extract the CATEGORY_KEYWORDS object
  const match = content.match(/export const CATEGORY_KEYWORDS: CategoryKeywords = ({[\s\S]*?});?\s*\/\*\*/);
  if (!match) {
    throw new Error('Could not parse CATEGORY_KEYWORDS from file');
  }

  // This is a simplified parser - works for our specific format
  const result: Record<string, { en: string[]; bg: string[]; ru: string[] }> = {};

  // Match each subcategory block
  const subcatRegex = /'([^']+)':\s*{\s*en:\s*\[([^\]]*)\],\s*bg:\s*\[([^\]]*)\],\s*ru:\s*\[([^\]]*)\],?\s*}/g;
  let subcatMatch;

  while ((subcatMatch = subcatRegex.exec(content)) !== null) {
    const slug = subcatMatch[1];
    const parseArray = (str: string) =>
      str.match(/'([^']+)'/g)?.map(s => s.slice(1, -1)) || [];

    result[slug] = {
      en: parseArray(subcatMatch[2]),
      bg: parseArray(subcatMatch[3]),
      ru: parseArray(subcatMatch[4]),
    };
  }

  return result;
}

/**
 * Update keywords file with new keywords
 */
function updateKeywordsFile(
  currentKeywords: Record<string, { en: string[]; bg: string[]; ru: string[] }>,
  updates: Map<string, { language: 'en' | 'bg' | 'ru'; newKeywords: string[] }>
) {
  let content = readFileSync(KEYWORDS_FILE, 'utf-8');

  for (const [subcategory, update] of updates) {
    const { language, newKeywords } = update;
    const current = currentKeywords[subcategory];

    if (!current) {
      console.warn(`  ⚠️ Subcategory '${subcategory}' not found in keywords file, skipping`);
      continue;
    }

    // Filter out keywords that already exist
    const existingSet = new Set(current[language].map(k => k.toLowerCase()));
    const uniqueNew = newKeywords.filter(k => !existingSet.has(k.toLowerCase()));

    if (uniqueNew.length === 0) {
      console.log(`  ℹ️ No new keywords for ${subcategory} (${language}) - all already exist`);
      continue;
    }

    // Build the new array
    const updatedArray = [...current[language], ...uniqueNew];
    const newArrayStr = updatedArray.map(k => `'${k}'`).join(', ');

    // Find and replace the specific language array for this subcategory
    // Pattern: 'subcategory': {\n    en: [...],\n    bg: [...],\n    ru: [...],
    const pattern = new RegExp(
      `('${subcategory}':\\s*{[^}]*${language}:\\s*)\\[[^\\]]*\\]`,
      'g'
    );

    const newContent = content.replace(pattern, `$1[${newArrayStr}]`);

    if (newContent === content) {
      console.warn(`  ⚠️ Could not update ${subcategory} (${language}) - pattern not found`);
    } else {
      content = newContent;
      console.log(`  ✅ Added ${uniqueNew.length} keywords to ${subcategory} (${language}): ${uniqueNew.join(', ')}`);
    }
  }

  if (!DRY_RUN) {
    writeFileSync(KEYWORDS_FILE, content, 'utf-8');
  }

  return content;
}

async function main() {
  console.log('');
  console.log('📊 Processing Category Feedback');
  console.log('================================');
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - no changes will be made\n');
  }
  console.log('');

  // 1. Fetch feedback records
  console.log('1️⃣ Fetching feedback records...');
  const { data: feedback, error } = await supabase
    .from('category_suggestions_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching feedback:', error.message);
    process.exit(1);
  }

  if (!feedback || feedback.length === 0) {
    console.log('   ℹ️ No feedback records found. Nothing to process.');
    console.log('');
    process.exit(0);
  }

  console.log(`   Found ${feedback.length} feedback records\n`);

  // 2. Group by subcategory + language
  console.log('2️⃣ Grouping feedback by subcategory and language...');
  const grouped = new Map<string, GroupedFeedback>();

  for (const record of feedback as FeedbackRecord[]) {
    const lang = record.language.substring(0, 2) as 'en' | 'bg' | 'ru';
    if (!['en', 'bg', 'ru'].includes(lang)) continue;

    const key = `${record.matched_subcategory}:${lang}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.titles.push(record.title);
      existing.count++;
    } else {
      grouped.set(key, {
        subcategory: record.matched_subcategory,
        language: lang,
        titles: [record.title],
        count: 1,
      });
    }
  }

  // Sort by count and take top 10
  const sortedGroups = Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  console.log(`   Found ${grouped.size} unique subcategory+language combinations`);
  console.log(`   Processing top ${sortedGroups.length}:\n`);

  for (const group of sortedGroups) {
    console.log(`   • ${group.subcategory} (${group.language}): ${group.count} records`);
  }
  console.log('');

  // 3. Extract keywords from titles
  console.log('3️⃣ Extracting keywords from titles...');
  const currentKeywords = readCurrentKeywords();

  const updates = new Map<string, { language: 'en' | 'bg' | 'ru'; newKeywords: string[] }>();

  for (const group of sortedGroups) {
    // Extract keywords from all titles in this group
    const keywordCounts = new Map<string, number>();

    for (const title of group.titles) {
      const keywords = extractKeywords(title, group.language);
      for (const keyword of keywords) {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      }
    }

    // Sort by frequency, take top keywords that appear in at least 2 titles (or all if fewer)
    const minOccurrences = group.titles.length > 3 ? 2 : 1;
    const topKeywords = Array.from(keywordCounts.entries())
      .filter(([_, count]) => count >= minOccurrences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Max 5 new keywords per subcategory
      .map(([keyword, _]) => keyword);

    if (topKeywords.length > 0) {
      updates.set(group.subcategory, {
        language: group.language,
        newKeywords: topKeywords,
      });
    }
  }

  console.log(`   Identified ${updates.size} subcategories to update\n`);

  // 4. Update keywords file
  console.log('4️⃣ Updating category-keywords.ts...');
  if (updates.size > 0) {
    updateKeywordsFile(currentKeywords, updates);
    if (DRY_RUN) {
      console.log('   (DRY RUN - file not modified)\n');
    } else {
      console.log('   File updated successfully\n');
    }
  } else {
    console.log('   No updates needed\n');
  }

  // 5. Clear feedback table
  console.log('5️⃣ Clearing feedback table...');
  if (DRY_RUN) {
    console.log(`   Would delete ${feedback.length} records (DRY RUN)\n`);
  } else {
    const { error: deleteError } = await supabase
      .from('category_suggestions_feedback')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (workaround for no .deleteAll())

    if (deleteError) {
      console.error('   ❌ Error clearing table:', deleteError.message);
    } else {
      console.log(`   ✅ Deleted ${feedback.length} records\n`);
    }
  }

  // Summary
  console.log('================================');
  console.log('✅ Processing complete!');
  console.log('');
  console.log('Summary:');
  console.log(`   • Processed: ${feedback.length} feedback records`);
  console.log(`   • Updated: ${updates.size} subcategories`);
  console.log(`   • Table cleared: ${DRY_RUN ? 'No (dry run)' : 'Yes'}`);
  console.log('');
}

main().catch(console.error);
