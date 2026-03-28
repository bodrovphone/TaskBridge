# Profile CRUD System - Audit & Implementation Plan

**Date:** 2025-10-31
**Status:** 🚧 Planning Phase
**Priority:** HIGH - Blocks production-ready profile management

---

## 🔍 Current State Analysis

### Authentication Status
✅ **WORKING**: Supabase Auth with Google/Facebook/Email (no email confirmation)
✅ **WORKING**: Session management via middleware
❌ **BROKEN**: Profile components use mockUser instead of real data
❌ **MISSING**: No UPDATE API endpoint for profile edits

### Existing Infrastructure

**API Routes:**
- ✅ `GET /api/auth/profile` - Fetch user profile (exists, working)
- ✅ `POST /api/auth/profile` - Create/sync profile after auth (exists, working)
- ❌ `PUT /api/profile` - Update user profile (MISSING!)
- ❌ `PUT /api/profile/professional` - Update professional-specific fields (MISSING!)

**Database Schema:**
- Location: `/docs/infrastructure/supabase-vercel-setup.md` (lines 200-252)
- Table: `public.users` with comprehensive fields
- Issues: Some UI fields don't map to database columns (see gaps below)

---

## 📊 Field Mapping Analysis

### Customer Profile Fields

| UI Field | Database Column | Status | Notes |
|----------|----------------|--------|-------|
| name | `full_name` | ✅ EXISTS | Direct mapping |
| email | `email` | ✅ EXISTS | Direct mapping |
| phone | `phone` | ✅ EXISTS | Direct mapping |
| location | `city` | ⚠️ PARTIAL | UI shows "Sofia, Bulgaria" but DB only has `city` |
| preferredLanguage | `preferred_language` | ✅ EXISTS | Enum: en/bg/ru |
| preferredContact | ❌ MISSING | ❌ MISSING | **Needs migration!** |
| memberSince | `created_at` | ✅ EXISTS | Computed from timestamp |
| tasksPosted | ❌ COMPUTED | ⚠️ NEEDS QUERY | Count from `tasks` table |
| tasksCompleted | `tasks_completed` | ✅ EXISTS | Cached counter |
| averageRating | `average_rating` | ✅ EXISTS | Cached decimal |
| totalSpent | ❌ MISSING | ❌ MISSING | **Needs migration!** Sum of completed task payments |
| isEmailVerified | `is_email_verified` | ✅ EXISTS | Boolean |
| isPhoneVerified | `is_phone_verified` | ✅ EXISTS | Boolean |

**Missing Database Fields:**
```sql
-- Add to users table:
preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone', 'sms', 'telegram')) DEFAULT 'email',
total_spent_bgn DECIMAL(10, 2) DEFAULT 0,
```

### Professional Profile Fields

| UI Field | Database Column | Status | Notes |
|----------|----------------|--------|-------|
| title | ❌ MISSING | ❌ MISSING | **Needs migration!** (e.g., "Professional Cleaning Services") |
| bio | `bio` | ✅ EXISTS | Text field |
| yearsExperience | `years_experience` | ⚠️ TYPE MISMATCH | UI uses '5-10' string, DB uses integer |
| serviceCategories | `service_categories` | ✅ EXISTS | TEXT[] array |
| availability | ❌ MISSING | ❌ MISSING | **Needs migration!** Enum: available/busy/unavailable |
| responseTime | `response_time_hours` | ✅ EXISTS | But UI shows '2h' string format |
| serviceArea | `city` | ⚠️ PARTIAL | UI uses array ['Sofia', 'Plovdiv'], DB has single city |
| paymentMethods | ❌ MISSING | ❌ MISSING | **Needs migration!** Array of payment types |
| languages | `preferred_language` | ⚠️ PARTIAL | DB has single language, UI wants array |
| weekdayHours | ❌ MISSING | ❌ MISSING | **Needs migration!** {start, end} |
| weekendHours | ❌ MISSING | ❌ MISSING | **Needs migration!** {start, end} |
| portfolio | ❌ MISSING | ❌ MISSING | **Needs migration!** JSONB or separate table |
| completedTasks | `tasks_completed` | ✅ EXISTS | Cached counter |
| averageRating | `average_rating` | ✅ EXISTS | Cached decimal |
| totalEarnings | ❌ MISSING | ❌ MISSING | **Needs migration!** Sum of earnings |
| profileViews | ❌ MISSING | ❌ MISSING | **Needs migration!** View counter |
| memberSince | `created_at` | ✅ EXISTS | Computed from timestamp |

