# Email Verification UI & Smart Notification Banners

## Task Description
Add UI elements to allow users to resend email verification and implement smart banner logic to guide users toward enabling notifications (either Telegram or Email).

## Requirements

### 1. Resend Email Verification Button (Simple Implementation)
- Add "Verify Email" button/link in profile page
- Add same functionality to auth slide-over for new signups
- Trigger API endpoint to resend verification email
- Show success/error messages
- Disabled state if email already verified

### 2. Smart Notification Banner System (Advanced)
Replace current Telegram-only banner with intelligent notification prompts:

#### Banner Priority Logic:
1. **No notification channel connected** → Show both options with randomizer
2. **Telegram dismissed** → Show Email verification banner
3. **Email dismissed** → Show Telegram connection banner
4. **Both dismissed** → No banner (user chose to skip notifications)
5. **Any channel verified** → No banner (user has notifications enabled)

#### UI Components:
- **Email Verification Banner** (similar styling to Telegram banner)
  - Icon: Mail/Envelope
  - Message: "Verify your email to receive notifications"
  - Action: "Send Verification Email" button
  - Dismissible with "x" close button
  - Store dismissal in localStorage: `email_verification_banner_dismissed`

- **Telegram Connection Banner** (existing, update logic)
  - Keep current design
  - Update dismissal logic to work with new system
  - Store dismissal in localStorage: `telegram_banner_dismissed`

#### Randomizer Logic (when both undismissed):
```typescript
// 70/30 chance on first profile visit (more often telegram than email)
const showTelegram = Math.random() < 0.5
// Store choice in session to maintain consistency during session
sessionStorage.setItem('notification_banner_choice', showTelegram ? 'telegram' : 'email')
```

## Acceptance Criteria

### Phase 1: Simple Resend Button
- [ ] Add "Verify Email" button to profile page (visible if email not verified)
- [ ] Add "Resend Verification Email" link to auth slide-over after signup
- [ ] Create `/api/auth/resend-verification` endpoint (already exists, verify it works)
- [ ] Show success toast: "Verification email sent! Check your inbox."
- [ ] Show error handling for rate limiting/failures
- [ ] Disable button if email already verified
- [ ] Button shows loading state while sending

### Phase 2: Smart Banner System
- [ ] Create `EmailVerificationBanner` component (match Telegram banner styling)
- [ ] Update `TelegramPromptBanner` to work with new dismissal logic
- [ ] Implement banner priority logic in profile page
- [ ] Add randomizer for showing Telegram vs Email when both undismissed
- [ ] Store dismissals in localStorage (persist across sessions)
- [ ] Use sessionStorage for banner choice consistency within session
- [ ] Test all banner scenarios:
  - Both undismissed → Randomizer picks one
  - Telegram dismissed → Show email banner
  - Email dismissed → Show Telegram banner
  - Both dismissed → No banner
  - Email verified → No banner
  - Telegram connected → No banner

### Phase 3: Polish & Edge Cases
- [ ] Banner animations (smooth fade in/out)
- [ ] Proper i18n for all banner text (EN/BG/RU)
- [ ] Rate limiting feedback (if user clicks resend too many times)
- [ ] Check email verification status on profile page load
- [ ] Update banner state after email verified (without page refresh)

## Technical Notes

### Existing API Endpoint
- `/api/auth/resend-verification` already exists
- Sends email via Supabase Auth
- Need to verify it's working in production

### Banner State Management
```typescript
interface NotificationBannerState {
  emailVerificationDismissed: boolean  // localStorage
  telegramBannerDismissed: boolean     // localStorage
  emailVerified: boolean               // from user profile
  telegramConnected: boolean           // from user profile
  sessionBannerChoice?: 'telegram' | 'email'  // sessionStorage
}
```

### Component Structure
```
/src/app/[lang]/profile/components/
├── email-verification-banner.tsx (NEW)
├── telegram-prompt-banner.tsx (EXISTING - update logic)
└── notification-banner-manager.tsx (NEW - orchestrates which banner to show)
```

## Priority
Medium - Nice to have for better user onboarding, but not blocking MVP

