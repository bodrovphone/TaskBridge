# Email Verification Implementation

## Task Description
Implement email verification system to ensure users can receive notifications. Users must verify their email before receiving notifications, unless they have connected their Telegram account as an alternative. Show strategic reminders during key user actions to encourage verification.

## ✅ Current Progress Checkpoint

**Infrastructure Setup Complete:**
- ✅ SendGrid account created and domain verified
- ✅ DNS records configured (SPF, DKIM, DMARC) on Hostinger
- ✅ SendGrid connected to Supabase via SMTP
- ✅ Custom SMTP working (emails from `noreply@trudify.com`)
- ✅ Email delivery tested and confirmed working
- ✅ Click tracking disabled (prevents link mangling)
- ✅ Site URL and redirect URLs configured
- ✅ Supabase "Confirm email" setting: **OFF** (non-blocking!)

**What Works:**
- ✅ Emails send successfully from SendGrid
- ✅ Emails arrive from custom domain (`noreply@trudify.com`)
- ✅ Verification links are clean (not wrapped by SendGrid tracking)
- ✅ `/auth/callback` route exists and handles OAuth

**What's Next:**
- ⏳ Turn OFF "Confirm email" in Supabase (currently ON, blocks users!)
- ⏳ Update signup flow to manually send verification emails
- ⏳ Update `/auth/callback` to handle email verification tokens
- ⏳ Build verification reminder UI components
- ⏳ Implement resend verification email functionality
- ⏳ Gate email notifications based on `email_confirmed_at`

**Known Issues:**
- ⚠️ Supabase rate limit: 3-4 emails per hour per email (hit during testing)
- ⚠️ Frontend directly calls Supabase (should use backend API - see `refactor-auth-to-backend-api.md`)
- ⚠️ "Confirm email" currently ON (blocks sign-in until verified) - **MUST turn OFF!**

## ✅ Implementation Strategy: Non-Blocking Email Verification

**CRITICAL PRINCIPLE:** Email verification is for NOTIFICATIONS ONLY, NOT for app access!

