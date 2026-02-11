# SendGrid to Resend Migration Plan

## Background

TaskBridge (Trudify) currently uses Twilio SendGrid for transactional emails. At <100 emails/month, SendGrid's pricing is excessive. This plan outlines migration to **Resend** -- the best alternative for our Next.js/TypeScript stack.

## Why Resend?

| Criteria | SendGrid (Current) | Resend (Target) |
|----------|-------------------|-----------------|
| **Free tier** | 100/day | 3,000/month (100/day) |
| **Cost at scale** | $19.95/month (Essentials) | $20/month (50K emails) |
| **Template system** | Dashboard-managed dynamic templates | React components in codebase |
| **Node.js integration** | Raw `fetch()` to REST API | First-class `resend` SDK |
| **Next.js support** | None | Official integration |
| **Template version control** | No (external dashboard) | Yes (git-tracked React components) |
| **Type safety** | No (string interpolation) | Yes (React props with TypeScript) |
| **Dev preview** | Must send test emails | `npx react-email dev` with hot reload |
| **Setup complexity** | DNS + dashboard + template IDs | `npm install` + 1 env var |

**Other alternatives considered and rejected:**
- **Brevo**: 9K/month free but poor TypeScript SDK, templates in external dashboard
- **Postmark**: Best deliverability but 100/month free tier is too tight, $15/month jump
- **Amazon SES**: Cheapest at scale but massive setup overhead (IAM, sandbox, DNS)
- **MailerSend**: Free tier reduced to 500/month, only 1 template on free plan
- **Mailgun**: Free tier is sandbox-only, $15/month for production
- **Loops**: Marketing-focused, $49/month paid tier
- **Plunk**: Too young/unproven for production

---

## Current SendGrid Integration Audit

### Environment Variables
```
SENDGRID_API_KEY=SG.xxx
SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION=d-xxx
SENDGRID_TEMPLATE_ID_NOTIFICATION=d-xxx
```

### Files That Send Emails (Direct SendGrid API Calls)

| File | Purpose | Priority |
|------|---------|----------|
| `/src/app/api/auth/signup/route.ts` | Verification email on signup | HIGH |
| `/src/app/api/auth/resend-verification/route.ts` | Resend verification email | HIGH |
| `/src/app/api/auth/unified/route.ts` | Unified login/register flow | HIGH |
| `/src/lib/services/email-notification.ts` | 9-type notification service | MEDIUM |

### Email Templates (HTML in `/docs/email-templates/`)

| Template | SendGrid Template ID | Status |
|----------|---------------------|--------|
| `01-email-verification.html` | `SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION` | Active |
| `04-base-notification.html` | `SENDGRID_TEMPLATE_ID_NOTIFICATION` | Ready, not yet triggered |

### Template Variables

**Email Verification:**
- `heading`, `greeting`, `user_name`, `message`, `button_text`
- `verification_link`, `link_instruction`, `footer_text`, `footer_rights`, `current_year`

**Base Notification (9 types):**
- `heading`, `greeting`, `user_name`, `message`
- `primary_button_text`, `primary_button_url`
- `secondary_button_text`, `secondary_button_url`
- `info_title`, `info_value`, `footer_text`, `footer_rights`, `current_year`

### Supporting Files (No Direct API Calls)

| File | Purpose |
|------|---------|
| `/src/lib/auth/email-verification.ts` | JWT token generation/verification (keep as-is) |
| `/src/lib/email/verification-templates.ts` | Locale-aware template content (keep as-is) |
| `/src/lib/intl/*/auth.ts` | Translation keys for emails (keep as-is) |
| `/src/lib/intl/*/notifications.ts` | Translation keys for notifications (keep as-is) |
| `/docs/SENDGRID_SETUP_QUICKSTART.md` | Setup documentation (update) |
| `/docs/sendgrid-email-verification-setup.md` | Setup documentation (update) |

### From Address
- `noreply@trudify.com` (domain verified in SendGrid with SPF/DKIM)

