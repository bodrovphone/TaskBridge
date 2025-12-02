# Smart Category Search & Discovery - Implementation Plan

## Overview

Implement intelligent category matching and task discovery using keyword algorithms (no AI initially) to improve user experience across task creation and browsing.

**Core Problems:**
1. Users searching "ремонт аквариума" get no results (no keyword matching)
2. Creating a task requires picking category first (friction)
3. Only 117 subcategories vs competitor's 1000+ (limited coverage)
4. No full-text search on task titles/descriptions

**Solution:** Keyword-based smart matching + full-text search + category expansion

---

## Key User Flows

### Flow A: Browse Tasks (Search)

```
User types: "ремонт аквариума"
                ↓
┌─────────────────────────────────────────────────┐
│  SMART SEARCH RESULTS                           │
├─────────────────────────────────────────────────┤
│  💡 Suggested Categories:                       │
│  [Fish Care] [Pet Services] [Aquarium Repair]   │  ← Click to filter
│                                                 │
│  📋 Matching Tasks (3):                         │
│  • "Почистване на аквариум 200л" - Sofia        │  ← Text match
│  • "Ремонт на филтър за аквариум" - Plovdiv     │  ← Text match
│                                                 │
│  📂 Related Tasks (5):                          │
│  • "Гледане на рибки докато съм..." - Sofia     │  ← Category match
│  • "Монтаж на голям аквариум" - Varna           │  ← Category match
└─────────────────────────────────────────────────┘
```

**Logic:**
1. **A) Text Search**: Query tasks table with full-text search on title/description
2. **B) Category Suggestions**: Match search terms against keyword database → suggest subcategories
3. **C) User Selects Category**: If clicked, filter by that subcategory (skip text search)
4. **D) Combined Results**: If no category selected, show:
   - "Matching Tasks" = text search results (exact/partial match)
   - "Related Tasks" = tasks from matched categories

### Flow B: Create Task (Title-First)

```
CURRENT FLOW:                    NEW FLOW:
─────────────────                ─────────────────
1. Pick category     →           1. Type title
2. Pick subcategory  →           2. System suggests categories
3. Type title        →           3. User confirms or picks manually
4. Type description  →           4. Type description
```

**New Create Task UI:**

```
┌─────────────────────────────────────────────────┐
│  What do you need help with?                    │
│  ┌─────────────────────────────────────────┐    │
│  │ Ремонт на аквариум и смяна на филтър   │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  💡 Suggested Category:                         │
│  ┌─────────────────────────────────────────┐    │
│  │ 🐟 Fish Care (Pet Services)        [✓] │    │  ← Auto-selected
│  └─────────────────────────────────────────┘    │
│  [Not right? Choose manually →]                 │
│                                                 │
│  [Continue →]                                   │
└─────────────────────────────────────────────────┘
```

**Logic:**
1. User types title (min 10 chars to trigger matching)
2. System matches title against keyword database
3. If match found (confidence > 70%): auto-suggest category
4. If no match: show "Choose category" with existing picker
5. User can always override suggestion

---

## Phase 1: Category Expansion (50-100 New Subcategories)

### Goal
Expand from 117 to ~200 subcategories for better coverage.

### Priority Expansion Areas

Based on Kabanchik.ua analysis and Bulgarian market needs:

#### 1. Handyman (5 → 15 subcategories)
Current: `plumber`, `electrician`, `handyman-service`, `carpenter`, `locksmith`

Add:
- `door-installation` - Монтаж на врати
- `window-installation` - Монтаж на прозорци
- `smart-home-installation` - Умен дом
- `intercom-installation` - Домофонни системи
- `antenna-installation` - Монтаж на антени
- `water-heater-installation` - Монтаж на бойлери
- `air-conditioning` - Климатици
- `gas-appliance-repair` - Ремонт на газови уреди
- `security-systems` - Охранителни системи
- `solar-panels` - Соларни панели

