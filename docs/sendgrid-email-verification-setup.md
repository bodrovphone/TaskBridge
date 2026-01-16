# SendGrid Email Verification Setup

This guide explains how to set up and customize email verification using SendGrid for Trudify.

## Overview

We use a custom email verification system that:
- ✅ **Non-blocking**: Users can use the app immediately after signup
- ✅ **Independent**: Uses `users.is_email_verified` (not Supabase's `email_confirmed_at`)
- ✅ **Branded**: Fully customizable SendGrid templates with Trudify branding
- ✅ **Secure**: JWT-based verification tokens (24-hour expiration)

## Architecture

```
User signs up
  ↓
Supabase creates user (auto-confirmed, gets JWT/session)
  ↓
User profile created with is_email_verified = false
  ↓
Generate JWT verification token (expires in 24h)
  ↓
Send branded email via SendGrid API
  ↓
User clicks verification link
  ↓
/api/auth/verify-email validates token
  ↓
Update users.is_email_verified = true
```

## Required Environment Variables

```bash
# SendGrid API Key (from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.your_api_key_here

# Your app URL (uses existing NEXT_PUBLIC_BASE_URL)
# Local: http://localhost:3000
# Staging: https://task-bridge-chi.vercel.app
# Production: https://trudify.com
```

## SendGrid Configuration

### 1. Verify Sender Email

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Verify your domain `trudify.com` (you already have this set up)
3. Confirm DNS records are in place (SPF, DKIM, DMARC)

### 2. Current Setup (Basic HTML)

Currently, we're sending emails using the SendGrid API with inline HTML:

**Email Template:**
- Subject: "Verify your email address - Trudify"
- From: noreply@trudify.com (Trudify)
- Styled with Trudify brand colors (#0066CC)
- Includes verification button and link

### 3. Upgrade to Dynamic Templates (Optional)

For better email management, you can create dynamic templates in SendGrid:

**Step 1: Create Template**
1. Go to SendGrid Dashboard → Email API → Dynamic Templates
2. Click "Create a Dynamic Template"
3. Name it "Email Verification - Trudify"
4. Click "Add Version" → Choose "Blank Template" or "Code Editor"

**Step 2: Get Template ID**

After creating the template:
1. Click "Settings" on the template
2. Copy the **Template ID** (format: `d-xxxxxxxxxxxxxxxxx`)
3. Add to your environment variables:

```bash
# .env.local
SENDGRID_TEMPLATE_ID=d-your-template-id-here
```

**Step 3: Template Variables**

The template will receive these variables (all automatically translated):

```handlebars
{{user_name}}           - User's full name or email prefix
{{verification_link}}   - Full verification URL
{{heading}}             - Translated: "Welcome to Trudify!" (EN) / "Добре дошли в Trudify!" (BG) / "Добро пожаловать в Trudify!" (RU)
{{greeting}}            - Translated: "Hi" (EN) / "Здравейте" (BG) / "Здравствуйте" (RU)
{{message}}             - Translated verification message
{{button_text}}         - Translated: "Verify Email Address" (EN) / "Потвърди имейл адрес" (BG) / "Подтвердить email адрес" (RU)
{{link_instruction}}    - Translated: "Or copy and paste this link..."
{{footer_text}}         - Translated disclaimer text
{{footer_rights}}       - Translated: "All rights reserved."
{{current_year}}        - Current year (e.g., "2024")
```

**Important:** All text variables are automatically provided in the user's language based on their signup locale!

**Step 3: Fully Translatable Template HTML**

Copy and paste this into SendGrid's Code Editor. All text uses variables for full i18n support:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #0066CC;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .logo {
      color: white;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    h2 {
      color: #333;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background-color: #0066CC;
      color: white;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      margin: 25px 0;
      font-weight: 600;
    }
    .footer {
      padding: 20px 30px;
      background-color: #f9f9f9;
      border-radius: 0 0 8px 8px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .link-text {
      color: #666;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Trudify</div>
    </div>
    <div class="content">
      <h2>{{heading}}</h2>
      <p>{{greeting}} {{user_name}},</p>
      <p>{{message}}</p>
      <div style="text-align: center;">
        <a href="{{verification_link}}" class="button">{{button_text}}</a>
      </div>
      <p class="link-text">
        {{link_instruction}}<br>
        <a href="{{verification_link}}">{{verification_link}}</a>
      </p>
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
      <p>© {{current_year}} Trudify. {{footer_rights}}</p>
    </div>
  </div>
</body>
</html>
```

**Template Variables (all translatable):**
- `{{user_name}}` - User's full name or email prefix
- `{{heading}}` - Email heading (e.g., "Welcome to Trudify!")
- `{{greeting}}` - Greeting word (e.g., "Hi" / "Здравей" / "Привет")
- `{{message}}` - Main message explaining verification
- `{{button_text}}` - CTA button text (e.g., "Verify Email Address")
- `{{verification_link}}` - The actual verification URL
- `{{link_instruction}}` - Text above the plain link
- `{{footer_text}}` - Footer disclaimer
- `{{footer_rights}}` - "All rights reserved" text
- `{{current_year}}` - Current year (passed from backend)

**Step 4: Code Configuration (Already Done!)**

The code is already configured to use dynamic templates! Just add the `SENDGRID_TEMPLATE_ID` environment variable:

```bash
# .env.local
SENDGRID_TEMPLATE_ID=d-your-template-id-from-step-2
```

**How it works:**
- If `SENDGRID_TEMPLATE_ID` is set → Uses your SendGrid dynamic template
- If not set → Falls back to inline HTML (still fully translated)
- Both modes automatically detect user's locale and send translated content
- Supports EN, BG, and RU languages

**Files already updated:**
- ✅ `/src/app/api/auth/signup/route.ts` - Signup email sending
- ✅ `/src/app/api/auth/resend-verification/route.ts` - Resend email
- ✅ `/src/lib/email/verification-templates.ts` - Translation helper
- ✅ `/src/lib/intl/en/auth.ts` - English translations
- ✅ `/src/lib/intl/bg/auth.ts` - Bulgarian translations
- ✅ `/src/lib/intl/ru/auth.ts` - Russian translations

## Testing

### 1. Test Signup Flow

```bash
# Use Gmail alias for testing
yourname+test@gmail.com
```

**Expected Logs:**
```
[Auth] User signed up successfully
[Auth] Detected user locale: bg
[Auth] Saved preferred language: bg
[Auth] Generated verification URL: http://localhost:3000/api/auth/verify-email?token=...
[Auth] Verification email sent successfully via SendGrid to: yourname+test@gmail.com in bg
```

### 2. Check Email Delivery

1. Check inbox for email from `noreply@trudify.com`
2. Verify email styling looks correct
3. Click verification link
4. Should redirect to app with `?verified=true`

### 3. Verify SendGrid Activity

1. Go to SendGrid Dashboard → Activity
2. Search for recipient email
3. Check status: "Delivered" (green checkmark)
4. Click to see delivery details

### 4. Test Database Update

After clicking verification link, check that `is_email_verified` is set to `true`:

```sql
SELECT id, email, is_email_verified FROM users WHERE email = 'yourname+test@gmail.com';
```

## Multilingual Support (Already Implemented!)

✅ **Fully translated email verification in EN, BG, and RU with persistent language preference!**

The system automatically:
1. **On Signup**: Detects user's locale from signup page (e.g., `/en/signup`, `/bg/signup`, `/ru/signup`)
2. **Saves Preference**: Stores locale in `users.preferred_language` field
3. **Loads Translations**: Gets translated email content from `/src/lib/intl/[lang]/auth.ts`
4. **Sends Email**: Passes all translated variables to SendGrid template
5. **Future Emails**: Always uses saved `preferred_language` (no re-detection needed)

**How locale detection works (only during signup):**
1. Checks URL path for locale (highest priority)
2. Checks Referer header for locale
3. Checks Accept-Language header
4. Falls back to Bulgarian (Trudify is Bulgarian platform)

**Example flow:**
- User signs up from `/bg/signup` → `preferred_language = 'bg'` saved → Gets Bulgarian email
- Later, user requests "Resend verification" → Email sent in Bulgarian (from saved preference)
- User changes site language to English → Still gets emails in Bulgarian (their original preference)

**Why save preference?**
- ✅ Consistent language across all emails
- ✅ No need to detect locale for every email
- ✅ User gets emails in language they chose during signup
- ✅ Works even if user accesses site from different locale later

## Troubleshooting

### Email not arriving

1. **Check SendGrid API Key**: Verify `SENDGRID_API_KEY` is set correctly
2. **Check SendGrid Activity**: Look for error messages
3. **Check Spam Folder**: Gmail might filter emails initially
4. **Check Rate Limits**: Supabase has 3-4 emails/hour limit (we bypass this with direct SendGrid)

### Token expired error

- Verification tokens expire after 24 hours
- User can request a new email via "Resend verification" button
- Check `TOKEN_SECRET` environment variable is consistent

### Email verified but still showing unverified

- Clear browser cache and refresh
- Check database directly: `SELECT is_email_verified FROM users WHERE id = '...'`
- Verify frontend is checking correct field

## Cost Optimization

**SendGrid Free Tier:**
- 100 emails/day
- Perfect for MVP and testing
- Upgrade to paid plan ($19.95/month) for production

**Cost Comparison:**
- SendGrid: $0.00 - $19.95/month (unlimited verification emails)
- Supabase Email: Limited by platform rate limiting
- WhatsApp/Viber: €10,000-16,000/year (avoid for verification)

## Security Notes

1. **JWT Secret**: Uses `EMAIL_VERIFICATION_SECRET` or falls back to Supabase anon key
2. **Token Expiration**: 24 hours (configurable in `/src/lib/auth/email-verification.ts`)
3. **Rate Limiting**: 3 emails per hour per user (prevents spam)
4. **HTTPS Only**: Verification links use HTTPS in production
5. **No Personal Data in Token**: Only email and userId encoded

## Files Reference

- **Token Utilities**: `/src/lib/auth/email-verification.ts`
- **Signup Route**: `/src/app/api/auth/signup/route.ts`
- **Verify Endpoint**: `/src/app/api/auth/verify-email/route.ts`
- **Resend Endpoint**: `/src/app/api/auth/resend-verification/route.ts`

## Next Steps

1. ✅ Test signup flow with new Gmail alias
2. ✅ Verify email arrives and styling looks good
3. ✅ Test verification link works
4. ⏸️ (Optional) Create custom SendGrid template with Trudify branding
5. ⏸️ (Future) Add multilingual email templates
6. ⏸️ (Future) Add verification reminder banner in app UI