**Key Points:**
- ✅ Users can sign up and use app IMMEDIATELY without verifying email
- ✅ Verification email sent AFTER signup (non-blocking)
- ✅ `email_confirmed_at` tracked but NOT required for sign-in
- ✅ Email verification ONLY required to receive email notifications
- ✅ Telegram serves as alternative (if connected, no email verification needed)
- ⚠️ **CRITICAL:** Keep Supabase "Confirm email" setting OFF (don't block users!)

**Correct Supabase Configuration:**
```
✅ Enable Email provider: ON (allow email/password auth)
❌ Confirm email: OFF (don't block sign-in!)
✅ Custom SMTP: SendGrid configured
```

**Implementation Flow:**
1. User signs up → immediately logged in (no blocking)
2. Backend manually sends verification email via API
3. User can use app fully without verifying
4. When user tries to receive email notifications → check `email_confirmed_at`
5. If null AND no Telegram → show reminder banner
6. User clicks verification link → `email_confirmed_at` set
7. Now can receive email notifications

**What you need to build:**
1. ✅ Configure custom SMTP (SendGrid) in Supabase Dashboard
2. ✅ Keep "Confirm email" OFF (non-blocking!)
3. ⏳ Manually send verification email after signup via backend API
4. ⏳ Implement `/auth/callback` route to handle verification redirects
5. ⏳ Build verification reminder banners (only shown when needed)
6. ⏳ Implement resend verification email functionality
7. ⏳ Gate email notifications based on `email_confirmed_at || telegram_id`

**What Supabase handles:**
- Email sending infrastructure (via SendGrid)
- Token generation and security
- Token expiration (24 hours)
- Verification link handling
- Setting `email_confirmed_at` when verified

## Requirements

### 1. Email Verification Flow (Non-Blocking!)

**Step 1: User Signup**
```typescript
// After successful signup in your backend API
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  }
})

// ✅ User is immediately logged in (session created)
// email_confirmed_at = null (not verified yet)
```

**Step 2: Manually Send Verification Email**
```typescript
// Immediately after signup, trigger verification email manually
if (data.user && !error) {
  // This sends the confirmation email even though "Confirm email" is OFF
  await supabase.auth.resend({
    type: 'signup',
    email: data.user.email!,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })
}
```

**Step 3: User Receives Email**
- Verification link with secure token
- Link expiration (24 hours)
- Trudify branding and friendly copy (customized in Supabase dashboard)

**Step 4: User Clicks Link**
- Redirects to `/auth/callback?token_hash=xxx&type=email`
- Callback route exchanges token for session
- Supabase sets `email_confirmed_at = NOW()`

**Step 5: Verification Complete**
- User can now receive email notifications
- `email_confirmed_at` is no longer null

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

### Supabase Configuration
- [ ] Custom SMTP configured in Supabase Dashboard (Resend recommended)
- [ ] Email template customized in Supabase Dashboard (Confirm Sign Up template)
- [ ] Email template includes Trudify branding and multilingual support (EN/BG/RU)
- [ ] Auth callback route implemented (`/app/auth/callback/route.ts`)
- [ ] Email verification success/error pages created
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

### ✅ Simplified Implementation: Use Supabase Built-in Email Verification

**IMPORTANT:** Supabase Auth already handles email verification automatically! You don't need to build custom token generation/verification.

**How it works:**
1. When user signs up via `supabase.auth.signUp({ email, password })`, Supabase automatically:
   - Sends verification email using configured SMTP
   - Manages verification tokens securely
   - Handles token expiration (24 hours default)
   - Updates `email_confirmed_at` field in `auth.users` table

2. Verification link format: `https://trudify.com/auth/callback?token_hash=xxx&type=email`

3. Check verification status:
```typescript
const { data: { user } } = await supabase.auth.getUser()
const isEmailVerified = !!user?.email_confirmed_at
```

**What you need to implement:**
- ✅ Configure custom SMTP (Resend recommended)
- ✅ Customize email template in Supabase Dashboard
- ✅ Implement `/auth/callback` route (exchange token for session)
- ✅ Add verification reminder banners in UI
- ✅ Implement resend verification email functionality
- ✅ Gate notifications based on `email_confirmed_at` OR `telegram_id`

**What Supabase handles automatically:**
- ❌ Token generation and hashing (handled by Supabase)
- ❌ Token storage (handled by Supabase)
- ❌ Token expiration (handled by Supabase)
- ❌ Verification endpoint (handled by Supabase)
- ❌ Database updates (handled by Supabase)

### Database
- `email_confirmed_at` field in `auth.users` table (managed by Supabase)
- ❌ NO need to create `email_verification_tokens` table - Supabase manages this
- Can query via: `SELECT email_confirmed_at FROM auth.users WHERE id = '...'`
- Or use Supabase client: `user?.email_confirmed_at`

### Email Service Configuration (Supabase Custom SMTP)

**⚠️ CRITICAL: Default Supabase SMTP is NOT for production use**
- Default SMTP limited to 2-4 emails/hour
- Only sends to project team members
- No SLA guarantee

**✅ Production Setup Required: Custom SMTP with Custom Domain**

Supabase supports custom SMTP configuration to send authentication emails from your own domain (e.g., `noreply@trudify.com`). This is REQUIRED for production.

**Recommended Solution: Resend Integration**
1. Navigate to **Integrations** page in Supabase Dashboard
2. Connect Resend integration (guided setup)
3. Or manually configure SMTP:
   - Go to **Authentication → Emails → SMTP Settings**
   - Enable **Custom SMTP**
   - Enter Resend SMTP credentials:
     - Host: `smtp.resend.com`
     - Port: `465` or `587`
     - Username: (from Resend dashboard)
     - Password: (API key from Resend)
     - Sender Email: `noreply@trudify.com`
     - Sender Name: `Trudify`

**Alternative SMTP Providers:**
- AWS SES
- SendGrid
- Postmark
- Mailtrap (for testing)
- Any SMTP-compatible service

**Benefits of Custom SMTP:**
- ✅ Brand recognition (emails from `@trudify.com`)
- ✅ Better deliverability and IP reputation
- ✅ Production-ready rate limits
- ✅ Email analytics and webhooks
- ✅ Compliance features

**Email Template Customization:**
Supabase provides customizable email templates in Dashboard → **Authentication → Email Templates**

Available templates:
- Confirm Sign Up (email verification) ✅ Use this!
- Magic Link
- Password Reset
- Change Email Address
- Reauthentication

**Template Variables Available:**
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .Token }}` - 6-digit OTP alternative
- `{{ .Email }}` - User's email address
- `{{ .Data }}` - Custom user metadata
- `{{ .SiteURL }}` - Application URL

**Template Requirements:**
- Professional and mobile-friendly design
- Include "Verify Email" button with colored CTA
- Add fallback link if button doesn't work
- Multilingual support (EN/BG/RU) - customize via Dashboard
- Trudify branding

### Resend Verification Email
```typescript
// API endpoint: POST /api/auth/resend-verification
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check rate limiting (implement with Redis or database)
  // ... rate limit check ...

  // Resend verification email
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email!
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Verification email sent!' })
}
```

### Auth Callback Route (Exchange Token for Session)
```typescript
// /app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()

    // Exchange token for session
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any
    })

    if (!error) {
      // Redirect to success page
      return NextResponse.redirect(`${requestUrl.origin}/en/auth/email-verified`)
    }
  }

  // Redirect to error page
  return NextResponse.redirect(`${requestUrl.origin}/en/auth/error`)
}
```

### Notification Check Example
```typescript
async function canSendNotification(userId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Check email verified OR telegram connected
  const isEmailVerified = !!user.email_confirmed_at

  // Also check if user has Telegram connected (from your users table)
  const { data: profile } = await supabase
    .from('users')
    .select('telegram_id')
    .eq('id', userId)
    .single()

  return isEmailVerified || !!profile?.telegram_id
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

## Setup Steps

### 1. Configure Resend SMTP (One-time setup)

**Step 1: Create Resend Account**
1. Sign up at https://resend.com
2. Verify your domain (`trudify.com`)
3. Add DNS records (SPF, DKIM, DMARC) as instructed

**Step 2: Connect to Supabase**
1. In Supabase Dashboard → **Integrations** → **Resend**
2. Click "Connect" and follow guided setup
3. Or manually configure SMTP:
   - Navigate to **Authentication → Emails → SMTP Settings**
   - Enable **Custom SMTP**
   - Enter credentials:
     - Host: `smtp.resend.com`
     - Port: `465` (SSL) or `587` (TLS)
     - Username: `resend`
     - Password: (API key from Resend dashboard)
     - Sender Email: `noreply@trudify.com`
     - Sender Name: `Trudify`

**Step 3: Customize Email Template**
1. Navigate to **Authentication → Email Templates**
2. Select **Confirm signup** template
3. Customize with Trudify branding:
   - Update colors, logo, copy
   - Add multilingual support (EN/BG/RU)
   - Use template variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc.
4. Test email delivery

**Step 4: Update Site URL**
1. Navigate to **Authentication → URL Configuration**
2. Set **Site URL**: `https://trudify.com`
3. Add **Redirect URLs**: `https://trudify.com/auth/callback`

### 2. Implementation Checklist
- [ ] Resend account created and domain verified
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Resend connected to Supabase via Integrations or manual SMTP
- [ ] Email template customized with Trudify branding
- [ ] Site URL and redirect URLs configured
- [ ] Test email sent and verified successfully
- [ ] Auth callback route implemented
- [ ] Verification reminder banners implemented
- [ ] Resend email functionality with rate limiting
- [ ] Notification gating logic updated
- [ ] All translations added (EN/BG/RU)

## Notes
- This prevents sending emails to invalid/typo email addresses
- Reduces bounce rates and improves deliverability
- Telegram connection serves as valid alternative (no email verification needed)
- Don't be too aggressive with reminders - allow users to dismiss
- Consider sending periodic reminder emails (weekly) to unverified users
- Resend free tier: 3,000 emails/month, 100 emails/day (sufficient for MVP)
- Monitor email deliverability in Resend dashboard
- Use Resend webhooks for advanced tracking (bounces, opens, clicks)