**Missing Database Fields:**
```sql
-- Add to users table:
professional_title TEXT,
availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'unavailable')) DEFAULT 'available',
service_area_cities TEXT[], -- Multiple cities
payment_methods TEXT[], -- ['cash', 'bank_transfer', 'card', 'crypto']
languages TEXT[], -- Multiple languages
weekday_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}'::jsonb,
weekend_hours JSONB DEFAULT '{"start": "09:00", "end": "14:00"}'::jsonb,
portfolio JSONB DEFAULT '[]'::jsonb, -- Array of portfolio items
total_earnings_bgn DECIMAL(10, 2) DEFAULT 0,
profile_views INTEGER DEFAULT 0,
```

### Settings Modal Fields

| UI Field | Database Column | Status | Notes |
|----------|----------------|--------|-------|
| **Telegram Connection** | `telegram_id`, `telegram_username`, etc. | ✅ EXISTS | Already implemented |
| emailNotifications | `notification_preferences.email` | ⚠️ UNSTRUCTURED | Exists but not detailed |
| taskUpdates | `notification_preferences.taskUpdates` | ❌ MISSING | Needs structured JSONB |
| smsNotifications | `notification_preferences.sms` | ⚠️ UNSTRUCTURED | Exists but not detailed |
| pushNotifications | `notification_preferences.push` | ⚠️ UNSTRUCTURED | Exists but not detailed |
| weeklyDigest | `notification_preferences.weeklyDigest` | ❌ MISSING | Needs structured JSONB |
| marketingEmails | `notification_preferences.marketing` | ❌ MISSING | Needs structured JSONB |
| profileVisibility | `privacy_settings.profileVisible` | ❌ MISSING | Needs structured JSONB |
| showContactInfo | `privacy_settings.showContactInfo` | ❌ MISSING | Needs structured JSONB |

**Current JSONB Structure:**
```sql
notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb
privacy_settings JSONB DEFAULT '{"show_phone": false, "show_email": false}'::jsonb
```

**Needed JSONB Structure:**
```json
// notification_preferences
{
  "email": true,
  "sms": true,
  "push": true,
  "telegram": true,
  "taskUpdates": true,
  "weeklyDigest": false,
  "marketing": false
}

// privacy_settings
{
  "profileVisible": true,
  "showPhone": false,
  "showEmail": false,
  "showContactInfo": true
}
```

---

## 🚨 Critical Issues

### 1. MockUser in Production Code
**File:** `/src/app/[lang]/profile/components/profile-page-content.tsx`
**Issue:** Hardcoded mockUser used when real auth data should be available
**Impact:** Settings Modal was receiving wrong user ID, breaking Telegram connection

### 2. No UPDATE API Route
**Missing:** `PUT /api/profile` endpoint
**Impact:** Profile forms simulate API calls with setTimeout, no real persistence

### 3. Type Mismatches
- `yearsExperience`: UI uses string ('5-10'), DB uses integer
- `serviceArea`: UI uses array, DB uses single `city` string
- `languages`: UI uses array, DB uses single `preferred_language`

### 4. Inconsistent Data Access
- Customer profile component creates its own mock data
- Professional profile component creates its own mock data
- No shared data source or API layer

---

## 📋 Implementation Plan

### Phase 1: Database Migration (Priority: CRITICAL)

Create migration to add missing fields:

**File:** `/docs/migrations/001-profile-fields-expansion.sql`

