# Professional Onboarding Flow

## Problem Statement

**Current state (Dec 2025):** 40 ad clicks → 3-4 signups → 0 completed profiles → 0 applications

**Root Cause:** Chicken-egg dilemma + no clear onboarding:
- Users sign up but don't know what to do next
- No tasks → Professionals can't apply → Leave
- No professionals → Customers don't post → Platform looks dead

**Solution:** Capture user intent, guide through profile completion, then provide value (tasks or notifications).

---

## Implementation Phases

This task is broken into 5 phases. Complete them in order.

| Phase | What | Dependency |
|-------|------|------------|
| 0 | Database setup | None |
| 1 | Intent capture (buttons) | Phase 0 |
| 2 | Auth callback (save + redirect) | Phase 1 |
| 3 | Profile onboarding UI | Phase 2 |
| 4 | Incomplete profile reminders | Phase 3 |
| 5 | New task notifications | Phase 0 |

---

## Phase 0: Database Setup

**Do this first.** All other phases depend on these columns.

```sql
-- Run in Supabase SQL Editor

-- Track if user signed up as professional or customer
ALTER TABLE users ADD COLUMN registration_intent TEXT;
-- Values: 'professional', 'customer', NULL (unknown/legacy)

-- Track when we sent profile completion reminder (one-time)
ALTER TABLE users ADD COLUMN profile_reminder_sent_at TIMESTAMPTZ;

-- Track when we last notified about a new task (7-day cooldown)
ALTER TABLE users ADD COLUMN last_task_notification_at TIMESTAMPTZ;
```

| Column | Purpose | Used In |
|--------|---------|---------|
| `registration_intent` | Know if user is professional or customer | Phase 2, 4 |
| `profile_reminder_sent_at` | Prevent duplicate reminder emails | Phase 4 |
| `last_task_notification_at` | 7-day cooldown between task notifications | Phase 5 |

### Acceptance Criteria - Phase 0
- [ ] Run migration in Supabase
- [ ] Verify columns exist in users table
- [ ] Update TypeScript types if needed

---

## Phase 1: Intent Capture (Buttons)

Capture user intent BEFORE they sign up, so we know how to guide them after.

### Two Entry Points

```
┌─────────────────────────────────────────────────────────────┐
│                    User lands on site                        │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
   "Become a Professional"            Browse tasks freely
   (store intent=professional)               │
              │                               ▼
              │                    Find task → "Apply"
              │                    (store returnTo URL)
              │                               │
              └───────────────┬───────────────┘
                              ▼
                      Auth modal/signup
```

### 1A. "Become a Professional" Buttons

Add `?intent=professional` param to all CTA buttons:
- Landing page hero section
- Header/navbar "Become a Professional" link
- Any promotional sections

**Before auth modal opens:**
```typescript
// Store intent in localStorage (survives OAuth redirect)
localStorage.setItem('trudify_registration_intent', 'professional')
```

### 1B. "Apply" Button on Task Detail

When unauthenticated user clicks "Apply":
```typescript
// Store the task URL they want to return to
localStorage.setItem('trudify_return_to', window.location.pathname)
// e.g., '/bg/tasks/abc123'
```

Then trigger auth modal.

### Acceptance Criteria - Phase 1
- [ ] "Become a Professional" buttons have `?intent=professional` param
- [ ] Clicking these buttons stores `trudify_registration_intent` in localStorage
- [ ] "Apply" button (when not logged in) stores `trudify_return_to` in localStorage
- [ ] Auth modal opens after storing

**Files to modify:**
- Landing page hero section
- Header/Navbar component
- Task detail page - Apply button (`/app/[lang]/tasks/[id]/`)
- Auth slide-over component

---

## Phase 2: Auth Callback (Save Intent + Redirect)

After successful registration, read intent from localStorage, save to DB, then redirect.

### Flow

```
OAuth callback received
    ↓
Read from localStorage:
  - trudify_return_to (task URL)
  - trudify_registration_intent ('professional')
    ↓
Save to database:
  registration_intent = 'professional'
    ↓
Clear localStorage
    ↓
Redirect based on priority:
  1. Has returnTo → /profile?onboarding=true&returnTo=...
  2. Has intent=professional → /profile?onboarding=true
  3. Neither → / (homepage, likely a customer)
```

