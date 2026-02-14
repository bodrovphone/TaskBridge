# Guest Create-Task Flow - Manual Test Plan

## Task Description
Manual test cases for the guest create-task flow introduced in the auth-at-submit update. Covers new user registration, existing user login, OAuth redirect, and expired token scenarios.

## Test Environment Setup
- Use incognito/private browser window for clean state
- Clear `trudify_pending_task` from localStorage between tests
- Have a test Google/Facebook account ready
- Have an existing email/password account ready

---

## Test Case 1: New User - Email/Password Registration

**Scenario**: A brand new visitor creates a task and registers with email/password.

**Steps**:
1. Open incognito window, go to homepage (`/bg` or `/en`)
2. Click "Post a Task" CTA button in the hero section
3. **Expected**: Navigates directly to `/[lang]/create-task` (no auth prompt)
4. Fill in the form:
   - Type a title (triggers smart category matching)
   - Confirm subcategory
   - Add description (15+ chars)
   - Select city
   - Leave budget as "unclear", timeline as "flexible"
5. **Expected**: Photo upload section is NOT shown. Instead, see a dashed box with message "You can add photos after posting your task"
6. Scroll down to review section, click "Post Task" (green button)
7. **Expected**: AuthSlideOver opens from the right with header "Create Task"
8. Enter a new email, password, and fill in your name
9. Click "Continue"
10. **Expected**:
    - Account is created
    - Slide-over closes
    - Task auto-submits (brief loading state)
    - Redirected to `/[lang]/tasks/posted`
    - Success toast appears
    - Task is visible in posted tasks list

**Verify**:
- [ ] No auth wall before seeing the form
- [ ] Photos section hidden for guest
- [ ] AuthSlideOver appears on submit
- [ ] Registration succeeds with name filled in
- [ ] Task is created and visible in posted tasks

---

## Test Case 2: New User - Google OAuth Registration

**Scenario**: A new visitor fills the form and registers via Google.

**Steps**:
1. Open incognito window, navigate to `/[lang]/create-task`
2. Fill in the full form (title, category, description, city)
3. Click "Post Task"
4. **Expected**: AuthSlideOver opens
5. Click "Continue with Google"
6. **Expected**: Redirected to Google OAuth consent screen
7. Complete Google sign-in
8. **Expected**:
    - Redirected back to `/[lang]/create-task?restore=true`
    - Brief loading spinner with "Submitting your task..."
    - Task auto-submits from localStorage draft
    - Redirected to `/[lang]/tasks/posted`
    - Success toast appears

**Verify**:
- [ ] Form data survives the OAuth redirect (saved to localStorage)
- [ ] `?restore=true` param is present after callback
- [ ] Auto-submit happens without showing the form again
- [ ] `trudify_pending_task` is cleared from localStorage after success
- [ ] Task appears in posted tasks with correct data (title, description, city, category)

---

## Test Case 3: New User - Facebook OAuth Registration

**Scenario**: Same as Test Case 2 but with Facebook OAuth.

**Steps**:
1. Repeat Test Case 2 steps but click "Continue with Facebook" instead
2. Complete Facebook login flow

**Verify**:
- [ ] Same behavior as Google OAuth flow
- [ ] Task data preserved through redirect
- [ ] Auto-submit works correctly

---

## Test Case 4: Existing User - Email/Password Login

**Scenario**: A returning user whose session expired fills the form and logs back in.

**Steps**:
1. Open incognito window (simulates expired session)
2. Navigate to `/[lang]/create-task`
3. **Expected**: Form loads normally, no redirect to homepage
4. Fill in the form completely
5. Click "Post Task"
6. **Expected**: AuthSlideOver opens
7. Enter existing email + password (do NOT fill in name field)
8. Click "Continue"
9. **Expected**:
    - Login succeeds (API detects existing account)
    - Slide-over closes
    - Task auto-submits
    - Redirected to `/[lang]/tasks/posted`

**Verify**:
- [ ] Name field stays muted/gray (not required for login)
- [ ] Login works without filling name
- [ ] Task submits immediately after login
- [ ] No "name required" error appears

---

## Test Case 5: Existing User - Expired Token, OAuth Re-login

**Scenario**: User previously logged in with Google, token expired, they fill a task and re-auth via Google.

