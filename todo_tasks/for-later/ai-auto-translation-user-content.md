# AI-Powered Auto-Translation for User Content

## Task Description
Implement automatic translation of user-generated content (task title, description, location_notes) into all supported locales using AI APIs. When a user creates a task in their preferred language, the system should automatically translate the content to other supported languages, allowing professionals who speak different languages to browse and understand tasks.

## Business Value
- **Market Expansion**: Bulgarian customers can post tasks that Russian-speaking professionals can read (and vice versa)
- **User Experience**: No need for users to manually translate their posts
- **Competitive Advantage**: Most local platforms don't offer this feature
- **Future-Proof**: Easy to add new languages (Ukrainian, Greek, Turkish planned)

## Current State
- **Supported Locales**: EN, BG, RU (3 languages)
- **Planned Addition**: UK (Ukrainian), potentially EL (Greek), TR (Turkish)
- **Translatable Fields**: `title`, `description`, `location_notes` (in tasks table)
- **Source Detection**: URL path indicates source language (`/ru/create-task` → Russian source)

## Requirements

### 1. Database Schema Migration

**Option A: JSONB Column (Recommended)**
```sql
-- Add translations column to tasks table
ALTER TABLE tasks
ADD COLUMN translations JSONB DEFAULT '{}';

-- Example structure:
-- {
--   "title": { "en": "Fix sink", "bg": "Поправка на мивка", "ru": "Починить раковину" },
--   "description": { "en": "...", "bg": "...", "ru": "..." },
--   "location_notes": { "en": "...", "bg": "...", "ru": "..." }
-- }

-- Add source_language column
ALTER TABLE tasks
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';

-- Index for faster locale-specific queries
CREATE INDEX idx_tasks_source_language ON tasks(source_language);
```

**Option B: Separate Columns (Alternative)**
```sql
-- More columns but simpler queries
ALTER TABLE tasks
ADD COLUMN title_en TEXT,
ADD COLUMN title_bg TEXT,
ADD COLUMN title_ru TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_bg TEXT,
ADD COLUMN description_ru TEXT,
ADD COLUMN location_notes_en TEXT,
ADD COLUMN location_notes_bg TEXT,
ADD COLUMN location_notes_ru TEXT,
ADD COLUMN source_language VARCHAR(5) DEFAULT 'en';
```

**Recommendation**: Option A (JSONB) is more flexible for adding new languages without migrations.

### 2. AI Translation Service Architecture

**Service Interface (Abstraction Layer)**
```typescript
// /src/lib/services/translation/types.ts
export interface TranslationService {
  translate(text: string, from: string, to: string): Promise<string>;
  translateBatch(texts: string[], from: string, to: string[]): Promise<Record<string, string[]>>;
  detectLanguage(text: string): Promise<string>;
  getSupportedLanguages(): string[];
}

// /src/lib/services/translation/index.ts
export function createTranslationService(): TranslationService {
  const provider = process.env.TRANSLATION_PROVIDER || 'deepl';

  switch (provider) {
    case 'deepl':
      return new DeepLTranslationService();
    case 'google':
      return new GoogleTranslationService();
    case 'openai':
      return new OpenAITranslationService();
    case 'anthropic':
      return new AnthropicTranslationService();
    default:
      throw new Error(`Unknown translation provider: ${provider}`);
  }
}
```

**Provider Implementations**
```typescript
// /src/lib/services/translation/providers/deepl.ts
export class DeepLTranslationService implements TranslationService {
  private apiKey = process.env.DEEPL_API_KEY;

  async translate(text: string, from: string, to: string): Promise<string> {
    // DeepL API implementation
  }
}

// /src/lib/services/translation/providers/openai.ts
export class OpenAITranslationService implements TranslationService {
  // OpenAI GPT-4 mini for cost-effective translation
}
```

### 3. Integration with Task Creation Flow

**Middleware Approach (in TaskService)**
```typescript
// /src/server/tasks/task.service.ts
async createTask(input: CreateTaskInput, userId: string): Promise<Result<Task>> {
  // ... existing validation ...

  // Translate user content before saving
  const translationService = createTranslationService();
  const sourceLocale = input.sourceLocale || 'en';
  const targetLocales = SUPPORTED_LOCALES.filter(l => l !== sourceLocale);

  const translations = await this.translateTaskContent(
    translationService,
    { title: input.title, description: input.description, location_notes: input.locationNotes },
    sourceLocale,
    targetLocales
  );

  // Save task with translations
  const taskData = {
    ...input,
    source_language: sourceLocale,
    translations: translations
  };

  // ... existing save logic ...
}
```

### 4. Frontend Changes

**Create Task Form Enhancement**
```typescript
// Pass current locale to API
const createTask = async (formData: TaskFormData) => {
  const currentLocale = i18n.language; // or extract from URL path

  await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      ...formData,
      sourceLocale: currentLocale // Tell API which language user wrote in
    })
  });
};
```

**Display Translated Content**
```typescript
// TaskCard component
const getLocalizedContent = (task: Task, field: 'title' | 'description', locale: string) => {
  // First try translated version
  if (task.translations?.[field]?.[locale]) {
    return task.translations[field][locale];
  }
  // Fall back to original
  return task[field];
};

<h3>{getLocalizedContent(task, 'title', currentLocale)}</h3>
<p>{getLocalizedContent(task, 'description', currentLocale)}</p>
```

## AI Provider Comparison

