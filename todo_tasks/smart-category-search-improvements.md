# Smart Category Search Improvements

## Task Description
Fix multiple translation and UX issues in the task creation form's smart category matching feature.

## Issues Identified

### 1. Missing Translations - Title Input Section
- **Location:** `title-category-section.tsx`
- "What do you need done? *" label not translated
- Input placeholder "e.g., Fix a leaking faucet in the bathroom" not translated
- Helper text "Be specific - this helps us match you with the right professionals" not translated

### 2. Keyword Matching Algorithm Improvement
- **Location:** `category-keywords.ts` / `helpers.ts`
- Current: Searches for exact phrase match
- Problem: "need an electric" doesn't match "electrician"
- **Solution:** Implement word-by-word matching
  - Split input into words: ["need", "an", "electric"]
  - Check if any word STARTS WITH or CONTAINS a keyword root
  - "electric" should fuzzy-match "electrician"
  - Consider stemming or prefix matching

### 3. Missing Translations - Category Suggestion UI
- Suggestion card text not translated
- "This looks like:" label
- "Yes, correct" / "Choose different" buttons
- "No match found" helper text

### 4. Mobile UX - Suggestion Popup Visibility
- **Problem:** On mobile with virtual keyboard open, suggestion popup appears below the fold
- **Current behavior:** Popup shows below input, gets hidden by keyboard
- **Solutions to consider:**
  - Option A: Show suggestions ABOVE the input field
  - Option B: Auto-scroll page down when suggestions appear
  - Option C: Use a bottom sheet/modal for suggestions on mobile
  - Option D: Collapse keyboard and show inline suggestions

### 5. Additional Translation Keys Needed
```typescript
// Add to tasks.ts or createTask namespace
'createTask.titleInput.label': 'What do you need done?',
'createTask.titleInput.placeholder': 'e.g., Fix a leaking faucet in the bathroom',
'createTask.titleInput.helper': 'Be specific - this helps us match you with the right professionals',
'createTask.suggestion.looksLike': 'This looks like:',
'createTask.suggestion.yesCorrect': 'Yes, correct',
'createTask.suggestion.chooseDifferent': 'Choose different',
'createTask.suggestion.noMatch': 'No matching category found',
'createTask.suggestion.searching': 'Finding the best category...',
```

## Acceptance Criteria
- [ ] All text in title input section translated (EN/BG/RU)
- [ ] Keyword matching works per-word (partial/prefix matching)
- [ ] "electric" matches "electrician", "plumb" matches "plumber"
- [ ] All suggestion UI text translated
- [ ] Suggestions visible on mobile with keyboard open
- [ ] Test on iPhone Safari with virtual keyboard

## Technical Notes

### Keyword Matching Enhancement
```typescript
// Current approach (exact/contains)
if (keyword.includes(query)) // "electrician".includes("electric") = false

// Improved approach (prefix matching)
const words = query.split(/\s+/)
for (const word of words) {
  if (word.length >= 3) {
    // Check if any keyword STARTS WITH this word
    if (keyword.startsWith(word)) // "electrician".startsWith("electric") = true
    // Or if this word STARTS WITH the keyword
    if (word.startsWith(keyword)) // useful for short keywords
  }
}
```

### Mobile Suggestions Positioning
- Detect if virtual keyboard is likely open (input focused + mobile viewport)
- Either:
  - Position suggestions above input using CSS `bottom: 100%`
  - Or use `scrollIntoView()` to ensure suggestions are visible
  - Or show as a floating overlay near top of screen

## Files to Modify
- `/src/app/[lang]/create-task/components/title-category-section.tsx`
- `/src/features/categories/lib/helpers.ts`
- `/src/features/categories/lib/category-keywords.ts`
- `/src/lib/intl/en/tasks.ts`
- `/src/lib/intl/bg/tasks.ts`
- `/src/lib/intl/ru/tasks.ts`

## Priority
High - Affects core user flow and internationalization

## Screenshots
- See conversation for mobile screenshot showing untranslated text