### Implementation

```typescript
// In /app/auth/callback/route.ts (after successful auth)

const returnTo = localStorage.getItem('trudify_return_to')
const intent = localStorage.getItem('trudify_registration_intent')

// Save intent to database (important for future emails!)
if (intent === 'professional' || returnTo) {
  // If they clicked Apply, they're also a professional
  await supabase
    .from('users')
    .update({ registration_intent: 'professional' })
    .eq('id', user.id)
}

// Clear localStorage
localStorage.removeItem('trudify_return_to')
localStorage.removeItem('trudify_registration_intent')

// Redirect
if (returnTo) {
  redirect(`/profile?onboarding=true&returnTo=${encodeURIComponent(returnTo)}`)
} else if (intent === 'professional') {
  redirect(`/profile?onboarding=true`)
} else {
  redirect(`/`)  // Customer or unknown
}
```

### Acceptance Criteria - Phase 2
- [ ] Auth callback reads localStorage values
- [ ] `registration_intent = 'professional'` saved to DB for professionals
- [ ] localStorage cleared after reading
- [ ] Redirect to `/profile?onboarding=true` with correct params
- [ ] Customers (no intent) redirect to homepage

**Files to modify:**
- Auth callback route (`/app/auth/callback/route.ts`)

---

## Phase 3: Profile Onboarding UI

When user lands on `/profile?onboarding=true`, show guided experience.

### Context-Aware Messaging

| URL Params | Message |
|------------|---------|
| `?onboarding=true&returnTo=/tasks/123` | "Complete your profile to apply to this task" |
| `?onboarding=true` (no returnTo) | "Complete your profile to get notified of new tasks" |

### UI Elements

1. **Welcome banner** - Context-aware message (see above)
2. **Tip component** - Guide through required fields step by step
   - See `tip-component-user-guide-tour.md` for implementation
3. **Highlight required fields:**
   - Professional title (what do you do?)
   - Bio/description (tell customers about yourself)
   - Category (what services do you offer?)
4. **Progress indicator** - Show completion status
5. **"Continue" button** - Disabled until required fields filled

### Post-Profile Redirect

```typescript
// On successful save
const returnTo = searchParams.get('returnTo')

if (returnTo && isProfileComplete(user)) {
  router.push(returnTo)  // Back to the task they wanted
} else if (isProfileComplete(user)) {
  router.push('/browse-tasks')
  // Show toast: "Profile complete! Browse tasks or we'll notify you of new ones"
}
```

### Helper Function

```typescript
const isProfileComplete = (user: User): boolean => {
  return Boolean(
    user.title?.trim() &&
    user.bio?.trim() &&
    user.professional_categories?.length > 0
  )
}
```

### "Empty Platform" Handling

If no tasks exist when professional completes profile:
- Show message: "You're all set! We'll notify you when tasks in [category] are posted in [city]"
- This promise is fulfilled by Phase 5 (notifications)

### Acceptance Criteria - Phase 3
- [ ] Profile page detects `?onboarding=true` param
- [ ] Welcome banner shows context-aware message
- [ ] Tip component guides through required fields
- [ ] Required fields (title, bio, category) are highlighted
- [ ] "Continue" button disabled until profile complete
- [ ] After save with `returnTo`, user redirects to that URL
- [ ] After save without `returnTo`, user redirects to `/browse-tasks`
- [ ] Edge case: if profile already complete, skip onboarding UI

**Files to modify:**
- Profile page (`/app/[lang]/profile/`)
- Browse tasks page - empty state message

---

## Phase 4: Incomplete Profile Reminders

If professional leaves without completing profile, remind them gently.

### Reminder Strategy

```
Professional signs up → Profile onboarding → Leaves incomplete?
                                                    ↓
                                ┌───────────────────┴───────────────────┐
                                ▼                                       ▼
                           In-app                                  After 24h
                      Badge on avatar                          ONE email reminder
                     (always visible)                        (never send again)
```