**Steps**:
1. Log in with Google, then clear cookies (or wait for session to expire)
2. Navigate to `/[lang]/create-task`
3. **Expected**: Form loads (user appears as guest since token is gone)
4. Fill in the form
5. Click "Post Task"
6. **Expected**: AuthSlideOver opens
7. Click "Continue with Google" (same Google account as before)
8. **Expected**:
    - Google OAuth flow completes (may skip consent if previously authorized)
    - Redirected to `/[lang]/create-task?restore=true`
    - Auto-submit with loading spinner
    - Redirected to posted tasks
    - Task created under existing account (not a duplicate user)

**Verify**:
- [ ] Existing user profile is reused (not duplicated)
- [ ] Task is associated with the existing user account
- [ ] All previous tasks still visible alongside the new one

---

## Test Case 6: Authenticated User - Normal Flow (Regression)

**Scenario**: Already logged-in user creates a task. Should work exactly as before.

**Steps**:
1. Log in normally (any method)
2. Navigate to `/[lang]/create-task`
3. Fill in the form including photos
4. Click "Post Task"
5. **Expected**:
    - No AuthSlideOver appears
    - Photos upload normally
    - Task submits directly
    - Redirected to posted tasks

**Verify**:
- [ ] Photo upload section IS visible for authenticated users
- [ ] No auth prompt on submit
- [ ] Photos are included in the created task
- [ ] Notification warning banner appears if user hasn't set notification channel

---

## Test Case 7: Guest Abandons Auth Flow

**Scenario**: Guest fills form, clicks submit, but closes the AuthSlideOver without authenticating.

**Steps**:
1. Open incognito, go to `/[lang]/create-task`
2. Fill in the form
3. Click "Post Task"
4. AuthSlideOver opens
5. Click X or click the backdrop to close it
6. **Expected**: Form is still intact with all data preserved
7. Click "Post Task" again
8. **Expected**: AuthSlideOver opens again (form data re-saved to localStorage)

**Verify**:
- [ ] Form data is NOT lost when closing AuthSlideOver
- [ ] Can retry submit multiple times
- [ ] localStorage has `trudify_pending_task` entry

---

## Test Case 8: Stale Draft Expiry (24h)

**Scenario**: Guest saves a draft but returns after 24 hours.

**Steps**:
1. Open incognito, fill form, click submit, close AuthSlideOver (draft saved)
2. In browser DevTools > Application > Local Storage, find `trudify_pending_task`
3. Edit the `savedAt` timestamp to be 25 hours ago (subtract 90000000 from the value)
4. Navigate to `/[lang]/create-task?restore=true`
5. **Expected**: Draft is NOT restored (expired). Form shows normally as empty.

**Verify**:
- [ ] Expired draft is ignored
- [ ] `trudify_pending_task` is cleared from localStorage
- [ ] `?restore=true` param is removed from URL

---

## Test Case 9: Header & Floating Button CTAs

**Scenario**: Verify all "Create Task" entry points navigate directly without auth gate.

**Steps**:
1. Open incognito window (not logged in)
2. Test each CTA:
   - a. Hero section "Post a Task" button
   - b. Desktop header nav "Create Task" link
   - c. Mobile hamburger menu "Create Task" item
   - d. Mobile floating action button (scroll down 600px+ first)
3. **Expected for all**: Navigate directly to `/[lang]/create-task` without showing AuthSlideOver

**Verify**:
- [ ] Hero CTA navigates directly
- [ ] Desktop nav CTA navigates directly
- [ ] Mobile menu CTA navigates directly
- [ ] Floating button CTA navigates directly
- [ ] No auth prompt appears at any entry point

---

## Test Case 10: Review Enforcement Still Works (Authenticated)

**Scenario**: Authenticated user with pending reviews tries to create a task.

**Steps**:
1. Log in as a user who has completed tasks with pending reviews
2. Click "Post a Task" from any CTA
3. **Expected**: ReviewEnforcementDialog appears (soft_block or hard_block)
4. Complete required reviews or skip (if soft_block)
5. **Expected**: Navigates to create-task page after reviews are handled

**Verify**:
- [ ] Review enforcement still triggers for authenticated users
- [ ] Dialog appears before navigation to create-task
- [ ] Review submission flow works correctly

---

## Priority
High

## Related Files
- `/src/app/[lang]/create-task/create-task-content.tsx`
- `/src/app/[lang]/create-task/lib/task-draft.ts`
- `/src/components/tasks/task-form.tsx`
- `/src/components/ui/auth-slide-over.tsx`
- `/src/hooks/use-create-task.ts`
- `/src/app/auth/callback/route.ts`
- `/src/features/home/components/sections/hero-section.tsx`
- `/src/components/common/header.tsx`
