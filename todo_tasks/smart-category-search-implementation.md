# Smart Category Search Implementation - 3 Phase Plan

## Overview

Implement intelligent category search with keyword matching, multilingual support, and AI-powered suggestions to improve task discovery and user experience across all locales (EN/BG/RU).

**Current Problem**: Users searching for "install home lock" or "fix laptop" get no results because the system only does exact substring matching on translated category labels.

**Solution**: Three-phase approach from basic keyword matching to AI-powered semantic search with learning capabilities.

---

## Phase 1: Current Implementation Analysis

### Category & Subcategory Structure

**Total**: 26 main categories + 135 subcategories

**Storage**: Locale-independent slugs (e.g., `plumber`, `electrician`, `house-cleaning`)

**Translations**: Full i18next support in `/src/lib/intl/[lang]/categories.ts`
- English: 245 translation keys
- Bulgarian: 245 translation keys
- Russian: 245 translation keys

**Database Schema**:
```sql
tasks (
  category TEXT NOT NULL,      -- Main category slug (e.g., 'handyman')
  subcategory TEXT,            -- Subcategory slug (e.g., 'plumber')
  -- pgvector extension enabled for future semantic search
)
```

### Current Search Implementation

#### 1. Create Task Form (`/src/app/[lang]/create-task/components/category-selection.tsx`)

**Search Logic** (lines 54-71):
```typescript
const filteredSubcategories = useMemo(() => {
  if (!searchQuery.trim()) return subcategories

  return subcategories.filter(cat =>
    t(cat.translationKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )
}, [searchQuery, subcategories, t])
```

**Features**:
- Real-time search across all 135 subcategories
- Simple substring matching on translated label OR slug
- Results limited to 12 items
- Visual category cards with icons/colors

#### 2. Browse Tasks Page (`/src/features/browse-tasks/components/sections/search-filters-section.tsx`)

**Search Logic** (via `searchCategories()` helper in `/src/features/categories/lib/helpers.ts`):
```typescript
export const searchCategories = (query: string, t: TFunction): CategoryOption[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const subcategories = getAllSubcategoriesWithLabels(t);

  return subcategories
    .filter(cat =>
      cat.label.toLowerCase().includes(lowerQuery) ||
      cat.slug.toLowerCase().includes(lowerQuery)
    )
    .map(cat => ({
      value: cat.slug,
      label: cat.label,
      mainCategoryId: cat.mainCategoryId,
    }));
};
```

**Features**:
- Autocomplete suggestions dropdown
- Popular category chips (8 most common)
- Animated typing placeholder
- Sections for categories + cities

#### 3. Backend Filtering (`/src/app/api/tasks/route.ts`)

**Query Parameters**:
- `category` - Filters by subcategory slug
- `subcategory` - Also filters by subcategory slug
- **Exact match only** - `.eq('subcategory', subcategorySlug)`

### Current Limitations

**What Doesn't Work**:

1. **No Keyword Matching**
   - ❌ "fix laptop" → should match `computer-help`
   - ❌ "install lock" → should match `locksmith`
   - ❌ "dog walker" → should match `dog-care`

2. **No Multilingual Synonyms**
   - ❌ "сантехник" (Russian) won't find "plumber" when browsing Bulgarian tasks
   - ❌ "починка" (repair) won't match "ремонт" categories
   - ❌ Cross-locale search fails entirely

3. **No Typo Tolerance**
   - ❌ "pumber" won't match "plumber"
   - ❌ "електричар" (Bulgarian typo) won't match "електротехник"

4. **No Semantic Understanding**
   - ❌ "water leak" won't match "plumber"
   - ❌ "broken window" won't match "glazier"
   - ❌ "yard work" won't match "gardening"

5. **No Search Analytics**
   - No tracking of what users search for
   - No learning from failed searches
   - No insights into missing categories

### Key Components (Existing)

**Category Utilities** (`/src/features/categories/lib/`):
- `main-categories.ts` - 26 main categories with metadata
- `subcategories.ts` - 135 subcategories with parent mapping
- `helpers.ts` - Utility functions including `searchCategories()`
- `types.ts` - TypeScript interfaces

**Database Extensions**:
- ✅ pgvector extension enabled (for future semantic search)
- ❌ Not currently used for category matching

---

## Phase 2: Keyword-Based Smart Search

### Goal
Add multilingual keyword arrays to each subcategory for better matching without AI dependency.

### Implementation Plan

#### Step 1: Create Keyword Data Structure

**New File**: `/src/features/categories/lib/category-keywords.ts`

```typescript
export interface CategoryKeywords {
  subcategorySlug: string;
  mainCategorySlug: string;
  keywords: {
    en: string[];
    bg: string[];
    ru: string[];
  };
}

export const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  {
    subcategorySlug: 'plumber',
    mainCategorySlug: 'handyman',
    keywords: {
      en: [
        'plumber', 'plumbing', 'pipe', 'pipes', 'leak', 'leaking', 'water',
        'drain', 'drainage', 'clog', 'clogged', 'faucet', 'tap', 'sink',
        'toilet', 'bathroom', 'shower', 'bathtub', 'water heater', 'boiler'
      ],
      bg: [
        'водопроводчик', 'водопровод', 'тръба', 'тръби', 'теч', 'тече', 'вода',
        'канал', 'канализация', 'запушване', 'запушен', 'чешма', 'мивка',
        'тоалетна', 'баня', 'душ', 'вана', 'бойлер', 'котел'
      ],
      ru: [
        'сантехник', 'сантехника', 'труба', 'трубы', 'утечка', 'течет', 'вода',
        'слив', 'канализация', 'засор', 'засорился', 'кран', 'раковина',
        'туалет', 'ванная', 'душ', 'ванна', 'водонагреватель', 'котел'
      ]
    }
  },
  {
    subcategorySlug: 'electrician',
    mainCategorySlug: 'handyman',
    keywords: {
      en: [
        'electrician', 'electrical', 'electric', 'electricity', 'power',
        'wire', 'wiring', 'socket', 'outlet', 'plug', 'switch', 'light',
        'lighting', 'lamp', 'fixture', 'breaker', 'fuse', 'panel', 'circuit'
      ],
      bg: [
        'електротехник', 'електричество', 'електрически', 'ток', 'захранване',
        'кабел', 'окабеляване', 'контакт', 'щепсел', 'ключ', 'светлина',
        'осветление', 'лампа', 'осветително тяло', 'предпазител', 'табло'
      ],
      ru: [
        'электрик', 'электричество', 'электрический', 'ток', 'питание',
        'провод', 'проводка', 'розетка', 'вилка', 'выключатель', 'свет',
        'освещение', 'лампа', 'светильник', 'предохранитель', 'щиток'
      ]
    }
  },
  // ... 133 more subcategories
];
```

