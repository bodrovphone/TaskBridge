# Authentication Cleanup Audit

Now that real Supabase authentication is working, this document tracks all mock/fallback code that needs to be updated or removed.

## ✅ Status: COMPLETE

**All auth migration tasks are complete!**
- ✅ All 7 files using old mock auth have been updated to use real auth
- ✅ Review enforcement logic commented out (ready for future implementation)
- ✅ Old mock auth hook deleted (`/src/hooks/use-auth.ts`)
- ✅ All type checks pass without errors
- ⏳ Remaining: Manual testing of auth flows

---

## 🔴 CRITICAL - Must Fix Now

These files use the **old mock auth hook** and need to be updated to use real auth:

### 1. ❌ `/src/hooks/use-auth.ts` - Old Mock Auth Hook
**Status**: Currently being imported by 4 files
**Action**: Delete this file after updating all imports
**Impact**: Breaking - causes confusion between mock and real auth

### 2. ❌ `/src/components/common/header.tsx`
**Current**: `import { useAuth } from '@/hooks/use-auth'` (mock)
**Fix**: Change to `import { useAuth } from '@/features/auth'` (real)
**Impact**: High - header shows wrong user state

### 3. ❌ `/src/hooks/use-create-task.ts`
**Current**: `import { useAuth } from '@/hooks/use-auth'` (mock)
**Fix**: Change to `import { useAuth } from '@/features/auth'` (real)
**Impact**: High - task creation won't be associated with real user

### 4. ❌ `/src/components/ui/user-avatar-dropdown.tsx`
**Current**: `import { useAuth } from '@/hooks/use-auth'` (mock)
**Fix**: Change to `import { useAuth } from '@/features/auth'` (real)
**Impact**: High - user menu shows mock user

### 5. ❌ `/src/app/[lang]/tasks/[id]/components/privacy-toggle.tsx`
**Current**: `import { useAuth } from '@/hooks/use-auth'` (mock)
**Fix**: Change to `import { useAuth } from '@/features/auth'` (real)
**Impact**: Medium - privacy toggle won't work correctly

---

## 🟡 IMPORTANT - Update Soon

These mock data files should be replaced with real API calls:

### 6. `/src/lib/mock-data/applications.ts`
**Purpose**: Mock applications data
**Action**: Replace with real API calls to fetch applications
**Timeline**: When building applications feature

### 7. `/src/features/applications/lib/my-applications-data.ts`
**Purpose**: Mock user applications
**Action**: Fetch from Supabase `applications` table
**Timeline**: When building applications feature

### 8. `/src/components/tasks/mock-questions.ts`
**Purpose**: Mock Q&A data for task detail page
**Action**: Replace with real API to fetch questions from database
**Timeline**: When building Q&A feature

### 9. `/src/components/tasks/mock-submit.ts`
**Purpose**: Mock task submission
**Action**: Replace with real API call
**Timeline**: When implementing task creation flow

---

## 🟢 KEEP FOR NOW - Useful Development Mocks

These files contain mock data that's useful for UI development and can stay until we build the full features:

### 10. ✅ `/src/features/professionals/lib/mock-professionals.ts`
**Purpose**: Mock professionals data for directory/listings
**Why Keep**: Useful for testing UI, no real professionals yet
**Action**: Keep until you have real professionals in database

### 11. ✅ `/src/features/reviews/lib/mock-reviews-data.ts`
**Purpose**: Mock reviews for professionals
**Why Keep**: Useful for testing review UI
**Action**: Keep until reviews feature is built

### 12. ✅ `/src/lib/mock-data.ts`
**Purpose**: General mock tasks/professionals
**Why Keep**: Useful for homepage/browse pages
**Action**: Keep until you populate database with real data

### 13. ✅ `/src/components/ui/fallback-avatar.tsx`
**Purpose**: Fallback avatar when user has no image
**Why Keep**: This is NOT a mock - it's a proper fallback component
**Action**: Keep forever - it's intentional fallback UI

---

## 📋 Summary

### Immediate Action Items (Do Now):
1. Update Header to use real auth
2. Update user-avatar-dropdown to use real auth
3. Update use-create-task to use real auth
4. Update privacy-toggle to use real auth
5. Delete old mock auth hook (`/src/hooks/use-auth.ts`)

**Estimated Time**: 30 minutes

### Later (When Building Features):
- Replace mock applications data with API calls
- Replace mock questions with API calls
- Replace mock submit with real task creation API

### Keep (Useful for Development):
- Mock professionals (until you add real ones)
- Mock reviews (until reviews feature built)
- Mock tasks (until you populate database)
- Fallback avatar (it's intentional, not a mock!)

---

## Migration Checklist

- [x] Update `/src/components/common/header.tsx` to use real auth ✅
- [x] Update `/src/components/ui/user-avatar-dropdown.tsx` to use real auth ✅
- [x] Update `/src/components/ui/user-avatar.tsx` to handle real UserProfile (fullName, avatarUrl) ✅
- [x] Update `/src/features/home/components/sections/hero-section.tsx` to use real auth ✅
- [x] Update `/src/app/[lang]/tasks/[id]/components/task-actions.tsx` to use real auth ✅
- [x] Update `/src/hooks/use-create-task.ts` to use real auth ✅
- [x] Update `/src/app/[lang]/tasks/[id]/components/privacy-toggle.tsx` to use real auth ✅
- [x] Update `/src/app/[lang]/categories/page.tsx` to use simplified hook ✅
- [x] Update `/src/features/home/components/sections/featured-tasks-section.tsx` to use simplified hook ✅
- [x] Update `/src/app/[lang]/tasks/posted/components/posted-tasks-page-content.tsx` to use simplified hook ✅
- [x] Verify all imports work correctly ✅
- [x] Run type check: `npm run type-check` ✅
- [x] Delete `/src/hooks/use-auth.ts` (old mock) ✅
- [ ] Test authentication flow in all updated components
- [ ] Test locally: sign in, navigate all pages, check user state

---

## Notes

- **fallback-avatar.tsx** is intentional UI fallback (NOT a mock to remove!)
- Keep mock data files until respective features are fully built with real APIs
- All mock professionals/tasks/reviews help with UI testing during development
