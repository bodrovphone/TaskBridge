# Supabase Password Reset Email Setup

This guide shows how to configure the Trudify-branded password reset email in your Supabase project.

## Template File

**File**: `supabase-password-reset-bulgarian.html`

This template uses your existing Trudify branding (handshake logo, blue colors, professional layout) adapted for Supabase Auth.

## 📋 Step-by-Step Setup

### 1. Open Supabase Dashboard

1. Navigate to https://supabase.com/dashboard
2. Select your **TaskBridge** project

### 2. Go to Email Templates

1. Click **"Authentication"** in the left sidebar
2. Click **"Email Templates"**

### 3. Select Reset Password Template

You'll see several template options:
- Confirm signup
- Magic Link
- Change Email
- **Reset Password** ← Select this one

### 4. Paste the Template

1. Open `/docs/email-templates/supabase-password-reset-bulgarian.html`
2. Copy the **entire HTML content** (Cmd+A, Cmd+C)
3. Paste into the Supabase template editor
4. Click **"Save"**

### 5. Test the Flow

1. Go to your app: `http://localhost:3000/bg/forgot-password`
2. Enter a test email address
3. Check terminal logs:
   ```
   [Auth] Sending password reset email to: test@example.com
   [Auth] Password reset email sent successfully
   ```
4. Check your email inbox
5. Click the reset link
6. Verify you see the branded email
7. Complete password reset

## 🎨 Template Variables

The template uses Supabase's Go template syntax:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Password reset link with code | `http://localhost:3000/bg/reset-password?code=abc123...` |
| `{{ .Email }}` | User's email address | `user@example.com` |
| `{{ .SiteURL }}` | Your site URL | `http://localhost:3000` or `https://trudify.com` |

## 🌍 Language

The template is in **Bulgarian** because:
- Bulgarian is your primary market
- Supabase doesn't natively support multiple language templates per auth email
- Most of your users will be Bulgarian speakers

### Adding Other Languages (Optional)

If you need English or Russian later:
1. Duplicate the template
2. Replace Bulgarian text with translated version
3. Use a separate Supabase project per language (not recommended)
4. Or keep Bulgarian as universal (recommended)

## ✅ Checklist

Before going to production:

- [ ] Template pasted into Supabase Dashboard
- [ ] Test email sent and received
- [ ] Reset link works correctly
- [ ] Redirects to `/[lang]/reset-password`
- [ ] Password update works
- [ ] Email renders correctly on mobile
- [ ] Outlook compatibility verified (falls back to text logo)

## 🔧 Customization

### Change Logo

Replace the SVG handshake icon with an image:

```html
<!-- Replace this section in the template -->
<img src="https://trudify.com/logo.png"
     alt="Trudify"
     style="max-width: 150px; height: auto;" />
```

### Update Footer Links

Replace placeholder links:

```html
<p>
  <a href="https://trudify.com">Уебсайт</a> |
  <a href="https://trudify.com/privacy">Поверителност</a> |
  <a href="https://trudify.com/terms">Условия</a>
</p>
```

### Change Colors

Update these CSS values:
- Primary blue: `#0066CC`
- Warning yellow: `#ffc107`
- Background: `#f5f5f5`

## 🆚 Difference from SendGrid Template

| Feature | SendGrid Template | Supabase Template |
|---------|------------------|-------------------|
| **Variables** | `{{user_name}}`, `{{reset_link}}` | `{{ .Email }}`, `{{ .ConfirmationURL }}` |
| **Multilingual** | ✅ Dynamic per user | ❌ One language only |
| **Template ID** | ✅ Required in env vars | ❌ Not needed |
| **Location** | SendGrid Dashboard | Supabase Dashboard |
| **Used For** | Notifications (tasks, apps) | Auth emails (reset, verify) |

## 📧 Other Supabase Auth Emails

You may want to customize these templates too:

### Email Verification (Signup Confirmation)
- **When**: User signs up with email/password
- **Variable**: `{{ .ConfirmationURL }}`
- **Location**: Authentication → Email Templates → "Confirm signup"
- **Recommended**: Use a similar branded template

### Magic Link (Passwordless Login)
- **When**: User requests passwordless login
- **Variable**: `{{ .ConfirmationURL }}`
- **Location**: Authentication → Email Templates → "Magic Link"
- **Note**: Not currently used in TaskBridge

### Change Email
- **When**: User changes their email address
- **Variable**: `{{ .ConfirmationURL }}`
- **Location**: Authentication → Email Templates → "Change Email"
- **Note**: Future feature

## 🐛 Troubleshooting

### Email not received
1. Check Supabase Dashboard → Logs → Auth Logs
2. Verify SMTP settings (Authentication → SMTP Settings)
3. Check spam folder
4. Confirm email address exists in database

### Link shows "expired" error
1. Ensure you clicked the link within 1 hour
2. Request a new reset email
3. Check browser console for errors
4. Verify `exchangeCodeForSession()` is working (check `/src/app/[lang]/reset-password/reset-password-content.tsx`)

### Template not updating
1. Hard refresh browser (Cmd+Shift+R)
2. Clear Supabase cache
3. Wait 1-2 minutes for changes to propagate

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Go Template Syntax](https://pkg.go.dev/text/template)
- TaskBridge password reset implementation: `/src/app/[lang]/forgot-password/`

## 🎯 Summary

You now have:
- ✅ Branded password reset email in Bulgarian
- ✅ Matching your existing Trudify design system
- ✅ Configured in Supabase (not SendGrid)
- ✅ Tested and working locally

The template automatically uses your configured SendGrid SMTP for delivery while using Supabase's template system for content.
