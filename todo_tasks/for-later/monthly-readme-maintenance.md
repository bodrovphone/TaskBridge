# Monthly README.md Maintenance

## Task Description
Regular monthly review and update of the README.md file to ensure all documentation remains accurate and up-to-date with the current state of the project.

## Schedule
**Frequency**: Monthly (1st of each month)
**Estimated Time**: 30-45 minutes

## Maintenance Checklist

### 1. Routes Documentation
- [ ] Verify all routes in the route tree are still accurate
- [ ] Check for any new routes added in `/src/app/[lang]/`
- [ ] Update route descriptions if functionality changed
- [ ] Verify server/client component status is correct
- [ ] Confirm mobile optimization status
- [ ] Check translation completeness for new routes

### 2. User Flow Diagrams
- [ ] Review all 5 Mermaid diagrams for accuracy
- [ ] Update flows if user journeys have changed
- [ ] Add new diagrams for significant new features
- [ ] Verify authentication flow matches current implementation

### 3. Tech Stack
- [ ] Review `package.json` for major dependency updates
- [ ] Update version numbers for key dependencies
- [ ] Add any new significant libraries
- [ ] Remove deprecated or unused dependencies

### 4. Features List
- [ ] Add newly completed features
- [ ] Update feature status (beta, complete, etc.)
- [ ] Remove planned features that were deprioritized
- [ ] Verify all listed features still work

### 5. Project Structure
- [ ] Check if directory structure has changed
- [ ] Update path aliases if new ones were added
- [ ] Verify `/src/features/` structure is current
- [ ] Update component organization if refactored

### 6. Internationalization
- [ ] Update translation key counts (`en.ts`, `bg.ts`, `ru.ts`)
- [ ] Verify locale detection strategy is current
- [ ] Check if new translation namespaces were added
- [ ] Update translation file locations if changed

### 7. Authentication Status
- [ ] Update authentication implementation status
- [ ] Document any new auth features added
- [ ] Update list of protected routes
- [ ] Revise migration plan if auth was enabled

### 8. Database Schema
- [ ] Review `/src/database/schema.ts` for changes
- [ ] Update entity definitions if schema changed
- [ ] Add new tables/entities if created
- [ ] Update field descriptions for accuracy

### 9. Development Section
- [ ] Update component refactoring progress
- [ ] Add new completed refactorings
- [ ] Update line count reductions
- [ ] Revise next priority items

### 10. Scripts and Commands
- [ ] Verify all npm scripts still work
- [ ] Add any new scripts added to `package.json`
- [ ] Update command descriptions if changed
- [ ] Test example commands for accuracy

### 11. Deployment Configuration
- [ ] Verify Vercel configuration is current
- [ ] Update environment variables list
- [ ] Check build commands are correct
- [ ] Update deployment instructions if changed

### 12. General Updates
- [ ] Update project version if applicable
- [ ] Add any new badges or shields
- [ ] Fix any broken links
- [ ] Update screenshots or demos if available
- [ ] Review and update "Contributing" section
- [ ] Check for typos or formatting issues

## Quick Update Commands

```bash
# Check for new routes
find src/app -type f -name "page.tsx"

# Count translation keys
grep -o '"[^"]*":' src/lib/intl/en.ts | wc -l
grep -o '"[^"]*":' src/lib/intl/bg.ts | wc -l
grep -o '"[^"]*":' src/lib/intl/ru.ts | wc -l

# Check line counts for large files
wc -l src/components/pages/professionals-page.tsx
wc -l src/components/pages/landing-page.tsx
wc -l src/components/pages/browse-tasks-page.tsx

# List all npm scripts
npm run

# Check Node version requirement
node --version
```

## Automation Helper

To get a summary of changes since last README update:

```bash
# Check git log since last README update
git log --oneline --since="1 month ago" -- src/

# Check for new files added
git diff --name-status HEAD@{1.month.ago} HEAD -- src/

# Check package.json changes
git log -p --since="1 month ago" -- package.json
```

## Documentation Sources

When updating, reference these files:
- `/CLAUDE.md` - Development guidelines and architecture
- `/PRD.md` - Product requirements
- `/package.json` - Dependencies and scripts
- `/src/database/schema.ts` - Database schema
- `/src/lib/intl/*.ts` - Translation files
- `/src/app/` - Route structure
- `/docs/` - Additional documentation

## After Completion

- [ ] Commit README.md changes with descriptive message
- [ ] Note date of last maintenance in commit message
- [ ] Move this task back to `todo_tasks/` for next month
- [ ] Set calendar reminder for next month

## Priority
High - Critical for project documentation and onboarding

## Notes
- This is a **recurring task** - always move back to `todo_tasks/` after completion
- Keep a log of significant changes in commit messages
- If major features are added, consider updating user flow diagrams
- Tag README updates in commits: `docs: monthly README maintenance - [Month Year]`
