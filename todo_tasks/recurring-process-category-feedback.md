# Recurring: Process Category Feedback

## Schedule
**Monthly** - Run on the 1st of each month (or whenever convenient)

## Task Description
Process user feedback from manual category selections to improve keyword matching accuracy. When users type a task title and our keyword matching fails, they manually select a category. This feedback is saved and used to add missing keywords.

## How to Run

```bash
# Preview what would be updated (no changes made)
npx tsx scripts/process-category-feedback.ts --dry-run

# Process feedback and update keywords
npx tsx scripts/process-category-feedback.ts
```

## What the Script Does

1. **Fetches** all records from `category_suggestions_feedback` table
2. **Groups** by subcategory + language, counts occurrences
3. **Identifies** top 10 most common missing matches
4. **Extracts** keywords from user titles (filters stop words)
5. **Updates** `src/features/categories/lib/category-keywords.ts`
6. **Clears** the feedback table after processing

## Output Example

```
📊 Processing Category Feedback
================================

1️⃣ Fetching feedback records...
   Found 47 feedback records

2️⃣ Grouping feedback by subcategory and language...
   • locksmith (ru): 12 records
   • plumber (bg): 8 records
   • electrician (ru): 6 records
   ...

3️⃣ Extracting keywords from titles...

4️⃣ Updating category-keywords.ts...
  ✅ Added 3 keywords to locksmith (ru): врезать замок, поменять замок
  ✅ Added 2 keywords to plumber (bg): теча кран, запушен тоалетна

5️⃣ Clearing feedback table...
   ✅ Deleted 47 records

================================
✅ Processing complete!
```

## Requirements

- `.env.local` must contain:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Notes

- Always run with `--dry-run` first to preview changes
- The script adds max 5 keywords per subcategory per run
- Keywords that already exist are skipped (no duplicates)
- If a subcategory isn't in the keywords file, it's skipped with a warning

## History

| Date | Records | Keywords Added | Notes |
|------|---------|----------------|-------|
| _TBD_ | _0_ | _0_ | First run |

---

**Priority**: Low (recurring maintenance)
**Estimated time**: 5 minutes
