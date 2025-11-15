# Consolidate useAuth Imports Across App

## Task Description
Replace all instances of `import { useAuth } from '@/features/auth'` with the direct hook import `import { useAuth } from '@/features/auth/hooks/use-auth'` to ensure consistent access to the full authentication API including `authenticatedFetch` and `notificationToken`.

## Background
We currently have two different `useAuth` implementations:
1. **Full Hook** (`@/features/auth/hooks/use-auth.ts`) - Includes `authenticatedFetch`, `notificationToken`, and full auth functionality
2. **Context Wrapper** (`@/features/auth/components/auth-provider.tsx`) - Limited interface missing `authenticatedFetch` and `notificationToken`

The barrel export (`@/features/auth/index.ts`) currently exports the limited context wrapper, causing inconsistent behavior across the app.

## Requirements

### 1. Find All Imports
- Search codebase for all instances of `import { useAuth } from '@/features/auth'`
- Document which files are using the limited version

### 2. Replace Imports
- Change each occurrence to: `import { useAuth } from '@/features/auth/hooks/use-auth'`
- Verify no TypeScript errors after replacement
- Ensure components still work correctly

### 3. Files Already Fixed
- ✅ `/src/app/[lang]/tasks/work/hooks/use-work-tasks.ts` (fixed by linter)

### 4. Update Barrel Export (Optional)
Consider updating `/src/features/auth/index.ts` to export the full hook instead:
```typescript
export { AuthProvider } from './components/auth-provider'
export { useAuth } from './hooks/use-auth'  // Export full hook instead of context wrapper
```

## Acceptance Criteria
- [ ] All `useAuth` imports point to `@/features/auth/hooks/use-auth`
- [ ] No TypeScript errors after changes
- [ ] All components using `authenticatedFetch` continue to work
- [ ] Build completes successfully
- [ ] Type-check passes

## Technical Notes

**Search Command:**
```bash
grep -r "from '@/features/auth'" src/ --include="*.tsx" --include="*.ts"
```

**Files to Check:**
- Profile pages
- Task pages (browse, posted, applications, work)
- Auth components (login, signup)
- Any component using authentication

**Why This Matters:**
- Components need access to `authenticatedFetch` for API calls with notification tokens
- Missing `notificationToken` prevents proper handling of notification-based authentication
- Inconsistent imports lead to runtime errors when trying to destructure missing properties

## Priority
**Medium** - Affects authentication consistency across the app, but workaround exists (direct import)

## Estimated Effort
~30 minutes (find and replace across 10-20 files)