```sql
-- =====================================================
-- Profile Fields Expansion Migration
-- Adds missing fields for customer and professional profiles
-- =====================================================

BEGIN;

-- Customer-specific additions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_contact TEXT
    CHECK (preferred_contact IN ('email', 'phone', 'sms', 'telegram'))
    DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS total_spent_bgn DECIMAL(10, 2) DEFAULT 0;

-- Professional-specific additions
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS professional_title TEXT,
  ADD COLUMN IF NOT EXISTS availability_status TEXT
    CHECK (availability_status IN ('available', 'busy', 'unavailable'))
    DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS service_area_cities TEXT[] DEFAULT ARRAY[city],
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[]
    DEFAULT ARRAY['cash', 'bank_transfer']::TEXT[],
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY[preferred_language]::TEXT[],
  ADD COLUMN IF NOT EXISTS weekday_hours JSONB
    DEFAULT '{"start": "08:00", "end": "18:00"}'::jsonb,
  ADD COLUMN IF NOT EXISTS weekend_hours JSONB
    DEFAULT '{"start": "09:00", "end": "14:00"}'::jsonb,
  ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_earnings_bgn DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Update notification_preferences structure for existing users
UPDATE public.users
SET notification_preferences = jsonb_build_object(
  'email', COALESCE(notification_preferences->>'email', 'true')::boolean,
  'sms', COALESCE(notification_preferences->>'sms', 'true')::boolean,
  'push', COALESCE(notification_preferences->>'push', 'true')::boolean,
  'telegram', true,
  'taskUpdates', true,
  'weeklyDigest', false,
  'marketing', false
)
WHERE notification_preferences IS NOT NULL;

-- Update privacy_settings structure for existing users
UPDATE public.users
SET privacy_settings = jsonb_build_object(
  'profileVisible', true,
  'showPhone', COALESCE(privacy_settings->>'show_phone', 'false')::boolean,
  'showEmail', COALESCE(privacy_settings->>'show_email', 'false')::boolean,
  'showContactInfo', true
)
WHERE privacy_settings IS NOT NULL;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_availability_status
  ON public.users(availability_status)
  WHERE user_type IN ('professional', 'both');

CREATE INDEX IF NOT EXISTS idx_users_service_area_cities
  ON public.users USING GIN(service_area_cities);

CREATE INDEX IF NOT EXISTS idx_users_payment_methods
  ON public.users USING GIN(payment_methods);

-- Add comments for documentation
COMMENT ON COLUMN public.users.preferred_contact IS 'User preferred contact method for notifications';
COMMENT ON COLUMN public.users.professional_title IS 'Professional headline/title shown on profile';
COMMENT ON COLUMN public.users.availability_status IS 'Current availability for taking new tasks';
COMMENT ON COLUMN public.users.service_area_cities IS 'Cities where professional offers services';
COMMENT ON COLUMN public.users.portfolio IS 'Array of portfolio items with before/after images';

COMMIT;
```

**Rollback Script:**
```sql
BEGIN;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS preferred_contact,
  DROP COLUMN IF EXISTS total_spent_bgn,
  DROP COLUMN IF EXISTS professional_title,
  DROP COLUMN IF EXISTS availability_status,
  DROP COLUMN IF EXISTS service_area_cities,
  DROP COLUMN IF EXISTS payment_methods,
  DROP COLUMN IF EXISTS languages,
  DROP COLUMN IF EXISTS weekday_hours,
  DROP COLUMN IF EXISTS weekend_hours,
  DROP COLUMN IF EXISTS portfolio,
  DROP COLUMN IF EXISTS total_earnings_bgn,
  DROP COLUMN IF EXISTS profile_views;

COMMIT;
```

### Phase 2: Update Type Definitions

**File:** `/src/server/domain/user/user.types.ts` (already has Telegram fields, expand it)

Add missing fields to `UserProfile` and `UpdateUserProfileDto` interfaces.

### Phase 3: Create Profile Update API

**New File:** `/src/app/api/profile/route.ts`

```typescript
/**
 * Profile Management API
 * Handles GET (current user) and PUT (update profile)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  // Redirect to existing auth profile endpoint
  return NextResponse.redirect(new URL('/api/auth/profile', request.url))
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  // Implementation here
}
```

### Phase 4: Update Profile Components

1. Remove mockUser
2. Use `profile` from `useAuth()` hook
3. Wire up real API calls
4. Add loading states and error handling

### Phase 5: Testing

1. Test customer profile updates
2. Test professional profile updates
3. Test settings modal updates
4. Verify data persistence in Supabase

---

## 🎯 Next Steps

1. **Review this document** - Ensure all stakeholders agree on field mappings
2. **Run migration** - Apply SQL to Supabase database
3. **Update types** - Expand TypeScript interfaces
4. **Build API** - Create PUT endpoint for profile updates
5. **Update UI** - Remove mockUser, use real data
6. **Test** - Verify full CRUD cycle works

---

## 📝 Notes

- **portfolio field**: Using JSONB for now, consider separate `professional_portfolio` table if needs grow
- **years_experience**: Keep as integer in DB, format as string in UI (1-3, 3-5, 5-10, 10+)
- **service_area_cities**: Using array to support multiple cities per professional
- **languages**: Array to support multilingual professionals
- **notification_preferences & privacy_settings**: Enhanced JSONB structure, backward compatible

---

## ✅ Success Criteria

- [ ] Database migration applied successfully
- [ ] All profile fields map to database columns
- [ ] PUT /api/profile endpoint returns 200 OK
- [ ] Customer profile form saves and reloads data
- [ ] Professional profile form saves and reloads data
- [ ] Settings modal saves and reloads preferences
- [ ] No mockUser references in code
- [ ] Type-safe throughout (no `as any`)
- [ ] Loading states work correctly
- [ ] Error messages display properly