#### 2. Pet Services (5 → 12 subcategories)
Current: `cat-care`, `dog-care`, `pet-hotel`, `pet-transportation`, `fish-care`

Add:
- `dog-walking` - Разходка на кучета
- `pet-grooming` - Грууминг
- `pet-training` - Обучение на домашни любимци
- `aquarium-maintenance` - Поддръжка на аквариуми
- `exotic-pet-care` - Грижа за екзотични животни
- `bird-care` - Грижа за птици
- `veterinary-home-visit` - Ветеринар на адрес

#### 3. Cleaning Services (5 → 12 subcategories)
Current: `apartment-cleaning`, `deep-cleaning`, `post-renovation-cleaning`, `dry-cleaning`, `house-cleaning`

Add:
- `office-cleaning` - Почистване на офиси
- `window-cleaning` - Почистване на прозорци
- `carpet-cleaning` - Почистване на килими
- `upholstery-cleaning` - Почистване на мека мебел
- `pool-cleaning` - Почистване на басейни
- `facade-cleaning` - Почистване на фасади
- `industrial-cleaning` - Индустриално почистване

#### 4. Beauty & Health (5 → 15 subcategories)
Current: `massage`, `nail-care`, `cosmetology`, `lash-care`, `brow-care`

Add:
- `hairdresser` - Фризьор
- `makeup-artist` - Гримьор
- `waxing` - Кола маска
- `tattoo-artist` - Татуист
- `personal-trainer-home` - Личен треньор вкъщи
- `nutritionist` - Диетолог
- `speech-therapist` - Логопед
- `physiotherapist` - Физиотерапевт
- `home-nurse` - Медицинска сестра
- `elderly-companion` - Придружител за възрастни

#### 5. Auto Repair (5 → 12 subcategories)
Current: `roadside-assistance`, `maintenance-diagnostics`, `auto-electrical`, `body-work`, `engine-repair`

Add:
- `tire-service` - Смяна на гуми
- `car-wash-detailing` - Автомивка/детайлинг
- `windshield-repair` - Ремонт на стъкла
- `car-ac-repair` - Ремонт на автоклиматик
- `brake-repair` - Ремонт на спирачки
- `suspension-repair` - Ремонт на ходова част
- `car-locksmith` - Автоключар

#### 6. New Main Category: Home Improvement (NEW)
- `painting-walls` - Боядисване на стени
- `wallpaper-installation` - Поставяне на тапети
- `flooring-installation` - Поставяне на подови настилки
- `ceiling-installation` - Окачени тавани
- `kitchen-installation` - Монтаж на кухни
- `bathroom-renovation` - Ремонт на баня
- `balcony-glazing` - Остъкляване на балкони
- `fence-installation` - Монтаж на огради

### Deliverables
- [ ] Update `/src/features/categories/lib/subcategories.ts` (+80 subcategories)
- [ ] Update `/src/features/categories/lib/main-categories.ts` (if adding new main)
- [ ] Add translations in `/src/lib/intl/en/categories.ts`
- [ ] Add translations in `/src/lib/intl/bg/categories.ts`
- [ ] Add translations in `/src/lib/intl/ru/categories.ts`
- [ ] Update `category-visuals.ts` with icons/colors

### Estimated Effort: 8-12 hours

---

## Phase 2: Keyword Database

### Goal
Create multilingual keyword arrays for smart matching (no AI).

### Data Structure