## Design Reference
- Match styling of existing Telegram banner
- Blue color for email (#0066CC)
- Teal color for Telegram (keep existing)
- Same card style, padding, and layout
- Same close button style

## Future Enhancements (Out of Scope)
- Analytics tracking for banner dismissals
- A/B testing different banner messages
- Multi-step onboarding flow
- In-app notification to verify email after receiving verification email



🧪 Testing Guide: Email Verification UI & Smart Notification Banners

  Test Environment Setup

  First, make sure your dev server is running:
  npm run dev

  Test Scenario 1: Email Verification Banner on Profile Page

  Pre-conditions:
  - User must be logged in
  - User's email must NOT be verified (is_email_verified = false in database)
  - User must NOT have Telegram connected (telegram_id = null)
  - Neither banner has been dismissed before (clear localStorage if needed)

  Steps:
  1. Navigate to: http://localhost:3000/en/profile (or /bg/profile or /ru/profile)
  2. Expected: You should see ONE of the following banners (50/50 random):
    - Email Banner: Blue gradient with 📧 icon, "Verify Your Email!" title
    - Telegram Banner: Blue gradient with Telegram icon, "Get Instant Notifications!" title
  3. Click: The banner's action button
    - Email banner → "Send Verification Email" button
    - Telegram banner → "Connect Telegram" button (opens settings modal)
  4. Expected:
    - Email: Success toast appears, verification email sent
    - Telegram: Settings modal opens

  Test Scenario 2: Email Banner in Personal Info Section

  Pre-conditions:
  - User must be logged in
  - User's email must NOT be verified

  Steps:
  1. Navigate to: Profile page (/en/profile)
  2. Scroll down to the "Personal Information" card
  3. Expected: You should see an amber/orange warning banner with:
    - 📧 Mail icon
    - "Verify your email address" heading
    - "Send Verification Email" button
  4. Click: "Send Verification Email" button
  5. Expected:
    - Button shows loading state ("Sending...")
    - Success/error message appears below button
    - If successful: Green box with "Verification email sent!"

  Test Scenario 3: Verification Prompt After Signup

  Pre-conditions:
  - User must NOT be logged in

  Steps:
  1. Navigate to: Any task detail page (e.g., /en/tasks/1)
  2. Click: "Apply" or "Ask Question" button
  3. Auth slide-over opens
  4. Switch to Signup mode (click "Create Account")
  5. Fill in the form:
    - Full Name: "Test User"
    - Email: "test@example.com"
    - Password: "password123"
    - Confirm Password: "password123"
  6. Click: "Create Account" button
  7. Expected: The form disappears and you see:
    - 📧 "Check your inbox!" heading
    - "We sent a verification email to test@example.com"
    - Two buttons:
        - "Resend Verification Email" (blue)
      - "Continue to App" (bordered)
  8. Click: "Resend Verification Email"
  9. Expected: Button shows loading state, then success

  Test Scenario 4: Smart Banner Dismissal Logic

  Test 4A: Dismiss Email Banner → See Telegram Banner
  1. Setup: Clear localStorage: localStorage.clear() in browser console
  2. Refresh profile page
  3. If Email banner shows: Click the X button to dismiss
  4. Refresh page again
  5. Expected: Now you should see the Telegram banner

  Test 4B: Dismiss Telegram Banner → See Email Banner
  1. Setup: Clear localStorage: localStorage.clear() in browser console
  2. Refresh profile page
  3. If Telegram banner shows: Click the X button to dismiss
  4. Refresh page again
  5. Expected: Now you should see the Email banner

  Test 4C: Dismiss Both Banners → No Banner Shows
  1. Dismiss whichever banner is showing (click X)
  2. Refresh page
  3. Dismiss the other banner (click X)
  4. Refresh page again
  5. Expected: No banner shows at all

  Test Scenario 5: Banner Disappears When Email Verified

  Pre-conditions:
  - Profile page shows a notification banner

  Steps:
  1. In the database, set is_email_verified = true for your user
  2. Refresh the profile page
  3. Expected: No notification banner shows (even if not dismissed)

  Test Scenario 6: Multi-Language Support

  Test the same scenarios in all languages:
  - English: /en/profile
  - Bulgarian: /bg/profile
  - Russian: /ru/profile

  Expected: All text should be properly translated in each language.

  ---
  🛠️ Quick Database Setup for Testing

  If you need to reset your test user's verification status:

  -- Make email unverified
  UPDATE users
  SET is_email_verified = false
  WHERE email = 'your-test-email@example.com';

  -- Disconnect Telegram
  UPDATE users
  SET telegram_id = null,
      telegram_username = null,
      telegram_first_name = null,
      telegram_last_name = null,
      telegram_photo_url = null
  WHERE email = 'your-test-email@example.com';

  ---
  🧹 Clear Test Data

  To reset and test from scratch:

  // Run in browser console
  localStorage.clear()
  sessionStorage.clear()
  location.reload()

  ---
  ✅ Expected Behavior Summary

  | User State                                                       | Banner Shown
            |
  |------------------------------------------------------------------|-------------------------
  ----------|
  | Email NOT verified + Telegram NOT connected + No dismissals      | Random (50/50): Email OR
   Telegram |
  | Email NOT verified + Telegram NOT connected + Email dismissed    | Telegram banner
            |
  | Email NOT verified + Telegram NOT connected + Telegram dismissed | Email banner
            |
  | Email NOT verified + Telegram NOT connected + Both dismissed     | No banner
            |
  | Email verified (regardless of Telegram)                          | No banner
            |
  | Telegram connected (regardless of email)                         | No banner
            |

  ---
  Let me know which scenario you want to test first, or if you encounter any issues!