### 4A. Visual Indicator (In-App)

Show badge on avatar when profile is incomplete:

```typescript
// In header avatar component
const showBadge = user?.registration_intent === 'professional' && !isProfileComplete(user)

<div className="relative">
  <Avatar ... />
  {showBadge && (
    <span
      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
      title="Complete your profile to apply"
    />
  )}
</div>
```

- Click navigates to `/profile?onboarding=true`
- Only show for professionals (check `registration_intent`)

### 4B. Email Reminder (24h Later)

**Only for professionals** who haven't completed profile after 24 hours.

**Setup Vercel Cron:**

1. Create API route `/app/api/cron/profile-reminders/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Find professionals needing reminder
  const { data: users } = await supabase
    .from('users')
    .select('id, email, first_name')
    .eq('registration_intent', 'professional')  // Only professionals!
    .or('title.is.null,bio.is.null,professional_categories.is.null')
    .lt('created_at', twentyFourHoursAgo)
    .is('profile_reminder_sent_at', null)
    .limit(50)

  for (const user of users || []) {
    await sendProfileReminderEmail(user)

    await supabase
      .from('users')
      .update({ profile_reminder_sent_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  return Response.json({ sent: users?.length || 0 })
}
```

2. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/profile-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

3. Add environment variable: `CRON_SECRET`

**Email Template (Bulgarian):**
```
Subject: Довърши профила си в Trudify 🔧

Здравей!

Ти се регистрира в Trudify, но профилът ти не е завършен.

Остават само 3 полета:
✅ Какво правиш (заглавие)
✅ За теб (кратко описание)
✅ Категория услуги

👉 Довърши сега: [link to /profile?onboarding=true]

След това ще можеш да кандидатстваш за задачи и да печелиш!

Поздрави,
Екипът на Trudify
```

### What NOT to Do
- ❌ Multiple reminder emails (one is enough)
- ❌ Daily push notifications
- ❌ Block access to browse tasks
- ❌ Aggressive popups on every page

### Acceptance Criteria - Phase 4
- [ ] Red badge on avatar when profile incomplete (professionals only)
- [ ] Badge has tooltip: "Complete your profile to apply"
- [ ] Clicking badge → `/profile?onboarding=true`
- [ ] Vercel Cron job created (`/api/cron/profile-reminders`)
- [ ] Cron runs daily at 9 AM
- [ ] Query filters by `registration_intent = 'professional'`
- [ ] Email sent only ONCE (check `profile_reminder_sent_at`)
- [ ] `profile_reminder_sent_at` updated after sending

**Files to modify:**
- Header/Navbar - avatar component
- New: `/app/api/cron/profile-reminders/route.ts`
- `vercel.json` - cron config
- Email templates

---

## Phase 5: New Task Notifications

When a customer posts a new task, notify matched professionals.

### Flow

```
Customer creates task (status = 'open')
    ↓
Find matched professionals:
  - Category matches (required)
  - City matches (preferred, not required)
  - Profile is complete
  - NOT notified in last 7 days
    ↓
Select top 5 matches
    ↓
Send notification (Telegram or Email)
    ↓
Update last_task_notification_at
```

### Matching Logic

```typescript
const findMatchedProfessionals = async (task: Task) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Find professionals with matching category and complete profile
  const { data: professionals } = await supabase
    .from('users')
    .select('*')
    .eq('registration_intent', 'professional')
    .contains('professional_categories', [task.category])
    .not('title', 'is', null)
    .not('bio', 'is', null)
    .or(`last_task_notification_at.is.null,last_task_notification_at.lt.${sevenDaysAgo.toISOString()}`)
    .order('city', { ascending: task.city ? task.city : undefined })  // Prioritize same city
    .limit(5)

  return professionals || []
}
```

### Notification Content (Bulgarian)

```
🔔 Нова задача в [Category]!

"[Task Title]"
📍 [City]
💰 [Budget] лв.

👉 Виж и кандидатствай: [link]
```

### Rate Limiting Rules

