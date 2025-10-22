# Currency Conversion: BGN to Euro (€)

## Task Description
Replace all Bulgarian Lev (BGN/лв) currency references with Euro (€) symbol throughout the application.

## Current State
The application currently uses:
- **English**: `BGN` (Bulgarian Lev)
- **Bulgarian**: `лв` or `лв.` (лева)
- **Russian**: `лв` or `лв.` (лева)
- **Icons**: `Banknote` icon from Lucide React (currency-agnostic)

## Requirements

### 1. Update Translation Files
Replace all currency references in `/src/lib/intl/[lang]/`:

**Files to update:**
- `en/profile.ts` - Line 18: `'Hourly Rate (BGN)'` → `'Hourly Rate (EUR)'`
- `en/tasks.ts` - Line 54: `'Up to 500 BGN'` → `'Up to 500 EUR'`
- `en/applications.ts` - Lines 6, 177: `BGN` → `EUR`
- `bg/profile.ts` - Line 18: `'Часова ставка (лв.)'` → `'Часова ставка (€)'`
- `bg/tasks.ts` - Line 54: `'До 500 лв'` → `'До 500 €'`
- `bg/applications.ts` - Line 177: `'{{price}} лв'` → `'{{price}} €'`
- `ru/profile.ts` - Line 18: `'Почасовая ставка (лв.)'` → `'Почасовая ставка (€)'`
- `ru/tasks.ts` - Line 54: `'До 500 лв'` → `'До 500 €'`
- `ru/applications.ts` - Line 177: `'{{price}} лв'` → `'{{price}} €'`

### 2. Update Mock Data
Search and replace BGN/лв with EUR/€ in:
- `/src/lib/mock-data/applications.ts`
- `/src/features/applications/lib/my-applications-data.ts`
- Any other mock data files with currency values

### 3. Update Database Schema (if applicable)
Check `/src/database/schema.ts` for any currency-related fields or comments that reference BGN.

### 4. Update Documentation
- Update `CLAUDE.md` if it mentions BGN anywhere
- Update `README.md` if it has currency examples
- Check `/docs/` folder for any currency references

### 5. Validation Script
Run the translation validation script to ensure consistency:
```bash
npx tsx src/lib/intl/validate-translations.ts
```

## Acceptance Criteria
- [ ] All English translations use `EUR` or `€`
- [ ] All Bulgarian translations use `€`
- [ ] All Russian translations use `€`
- [ ] Translation validation script passes
- [ ] Mock data uses EUR values
- [ ] No references to BGN, лв, or Lev remain in the codebase
- [ ] All currency displays show Euro symbol (€)

## Technical Notes
- The `Banknote` icon is already currency-agnostic and doesn't need changes
- Consider if price values need adjustment (1 BGN ≈ 0.51 EUR at time of writing)
- Update any hardcoded budget ranges if using actual currency values

## Search Commands
```bash
# Find all BGN references
grep -r "BGN" src/

# Find all лв references
grep -r "лв" src/

# Find all files with currency in mock data
grep -r "price.*BGN\|budget.*BGN" src/
```

## Priority
**Medium** - This is a future enhancement for potential EU market expansion

## Estimated Effort
~2-3 hours (mostly find-and-replace with testing)

## Dependencies
- None - purely cosmetic change
- May want to coordinate with marketing/product team before implementation