**Keyword Generation Strategy**:
- **Base terms**: Direct translations of subcategory name
- **Related tools**: Equipment/materials used (e.g., "ladder", "drill")
- **Common problems**: What users search when they need this service (e.g., "leak", "broken")
- **Action verbs**: What the service does (e.g., "install", "repair", "fix")
- **Locations**: Where service is performed (e.g., "bathroom", "kitchen")
- **Synonyms**: Alternative ways to describe same service
- **Common misspellings**: Frequent typos in each language

**Target**: 10-20 keywords per language per subcategory = ~4,000 total keywords

#### Step 2: Update Search Logic

**Modify**: `/src/features/categories/lib/helpers.ts`

```typescript
import { CATEGORY_KEYWORDS } from './category-keywords';

export const searchCategories = (
  query: string,
  t: TFunction,
  locale: string = 'en'
): CategoryOption[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const allSubcategories = getAllSubcategoriesWithLabels(t);
  const results = new Map<string, { score: number; category: CategoryOption }>();

  // Exact label/slug match (highest priority - score 100)
  allSubcategories.forEach(cat => {
    const label = cat.label.toLowerCase();
    const slug = cat.slug.toLowerCase();

    if (label === lowerQuery || slug === lowerQuery) {
      results.set(cat.slug, { score: 100, category: cat });
    } else if (label.includes(lowerQuery) || slug.includes(lowerQuery)) {
      // Substring match (high priority - score 75)
      results.set(cat.slug, { score: 75, category: cat });
    }
  });

  // Keyword matching (medium priority - score 50)
  CATEGORY_KEYWORDS.forEach(keywordData => {
    const keywords = keywordData.keywords[locale as 'en' | 'bg' | 'ru'] || [];
    const matchingKeyword = keywords.find(kw =>
      kw.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(kw.toLowerCase())
    );

    if (matchingKeyword && !results.has(keywordData.subcategorySlug)) {
      const category = allSubcategories.find(c => c.slug === keywordData.subcategorySlug);
      if (category) {
        results.set(keywordData.subcategorySlug, { score: 50, category });
      }
    }
  });

  // Sort by score (descending), then alphabetically
  return Array.from(results.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.category.label.localeCompare(b.category.label);
    })
    .map(r => r.category);
};
```

