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
// 50/50 chance on first profile visit
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
