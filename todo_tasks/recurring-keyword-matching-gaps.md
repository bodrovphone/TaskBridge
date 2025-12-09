# Recurring: Keyword Matching Gaps

## Task Type
Recurring / Ongoing maintenance

## Description
Track and fix keyword matching gaps in the smart category search system. Users report phrases that don't match expected subcategories.

## Step 1: Check Automated Feedback First!

**Before manually fixing gaps, run the feedback script to see what users have reported:**

```bash
# Preview collected feedback (no changes)
npx tsx scripts/process-category-feedback.ts --dry-run
```

This pulls from `category_suggestions_feedback` table - records created when users manually select a category after keyword matching fails.

**Review the output carefully:**
- Some suggestions are valid (add them)
- Some are stale (already fixed)
- Some are misclassified junk (ignore)

**Related task:** See `todo_tasks/recurring-process-category-feedback.md` for full script documentation.

---

## Step 2: Manual Fixes

**Keywords file:** `/src/features/categories/lib/category-keywords.ts`

**How to fix manually:**
1. Identify the target subcategory slug (e.g., `plastering`, `event-host`)
2. Add missing keywords to the appropriate language array (en/bg/ru)
3. Consider verb forms, noun cases, and common misspellings

## Common Gap Patterns

| Pattern | Example | Solution |
|---------|---------|----------|
| Missing verb forms | "зашпаклевать" vs noun "шпаклевка" | Add infinitive + perfective forms |
| Missing noun cases | "стену" (accusative) vs "стена" | Add common case forms |
| Missing domain terms | "организация свадьбы" | Add domain-specific phrases |
| Typos/alternative spellings | "шпатлевка" vs "шпаклевка" | Add both variants |

## Fixed Issues Log

### 2025-12-09
**Manual reports:**
- "организация свадьбы" → Added to `event-host`: свадьба, организация свадьбы, организатор свадьбы, etc.
- "зашпаклевать стену" → Added to `plastering`: шпаклевать, зашпаклевать, стена, стены, стену, etc.

**From feedback DB (9 records processed):**
- "помыть унитаз" → Added to `apartment-cleaning`: помыть, унитаз, ванна, туалет, мыть
- Skipped stale: plastering, event-host (already fixed above)
- Skipped junk: ai-consulting (misclassified query)
- Skipped stale: transcription/psychology (already exists in `psychologist`)

---

## Pending Issues
<!-- Add new reported gaps here -->

## Notes
- Algorithm does partial/prefix matching (score 65-90), but exact keywords score 100
- Stop words are filtered: с, в, на, и, для, мне, нужен, нужна, нужно
- Minimum word length for matching: 3 characters