| Rule | Value | Why |
|------|-------|-----|
| Max professionals per task | 5 | Don't spam everyone |
| Cooldown per professional | 7 days | Prevent notification fatigue |
| City matching | Preferred, not required | Ensures notifications even in small cities |

### Where to Trigger

Call `notifyMatchedProfessionals(task)` after:
- Task created with status = 'open'
- (Future: Task status changed to 'open' from draft)

### Acceptance Criteria - Phase 5
- [ ] Create `notifyMatchedProfessionals(task)` function
- [ ] Match by category (required)
- [ ] Prioritize same city (optional)
- [ ] Only professionals with complete profiles
- [ ] Limit to 5 professionals per task
- [ ] Check 7-day cooldown (`last_task_notification_at`)
- [ ] Add `newTaskInArea` template to telegram-notification.ts
- [ ] Send via Telegram (primary) or Email (fallback)
- [ ] Update `last_task_notification_at` after sending
- [ ] Trigger after task created with status = 'open'

**Files to modify:**
- New: notification function (e.g., `/lib/services/task-notifications.ts`)
- Telegram notification service - add template
- Task creation flow - add trigger

---

## Summary: All Acceptance Criteria

### Phase 0: Database ✅
- [ ] Add `registration_intent` column
- [ ] Add `profile_reminder_sent_at` column
- [ ] Add `last_task_notification_at` column

### Phase 1: Intent Capture ✅
- [ ] "Become a Professional" buttons store intent in localStorage
- [ ] "Apply" button stores returnTo URL in localStorage

### Phase 2: Auth Callback ✅
- [ ] Save `registration_intent` to DB
- [ ] Redirect with correct params

### Phase 3: Profile Onboarding ✅
- [ ] Onboarding UI with tip component
- [ ] Context-aware messaging
- [ ] Post-profile redirect (returnTo or browse-tasks)

### Phase 4: Incomplete Reminders ✅
- [ ] Avatar badge for incomplete profiles
- [ ] Vercel Cron for 24h email reminder
- [ ] Only target professionals

### Phase 5: Task Notifications ✅
- [ ] Notify 5 matched professionals per new task
- [ ] 7-day cooldown per professional
- [ ] Telegram/Email delivery

---

## Technical Reference

### localStorage Keys
```typescript
const RETURN_TO_KEY = 'trudify_return_to'
const INTENT_KEY = 'trudify_registration_intent'
```

### Profile Completion Check
```typescript
const isProfileComplete = (user: User): boolean => {
  return Boolean(
    user.title?.trim() &&
    user.bio?.trim() &&
    user.professional_categories?.length > 0
  )
}
```

### Files to Modify (Complete List)
- Landing page - hero CTA buttons
- Header/Navbar - registration CTAs + avatar badge
- Task detail page - Apply button
- Auth slide-over component
- Auth callback route (`/app/auth/callback/route.ts`)
- Profile page (`/app/[lang]/profile/`)
- Browse tasks page - empty state
- New: `/app/api/cron/profile-reminders/route.ts`
- New: `/lib/services/task-notifications.ts`
- Telegram notification service - new template
- `vercel.json` - cron config
- Email templates

---

## Priority

**High** - Direct impact on Google Ads ROI (€3/day spend, 0% conversion currently)

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Profile completion rate | 0% | >50% |
| Time to first application | Never | <24h |
| Ad spend efficiency | 0 applications | 2-4 applications/week |

## Related Documents

- Google Ads campaigns: `/docs/marketing/google-ads-campaigns.md`
- Telegram notifications: `/src/lib/services/telegram-notification.ts`
- Tip component: `/todo_tasks/tip-component-user-guide-tour.md`

## Decisions Made

- ✅ Save `registration_intent` to DB (not just localStorage) - enables targeted emails
- ✅ Use Vercel Cron for 24h reminder (free tier, once daily)
- ✅ Notification system in same task (transactional notifications already working)
- ✅ Rate limit: max 5 professionals per task, 7-day cooldown
- ✅ Individual notifications (not batched) - simpler, more immediate
