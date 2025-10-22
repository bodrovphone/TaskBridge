# Fix Russian Translation Extra Keys

## Task Description
Remove 55 extra keys from Russian translation files that don't exist in the English reference translations. These keys were part of an older translation structure and need to be cleaned up for consistency.

## Problem
The validation script identified 55 extra keys in Russian translations that are not present in English. These need to be removed or commented out to maintain consistency across all languages.

## Extra Keys to Remove

All keys start with `myApplications.` prefix and are located in `/src/lib/intl/ru/applications.ts`:

1. `myApplications.appliedOn`
2. `myApplications.deleteApplication`
3. `myApplications.detail.applicationDate`
4. `myApplications.detail.applicationWithdrawn`
5. `myApplications.detail.awaitingReview`
6. `myApplications.detail.cannotReapply`
7. `myApplications.detail.completeTask`
8. `myApplications.detail.completedOn`
9. `myApplications.detail.confirmStartDate`
10. `myApplications.detail.contactInfo`
... and 45 more similar keys

## Solution

Run the validation script to get the full list:
```bash
npx tsx src/lib/intl/validate-translations.ts
```

Then either:
1. **Comment out** the extra keys (prefix with `//`) for future reference
2. **Delete** the extra keys if they're truly obsolete

After cleanup, run validation again to confirm:
```bash
npx tsx src/lib/intl/validate-translations.ts
```

## Acceptance Criteria

- [ ] All 55 extra keys identified and handled (commented out or removed)
- [ ] Validation script passes with no errors
- [ ] Russian translations have exactly 1203 keys (matching English and Bulgarian)
- [ ] Application still compiles and runs without errors

## Priority
**Low** - Does not block development, but should be cleaned up for maintainability

## Estimated Effort
30 minutes - straightforward cleanup task

## Notes
- Keep commented keys for 1-2 sprints in case they're needed
- After confirming app works without them, they can be fully removed
- This is technical debt from the old monolithic structure
