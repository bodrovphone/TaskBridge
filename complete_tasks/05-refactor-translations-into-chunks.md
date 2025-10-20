# Refactor Translation Files into Chunks

## Task Description
Break down the large monolithic translation files (en.ts, bg.ts, ru.ts) into smaller, modular chunks organized by feature or domain. This will improve maintainability, reduce token usage when editing, and make it easier for teams to work on different features simultaneously.

## Problem
- Current translation files are becoming very large (1300+ lines each)
- Reading entire files consumes excessive tokens during AI-assisted development
- Difficult to find specific translation keys
- Risk of merge conflicts when multiple developers work on translations
- No clear organization by feature or domain

## Requirements

### File Structure
```
/src/lib/intl/
├── config.ts                    # i18n configuration (keeps modular imports)
├── en/
│   ├── index.ts                 # Barrel export combining all chunks
│   ├── common.ts                # Common UI terms (buttons, actions, etc.)
│   ├── navigation.ts            # Nav, header, footer
│   ├── landing.ts               # Landing page content
│   ├── tasks.ts                 # Task-related translations
│   ├── professionals.ts         # Professional listings and profiles
│   ├── applications.ts          # Application management
│   ├── task-completion.ts       # Task completion workflow
│   ├── auth.ts                  # Authentication and user management
│   ├── categories.ts            # Service categories
│   └── profile.ts               # User profile pages
├── bg/
│   ├── index.ts
│   ├── common.ts
│   └── ... (same structure as en/)
└── ru/
    ├── index.ts
    ├── common.ts
    └── ... (same structure as en/)
```

### Implementation Steps

1. **Create chunk files for English first** (as reference)
   - Split `/src/lib/intl/en.ts` into feature-based chunks
   - Each chunk exports a typed object with translations
   - Use clear naming convention (kebab-case file names)

2. **Create barrel exports**
   - Each language folder has `index.ts` that combines all chunks
   - Deep merge all chunks into single object
   - Maintain type safety with TypeScript

3. **Update i18n config**
   - Modify `/src/lib/intl/config.ts` to import from barrel exports
   - Ensure no breaking changes to existing translation usage

4. **Replicate for Bulgarian and Russian**
   - Use same chunk structure
   - Ensure all keys are present in all languages

5. **Add TypeScript types**
   - Create shared type definition for translation keys
   - Ensure type safety across all language chunks

## Acceptance Criteria

- [ ] Translation files split into 10-12 logical chunks per language
- [ ] Each chunk file is under 200 lines
- [ ] Barrel exports (`index.ts`) properly combine all chunks
- [ ] No breaking changes - existing code continues to work
- [ ] TypeScript types ensure all languages have same keys
- [ ] Can add new keys by editing only relevant chunk file
- [ ] Documentation updated in CLAUDE.md

## Technical Notes

### Example Chunk Structure
```typescript
// /src/lib/intl/en/task-completion.ts
export const taskCompletion = {
  'taskStatus.open': 'Open',
  'taskStatus.inProgress': 'In Progress',
  'taskCompletion.markCompleted': 'Mark as Completed',
  // ... all task completion keys
}
```

### Example Barrel Export
```typescript
// /src/lib/intl/en/index.ts
import { common } from './common'
import { taskCompletion } from './task-completion'
// ... other imports

export const en = {
  ...common,
  ...taskCompletion,
  // ... spread all chunks
}

export default en
```

### Benefits
- Easier to find and edit specific translations
- Reduced token usage (only read relevant chunk)
- Better team collaboration (fewer merge conflicts)
- Clear feature boundaries
- Can lazy-load chunks if needed in future

## Priority
**Medium** - Not blocking current development but will improve maintainability and developer experience

## Estimated Effort
2-3 hours (careful splitting and testing required)

## Dependencies
None - can be done independently

## Notes
- Keep consistent key naming across all chunks
- Consider using a script to validate all languages have same keys
- Document chunk organization in CLAUDE.md
