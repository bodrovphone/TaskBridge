# Email Verification Implementation

## Task Description
Implement email verification system to ensure users can receive notifications. Users must verify their email before receiving notifications, unless they have connected their Telegram account as an alternative. Show strategic reminders during key user actions to encourage verification.

## Requirements

### 1. Email Verification Flow
- Send verification email when user signs up
- Verification email should contain:
  - Verification link with secure token
  - Link expiration (24 hours)
  - Trudify branding and friendly copy
- Implement verification endpoint: `/api/auth/verify-email?token=xxx`
- Update `is_email_verified` flag in database upon successful verification
- Handle expired/invalid tokens gracefully

### 2. Notification Gating Logic
**Only send notifications if:**
- User has `is_email_verified = true` (for email notifications), OR
- User has `telegram_id IS NOT NULL` (Telegram is alternative)

**Update these notification triggers:**
- Task status updates
- New applications received
- Application accepted/rejected
- New messages
- Task completion
- Payment confirmations

### 3. Strategic Verification Reminders
Show verification prompts only when:
- User has NOT verified email, AND
- User has NOT connected Telegram account

**Show reminders during these actions:**

#### A. Task Creation Page
- Banner at top: "Verify your email to receive notifications about applications"
- Can still create task, but shown prominent reminder
- After task creation: Modal/toast suggesting email verification

#### B. Professional Application
- Before submitting application: Check if email verified
- If not verified: Warning banner "Verify email to receive responses from clients"
- Can still apply, but shown reminder

#### C. Profile Page
- Warning banner in Personal Info section if email not verified
- "Resend Verification Email" button
- Hide banner if Telegram is connected (since notifications work via Telegram)

#### D. First Login After Signup
- One-time modal/banner: "Please verify your email to stay updated"
- Option to dismiss or verify
- Don't show again if dismissed or if Telegram connected

### 4. UI Components Needed

#### Verification Reminder Banner Component
```typescript
<VerificationReminderBanner
  show={!isEmailVerified && !hasTelegram}
  onResendEmail={() => resendVerificationEmail()}
  onDismiss={() => dismissReminder()}
  context="task-creation" // or "application", "profile"
/>
```

#### Email Verification Status in Profile
- Update Personal Info section to show verification status
- "Resend Verification Email" button if not verified
- Success message after verification
- Hide if Telegram connected (notifications work via Telegram)

### 5. Resend Verification Email
- API endpoint: `POST /api/auth/resend-verification`
- Rate limiting: Max 3 emails per hour per user
- Show countdown timer: "You can resend in 5 minutes"
- Toast notification on successful resend

## Acceptance Criteria
- [ ] Email verification system implemented (send, verify, expire tokens)
- [ ] Verification email template created (EN/BG/RU)
- [ ] Verification endpoint handles valid/invalid/expired tokens
- [ ] Database flag `is_email_verified` updated on verification
- [ ] Notification gating logic implemented (check email verified OR telegram connected)
- [ ] Verification reminder banner component created
- [ ] Reminder shown on task creation page (if needed)
- [ ] Reminder shown before professional application (if needed)
- [ ] Reminder shown in profile page (if needed)
- [ ] First-login verification modal implemented (optional, dismissible)
- [ ] Resend verification email functionality with rate limiting
- [ ] All reminders hidden if Telegram account connected
- [ ] All text translated in EN/BG/RU
- [ ] Email verification success page/message

## Technical Notes

### Database
- `is_email_verified` field already exists in users table
- Create `email_verification_tokens` table:
  - `id`, `user_id`, `token` (hashed), `expires_at`, `created_at`
  - Add index on `token` for fast lookup

### Email Service
- Use existing email sending infrastructure
- Template should be professional and mobile-friendly
- Include "Verify Email" button with colored CTA
- Add fallback link if button doesn't work

### Token Generation
```typescript
// Generate secure token
const token = crypto.randomBytes(32).toString('hex')
const hashedToken = await bcrypt.hash(token, 10)
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
```

### Verification Link Format
```
https://trudify.com/en/auth/verify-email?token=xxx
```

### Notification Check Example
```typescript
async function canSendNotification(userId: string): Promise<boolean> {
  const user = await getUser(userId)

  // Can send if email verified OR telegram connected
  return user.is_email_verified || !!user.telegram_id
}

// Before sending any notification
if (await canSendNotification(userId)) {
  await sendNotification(...)
} else {
  console.log(`[Notification] Skipped for user ${userId} - email not verified and no telegram`)
}
```

### Translation Keys
Add to `/src/lib/intl/[lang]/auth.ts` or `/common.ts`:
```typescript
'auth.emailVerification.title': 'Verify Your Email'
'auth.emailVerification.description': 'We sent a verification link to {email}'
'auth.emailVerification.checkInbox': 'Please check your inbox and click the verification link'
'auth.emailVerification.resendEmail': 'Resend Verification Email'
'auth.emailVerification.emailSent': 'Verification email sent! Check your inbox.'
'auth.emailVerification.rateLimitExceeded': 'Please wait {minutes} minutes before requesting another email'

'auth.emailVerification.reminderBanner.title': 'Verify your email address'
'auth.emailVerification.reminderBanner.taskCreation': 'Verify your email to receive notifications about applications on your task'
'auth.emailVerification.reminderBanner.application': 'Verify your email to receive responses from clients'
'auth.emailVerification.reminderBanner.profile': 'Verify your email to start receiving important notifications'

'auth.emailVerification.success': 'Email verified successfully!'
'auth.emailVerification.expired': 'Verification link expired. Please request a new one.'
'auth.emailVerification.invalid': 'Invalid verification link. Please try again.'
```

### Reminder Dismissal
- Store dismissal state in localStorage: `email-verification-reminder-dismissed`
- Respect dismissal for 7 days, then show again
- Reset dismissal if user explicitly clicks "Resend Email"

## Priority
High - Important for notification reliability and user engagement

## Notes
- This prevents sending emails to invalid/typo email addresses
- Reduces bounce rates and improves deliverability
- Telegram connection serves as valid alternative (no email verification needed)
- Don't be too aggressive with reminders - allow users to dismiss
- Consider sending periodic reminder emails (weekly) to unverified users
