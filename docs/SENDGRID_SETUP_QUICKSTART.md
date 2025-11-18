# SendGrid Dynamic Template - Quick Setup Guide

## What You Need to Do

### 1. Create Dynamic Template in SendGrid

1. Go to **SendGrid Dashboard** → **Email API** → **Dynamic Templates**
2. Click **"Create a Dynamic Template"**
3. Name it: **"Email Verification - Trudify"**
4. Click **"Add Version"** → Choose **"Code Editor"**

### 2. Paste Template HTML

Copy the HTML template from `/docs/sendgrid-email-verification-setup.md` (Step 3) and paste it into SendGrid's Code Editor.

**The template HTML is here:**
```
/docs/sendgrid-email-verification-setup.md
```
Look for the section **"Step 3: Fully Translatable Template HTML"**

### 2.5. Test Template with Mock Data

After pasting the HTML, click **"Test Data"** in SendGrid and paste this JSON to preview the email:

```json
{
  "user_name": "Ivan Petrov",
  "verification_link": "https://trudify.com/api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
  "heading": "Welcome to Trudify!",
  "greeting": "Hi",
  "message": "Thank you for signing up! Please verify your email address to enable email notifications.",
  "button_text": "Verify Email Address",
  "link_instruction": "Or copy and paste this link into your browser:",
  "footer_text": "If you didn't create an account, you can safely ignore this email.",
  "footer_rights": "All rights reserved.",
  "current_year": "2024"
}
```

**What to check:**
- ✅ All text displays correctly
- ✅ Button looks good and is clickable (in preview)
- ✅ Colors match Trudify brand (#0066CC)
- ✅ Layout looks good on mobile and desktop
- ✅ No variables showing as `{{variable_name}}` (all should be replaced with values)

### 3. Get Template ID

1. Click **"Settings"** on your template
2. Copy the **Template ID** (looks like: `d-1234567890abcdef`)
3. Save the template

### 4. Add Environment Variable

Add this to your `.env.local` file:

```bash
SENDGRID_TEMPLATE_ID=d-your-template-id-here
```

(Replace `d-your-template-id-here` with the actual ID from step 3)

### 5. Test It!

Sign up with a new email (use Gmail alias):
```
bodrovphone+test12@gmail.com
```

**Expected behavior:**
- ✅ User gets JWT token and logged in immediately
- ✅ Email arrives in inbox from `noreply@trudify.com`
- ✅ Email is in correct language (EN/BG/RU based on signup page locale)
- ✅ Click verification link → User redirected with `?verified=true`
- ✅ `users.is_email_verified` updated to `true` in database

## How Translation Works

The system **saves user's language preference** during signup and uses it for ALL future emails:

**During Signup:**
1. Detects locale from signup page (e.g., `/en/`, `/bg/`, `/ru/`)
2. Saves to `users.preferred_language` field
3. Sends first verification email in that language

**For Resend/Future Emails:**
1. Fetches user's stored `preferred_language`
2. Sends email in their saved language
3. Fallback to Bulgarian if not set (Trudify is Bulgarian platform)

**Example:**
- User signs up from `/bg/signup` → `preferred_language = 'bg'` saved
- User clicks "Resend verification" later → Email sent in Bulgarian
- Even if they're browsing in English now, email is still in Bulgarian (their preference)

**No code changes needed!** All translations are already in:
- `/src/lib/intl/en/auth.ts`
- `/src/lib/intl/bg/auth.ts`
- `/src/lib/intl/ru/auth.ts`

## Template Variables

Your SendGrid template will receive these variables (automatically translated):

| Variable | English | Bulgarian | Russian |
|----------|---------|-----------|---------|
| `{{heading}}` | Welcome to Trudify! | Добре дошли в Trudify! | Добро пожаловать в Trudify! |
| `{{greeting}}` | Hi | Здравейте | Здравствуйте |
| `{{button_text}}` | Verify Email Address | Потвърди имейл адрес | Подтвердить email адрес |
| `{{message}}` | Thank you for signing up!... | Благодарим ви, че се регистрирахте!... | Спасибо за регистрацию!... |

Plus:
- `{{user_name}}` - User's full name
- `{{verification_link}}` - Verification URL
- `{{link_instruction}}` - Instructions for copying link
- `{{footer_text}}` - Footer disclaimer
- `{{footer_rights}}` - Copyright text
- `{{current_year}}` - Current year

## Fallback Mode

If you DON'T set `SENDGRID_TEMPLATE_ID`:
- System uses **inline HTML** (still fully translated!)
- Emails still work, just without your custom SendGrid template
- Good for testing before creating template

## What's Already Done

✅ All code updated to support dynamic templates
✅ Translations added for EN, BG, RU
✅ Locale detection implemented
✅ Fallback to inline HTML if no template
✅ JWT-based verification tokens
✅ Non-blocking verification (users can use app immediately)

## Next Steps After Setup

1. Test signup from different locales:
   - `http://localhost:3000/en` → English email
   - `http://localhost:3000/bg` → Bulgarian email
   - `http://localhost:3000/ru` → Russian email

2. Check SendGrid Activity for delivery status

3. Verify emails look good on desktop and mobile

4. Optional: Customize template design in SendGrid (colors, fonts, layout)

## Support

Full documentation: `/docs/sendgrid-email-verification-setup.md`

If emails aren't arriving, check:
- `SENDGRID_API_KEY` is set correctly
- `SENDGRID_TEMPLATE_ID` matches your template (or remove it to use fallback)
- SendGrid Activity for error messages
- Spam folder
