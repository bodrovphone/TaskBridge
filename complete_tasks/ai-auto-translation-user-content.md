# AI-Powered Auto-Translation for User Content

## Task Description
Implement **one-way automatic translation TO Bulgarian** for user-generated task content. When a user creates/edits a task from a non-Bulgarian locale (EN, RU, UA), the system translates the content into Bulgarian. This is cost-optimized for the Bulgarian market focus.

## Key Design Decisions

### One-Way Translation (Cost-Optimized)
- **Only translate TO Bulgarian** - No need to translate BG tasks to other languages
- **Source locales**: EN, RU, UA (any non-BG locale)
- **Target locale**: BG only
- **Rationale**: Bulgarian market is primary target, professionals browse in BG

### Display Logic
| User's Locale | Task Source | What to Display |
|---------------|-------------|-----------------|
| BG | EN/RU/UA | Bulgarian translation |
| BG | BG | Original (no translation needed) |
| EN/RU/UA | Any | Original text (as written) |

**Simple rule**: Only BG locale viewers see translations, everyone else sees original.

### Translation Providers (with Fallback)
1. **Primary**: DeepL API (`DEEPL_API_KEY`)
   - Free tier: 500,000 chars/month
   - Best quality for European languages
2. **Fallback**: Microsoft Translator (when DeepL limit reached)
   - Not registered yet, will set up if/when needed
   - Fallback triggered by DeepL quota error

## Current State
- **Supported Locales**: EN, BG, RU, UA (4 languages)
- **Translatable Fields**: `title`, `description`, `requirements` (location_notes)
- **Source Detection**: URL path indicates source language (`/ru/create-task` → Russian)
- **Existing Tasks**: Can be deleted (cleanup planned)

## Database Schema

### Migration SQL
```sql
-- Add Bulgarian translation column (simplified - only BG needed)
ALTER TABLE tasks
ADD COLUMN title_bg TEXT,
ADD COLUMN description_bg TEXT,
ADD COLUMN requirements_bg TEXT;

-- Track source language for display logic
ALTER TABLE tasks
ADD COLUMN source_language VARCHAR(5) DEFAULT 'bg';

-- Index for queries
CREATE INDEX idx_tasks_source_language ON tasks(source_language);

-- Comment for clarity
COMMENT ON COLUMN tasks.source_language IS 'Locale task was created in (en, bg, ru, ua)';
COMMENT ON COLUMN tasks.title_bg IS 'Bulgarian translation of title (null if source was BG)';
```

**Why separate columns instead of JSONB?**
- Only one target language (BG), no need for flexible structure
- Simpler queries: `COALESCE(title_bg, title)` for BG locale
- Easier to add indexes if needed
- More explicit schema

## Implementation

### 1. Translation Service (`/src/lib/services/translation.ts`)

```typescript
interface TranslationResult {
  text: string
  provider: 'deepl' | 'microsoft'
  cached: boolean
}

interface TranslateTaskInput {
  title: string
  description: string
  requirements?: string
  sourceLocale: string
}

interface TranslateTaskOutput {
  title_bg: string | null
  description_bg: string | null
  requirements_bg: string | null
}

// Main function - translates task content to Bulgarian
async function translateTaskToBulgarian(
  input: TranslateTaskInput
): Promise<TranslateTaskOutput>

// Returns null for all fields if source is already Bulgarian
// Uses DeepL first, falls back to Microsoft on quota error
```

### 2. Task Creation Integration

```typescript
// In POST /api/tasks route
const taskData = {
  ...input,
  source_language: sourceLocale, // from request body
}

// Only translate if NOT Bulgarian
if (sourceLocale !== 'bg') {
  const translations = await translateTaskToBulgarian({
    title: input.title,
    description: input.description,
    requirements: input.requirements,
    sourceLocale
  })
  Object.assign(taskData, translations)
}
```

### 3. Task Update Integration

```typescript
// In PATCH /api/tasks/[id] route
// Only re-translate if content fields changed AND source was non-BG

if (task.source_language !== 'bg') {
  const needsRetranslation =
    input.title !== undefined ||
    input.description !== undefined ||
    input.requirements !== undefined

  if (needsRetranslation) {
    const translations = await translateTaskToBulgarian({...})
    Object.assign(updates, translations)
  }
}
```

### 4. Display Helper (`/src/lib/utils/task-localization.ts`)

```typescript
/**
 * Get localized task content based on viewer's locale
 *
 * @param task - Task with translation fields
 * @param viewerLocale - Current user's locale
 * @returns Object with title, description, requirements in correct language
 */
export function getLocalizedTaskContent(
  task: Task,
  viewerLocale: string
): { title: string; description: string; requirements: string | null } {
  // Only BG locale viewers see translations
  if (viewerLocale === 'bg' && task.source_language !== 'bg') {
    return {
      title: task.title_bg || task.title,
      description: task.description_bg || task.description,
      requirements: task.requirements_bg || task.location_notes
    }
  }

  // Everyone else sees original
  return {
    title: task.title,
    description: task.description,
    requirements: task.location_notes
  }
}
```

### 5. Frontend Form Change

```typescript
// In task-form.tsx - pass locale to API
const taskData = {
  ...value,
  sourceLocale: locale, // Already available from params
  photoUrls: uploadedImageUrls,
}
```

## Environment Variables