### DeepL API (Recommended for MVP)
- **Pricing**: Free tier: 500,000 chars/month, Pro: $5.49/1M chars
- **Quality**: Best for European languages (excellent BG/RU support)
- **Speed**: Fast, dedicated translation API
- **Pros**: Highest quality for BG/RU, simple API, free tier for testing
- **Cons**: Per-character pricing can add up

### Google Cloud Translation
- **Pricing**: $20/1M characters (first 500K free)
- **Quality**: Good, especially for common languages
- **Speed**: Very fast
- **Pros**: Reliable, supports many languages
- **Cons**: More expensive than DeepL for similar quality

### OpenAI GPT-4o-mini
- **Pricing**: $0.15/1M input + $0.60/1M output tokens
- **Quality**: Good for natural translations
- **Speed**: Moderate (LLM inference)
- **Pros**: Flexible, can handle context/tone, batch translations
- **Cons**: Slightly slower, needs prompt engineering

### Anthropic Claude Haiku
- **Pricing**: $0.25/1M input + $1.25/1M output tokens
- **Quality**: Excellent, understands context well
- **Speed**: Fast for LLM
- **Pros**: Great at preserving tone, Claude ecosystem
- **Cons**: Slightly more expensive than GPT-4o-mini

### Recommendation: DeepL for MVP
- Free 500K chars/month covers early testing
- Best quality for Bulgarian/Russian
- Simple API, easy to integrate
- Easy to swap provider if costs become an issue

## Cost Estimation

**Assumptions:**
- Average task: 50 chars title + 300 chars description + 100 chars location_notes = ~450 chars
- Translate to 2 languages = 900 chars per task
- 1000 tasks/month (early stage) = 900K chars

| Provider | Monthly Cost (1K tasks) | Per Task |
|----------|------------------------|----------|
| DeepL Free | $0 (under 500K) | $0 |
| DeepL Pro | ~$5 | $0.005 |
| Google | ~$18 | $0.018 |
| GPT-4o-mini | ~$1 | $0.001 |
| Claude Haiku | ~$1.50 | $0.0015 |

## Implementation Phases

### Phase 1: Infrastructure
- [ ] Add `translations` JSONB column and `source_language` to tasks table
- [ ] Create translation service abstraction layer
- [ ] Implement DeepL provider

### Phase 2: Task Creation Integration
- [ ] Modify `TaskService.createTask()` to call translation service
- [ ] Pass `sourceLocale` from frontend create-task form
- [ ] Handle translation failures gracefully (save original, retry later)

### Phase 3: Display Integration
- [ ] Create `getLocalizedContent()` utility function
- [ ] Update TaskCard to display translated content based on user locale
- [ ] Update task detail page to show translated content

### Phase 4: Quality & Resilience
- [ ] Add translation queue for async processing (optional)
- [ ] Implement retry logic for failed translations
- [ ] Add manual override option for task owners
- [ ] Add "Originally written in [language]" indicator

### Phase 5: Expand to Other Content (Future)
- [ ] Professional profiles (about/description)
- [ ] Application messages
- [ ] Reviews

## Acceptance Criteria

- [ ] Tasks created in BG are readable in EN and RU
- [ ] Tasks created in RU are readable in EN and BG
- [ ] Tasks created in EN are readable in BG and RU
- [ ] Translation provider can be swapped via environment variable
- [ ] Translation failures don't block task creation (graceful degradation)
- [ ] Cost tracking implemented (log chars translated per task)
- [ ] Original language indicator shown on translated content

## Technical Notes

### Error Handling Strategy
```typescript
try {
  const translations = await translationService.translateBatch(...);
  task.translations = translations;
} catch (error) {
  // Log error but don't fail task creation
  console.error('Translation failed, saving without translations:', error);
  task.translations = {};
  // Queue for retry later (optional)
  await queueTranslationRetry(task.id);
}
```

### Environment Variables
```bash
# Translation provider selection
TRANSLATION_PROVIDER=deepl  # deepl | google | openai | anthropic

# Provider-specific keys
DEEPL_API_KEY=xxx
GOOGLE_TRANSLATION_API_KEY=xxx
OPENAI_API_KEY=xxx  # If not already set
ANTHROPIC_API_KEY=xxx  # If not already set

# Feature flags
ENABLE_AUTO_TRANSLATION=true
TRANSLATION_RETRY_QUEUE=false  # Enable async retry queue
```

### Database Query for Browsing
```typescript
// When fetching tasks, select translated field based on user's locale
const getTasks = async (locale: string) => {
  const { data } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      location_notes,
      translations,
      source_language,
      ...other_fields
    `)
    .order('created_at', { ascending: false });

  // Transform with locale-specific content
  return data.map(task => ({
    ...task,
    title: task.translations?.title?.[locale] || task.title,
    description: task.translations?.description?.[locale] || task.description,
    location_notes: task.translations?.location_notes?.[locale] || task.location_notes,
  }));
};
```

## Priority
**Low** - Post-MVP enhancement, implement when user base grows and multi-lingual browsing becomes valuable

## Estimated Effort
- Phase 1: 4-6 hours (DB + service layer)
- Phase 2: 2-3 hours (task creation integration)
- Phase 3: 2-3 hours (display layer)
- Phase 4: 4-6 hours (resilience features)
- **Total**: 12-18 hours

## Dependencies
- Supabase database migration capability
- API key for chosen translation provider
- Production deployment to test real usage

## Related Tasks
- `13-currency-bgn-to-euro-conversion.md` (market expansion)
- Future: Professional profile translations
- Future: Review translations