### Notification Priority System
1. **Telegram** (if `telegram_id` exists) -- Primary channel
2. **Email** (if `is_email_verified = true` AND no Telegram) -- Fallback
3. **None** -- If user has neither

This priority system stays the same after migration.

---

## Migration Plan

### Phase 1: Setup Resend Account & Domain (No code changes)

**Steps:**
1. Create Resend account at https://resend.com
2. Add and verify `trudify.com` domain (DNS records: SPF, DKIM, DMARC)
3. Get API key from Resend dashboard
4. Add `RESEND_API_KEY` to `.env.local` and Vercel environment variables
5. Test sending a basic email via Resend dashboard

**DNS Changes:**
- Remove SendGrid DNS records (SPF, DKIM CNAME entries)
- Add Resend DNS records (provided in Resend dashboard)
- Keep existing DMARC record, update to reference Resend

**Estimated effort:** DNS propagation may need up to 48 hours. Plan for overlap period where both providers are verified.

### Phase 2: Install Dependencies & Create Email Templates

**Install packages:**
```bash
npm install resend @react-email/components
```

**Create email template directory structure:**
```
/src/emails/
├── components/          # Shared email components
│   ├── email-layout.tsx # Base layout (Trudify header, footer, branding)
│   └── email-button.tsx # Reusable CTA button
├── email-verification.tsx       # Verification email template
└── base-notification.tsx        # Base notification template (9 types)
```

**Convert HTML templates to React Email components:**

The existing HTML templates in `/docs/email-templates/` serve as the design reference. Convert them to React components with:
- Same Trudify branding (primary `#0066CC`, secondary `#00A86B`, handshake icon)
- Same responsive layout
- TypeScript props instead of `{{dynamic_template_data}}` variables
- Same multi-language support via existing translation functions

