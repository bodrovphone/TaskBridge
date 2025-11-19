# Email Templates Customization

## Task Description
Customize Supabase authentication email templates with Trudify branding and multilingual support (EN/BG/RU). Create professional, mobile-friendly email templates that match the brand identity and provide a great user experience.

## Requirements

### 1. Templates to Customize

In Supabase Dashboard → Authentication → Email Templates:

**Priority Templates:**
- **Confirm signup** - Email verification (HIGHEST PRIORITY)
- **Magic Link** - Passwordless login
- **Reset Password** - Password recovery

**Secondary Templates:**
- Change Email Address
- Reauthentication

### 2. Branding Requirements

**Visual Identity:**
- Trudify logo/header
- Brand colors (primary: #0066CC, secondary: #00A86B)
- Professional typography
- Mobile-responsive design
- Footer with social links and contact info

**Content Requirements:**
- Clear, friendly copy
- Strong call-to-action buttons
- Security reassurance messaging
- Help/support links

### 3. Multilingual Support

**Languages:**
- English (EN)
- Bulgarian (BG)
- Russian (RU)

**Implementation Strategy:**

Since Supabase doesn't natively support multiple language templates, use one of these approaches:

**Option A: Detect Language from User Metadata**
- Store user's preferred language in `user_metadata.locale`
- Use conditional logic in template:
```html
{{ if eq .Data.locale "bg" }}
  <!-- Bulgarian content -->
{{ else if eq .Data.locale "ru" }}
  <!-- Russian content -->
{{ else }}
  <!-- English content (default) -->
{{ end }}
```

**Option B: Multiple SendGrid Templates** (Alternative)
- Create 3 separate email templates in SendGrid
- Use Supabase webhook to intercept email sending
- Route to appropriate template based on user locale
- More complex but cleaner separation

### 4. Available Template Variables

Use these Supabase variables for personalization:

**Confirmation Email:**
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .Token }}` - 6-digit OTP (alternative to link)
- `{{ .Email }}` - User's email address
- `{{ .Data.locale }}` - User's language preference (custom)
- `{{ .SiteURL }}` - Application URL

**Password Reset:**
- `{{ .ConfirmationURL }}` - Password reset link
- `{{ .Token }}` - 6-digit OTP
- `{{ .Email }}` - User's email

**Magic Link:**
- `{{ .ConfirmationURL }}` - Login link
- `{{ .Token }}` - 6-digit OTP
- `{{ .Email }}` - User's email

## Template Structure

### Confirmation Email Example:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Trudify</title>
  <style>
    /* Mobile-responsive styles */
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button {
      background: #0066CC;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
    }
    .footer { color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo -->
    <img src="https://trudify.com/logo.png" alt="Trudify" style="max-width: 150px;">

    <!-- Multilingual content -->
    {{ if eq .Data.locale "bg" }}
      <h2>Потвърдете вашия имейл</h2>
      <p>Здравейте!</p>
      <p>Благодарим, че се регистрирахте в Trudify. Моля, потвърдете вашия имейл адрес, като кликнете на бутона по-долу:</p>
      <p><a href="{{ .ConfirmationURL }}" class="button">Потвърдете имейл</a></p>
      <p>Или копирайте този линк: {{ .ConfirmationURL }}</p>
      <p>Този линк е валиден 24 часа.</p>
    {{ else if eq .Data.locale "ru" }}
      <h2>Подтвердите ваш email</h2>
      <p>Здравствуйте!</p>
      <p>Спасибо за регистрацию в Trudify. Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
      <p><a href="{{ .ConfirmationURL }}" class="button">Подтвердить email</a></p>
      <p>Или скопируйте эту ссылку: {{ .ConfirmationURL }}</p>
      <p>Эта ссылка действительна 24 часа.</p>
    {{ else }}
      <h2>Verify Your Email</h2>
      <p>Hello!</p>
      <p>Thanks for signing up for Trudify. Please verify your email address by clicking the button below:</p>
      <p><a href="{{ .ConfirmationURL }}" class="button">Verify Email</a></p>
      <p>Or copy this link: {{ .ConfirmationURL }}</p>
      <p>This link will expire in 24 hours.</p>
    {{ end }}

    <!-- Footer -->
    <div class="footer">
      <p>© 2025 Trudify. All rights reserved.</p>
      <p>Need help? Contact us at support@trudify.com</p>
    </div>
  </div>
</body>
</html>
```

## Acceptance Criteria

- [ ] Confirmation signup email template customized with Trudify branding
- [ ] Magic link email template customized
- [ ] Password reset email template customized
- [ ] All templates are mobile-responsive
- [ ] Multilingual support implemented (EN/BG/RU)
- [ ] Templates tested on major email clients (Gmail, Outlook, Apple Mail)
- [ ] CTA buttons are prominent and work correctly
- [ ] Fallback text links provided if buttons don't render
- [ ] User locale stored in `user_metadata.locale` during signup
- [ ] Templates validated and sent successfully via SendGrid

## Technical Notes

### Storing User Locale on Signup

When user signs up, store their language preference:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      locale: currentLocale // 'en', 'bg', or 'ru'
    }
  }
})
```

### Testing Templates

1. Update template in Supabase Dashboard
2. Sign up test users with different locales
3. Check email rendering in:
   - Gmail (desktop + mobile)
   - Outlook
   - Apple Mail
   - Yahoo Mail (optional)

### Email Best Practices

- **Subject Lines:**
  - EN: "Verify Your Email - Trudify"
  - BG: "Потвърдете вашия имейл - Trudify"
  - RU: "Подтвердите ваш email - Trudify"
- **Preheader Text:** First line of email (shows in inbox preview)
- **Alt Text:** For images (in case images don't load)
- **Plain Text Version:** Include plain text fallback
- **Unsubscribe Link:** Not needed for transactional emails, but good practice

## Priority
Medium - Important for brand consistency and user experience, but core functionality works without customization

## Notes
- Start with "Confirm signup" template (most important)
- Test thoroughly across email clients
- Consider using Litmus or Email on Acid for testing (optional)
- Keep templates simple and fast-loading
- Avoid too many images (affects load time and spam filters)
- SendGrid provides email analytics - use to track open rates
