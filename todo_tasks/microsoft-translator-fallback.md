# Microsoft Translator API Fallback

## Task Description
Add Microsoft Translator as a fallback when DeepL quota is exceeded. Currently, when DeepL quota runs out, translations are skipped (graceful degradation). This task adds Microsoft Translator as an alternative provider.

## Related Task
- `ai-auto-translation-user-content.md` (parent task - completed)

## Current State
- DeepL API is the primary translation provider
- Quota exceeded status is stored in `app_settings` table
- When quota exceeded, translations are skipped for 30 days
- Microsoft Translator code exists but is disabled

## Requirements

### 1. Register Microsoft Translator
- Sign up at Azure Portal
- Create Cognitive Services resource (Translator)
- Get API key and region

### 2. Environment Variables
```bash
MICROSOFT_TRANSLATOR_KEY=your-key
MICROSOFT_TRANSLATOR_REGION=westeurope
```

### 3. Update Translation Service
- Re-enable Microsoft fallback in `translateWithDeepL()`
- On DeepL 456 error, try Microsoft before marking quota exceeded
- Log which provider was used for cost tracking

### 4. Fallback Logic
```
DeepL API call
    ↓
├─ Success → Return translation
├─ 456 Error → Try Microsoft
│     ↓
│   ├─ Success → Return translation (log: "fallback used")
│   └─ Fail → Mark quota exceeded, return null
└─ Other Error → Return null (graceful degradation)
```

## Implementation Notes

The Microsoft Translator code already exists in `/src/lib/services/translation.ts`:
```typescript
async function translateWithMicrosoft(
  text: string,
  sourceLang: string
): Promise<string | null>
```

Just need to:
1. Re-enable the fallback call in `translateToBulgarian()`
2. Add proper error handling
3. Add logging for cost tracking

## Acceptance Criteria
- [ ] Microsoft Translator API key configured
- [ ] Fallback triggers when DeepL returns 456
- [ ] Translations work via Microsoft when DeepL quota exceeded
- [ ] Logs show which provider was used
- [ ] Quota exceeded only marked after both providers fail

## Priority
**Low** - Only needed if DeepL 500K chars/month isn't enough

## Estimated Effort
2-3 hours (mostly Azure setup)