**Improvements**:
- ✅ Score-based ranking (exact > substring > keyword)
- ✅ Locale-aware keyword matching
- ✅ Deduplication (same category won't appear twice)
- ✅ Maintains existing behavior for exact matches

#### Step 3: Update Category Selection Component

**Modify**: `/src/app/[lang]/create-task/components/category-selection.tsx`

```typescript
import { useRouter } from 'next/navigation';
import { searchCategories } from '@/features/categories/lib/helpers';

// Inside component
const { i18n } = useTranslation();
const currentLocale = i18n.language;

const filteredSubcategories = useMemo(() => {
  if (!searchQuery.trim()) return subcategories;

  // Use enhanced search with keyword matching
  const results = searchCategories(searchQuery, t, currentLocale);

  // Convert CategoryOption[] to SubcategoryWithLabel[]
  return subcategories.filter(cat =>
    results.some(r => r.value === cat.slug)
  );
}, [searchQuery, subcategories, t, currentLocale]);
```

#### Step 4: Update Browse Tasks Search

**Modify**: `/src/features/browse-tasks/components/sections/search-filters-section.tsx`

```typescript
const { i18n } = useTranslation();

const filteredCategories = useMemo(() => {
  if (searchQuery.trim()) {
    // Use enhanced search with keyword matching
    return searchCategories(searchQuery, t, i18n.language);
  }
  return [];
}, [searchQuery, t, i18n.language]);
```

**No changes needed** - already uses `searchCategories()` helper.

#### Step 5: Generate Keywords for All 135 Subcategories

**Priority Order**:
1. **High Priority** (30 subcategories) - Popular services
   - `house-cleaning`, `plumber`, `electrician`, `locksmith`, `computer-help`
   - `furniture-assembly`, `dog-walking`, `language-tutoring`, `web-developer`
   - `apartment-renovation`, `painter`, `carpenter`, `gardening`

2. **Medium Priority** (50 subcategories) - Common services
   - All remaining handyman categories
   - Beauty & health services
   - Cleaning variations
   - Tutoring subjects

3. **Low Priority** (55 subcategories) - Specialized services
   - Niche professional services
   - Rare repair types
   - Specialized contractors

**Keyword Research Sources**:
- Existing task descriptions in database
- Google Translate for cross-locale validation
- Bulgarian/Russian service directories (e.g., OLX, Bazar.bg)
- Common search queries in analytics (if available)
- Native speaker consultation for Bulgarian/Russian

**Quality Assurance**:
- ✅ Minimum 10 keywords per language per subcategory
- ✅ No duplicate keywords across similar categories
- ✅ Validated translations by native speakers
- ✅ Include common misspellings (e.g., "електричар" → "електротехник")

#### Step 6: Add Keyword Management Tools

**New File**: `/scripts/validate-keywords.ts`

```typescript
import { CATEGORY_KEYWORDS } from '../src/features/categories/lib/category-keywords';
import { SUBCATEGORIES } from '../src/features/categories/lib/subcategories';

// Validation checks:
// 1. All subcategories have keywords
// 2. Minimum 10 keywords per language
// 3. No duplicate keywords within same category
// 4. No empty arrays
// 5. All referenced slugs exist in SUBCATEGORIES

function validateKeywords() {
  const errors: string[] = [];
  const warnings: string[] = [];

  const coveredSlugs = new Set(CATEGORY_KEYWORDS.map(k => k.subcategorySlug));
  const allSlugs = SUBCATEGORIES.map(s => s.slug);

  // Check coverage
  allSlugs.forEach(slug => {
    if (!coveredSlugs.has(slug)) {
      errors.push(`Missing keywords for subcategory: ${slug}`);
    }
  });

  // Check keyword quality
  CATEGORY_KEYWORDS.forEach(kw => {
    ['en', 'bg', 'ru'].forEach(lang => {
      const keywords = kw.keywords[lang as 'en' | 'bg' | 'ru'];

      if (!keywords || keywords.length === 0) {
        errors.push(`${kw.subcategorySlug}: No ${lang} keywords`);
      } else if (keywords.length < 10) {
        warnings.push(`${kw.subcategorySlug}: Only ${keywords.length} ${lang} keywords (recommended: 10+)`);
      }

      // Check for duplicates
      const uniqueKeywords = new Set(keywords.map(k => k.toLowerCase()));
      if (uniqueKeywords.size !== keywords.length) {
        warnings.push(`${kw.subcategorySlug}: Duplicate keywords in ${lang}`);
      }
    });
  });

  console.log(`✅ Validated ${CATEGORY_KEYWORDS.length} keyword sets`);
  console.log(`⚠️  ${warnings.length} warnings`);
  console.log(`❌ ${errors.length} errors`);

  if (errors.length > 0) {
    console.error('\nErrors:', errors);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\nWarnings:', warnings);
  }
}

validateKeywords();
```

**Usage**:
```bash
npx tsx scripts/validate-keywords.ts
```

#### Step 7: Testing Strategy

**Test Cases**:
1. **Exact Match** - "plumber" → finds "Plumber" category
2. **Keyword Match** - "fix leak" → finds "Plumber" category
3. **Multilingual** - "сантехник" → finds "Plumber" when locale is 'ru'
4. **Cross-Locale** - "plumber" → finds category even in Bulgarian/Russian UI
5. **Multiple Matches** - "repair" → finds all repair-related categories, ranked
6. **Typo Tolerance** - Common misspellings included in keywords
7. **Empty Query** - Returns empty array (no change)
8. **No Matches** - Returns empty array gracefully

**Performance Testing**:
- Benchmark search with 135 subcategories × 15 keywords avg = ~2,000 keywords
- Target: < 50ms search latency
- Optimize with memoization if needed

### Deliverables (Phase 2)

- [ ] `/src/features/categories/lib/category-keywords.ts` - Complete keyword data for all 135 subcategories
- [ ] Enhanced `searchCategories()` function with keyword matching and scoring
- [ ] Updated category-selection and browse-tasks components
- [ ] `/scripts/validate-keywords.ts` - Keyword validation script
- [ ] Unit tests for keyword search in `/tests/categories/search.test.ts`
- [ ] Documentation in `CLAUDE.md` for keyword management
- [ ] Performance benchmarks and optimization if needed

### Estimated Effort

- **Keyword Research & Translation**: 20-30 hours (can be partially automated)
- **Implementation**: 8-12 hours
- **Testing & QA**: 4-6 hours
- **Total**: ~35-50 hours

---

## Phase 3: AI-Powered Category Matching with Learning

### Goal
Use AI (OpenAI GPT-4 or Claude API) to intelligently match user queries to categories, cache results, and learn from misses to expand keyword database.

### Architecture Overview

```
User Query → AI Matching → [Cache Hit? → Return Cached]
                         → [Cache Miss → AI API → Cache Result → Return]
                         → [No Match? → Log for Analysis → Suggest "Other"]
```

### Implementation Plan

#### Step 1: Choose AI Provider

**Options**:

1. **OpenAI GPT-4o-mini** (Recommended)
   - Cost: $0.15/1M input tokens, $0.60/1M output tokens
   - Speed: ~500ms average latency
   - Quality: Excellent for Bulgarian/Russian understanding
   - API: Simple JSON mode for structured responses

2. **Anthropic Claude 3.5 Haiku**
   - Cost: $0.25/1M input tokens, $1.25/1M output tokens
   - Speed: ~400ms average latency
   - Quality: Best-in-class for nuanced language understanding
   - API: Tool calling for structured outputs

3. **Together AI (Llama 3.1 70B)**
   - Cost: $0.88/1M tokens (input + output combined)
   - Speed: ~300ms average latency
   - Quality: Good for Bulgarian, needs testing for Russian
   - API: OpenAI-compatible

**Recommendation**: Start with **OpenAI GPT-4o-mini** for best cost/quality balance, with fallback to keyword search if API is down.

#### Step 2: Database Schema for AI Cache

**New Table**: `category_search_cache`

```sql
CREATE TABLE category_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_locale TEXT NOT NULL CHECK (query_locale IN ('en', 'bg', 'ru')),
  matched_subcategory TEXT REFERENCES subcategories(slug),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  match_source TEXT CHECK (match_source IN ('exact', 'keyword', 'ai', 'none')),
  ai_reasoning TEXT,                    -- Why AI chose this match
  usage_count INTEGER DEFAULT 1,        -- How many times this cache hit was used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite unique index for fast lookup
  CONSTRAINT unique_query_locale UNIQUE (query_text, query_locale)
);

-- Index for cache lookup performance
CREATE INDEX idx_category_search_cache_lookup
ON category_search_cache (query_text, query_locale, matched_subcategory);

-- Index for analytics queries
CREATE INDEX idx_category_search_cache_usage
ON category_search_cache (usage_count DESC, last_used_at DESC);
```

**New Table**: `unmatched_searches`

```sql
CREATE TABLE unmatched_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_locale TEXT NOT NULL,
  search_context JSONB,                 -- Additional context (user location, previous searches)
  occurrence_count INTEGER DEFAULT 1,   -- How many times users searched this
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,       -- Whether we added a category/keyword for this
  resolved_action TEXT,                 -- What action was taken (added_keyword, new_category, etc.)

  CONSTRAINT unique_unmatched_query UNIQUE (query_text, query_locale)
);

-- Index for finding common unmatched searches
CREATE INDEX idx_unmatched_searches_frequency
ON unmatched_searches (occurrence_count DESC, query_locale);
```

#### Step 3: AI Matching Service

**New File**: `/src/lib/services/ai-category-matcher.ts`

```typescript
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { SUBCATEGORIES } from '@/features/categories/lib/subcategories';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MatchResult {
  subcategorySlug: string | null;
  confidence: number;
  reasoning: string;
  source: 'exact' | 'keyword' | 'ai' | 'none';
}

export async function matchCategoryWithAI(
  query: string,
  locale: string = 'en'
): Promise<MatchResult> {
  try {
    // Step 1: Check cache first
    const supabase = await createClient();
    const { data: cached } = await supabase
      .from('category_search_cache')
      .select('matched_subcategory, confidence_score, match_source, ai_reasoning')
      .eq('query_text', query.toLowerCase().trim())
      .eq('query_locale', locale)
      .single();

    if (cached) {
      // Update cache hit stats
      await supabase
        .from('category_search_cache')
        .update({
          usage_count: supabase.rpc('increment', { row_id: cached.id }),
          last_used_at: new Date().toISOString()
        })
        .eq('id', cached.id);

      return {
        subcategorySlug: cached.matched_subcategory,
        confidence: cached.confidence_score,
        reasoning: cached.ai_reasoning || 'Cached result',
        source: cached.match_source
      };
    }

    // Step 2: Call OpenAI API
    const categoryList = SUBCATEGORIES.map(cat => ({
      slug: cat.slug,
      translationKey: cat.translationKey
    }));

    const systemPrompt = `You are a category matching assistant for a Bulgarian freelance platform called Trudify.

Your task is to match user search queries to the most appropriate service subcategory from our predefined list.

Available subcategories (135 total):
${categoryList.map(c => `- ${c.slug} (${c.translationKey})`).join('\n')}

User query locale: ${locale}

Instructions:
1. Analyze the user's query and determine their service needs
2. Match to the MOST SPECIFIC subcategory that fits
3. If multiple categories could work, choose the most commonly requested one
4. Provide a confidence score from 0.0 to 1.0
5. If no good match exists (confidence < 0.3), return null
6. Explain your reasoning briefly

Respond in JSON format:
{
  "subcategorySlug": "plumber" | null,
  "confidence": 0.85,
  "reasoning": "User wants plumbing work based on 'fix leak' query"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,  // Lower temperature for more consistent results
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    // Step 3: Cache the result
    const matchResult: MatchResult = {
      subcategorySlug: result.subcategorySlug,
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'AI match',
      source: result.subcategorySlug ? 'ai' : 'none'
    };

    await supabase.from('category_search_cache').insert({
      query_text: query.toLowerCase().trim(),
      query_locale: locale,
      matched_subcategory: matchResult.subcategorySlug,
      confidence_score: matchResult.confidence,
      match_source: matchResult.source,
      ai_reasoning: matchResult.reasoning
    });

    // Step 4: Log unmatched searches for learning
    if (!matchResult.subcategorySlug || matchResult.confidence < 0.3) {
      await supabase
        .from('unmatched_searches')
        .insert({
          query_text: query.toLowerCase().trim(),
          query_locale: locale,
          search_context: { confidence: matchResult.confidence }
        })
        .onConflict(['query_text', 'query_locale'])
        .set({
          occurrence_count: supabase.rpc('increment'),
          last_searched_at: new Date().toISOString()
        });
    }

    return matchResult;

  } catch (error) {
    console.error('AI category matching error:', error);

    // Fallback to keyword search on error
    return {
      subcategorySlug: null,
      confidence: 0,
      reasoning: 'AI matching failed, fallback to keyword search',
      source: 'none'
    };
  }
}
```

#### Step 4: Hybrid Search API (Keyword + AI)

**New File**: `/src/app/api/search/categories/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchCategories } from '@/features/categories/lib/helpers';
import { matchCategoryWithAI } from '@/lib/services/ai-category-matcher';
import { getTranslation } from '@/lib/intl/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const locale = searchParams.get('locale') || 'en';
  const useAI = searchParams.get('ai') !== 'false'; // Default to true

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const t = await getTranslation(locale);

    // Step 1: Try keyword search first (fast)
    const keywordResults = searchCategories(query, t, locale);

    if (keywordResults.length > 0 && keywordResults[0].score >= 75) {
      // High-confidence keyword match, no need for AI
      return NextResponse.json({
        results: keywordResults.slice(0, 10),
        source: 'keyword',
        aiUsed: false
      });
    }

    // Step 2: Try AI matching for low-confidence or no matches
    if (useAI && (keywordResults.length === 0 || keywordResults[0].score < 50)) {
      const aiMatch = await matchCategoryWithAI(query, locale);

      if (aiMatch.subcategorySlug && aiMatch.confidence >= 0.5) {
        // AI found a good match
        const category = await getSubcategoryDetails(aiMatch.subcategorySlug, t);

        return NextResponse.json({
          results: [
            {
              ...category,
              score: Math.round(aiMatch.confidence * 100),
              aiReasoning: aiMatch.reasoning
            },
            ...keywordResults  // Include keyword results as alternatives
          ].slice(0, 10),
          source: 'ai',
          aiUsed: true,
          confidence: aiMatch.confidence
        });
      }
    }

    // Step 3: Return keyword results (even if low confidence)
    return NextResponse.json({
      results: keywordResults.slice(0, 10),
      source: keywordResults.length > 0 ? 'keyword' : 'none',
      aiUsed: useAI,
      suggestion: keywordResults.length === 0 ? 'Try different search terms or browse categories' : null
    });

  } catch (error) {
    console.error('Category search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
```

#### Step 5: Update Frontend Components

**Modify**: `/src/features/browse-tasks/components/sections/search-filters-section.tsx`

```typescript
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const [isSearching, setIsSearching] = useState(false);
const [aiSuggestions, setAiSuggestions] = useState<CategoryOption[]>([]);

// Debounced AI search (only triggers after user stops typing)
const searchWithAI = useCallback(
  debounce(async (query: string, locale: string) => {
    if (!query.trim() || query.length < 3) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search/categories?q=${encodeURIComponent(query)}&locale=${locale}&ai=true`
      );
      const data = await response.json();

      if (data.source === 'ai') {
        setAiSuggestions(data.results);
      }
    } catch (error) {
      console.error('AI search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, 800),  // 800ms debounce
  []
);

// Combine keyword + AI results
const allSuggestions = useMemo(() => {
  const keywordResults = searchCategories(searchQuery, t, i18n.language);

  // Merge and deduplicate
  const combined = [...keywordResults];
  aiSuggestions.forEach(ai => {
    if (!combined.some(k => k.value === ai.value)) {
      combined.push({ ...ai, isAiSuggestion: true });
    }
  });

  return combined.slice(0, 10);
}, [searchQuery, t, i18n.language, aiSuggestions]);

// Trigger AI search on query change
useEffect(() => {
  if (searchQuery.trim()) {
    searchWithAI(searchQuery, i18n.language);
  }
}, [searchQuery, i18n.language, searchWithAI]);
```

**UI Enhancement**: Show AI suggestions with badge
```tsx
{allSuggestions.map((suggestion) => (
  <div key={suggestion.value} className="suggestion-item">
    <span>{suggestion.label}</span>
    {suggestion.isAiSuggestion && (
      <Badge variant="secondary" size="sm">AI Match</Badge>
    )}
  </div>
))}
```

#### Step 6: Background Learning System

**New File**: `/scripts/analyze-unmatched-searches.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { CATEGORY_KEYWORDS } from '@/features/categories/lib/category-keywords';

async function analyzeUnmatchedSearches() {
  const supabase = await createClient();

  // Get top 50 most common unmatched searches
  const { data: unmatched } = await supabase
    .from('unmatched_searches')
    .select('query_text, query_locale, occurrence_count')
    .eq('resolved', false)
    .order('occurrence_count', { ascending: false })
    .limit(50);

  if (!unmatched || unmatched.length === 0) {
    console.log('✅ No unmatched searches to analyze');
    return;
  }

  console.log(`\n📊 Top ${unmatched.length} Unmatched Searches:\n`);

  unmatched.forEach((search, idx) => {
    console.log(
      `${idx + 1}. "${search.query_text}" (${search.query_locale}) - ${search.occurrence_count} searches`
    );
  });

  console.log('\n💡 Recommendations:');
  console.log('1. Review these searches for potential new categories');
  console.log('2. Add keywords to existing categories to cover these queries');
  console.log('3. Consider creating new subcategories for high-frequency searches');

  // TODO: Use AI to suggest which category each query should map to
  // TODO: Automatically generate keyword additions for category-keywords.ts
}

analyzeUnmatchedSearches();
```

**Cron Job**: Run weekly to generate keyword expansion suggestions

#### Step 7: Admin Dashboard for Learning

**New Page**: `/src/app/[lang]/admin/search-analytics/page.tsx`

**Features**:
- View top unmatched searches by frequency
- See AI matching accuracy (cache hit rate)
- Review and approve keyword additions
- Mark unmatched searches as "resolved" after action
- Export data for further analysis

**Access Control**: Restrict to admin users only

#### Step 8: Cost Optimization Strategies

**Estimated Costs** (for 10,000 searches/day):

1. **Without AI**: $0/month (keyword search only)

2. **With AI (naive)**:
   - 10,000 searches × 30 days = 300,000 AI calls/month
   - Average 500 tokens per call (system + user + response)
   - 300K × 500 = 150M tokens/month
   - Cost: ~$22.50/month (GPT-4o-mini)

3. **With AI + Cache (optimized)**:
   - Cache hit rate: 60-80% after 1 month
   - Unique queries: ~2,000-4,000/day (80% reduction)
   - 4K × 30 days = 120,000 AI calls/month
   - 120K × 500 = 60M tokens/month
   - Cost: ~$9/month (GPT-4o-mini)

**Optimization Techniques**:
- ✅ **Aggressive caching** - Cache all AI results permanently
- ✅ **Keyword-first strategy** - Only use AI if keyword search confidence < 50%
- ✅ **Debouncing** - Wait 800ms before triggering AI search
- ✅ **Minimum query length** - Only use AI for queries >= 3 characters
- ✅ **Batch processing** - Process popular searches in background to pre-populate cache
- ✅ **Rate limiting** - Max 10 AI searches per user per hour

**Cost Monitoring**:
```typescript
// Track AI usage in database
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY,
  search_query TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Deliverables (Phase 3)

- [ ] Database migrations for `category_search_cache` and `unmatched_searches` tables
- [ ] `/src/lib/services/ai-category-matcher.ts` - AI matching service with caching
- [ ] `/src/app/api/search/categories/route.ts` - Hybrid search API
- [ ] Updated frontend components with AI suggestions
- [ ] `/scripts/analyze-unmatched-searches.ts` - Learning analysis script
- [ ] Admin dashboard for search analytics at `/admin/search-analytics`
- [ ] Cost monitoring and optimization implementation
- [ ] Documentation in `CLAUDE.md` for AI search system
- [ ] A/B testing setup to measure improvement over keyword-only search

### Estimated Effort

- **AI Service Implementation**: 12-16 hours
- **Database & Caching**: 6-8 hours
- **Frontend Integration**: 8-10 hours
- **Admin Dashboard**: 10-12 hours
- **Testing & Optimization**: 8-10 hours
- **Total**: ~45-60 hours

### Success Metrics

- **Match Rate**: % of searches that return at least 1 category
  - Target: 85%+ (up from current ~40-50%)
- **AI Usage Rate**: % of searches that trigger AI vs keyword-only
  - Target: < 30% (most handled by keywords + cache)
- **Cache Hit Rate**: % of searches served from cache
  - Target: 70%+ after 1 month
- **User Engagement**: Click-through rate on search results
  - Target: 60%+ (up from current ~30-40%)
- **Cost Efficiency**: Average cost per search
  - Target: < $0.0003 ($9/month for 30K searches)

---

## Implementation Timeline

### Phase 2: Keyword-Based Search (4-6 weeks)
- **Week 1-2**: Data structure setup + high-priority keywords (30 categories)
- **Week 3**: Search logic implementation + frontend integration
- **Week 4**: Medium-priority keywords (50 categories)
- **Week 5**: Low-priority keywords (55 categories) + validation
- **Week 6**: Testing, QA, and documentation

### Phase 3: AI-Powered Search (6-8 weeks)
- **Week 1**: Database schema + AI service setup
- **Week 2-3**: Hybrid search API + frontend integration
- **Week 4**: Caching optimization + cost monitoring
- **Week 5-6**: Admin dashboard + learning system
- **Week 7**: Testing, A/B testing setup
- **Week 8**: Performance optimization + rollout

**Total Timeline**: 10-14 weeks for complete implementation

---

## Risk Mitigation

### Technical Risks

1. **AI API Downtime**
   - Mitigation: Fallback to keyword search, implement retry logic, monitor uptime
   - Impact: Low (graceful degradation)

2. **High AI Costs**
   - Mitigation: Aggressive caching, rate limiting, cost alerts at $20/month threshold
   - Impact: Medium (budget overruns)

3. **Poor AI Match Quality**
   - Mitigation: Confidence threshold (0.5+), human review of cache, A/B testing
   - Impact: Medium (user frustration)

4. **Database Performance**
   - Mitigation: Proper indexing, cache table partitioning, query optimization
   - Impact: Low (scalable design)

### Product Risks

1. **Users Prefer Browse Over Search**
   - Mitigation: Track usage metrics, optimize both experiences
   - Impact: Low (feature is additive)

2. **Translation Quality Issues**
   - Mitigation: Native speaker review of keywords, user feedback loop
   - Impact: Medium (affects core UX)

3. **Category Confusion**
   - Mitigation: Clear category descriptions, AI reasoning display, "Did you mean?" suggestions
   - Impact: Low (improved over current state)

---

## Testing Strategy

### Phase 2 Testing

**Unit Tests** (`/tests/categories/keyword-search.test.ts`):
```typescript
describe('Keyword-based category search', () => {
  it('should match exact category name', () => {
    const results = searchCategories('plumber', mockT, 'en');
    expect(results[0].value).toBe('plumber');
    expect(results[0].score).toBe(100);
  });

  it('should match keyword in correct locale', () => {
    const results = searchCategories('fix leak', mockT, 'en');
    expect(results).toContainEqual(expect.objectContaining({
      value: 'plumber',
      score: 50
    }));
  });

  it('should not match keywords from different locale', () => {
    const results = searchCategories('сантехник', mockT, 'en');
    expect(results).toHaveLength(0);  // Russian keyword, English locale
  });

  it('should rank exact match higher than keyword match', () => {
    const results = searchCategories('computer', mockT, 'en');
    const exactMatch = results.find(r => r.value === 'computer-help');
    const keywordMatch = results.find(r => r.value === 'laptop-repair');
    expect(exactMatch?.score).toBeGreaterThan(keywordMatch?.score || 0);
  });
});
```

**Integration Tests**:
- Search component with keyword data
- Category selection flow with search
- Browse tasks with autocomplete

**Manual Testing Checklist**:
- [ ] Search in English, Bulgarian, Russian
- [ ] Test all 30 high-priority categories with 5+ keyword variations each
- [ ] Cross-locale search (e.g., English keywords in Bulgarian UI)
- [ ] Mobile responsiveness of search UI
- [ ] Performance with large result sets

### Phase 3 Testing

**Unit Tests** (`/tests/services/ai-matcher.test.ts`):
```typescript
describe('AI category matcher', () => {
  it('should return cached result on second call', async () => {
    const first = await matchCategoryWithAI('fix my laptop', 'en');
    const second = await matchCategoryWithAI('fix my laptop', 'en');
    expect(second.source).toBe('ai');  // Cached, but still marked as AI
  });

  it('should handle API errors gracefully', async () => {
    // Mock OpenAI API failure
    const result = await matchCategoryWithAI('test query', 'en');
    expect(result.source).toBe('none');
    expect(result.subcategorySlug).toBeNull();
  });
});
```

**A/B Testing Setup**:
- **Control Group (50%)**: Keyword search only
- **Test Group (50%)**: Keyword + AI search
- **Metrics**: Match rate, CTR, time to selection, user satisfaction
- **Duration**: 2 weeks minimum
- **Success Criteria**: 15%+ improvement in match rate with < $0.001 cost per search

**Load Testing**:
- Simulate 100 concurrent searches
- Test cache hit rate progression (0% → 70% over 1,000 unique queries)
- Verify AI API rate limits and backoff logic

---

## Rollout Plan

### Phase 2 Rollout (Keyword Search)

**Stage 1: Internal Testing (1 week)**
- Deploy to staging environment
- Test with internal team (10-20 users)
- Collect feedback on keyword quality
- Fix critical bugs

**Stage 2: Beta Users (2 weeks)**
- Enable for 10% of users (feature flag)
- Monitor search metrics and error rates
- Collect user feedback via in-app survey
- Iterate on keyword quality

**Stage 3: Full Rollout (1 week)**
- Enable for 100% of users
- Monitor performance and error rates
- Prepare hotfix process for critical issues

### Phase 3 Rollout (AI Search)

**Stage 1: Dark Launch (1 week)**
- Call AI API in background, don't show results
- Populate cache without user impact
- Verify cost and performance

**Stage 2: Shadow Mode (2 weeks)**
- A/B test: 10% get AI results, 90% keyword-only
- Compare match rates and user behavior
- Optimize confidence thresholds

**Stage 3: Gradual Rollout (4 weeks)**
- Week 1: 25% of users
- Week 2: 50% of users
- Week 3: 75% of users
- Week 4: 100% of users
- Monitor costs and match quality at each stage

**Rollback Plan**:
- Feature flag to disable AI instantly
- Fallback to keyword search on error
- Cache preserved for quick re-enable

---

## Documentation Updates

### Developer Documentation

**New File**: `/docs/features/smart-category-search.md`

Contents:
- Architecture overview with diagrams
- Keyword management guide
- AI service configuration
- Cache management and monitoring
- Cost optimization strategies
- Troubleshooting guide

### User-Facing Help

**Update**: Help center articles (if exists)
- "How to search for services"
- "Tips for finding the right professional"
- "Understanding category suggestions"

---

## Future Enhancements (Post Phase 3)

### 1. Semantic Search with pgvector

**Goal**: Use embedding-based search for true semantic understanding

**Implementation**:
- Generate embeddings for all subcategories (in all 3 languages)
- Store in pgvector column on `tasks` table
- Use cosine similarity for semantic matching
- Combine with keyword + AI for hybrid approach

**Cost**: ~$0.10/1M tokens (OpenAI text-embedding-3-small)

### 2. Personalized Search Ranking

**Goal**: Learn user preferences over time

**Features**:
- Track which categories user searches for most
- Boost frequently-used categories in search results
- Consider user's location (boost local services)
- Time-based boosting (e.g., "house cleaning" on weekends)

### 3. Natural Language Task Creation

**Goal**: "I need someone to fix my leaky faucet" → Auto-fill category, title, description

**Implementation**:
- AI parses full sentence
- Extracts: category, location, urgency, budget hints
- Pre-fills create task form
- User reviews and submits

### 4. Multi-Category Tasks

**Goal**: Support tasks that span multiple categories (e.g., "kitchen renovation" = plumber + electrician + tiling)

**Implementation**:
- Allow selecting 2-3 subcategories per task
- AI suggests additional relevant categories
- Professionals can apply based on any matching category

### 5. Voice Search

**Goal**: Hands-free task search via speech input

**Implementation**:
- Use Web Speech API for browser-based voice input
- Send transcription to AI matcher
- Show results while user speaks

---

## Success Criteria (Overall)

### Phase 2 Success Metrics

- ✅ All 135 subcategories have keyword coverage (10+ keywords/language)
- ✅ Match rate improves from ~40% to 70%+
- ✅ Search latency stays < 100ms
- ✅ Zero performance regression on browse-tasks page
- ✅ User feedback: "Much easier to find services" (survey rating 4+/5)

### Phase 3 Success Metrics

- ✅ Match rate improves from 70% to 85%+
- ✅ AI cost stays under $15/month
- ✅ Cache hit rate reaches 70%+ within 1 month
- ✅ 95% of searches return results in < 500ms
- ✅ 90%+ of AI matches are relevant (manual review of 100 samples)
- ✅ Unmatched search log identifies 5+ new category opportunities per month

### Overall Product Impact

- ✅ 30% increase in task creation completion rate
- ✅ 25% increase in professional applications per task
- ✅ 20% reduction in "Other" category usage
- ✅ Positive user feedback in App Store/Google Play reviews
- ✅ Improved SEO from better category organization

---

## Next Steps

1. **Review and Approve Plan** - Stakeholder sign-off on all 3 phases
2. **Allocate Resources** - Assign developers, designers, translators
3. **Set Up Project Board** - Create tasks in project management tool
4. **Create Feature Branch** - `feature/smart-category-search`
5. **Begin Phase 2 Implementation** - Start with data structure and high-priority keywords
6. **Weekly Check-ins** - Review progress, adjust timeline as needed

---

## Questions for Stakeholders

1. **Phase 2 vs Phase 3 Priority**: Should we complete Phase 2 fully before starting Phase 3, or run them in parallel?
2. **AI Provider**: Any preference between OpenAI, Anthropic, or Together AI?
3. **Budget**: Confirm $15-20/month budget for AI costs is acceptable
4. **Timeline**: Is 10-14 week timeline acceptable, or is there urgency to ship faster?
5. **Quality vs Speed**: Would you prefer thorough keyword research (slower) or AI-heavy approach (faster but higher cost)?

---

## Appendix A: Sample Keywords (Top 10 Categories)

### 1. Plumber (`plumber`)
```typescript
keywords: {
  en: ['plumber', 'plumbing', 'pipe', 'leak', 'water', 'drain', 'faucet', 'sink', 'toilet', 'shower', 'bathtub', 'water heater', 'boiler', 'clog', 'flooding'],
  bg: ['водопроводчик', 'водопровод', 'тръба', 'теч', 'вода', 'канал', 'чешма', 'мивка', 'тоалетна', 'душ', 'вана', 'бойлер', 'котел', 'запушване', 'наводнение'],
  ru: ['сантехник', 'сантехника', 'труба', 'утечка', 'вода', 'слив', 'кран', 'раковина', 'туалет', 'душ', 'ванна', 'водонагреватель', 'котел', 'засор', 'затопление']
}
```

### 2. Electrician (`electrician`)
```typescript
keywords: {
  en: ['electrician', 'electrical', 'wire', 'socket', 'outlet', 'switch', 'light', 'power', 'circuit', 'breaker', 'fuse', 'panel', 'installation', 'repair'],
  bg: ['електротехник', 'електричество', 'кабел', 'контакт', 'ключ', 'светлина', 'ток', 'верига', 'предпазител', 'табло', 'инсталация', 'ремонт'],
  ru: ['электрик', 'электричество', 'провод', 'розетка', 'выключатель', 'свет', 'ток', 'цепь', 'предохранитель', 'щиток', 'установка', 'ремонт']
}
```

### 3. House Cleaning (`house-cleaning`)
```typescript
keywords: {
  en: ['cleaning', 'clean', 'house', 'home', 'apartment', 'maid', 'vacuum', 'dust', 'mop', 'deep clean', 'spring cleaning', 'move-out', 'sanitize'],
  bg: ['почистване', 'чисто', 'къща', 'дом', 'апартамент', 'прислужница', 'прахосмукачка', 'прах', 'моп', 'дълбоко почистване', 'пролетно почистване', 'почистване след ремонт'],
  ru: ['уборка', 'чистка', 'дом', 'квартира', 'горничная', 'пылесос', 'пыль', 'швабра', 'генеральная уборка', 'послеремонтная уборка', 'дезинфекция']
}
```

### 4. Computer Help (`computer-help`)
```typescript
keywords: {
  en: ['computer', 'laptop', 'pc', 'fix', 'repair', 'virus', 'slow', 'broken', 'screen', 'setup', 'install', 'software', 'hardware', 'troubleshoot'],
  bg: ['компютър', 'лаптоп', 'ремонт', 'поправка', 'вирус', 'бавен', 'счупен', 'екран', 'настройка', 'инсталация', 'софтуер', 'хардуер', 'проблем'],
  ru: ['компьютер', 'ноутбук', 'ремонт', 'починка', 'вирус', 'медленный', 'сломан', 'экран', 'настройка', 'установка', 'программа', 'железо', 'проблема']
}
```

### 5. Locksmith (`locksmith`)
```typescript
keywords: {
  en: ['locksmith', 'lock', 'key', 'door', 'locked out', 'unlock', 'rekey', 'deadbolt', 'install', 'security', 'safe', 'emergency', 'broken key'],
  bg: ['ключар', 'ключ', 'брава', 'врата', 'заключен', 'отключване', 'смяна', 'инсталация', 'сигурност', 'сейф', 'спешно', 'счупен ключ'],
  ru: ['слесарь', 'замок', 'ключ', 'дверь', 'закрыт', 'открыть', 'замена', 'установка', 'безопасность', 'сейф', 'срочно', 'сломанный ключ']
}
```

---

## Appendix B: Database Migration Scripts

### Migration 1: Add Search Cache Table
```sql
-- File: /supabase/migrations/20250120_add_category_search_cache.sql

CREATE TABLE category_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_locale TEXT NOT NULL CHECK (query_locale IN ('en', 'bg', 'ru')),
  matched_subcategory TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  match_source TEXT CHECK (match_source IN ('exact', 'keyword', 'ai', 'none')),
  ai_reasoning TEXT,
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_query_locale UNIQUE (query_text, query_locale)
);

CREATE INDEX idx_category_search_cache_lookup
ON category_search_cache (query_text, query_locale, matched_subcategory);

CREATE INDEX idx_category_search_cache_usage
ON category_search_cache (usage_count DESC, last_used_at DESC);

-- Add RLS policies
ALTER TABLE category_search_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache is readable by everyone"
ON category_search_cache FOR SELECT
USING (true);

CREATE POLICY "Cache is writable by authenticated users"
ON category_search_cache FOR INSERT
TO authenticated
WITH CHECK (true);

COMMENT ON TABLE category_search_cache IS
'Caches AI and keyword search results for faster category matching';
```

### Migration 2: Add Unmatched Searches Table
```sql
-- File: /supabase/migrations/20250120_add_unmatched_searches.sql

CREATE TABLE unmatched_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_locale TEXT NOT NULL CHECK (query_locale IN ('en', 'bg', 'ru')),
  search_context JSONB,
  occurrence_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_action TEXT,

  CONSTRAINT unique_unmatched_query UNIQUE (query_text, query_locale)
);

CREATE INDEX idx_unmatched_searches_frequency
ON unmatched_searches (occurrence_count DESC, query_locale);

CREATE INDEX idx_unmatched_searches_unresolved
ON unmatched_searches (resolved, occurrence_count DESC)
WHERE resolved = FALSE;

-- Add RLS policies
ALTER TABLE unmatched_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Unmatched searches readable by everyone"
ON unmatched_searches FOR SELECT
USING (true);

CREATE POLICY "Unmatched searches writable by authenticated users"
ON unmatched_searches FOR INSERT
TO authenticated
WITH CHECK (true);

COMMENT ON TABLE unmatched_searches IS
'Tracks search queries that did not match any category for learning and improvement';
```

---

## Priority
**High** - Directly impacts core user experience (task discovery and creation)

## Estimated Total Effort
**Phase 2**: 35-50 hours
**Phase 3**: 45-60 hours
**Total**: 80-110 hours (10-14 weeks with testing and iteration)