**New File:** `/src/features/categories/lib/category-keywords.ts`

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
        'plumber', 'plumbing', 'pipe', 'leak', 'water', 'drain', 'faucet',
        'sink', 'toilet', 'shower', 'bathtub', 'water heater', 'boiler',
        'clog', 'flooding', 'tap', 'bathroom', 'kitchen sink'
      ],
      bg: [
        'водопроводчик', 'ВиК', 'тръба', 'теч', 'вода', 'канал', 'чешма',
        'мивка', 'тоалетна', 'душ', 'вана', 'бойлер', 'котел',
        'запушване', 'запушен', 'наводнение', 'кран', 'баня', 'сифон'
      ],
      ru: [
        'сантехник', 'сантехника', 'труба', 'утечка', 'вода', 'слив', 'кран',
        'раковина', 'туалет', 'душ', 'ванна', 'бойлер', 'котел',
        'засор', 'затопление', 'смеситель', 'ванная', 'унитаз'
      ]
    }
  },
  {
    subcategorySlug: 'fish-care',
    mainCategorySlug: 'pet-services',
    keywords: {
      en: [
        'fish', 'aquarium', 'tank', 'fish tank', 'tropical fish', 'goldfish',
        'fish feeding', 'aquarium cleaning', 'filter', 'water change'
      ],
      bg: [
        'риби', 'рибки', 'аквариум', 'аквариуми', 'златна рибка',
        'хранене на риби', 'почистване на аквариум', 'филтър', 'смяна на вода'
      ],
      ru: [
        'рыбки', 'аквариум', 'аквариумы', 'золотая рыбка', 'рыба',
        'кормление рыб', 'чистка аквариума', 'фильтр', 'подмена воды'
      ]
    }
  },
  // ... 200+ more subcategories
];
```

### Keyword Generation Strategy

**Per subcategory (15-25 keywords per language):**
1. **Base terms**: Direct category name translations
2. **Synonyms**: Alternative words for same service
3. **Related objects**: Things the service works with (e.g., "sink" for plumber)
4. **Action verbs**: What the service does (e.g., "fix", "install", "repair")
5. **Problem descriptions**: What users search when they have issues (e.g., "leak", "broken")
6. **Common misspellings**: Frequent typos in each language

### Deliverables
- [ ] Create `/src/features/categories/lib/category-keywords.ts`
- [ ] Generate keywords for all ~200 subcategories
- [ ] Create validation script `/scripts/validate-keywords.ts`
- [ ] Target: 4,000+ total keywords across 3 languages

### Estimated Effort: 15-20 hours (mostly research/translation)

---

## Phase 3: Matching Algorithm

### Goal
Implement keyword-based matching without AI dependency.

### Algorithm Design

```typescript
interface MatchResult {
  subcategorySlug: string;
  mainCategorySlug: string;
  score: number;           // 0-100
  matchType: 'exact' | 'keyword' | 'partial';
  matchedTerms: string[];  // Which keywords matched
}