```bash
# Required
DEEPL_API_KEY=your-deepl-api-key

# Future fallback (not needed yet)
MICROSOFT_TRANSLATOR_KEY=xxx
MICROSOFT_TRANSLATOR_REGION=westeurope
```

## Cost Estimation (One-Way Only)

**Assumptions:**
- Average task: 50 chars title + 300 chars description + 100 chars requirements = ~450 chars
- **Only non-BG tasks translated** (estimated 30% of total)
- 1000 tasks/month × 30% = 300 translations × 450 chars = 135K chars

| Scenario | Monthly Chars | Cost |
|----------|---------------|------|
| MVP (1K tasks, 30% non-BG) | 135K | $0 (free tier) |
| Growth (5K tasks, 30% non-BG) | 675K | ~$1 (DeepL Pro) |
| Scale (10K tasks, 30% non-BG) | 1.35M | ~$7 (DeepL Pro) |

**50-70% cheaper than bidirectional translation!**

## Implementation Phases

### Phase 1: Database & Service
- [ ] Run migration to add `title_bg`, `description_bg`, `requirements_bg`, `source_language`
- [ ] Create `/src/lib/services/translation.ts` with DeepL integration
- [ ] Add Microsoft fallback (can be stubbed initially)

### Phase 2: Task Creation
- [ ] Pass `sourceLocale` from frontend form
- [ ] Call translation service in POST /api/tasks (non-BG only)
- [ ] Handle errors gracefully (save without translation)

### Phase 3: Task Update
- [ ] Detect content changes in PATCH /api/tasks/[id]
- [ ] Re-translate when title/description/requirements change

### Phase 4: Display
- [ ] Create `getLocalizedTaskContent()` utility
- [ ] Update TaskCard component
- [ ] Update task detail page
- [ ] Add "Originally in [language]" indicator (optional)

## Acceptance Criteria

- [ ] Task created in EN → has Bulgarian translation stored
- [ ] Task created in RU → has Bulgarian translation stored
- [ ] Task created in BG → no translation (fields null)
- [ ] BG locale viewer sees translated content for non-BG tasks
- [ ] EN/RU/UA locale viewer sees original content always
- [ ] Edit task → re-translates if content changed
- [ ] DeepL error → graceful fallback (no crash, log error)
- [ ] Translation failure doesn't block task creation

## Technical Notes

### Error Handling
```typescript
try {
  return await translateWithDeepL(text, from, 'BG')
} catch (error) {
  if (isQuotaExceededError(error)) {
    console.warn('DeepL quota exceeded, trying Microsoft...')
    return await translateWithMicrosoft(text, from, 'BG')
  }
  // Log but don't fail task creation
  console.error('Translation failed:', error)
  return null
}
```

### Logging for Cost Tracking
```typescript
console.log('[Translation]', {
  taskId,
  sourceLocale,
  charsTranslated: title.length + description.length + (requirements?.length || 0),
  provider: 'deepl',
  success: true
})
```

## Priority
**Medium** - Implement now for MVP launch

## Files to Create/Modify
1. `supabase/migrations/YYYYMMDD_add_task_translations.sql` - DB migration
2. `/src/lib/services/translation.ts` - Translation service (NEW)
3. `/src/server/tasks/task.types.ts` - Add translation fields to Task type
4. `/src/server/tasks/task.service.ts` - Call translation on create/update
5. `/src/app/api/tasks/route.ts` - Accept sourceLocale
6. `/src/app/api/tasks/[id]/route.ts` - Handle translation on update
7. `/src/components/tasks/task-form.tsx` - Pass sourceLocale
8. `/src/lib/utils/task-localization.ts` - Display helper (NEW)
9. Components using task content - Use localization helper

## Dependencies
- DEEPL_API_KEY in environment
- Supabase migration access

---

## Completion Notes (2025-11-28)

### Status: COMPLETED

### What was implemented:
1. **One-way translation to Bulgarian** - Tasks from EN/RU/UA locales get Bulgarian translations
2. **DeepL API integration** - Primary translation provider with quota management
3. **Async translation** - Fire-and-forget pattern for instant task creation UX
4. **Quota management** - Stores `deepl_quota_exceeded_at` in `app_settings` table, skips translations for 30 days when exceeded
5. **SSR/SEO support** - Uses URL locale for server-side rendering
6. **Usage monitoring** - `/api/admin/deepl-usage` endpoint to check quota

### Files created:
- `/src/lib/services/translation.ts` - Translation service with DeepL + quota management
- `/src/lib/utils/task-localization.ts` - Display helper for localized content
- `/src/app/api/admin/deepl-usage/route.ts` - Quota monitoring endpoint

### Files modified:
- `/src/server/tasks/task.types.ts` - Added translation fields
- `/src/server/tasks/task.service.ts` - Async background translation
- `/src/server/tasks/task.validation.ts` - Added sourceLocale to schema
- `/src/server/tasks/task.repository.ts` - Added translation fields to query
- `/src/components/tasks/task-form.tsx` - Passes sourceLocale
- `/src/components/ui/task-card.tsx` - Uses localized content
- `/src/app/[lang]/tasks/[id]/components/task-detail-content.tsx` - Uses localized content

### Database migrations:
- Added `title_bg`, `description_bg`, `requirements_bg`, `source_language` to `tasks` table
- Created `app_settings` table for quota tracking

### Follow-up task:
- `microsoft-translator-fallback.md` - Add Microsoft Translator as fallback provider