**Example -- Email Verification Template:**
```tsx
// /src/emails/email-verification.tsx
import { Html, Head, Body, Container, Section, Text, Button, Img } from '@react-email/components';

interface EmailVerificationProps {
  heading: string;
  greeting: string;
  userName: string;
  message: string;
  buttonText: string;
  verificationLink: string;
  linkInstruction: string;
  footerText: string;
  footerRights: string;
  currentYear: string;
}

export default function EmailVerification({
  heading, greeting, userName, message,
  buttonText, verificationLink, linkInstruction,
  footerText, footerRights, currentYear,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header with Trudify branding */}
          <Section style={{ backgroundColor: '#0066CC', padding: '24px', textAlign: 'center' }}>
            <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>
              🤝 Trudify
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ backgroundColor: '#ffffff', padding: '32px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>{heading}</Text>
            <Text>{greeting} {userName},</Text>
            <Text>{message}</Text>
            <Button
              href={verificationLink}
              style={{
                backgroundColor: '#0066CC',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              {buttonText}
            </Button>
            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
              {linkInstruction}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '16px', textAlign: 'center' }}>
            <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
              {footerText}
            </Text>
            <Text style={{ fontSize: '12px', color: '#9ca3af' }}>
              © {currentYear} {footerRights}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Phase 3: Create Resend Email Service

**Create a new service file:**
```
/src/lib/services/resend-email.ts
```

This replaces the raw `fetch()` calls to SendGrid's API with Resend SDK calls:

```typescript
// /src/lib/services/resend-email.ts
import { Resend } from 'resend';
import EmailVerification from '@/emails/email-verification';
import BaseNotification from '@/emails/base-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  to: string,
  templateData: EmailVerificationProps
) {
  return resend.emails.send({
    from: 'Trudify <noreply@trudify.com>',
    to,
    subject: templateData.heading,
    react: EmailVerification(templateData),
  });
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  templateData: BaseNotificationProps
) {
  return resend.emails.send({
    from: 'Trudify <noreply@trudify.com>',
    to,
    subject,
    react: BaseNotification(templateData),
  });
}
```

### Phase 4: Migrate API Routes (One at a Time)

**Order of migration (by priority):**

#### 4.1 `/src/app/api/auth/signup/route.ts`
- Replace the `fetch('https://api.sendgrid.com/v3/mail/send', ...)` block
- Call `sendVerificationEmail()` from the new Resend service
- Remove `SENDGRID_API_KEY` and `SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION` references
- Test: Sign up with a new email, verify the verification email arrives

#### 4.2 `/src/app/api/auth/resend-verification/route.ts`
- Same replacement pattern as signup
- Keep the rate limiting logic (3 emails/hour) unchanged
- Test: Request verification resend, verify email arrives

#### 4.3 `/src/app/api/auth/unified/route.ts`
- Same replacement pattern
- Test: Register via unified endpoint, verify email arrives

#### 4.4 `/src/lib/services/email-notification.ts`
- Replace the SendGrid `fetch()` call in `sendEmailNotification()`
- Use `sendNotificationEmail()` from the new Resend service
- Keep the Telegram priority logic unchanged
- Keep the notification logging to `notification_logs` table
- Update the logged `metadata` to reference Resend instead of SendGrid template IDs
- Test: Trigger each of the 9 notification types

### Phase 5: Cleanup

**Remove:**
- `SENDGRID_API_KEY` from `.env.local`, `.env.local.example`, and Vercel
- `SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION` from all env files
- `SENDGRID_TEMPLATE_ID_NOTIFICATION` from all env files
- SendGrid DNS records from trudify.com domain

**Update:**
- `/docs/SENDGRID_SETUP_QUICKSTART.md` → rename to `RESEND_SETUP_QUICKSTART.md`
- `/docs/sendgrid-email-verification-setup.md` → rename to `resend-email-setup.md`
- `CLAUDE.md` references to SendGrid
- `.env.local.example` -- add `RESEND_API_KEY` entry

**Keep as-is (no changes needed):**
- `/src/lib/auth/email-verification.ts` (JWT logic, independent of email provider)
- `/src/lib/email/verification-templates.ts` (locale content, independent of provider)
- All translation files (same keys, same content)
- Password reset emails (handled by Supabase Auth, not SendGrid)
- Telegram notification service (unrelated)
- Notification priority system (Telegram → Email → None)

### Phase 6: Verify & Monitor

**Testing checklist:**
- [ ] Email verification on signup (EN/BG/RU)
- [ ] Resend verification email
- [ ] Unified auth registration flow
- [ ] All 9 notification email types render correctly
- [ ] Emails arrive in inbox (not spam)
- [ ] Trudify branding matches original templates
- [ ] Mobile-responsive email rendering
- [ ] Notification logging records Resend message IDs
- [ ] Rate limiting still works (3/hour for verification)
- [ ] `noreply@trudify.com` sender displays correctly

**Monitor (first 2 weeks):**
- Resend dashboard: delivery rates, bounces, spam complaints
- `notification_logs` table: check for `status: 'failed'` entries
- User reports of missing emails

---

## Environment Variable Changes

### Remove
```
SENDGRID_API_KEY
SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION
SENDGRID_TEMPLATE_ID_NOTIFICATION
```

### Add
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| DNS propagation delay | Medium | Low | Run both providers during transition (48h overlap) |
| Email deliverability drop | Low | Medium | Test with multiple providers (Gmail, Outlook, Yahoo) before cutover |
| Template rendering differences | Low | Low | Use `npx react-email dev` to preview before deploying |
| Resend outage | Low | Low | Same risk as SendGrid; notification system falls back to Telegram |
| Free tier limit hit | Very Low | Low | 3,000/month vs <100 usage = 30x headroom |

---

## Timeline Summary

| Phase | Description | Dependencies |
|-------|-------------|--------------|
| 1 | Resend account + domain verification | None |
| 2 | Install packages + create React email templates | Phase 1 (domain verified) |
| 3 | Create Resend email service | Phase 2 |
| 4 | Migrate API routes (4 files) | Phase 3 |
| 5 | Cleanup old SendGrid references | Phase 4 (all routes migrated) |
| 6 | Verify & monitor | Phase 5 |

## Priority
Medium -- SendGrid works but costs more than necessary. No urgent deadline.