function matchQueryToCategories(
  query: string,
  locale: 'en' | 'bg' | 'ru'
): MatchResult[] {
  const normalizedQuery = normalizeText(query);
  const queryWords = tokenize(normalizedQuery);
  const results: MatchResult[] = [];

  for (const category of CATEGORY_KEYWORDS) {
    const keywords = category.keywords[locale];
    let score = 0;
    let matchType: MatchResult['matchType'] = 'partial';
    const matchedTerms: string[] = [];

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // Exact match (highest score)
      if (normalizedQuery === normalizedKeyword) {
        score = 100;
        matchType = 'exact';
        matchedTerms.push(keyword);
        break;
      }

      // Query contains keyword
      if (normalizedQuery.includes(normalizedKeyword)) {
        score = Math.max(score, 80);
        matchType = 'keyword';
        matchedTerms.push(keyword);
        continue;
      }

      // Keyword contains query (partial)
      if (normalizedKeyword.includes(normalizedQuery) && normalizedQuery.length >= 3) {
        score = Math.max(score, 60);
        matchedTerms.push(keyword);
        continue;
      }

      // Word-level matching
      const keywordWords = tokenize(normalizedKeyword);
      const matchingWords = queryWords.filter(qw =>
        keywordWords.some(kw => kw.includes(qw) || qw.includes(kw))
      );

      if (matchingWords.length > 0) {
        const wordScore = (matchingWords.length / queryWords.length) * 50;
        if (wordScore > score) {
          score = wordScore;
          matchedTerms.push(keyword);
        }
      }
    }

    if (score >= 30) {  // Minimum threshold
      results.push({
        subcategorySlug: category.subcategorySlug,
        mainCategorySlug: category.mainCategorySlug,
        score,
        matchType,
        matchedTerms
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Helper functions
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')  // Keep letters, numbers, spaces
    .replace(/\s+/g, ' ');
}

function tokenize(text: string): string[] {
  return text.split(' ').filter(word => word.length >= 2);
}
```

### Scoring Logic

| Match Type | Score | Example |
|------------|-------|---------|
| Exact match | 100 | "plumber" → `plumber` |
| Contains keyword | 80 | "fix my plumbing" → `plumber` |
| Keyword contains query | 60 | "plumb" → `plumber` |
| Word overlap (>50%) | 40-50 | "toilet repair" → `plumber` |
| Word overlap (<50%) | 30-40 | "bathroom leak" → `plumber` |
| No match | 0 | - |

### Implementation Files

- [ ] `/src/features/categories/lib/matching-algorithm.ts` - Core algorithm
- [ ] `/src/features/categories/lib/text-utils.ts` - Normalization helpers
- [ ] `/src/features/categories/lib/index.ts` - Export new functions

### Estimated Effort: 6-8 hours

---

## Phase 4: Full-Text Search on Tasks

### Goal
Enable searching task titles/descriptions directly in PostgreSQL.

### Database Migration

```sql
-- Migration: add_task_full_text_search.sql

-- Add generated tsvector column for full-text search
ALTER TABLE tasks ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(title_bg, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(description_bg, '')), 'B')
) STORED;

-- Create GIN index for fast full-text search
CREATE INDEX idx_tasks_search_vector ON tasks USING GIN(search_vector);

-- Function to search tasks by text
CREATE OR REPLACE FUNCTION search_tasks(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  city TEXT,
  rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.category,
    t.subcategory,
    t.city,
    ts_rank(t.search_vector, plainto_tsquery('simple', search_query)) as rank
  FROM tasks t
  WHERE
    t.status = 'open'
    AND t.search_vector @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$;
```

### Why 'simple' Instead of Language-Specific?

Using `'simple'` text search configuration because:
1. We have mixed content (EN, BG, RU, UA)
2. Bulgarian/Russian don't have built-in PostgreSQL dictionaries
3. Simple tokenization works well for our use case
4. Can add language-specific later if needed

### API Integration

**Update:** `/src/app/api/tasks/route.ts`

```typescript
// Add text search parameter
const searchText = searchParams.get('q');

if (searchText && searchText.trim().length >= 3) {
  // Use full-text search function
  const { data: textResults } = await supabase
    .rpc('search_tasks', {
      search_query: searchText,
      result_limit: 20
    });

  // Combine with category filter if both provided
  // ...
}
```

### Deliverables
- [ ] Create migration file
- [ ] Run migration on Supabase
- [ ] Update task API route
- [ ] Add `q` parameter to task query types

### Estimated Effort: 4-6 hours

---

## Phase 5: Browse Tasks UI Integration

### Goal
Combine text search + category suggestions in browse tasks page.

### Updated Search Results UI

```typescript
// /src/features/browse-tasks/components/sections/search-results-section.tsx

interface SearchResults {
  suggestedCategories: CategorySuggestion[];  // From keyword matching
  textMatchTasks: Task[];                      // From full-text search
  categoryMatchTasks: Task[];                  // From matched category filter
}

function SearchResultsSection({
  query,
  results,
  selectedCategory,
  onCategorySelect
}: Props) {
  return (
    <div className="space-y-6">
      {/* Category Suggestions */}
      {results.suggestedCategories.length > 0 && !selectedCategory && (
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-2">
            {t('browseTasks.suggestedCategories')}
          </p>
          <div className="flex flex-wrap gap-2">
            {results.suggestedCategories.map(cat => (
              <Chip
                key={cat.slug}
                onClick={() => onCategorySelect(cat.slug)}
                variant="flat"
                color="primary"
              >
                {cat.label}
                <span className="ml-1 text-xs opacity-70">
                  ({cat.score}%)
                </span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Text Match Results */}
      {results.textMatchTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {t('browseTasks.matchingTasks')} ({results.textMatchTasks.length})
          </h3>
          <TaskGrid tasks={results.textMatchTasks} />
        </div>
      )}

      {/* Category Match Results (only if no category selected) */}
      {!selectedCategory && results.categoryMatchTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-600">
            {t('browseTasks.relatedTasks')} ({results.categoryMatchTasks.length})
          </h3>
          <TaskGrid tasks={results.categoryMatchTasks} variant="muted" />
        </div>
      )}

      {/* Empty State */}
      {results.textMatchTasks.length === 0 &&
       results.categoryMatchTasks.length === 0 && (
        <EmptySearchState query={query} />
      )}
    </div>
  );
}
```

### Search Flow Logic

```typescript
async function performSearch(query: string, locale: string) {
  // 1. Get category suggestions from keyword matching (client-side)
  const suggestedCategories = matchQueryToCategories(query, locale);

  // 2. Fetch text-matched tasks from API
  const textMatchTasks = await fetchTasks({ q: query });

  // 3. Fetch category-matched tasks (if suggestions found)
  let categoryMatchTasks: Task[] = [];
  if (suggestedCategories.length > 0) {
    const topCategories = suggestedCategories.slice(0, 3).map(c => c.subcategorySlug);
    categoryMatchTasks = await fetchTasks({
      subcategory: topCategories.join(',')  // Multiple categories
    });

    // Remove duplicates (tasks that appear in both)
    const textMatchIds = new Set(textMatchTasks.map(t => t.id));
    categoryMatchTasks = categoryMatchTasks.filter(t => !textMatchIds.has(t.id));
  }

  return { suggestedCategories, textMatchTasks, categoryMatchTasks };
}
```

### Deliverables
- [ ] Create `/src/features/browse-tasks/components/sections/search-results-section.tsx`
- [ ] Update search logic in browse tasks page
- [ ] Add translations for new UI elements
- [ ] Handle loading/error states

### Estimated Effort: 10-12 hours

---

## Phase 6: Create Task Title-First Flow

### Goal
Let users type title first, then auto-suggest category.

### UI Flow Changes

**Current:** Category Selection → Task Details
**New:** Task Title → Category Suggestion → Task Details

### New Component Structure

```typescript
// /src/app/[lang]/create-task/components/title-first-flow.tsx

type FlowState = 'title' | 'category-confirm' | 'details';

function TitleFirstFlow() {
  const [flowState, setFlowState] = useState<FlowState>('title');
  const [title, setTitle] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<MatchResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Trigger matching when title changes (debounced)
  useEffect(() => {
    if (title.length >= 10) {
      const matches = matchQueryToCategories(title, locale);
      if (matches.length > 0 && matches[0].score >= 70) {
        setSuggestedCategory(matches[0]);
      } else {
        setSuggestedCategory(null);
      }
    }
  }, [title, locale]);

  return (
    <div>
      {flowState === 'title' && (
        <TitleInputSection
          value={title}
          onChange={setTitle}
          onContinue={() => {
            if (suggestedCategory) {
              setFlowState('category-confirm');
            } else {
              setFlowState('details');  // Will show category picker
            }
          }}
        />
      )}

      {flowState === 'category-confirm' && suggestedCategory && (
        <CategoryConfirmSection
          suggestion={suggestedCategory}
          onConfirm={() => {
            setSelectedCategory(suggestedCategory.subcategorySlug);
            setFlowState('details');
          }}
          onReject={() => {
            setSuggestedCategory(null);
            setFlowState('details');  // Will show category picker
          }}
        />
      )}

      {flowState === 'details' && (
        <TaskDetailsFlow
          title={title}
          category={selectedCategory}
          showCategoryPicker={!selectedCategory}
        />
      )}
    </div>
  );
}
```

### Title Input Section

```typescript
function TitleInputSection({ value, onChange, onContinue }: Props) {
  const { t } = useTranslation();
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Get suggestion as user types
  const suggestion = useMemo(() => {
    if (value.length < 10) return null;
    const matches = matchQueryToCategories(value, locale);
    return matches.length > 0 && matches[0].score >= 50 ? matches[0] : null;
  }, [value, locale]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {t('createTask.whatDoYouNeed')}
      </h2>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('createTask.titlePlaceholder')}
        minRows={2}
        maxRows={4}
        classNames={{
          input: 'text-lg'
        }}
      />

      {/* Live category suggestion preview */}
      {suggestion && value.length >= 10 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-green-600"
        >
          <CheckCircle className="w-4 h-4" />
          <span>
            {t('createTask.suggestedCategory')}: {suggestion.label}
          </span>
        </motion.div>
      )}

      <Button
        size="lg"
        color="primary"
        isDisabled={value.length < 10}
        onPress={onContinue}
      >
        {t('createTask.continue')}
      </Button>

      <p className="text-sm text-gray-500">
        {t('createTask.titleHint', { minChars: 10 })}
      </p>
    </div>
  );
}
```

### Category Confirmation Section

```typescript
function CategoryConfirmSection({ suggestion, onConfirm, onReject }: Props) {
  const { t } = useTranslation();
  const mainCategory = getMainCategoryById(suggestion.mainCategorySlug);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {t('createTask.confirmCategory')}
      </h2>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-${mainCategory?.color}-100`}>
            <mainCategory.icon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium">{suggestion.label}</p>
            <p className="text-sm text-gray-500">
              {t(`categories.main.${suggestion.mainCategorySlug}.description`)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            color="primary"
            size="lg"
            className="flex-1"
            onPress={onConfirm}
          >
            {t('createTask.yesThisIsCorrect')}
          </Button>
          <Button
            variant="bordered"
            size="lg"
            className="flex-1"
            onPress={onReject}
          >
            {t('createTask.chooseManually')}
          </Button>
        </div>
      </Card>

      <p className="text-sm text-gray-500 text-center">
        {t('createTask.categoryExplanation')}
      </p>
    </div>
  );
}
```

### Deliverables
- [ ] Create `/src/app/[lang]/create-task/components/title-first-flow.tsx`
- [ ] Create title input and category confirm sections
- [ ] Add new translations
- [ ] Add feature flag to toggle between old/new flow
- [ ] Test with various title inputs

### Estimated Effort: 12-15 hours

---

## Phase 7: Testing & Validation

### Test Cases

#### Keyword Matching Tests
```typescript
describe('matchQueryToCategories', () => {
  it('exact match returns score 100', () => {
    const results = matchQueryToCategories('plumber', 'en');
    expect(results[0].score).toBe(100);
    expect(results[0].subcategorySlug).toBe('plumber');
  });

  it('keyword match returns score 80', () => {
    const results = matchQueryToCategories('fix my leaking pipe', 'en');
    expect(results[0].subcategorySlug).toBe('plumber');
    expect(results[0].score).toBeGreaterThanOrEqual(80);
  });

  it('handles Bulgarian queries', () => {
    const results = matchQueryToCategories('ремонт аквариум', 'bg');
    expect(results.some(r => r.subcategorySlug === 'fish-care')).toBe(true);
  });

  it('handles Russian queries', () => {
    const results = matchQueryToCategories('сантехник на дом', 'ru');
    expect(results[0].subcategorySlug).toBe('plumber');
  });

  it('returns empty for no matches', () => {
    const results = matchQueryToCategories('xyzabc123', 'en');
    expect(results.length).toBe(0);
  });
});
```

#### Full-Text Search Tests
```typescript
describe('Task full-text search', () => {
  it('finds tasks by title keyword', async () => {
    const results = await searchTasks('аквариум');
    expect(results.length).toBeGreaterThan(0);
  });

  it('ranks exact matches higher', async () => {
    const results = await searchTasks('ремонт на аквариум');
    // Tasks with exact phrase should rank first
    expect(results[0].title).toContain('аквариум');
  });

  it('searches across all locales', async () => {
    const results = await searchTasks('repair');
    // Should find tasks with English or translated content
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### Manual Testing Checklist

**Browse Tasks:**
- [ ] Search "ремонт аквариума" → Shows fish-care suggestion + text results
- [ ] Click category chip → Filters to that category only
- [ ] Search with no matches → Shows helpful empty state
- [ ] Search in all 3 locales works correctly

**Create Task:**
- [ ] Type title → Category suggestion appears after 10 chars
- [ ] High confidence match → Auto-suggests with confirm screen
- [ ] Low confidence → Shows manual category picker
- [ ] "Choose manually" → Shows existing category grid

### Deliverables
- [ ] Unit tests for matching algorithm
- [ ] Integration tests for search API
- [ ] Manual test script with 50+ test queries
- [ ] Performance benchmarks (target: <100ms matching)

### Estimated Effort: 6-8 hours

---

## Implementation Timeline

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 1 | Category Expansion | 8-12h | None |
| 2 | Keyword Database | 15-20h | Phase 1 |
| 3 | Matching Algorithm | 6-8h | Phase 2 |
| 4 | Full-Text Search | 4-6h | None (parallel) |
| 5 | Browse Tasks UI | 10-12h | Phase 3, 4 |
| 6 | Create Task UI | 12-15h | Phase 3 |
| 7 | Testing | 6-8h | Phase 5, 6 |

**Total Estimated: 61-81 hours**

### Recommended Order

1. **Week 1-2:** Phase 1 (Categories) + Phase 4 (FTS) - Can run in parallel
2. **Week 3-4:** Phase 2 (Keywords) + Phase 3 (Algorithm)
3. **Week 5-6:** Phase 5 (Browse UI) + Phase 6 (Create UI)
4. **Week 7:** Phase 7 (Testing) + Bug fixes + Rollout

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Category coverage | 117 subcats | 200+ subcats |
| Search match rate | ~30% | 80%+ |
| Create task completion | Unknown | +15% |
| Avg. time to find category | Unknown | -30% |
| "Other" category usage | Unknown | -50% |

---

## Future Enhancements (Post-MVP)

### AI-Powered Matching (Phase 8)
- Add OpenAI/Claude API for semantic understanding
- Only trigger when keyword matching fails
- Cache results aggressively
- Budget: $10-15/month max

### Search Analytics (Phase 9)
- Track unmatched searches
- Learn new keywords from failed matches
- Admin dashboard for keyword management
- Auto-suggest new subcategories

### Personalization (Phase 10)
- Remember user's frequent categories
- Location-based category boosting
- Time-based suggestions (seasonal services)

---

## Questions / Decisions Needed

1. **Category expansion priority**: Start with which main categories?
2. **Matching threshold**: 70% confidence for auto-suggest OK?
3. **Number of suggestions**: Show top 3 or top 5 category suggestions?
4. **Empty state**: What to show when no matches found?
5. **A/B testing**: Test old vs new create flow?

---

## Priority
**High** - Directly impacts core user experience

## Related Files
- `/src/features/categories/` - Category system
- `/src/app/[lang]/create-task/` - Task creation flow
- `/src/features/browse-tasks/` - Task browsing
- `/src/app/api/tasks/route.ts` - Task API

---

*Last Updated: 2024-11-30*
