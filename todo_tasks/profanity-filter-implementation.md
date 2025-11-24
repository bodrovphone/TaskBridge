# Profanity Filter Implementation

## Overview

Implement profanity detection and filtering for task creation forms to maintain a professional and safe platform. The filter must support **Bulgarian**, **Russian**, **Ukrainian**, and **English** languages with Cyrillic script support.

## Research Findings

### Recommended Library: **glin-profanity**

After researching available options, **[glin-profanity](https://github.com/GLINCKER/glin-profanity)** is the best choice for TaskBridge:

**Why glin-profanity:**
- **23 languages supported** including Russian (built-in)
- **TypeScript native** with full type definitions
- **Obfuscation detection** - catches "sh1t", "f*ck", "a$$hole" variants
- **Configurable severity levels** - Exact, Fuzzy, Merged matching
- **Context-aware filtering** - 85% reduction in false positives
- **High performance** - lightweight and efficient
- **Active maintenance** - v2.3.5+ with regular updates
- **Cross-platform** - Works in Node.js and browser

**Supported Languages (relevant to us):**
- English
- Russian
- Polish (useful as Slavic reference)

**Languages NOT built-in (need custom lists):**
- Bulgarian
- Ukrainian

### Alternative Libraries Considered

| Library | Languages | Cyrillic | Notes |
|---------|-----------|----------|-------|
| **glin-profanity** | 23 | Russian | Best overall, extensible |
| **@2toad/profanity** | 10+ | Unicode-aware | Good TypeScript, less languages |
| **obscenity** | English only | Transformers | Great for obfuscation, limited languages |
| **bad-words** | English | No | Outdated, English-only |
| **leo-profanity** | Multiple | Limited | Less maintained |

### Bulgarian/Ukrainian Word Lists

**Sources for custom word lists:**

1. **[swearify](https://github.com/Behiwzad/swearify)** - Has Bulgarian (135 words)
2. **[washyourmouthoutwithsoap](https://github.com/thisandagain/washyourmouthoutwithsoap)** - Has Bulgarian + Ukrainian (auto-translated)
3. **[profanity-list](https://github.com/dsojevic/profanity-list)** - Structured JSON with severity ratings
4. **[censor-text/profanity-list](https://github.com/censor-text/profanity-list)** - Open-source, community maintained

**For Russian/Ukrainian specifically:**
- **[rominf/profanity-filter](https://github.com/rominf/profanity-filter)** - Python lib with `ru_badwords.txt` (can extract list)
- **[PixxxeL/djantimat](https://github.com/PixxxeL/djantimat)** - Russian profanity dictionary source

---

## Implementation Plan

### Phase 1: Basic Integration

**Objective:** Integrate glin-profanity with English + Russian support

#### Step 1: Install Dependencies

```bash
npm install glin-profanity
```

#### Step 2: Create Profanity Service

**File:** `/src/lib/services/profanity-filter.ts`

```typescript
import { checkProfanity, ProfanityResult } from 'glin-profanity';

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  detectedWords: string[];
  cleanedText: string;
}

const LANGUAGE_MAP: Record<string, string[]> = {
  en: ['english'],
  bg: ['bulgarian', 'english'], // Fallback to English for coverage
  ru: ['russian', 'english'],
  uk: ['ukrainian', 'english'],
};

export async function checkTextForProfanity(
  text: string,
  locale: string = 'en'
): Promise<ProfanityCheckResult> {
  const languages = LANGUAGE_MAP[locale] || ['english'];

  const result = checkProfanity(text, {
    languages,
    severityLevels: true,
    obfuscationDetection: true,
  });

  return {
    hasProfanity: result.found,
    severity: mapSeverity(result.severity),
    detectedWords: result.matches.map(m => m.word),
    cleanedText: result.censored,
  };
}

function mapSeverity(level: number): ProfanityCheckResult['severity'] {
  if (level === 0) return 'none';
  if (level <= 1) return 'mild';
  if (level <= 2) return 'moderate';
  return 'severe';
}
```

#### Step 3: Add Custom Bulgarian/Ukrainian Word Lists

**File:** `/src/lib/services/profanity-wordlists.ts`

```typescript
// Bulgarian profanity list (from swearify + native speaker review)
export const BULGARIAN_PROFANITY: string[] = [
  // Add validated Bulgarian words here
  // Source: https://github.com/Behiwzad/swearify (135 words)
];

// Ukrainian profanity list (from washyourmouthoutwithsoap + native speaker review)
export const UKRAINIAN_PROFANITY: string[] = [
  // Add validated Ukrainian words here
  // Source: https://github.com/thisandagain/washyourmouthoutwithsoap
];

// Common Cyrillic obfuscation patterns
export const CYRILLIC_OBFUSCATION_MAP: Record<string, string[]> = {
  'а': ['a', '@', '4'],
  'е': ['e', '3'],
  'о': ['o', '0'],
  'с': ['c', 's'],
  'р': ['p', 'r'],
  'х': ['x', 'h'],
  // ... more mappings
};
```

#### Step 4: Integrate with Task Creation Form

**File:** `/src/app/[lang]/create-task/components/task-form.tsx`

```typescript
import { checkTextForProfanity } from '@/lib/services/profanity-filter';

// In form validation
const validateProfanity = async (text: string, locale: string) => {
  const result = await checkTextForProfanity(text, locale);

  if (result.hasProfanity && result.severity !== 'mild') {
    return {
      valid: false,
      error: t('validation.profanityDetected'),
      severity: result.severity,
    };
  }

  return { valid: true };
};

// Validate on form fields
const titleValidation = await validateProfanity(form.title, i18n.language);
const descriptionValidation = await validateProfanity(form.description, i18n.language);
```

---

### Phase 2: Enhanced Bulgarian/Ukrainian Support

**Objective:** Add comprehensive Bulgarian and Ukrainian word lists

#### Step 1: Gather Word Lists

1. **Extract from swearify** (Bulgarian - 135 words)
2. **Extract from washyourmouthoutwithsoap** (Bulgarian + Ukrainian)
3. **Cross-reference with rominf/profanity-filter** (Russian variants)
4. **Native speaker review** - Validate and categorize by severity

#### Step 2: Create Extended Profanity Service

**File:** `/src/lib/services/profanity-filter-extended.ts`

- Add Bulgarian word list integration
- Add Ukrainian word list integration
- Implement Cyrillic obfuscation detection
- Add severity classification for each word

#### Step 3: Add Validation to API Route

**File:** `/src/app/api/tasks/route.ts`

```typescript
import { checkTextForProfanity } from '@/lib/services/profanity-filter';

export async function POST(request: Request) {
  const body = await request.json();

  // Server-side profanity validation
  const titleCheck = await checkTextForProfanity(body.title, body.locale);
  const descriptionCheck = await checkTextForProfanity(body.description, body.locale);

  if (titleCheck.hasProfanity || descriptionCheck.hasProfanity) {
    return NextResponse.json(
      { error: 'profanity_detected', fields: ['title', 'description'] },
      { status: 400 }
    );
  }

  // Continue with task creation...
}
```

---

### Phase 3: Admin & Moderation Tools

**Objective:** Add tools for managing profanity detection

#### Features:
- [ ] Admin dashboard to view flagged content
- [ ] False positive reporting system
- [ ] Custom word list management UI
- [ ] Analytics on detected profanity (anonymized)

---

## Technical Considerations

### Performance
- **Client-side pre-check:** Fast feedback before form submission
- **Server-side validation:** Authoritative check with full word lists
- **Caching:** Cache word lists in memory for fast lookups

### False Positives
- Use severity levels to avoid blocking mild language
- Implement whitelist for legitimate words that match patterns
- Example: "Scunthorpe problem" - legitimate place names with bad substrings

### Security
- Server-side validation is mandatory (client-side can be bypassed)
- Sanitize user input before profanity check
- Log detected profanity attempts for abuse monitoring

### Localization
- Error messages should be translated (EN/BG/RU)
- Different cultures have different severity expectations
- Consider regional variations in profanity

---

## Translation Keys Needed

```typescript
// /src/lib/intl/[lang]/validation.ts (new file or add to common.ts)
{
  'validation.profanityDetected': 'Your text contains inappropriate language. Please revise.',
  'validation.profanityTitle': 'Task title contains inappropriate language',
  'validation.profanityDescription': 'Task description contains inappropriate language',
  'validation.profanityWarning': 'Some words may be flagged. Review before submitting.',
}
```

---

## Acceptance Criteria

- [ ] glin-profanity installed and configured
- [ ] Profanity service created with TypeScript types
- [ ] English + Russian working out of the box
- [ ] Bulgarian word list integrated (100+ words)
- [ ] Ukrainian word list integrated (100+ words)
- [ ] Task creation form validates title + description
- [ ] Server-side API validation implemented
- [ ] User-friendly error messages in all 3 locales
- [ ] Obfuscation detection working (leetspeak, symbol substitution)
- [ ] False positive rate acceptable (< 1%)
- [ ] Unit tests for profanity service

---

## Testing Strategy

### Unit Tests
```typescript
describe('Profanity Filter', () => {
  it('should detect English profanity', async () => {
    const result = await checkTextForProfanity('This is a bad word test', 'en');
    expect(result.hasProfanity).toBe(true);
  });

  it('should detect Russian profanity', async () => {
    const result = await checkTextForProfanity('Это плохое слово', 'ru');
    expect(result.hasProfanity).toBe(true);
  });

  it('should detect obfuscated profanity', async () => {
    const result = await checkTextForProfanity('f*ck', 'en');
    expect(result.hasProfanity).toBe(true);
  });

  it('should not flag clean text', async () => {
    const result = await checkTextForProfanity('I need help fixing my roof', 'en');
    expect(result.hasProfanity).toBe(false);
  });
});
```

### Manual Testing
- [ ] Test with known profanity in all 4 languages
- [ ] Test obfuscation patterns (f*ck, sh1t, @$$)
- [ ] Test false positive scenarios (Scunthorpe, etc.)
- [ ] Test form validation UX
- [ ] Test error message display

---

## Resources & References

### npm Packages
- [glin-profanity](https://www.npmjs.com/package/glin-profanity) - Main library
- [@2toad/profanity](https://www.npmjs.com/package/@2toad/profanity) - Alternative
- [obscenity](https://github.com/jo3-l/obscenity) - Transformer-based

### Word Lists
- [swearify](https://github.com/Behiwzad/swearify) - Bulgarian (135 words)
- [washyourmouthoutwithsoap](https://github.com/thisandagain/washyourmouthoutwithsoap) - Multi-language
- [profanity-list](https://github.com/dsojevic/profanity-list) - Structured JSON
- [rominf/profanity-filter](https://github.com/rominf/profanity-filter) - Russian source

### Documentation
- [glin-profanity docs](https://www.typeweaver.com/docs/glin-profanity)
- [glin-profanity demo](https://www.glincker.com/tools/glin-profanity)

---

## Priority
**Medium** - Important for platform safety but not blocking for MVP launch

## Estimated Effort
- **Phase 1 (Basic):** 4-6 hours
- **Phase 2 (Extended):** 8-12 hours
- **Phase 3 (Admin):** 10-15 hours
- **Total:** 22-33 hours

## Dependencies
- Task creation form must be stable
- Translation infrastructure in place
- API routes for tasks implemented
