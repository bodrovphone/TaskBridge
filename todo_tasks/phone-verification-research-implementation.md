# Phone Number Verification - Research & Implementation Plan

## Task Description
Implement one-time phone number verification for TaskBridge user profiles, enabling:
1. Verified phone numbers stored in user profiles
2. Automatic sharing of customer phone to professional upon application acceptance
3. User consent collection for phone sharing and future notifications (WhatsApp/Viber)

## Use Case Summary

```
User Profile → Enter Phone → Receive ONE SMS Code → Verify → Done (forever)
                                       ↓
                              ONE SMS per user lifetime
                                       ↓
                        Phone stored for app purposes:
                        • Auto-share to professional on acceptance (with consent)
                        • Future WhatsApp/Viber notifications (not SMS)
```

**Key Point:** No ongoing SMS costs after initial verification. Future notifications will use WhatsApp/Viber, not SMS.

---

## Research Summary

### Current State
- **Auth providers**: Email/password, Google OAuth, Facebook OAuth
- **Backend**: Supabase (PostgreSQL + Auth)
- **Email**: SendGrid (Twilio company)
- **Notifications**: Telegram notifications implemented (`/src/lib/services/telegram-notification.ts`)

### SendGrid + Twilio Bundle?
**No direct bundle exists.** Twilio owns SendGrid but they're billed separately. For one-time verification at your scale, Plivo is significantly cheaper.

---

## Provider Comparison

| Provider | Per SMS (Bulgaria) | Verification Fee | Fraud Protection |
|----------|-------------------|------------------|------------------|
| **Twilio Verify** | ~$0.08 | $0.05/success | $2,500/100k SMS |
| **Plivo Verify** | ~$0.0055 | $0 (FREE) | FREE |
| Supabase Phone Auth | Provider-dependent | $75/month (MFA) | N/A |

### Recommendation: **Plivo Verify**

**Why Plivo:**
- **93% cheaper** than Twilio for Bulgaria SMS
- **No per-verification fee** (Twilio charges $0.05 extra per success)
- **Free fraud protection** (Twilio charges $2,500/100k)
- Simple REST API, good documentation
- 190+ countries supported

**Why NOT others:**
- **Twilio**: Too expensive (~$0.13 total vs $0.0055)
- **Supabase Phone Auth**: Designed for phone-as-login, overkill for profile verification, $75/month MFA fee
- **Firebase**: Adds complexity (separate auth system from Supabase)

**Sources:**
- [Plivo Verify Pricing](https://www.plivo.com/verify/pricing/)
- [Plivo Bulgaria SMS Pricing](https://www.plivo.com/sms/pricing/bg/)
- [Twilio Verify Pricing](https://www.twilio.com/en-us/verify/pricing)

---

## Cost Projections (One-Time)

Since each user only verifies once, these are **total lifetime costs**, not monthly:

| Total Users | Plivo Cost | Twilio Cost | Savings |
|-------------|------------|-------------|---------|
| 100 | $0.55 | $13.00 | 96% |
| 1,000 | $5.50 | $130.00 | 96% |
| 10,000 | $55.00 | $1,300.00 | 96% |
| 100,000 | $550.00 | $13,000.00 | 96% |

**Bottom line:** Phone verification for 10,000 users = $55 total with Plivo.

---

## Future Notifications (Reference Only)

For future WhatsApp/Viber notifications (not part of this implementation):

### WhatsApp Business API
- **Service messages** (24hr window): FREE
- **Utility/transactional**: ~$0.02-0.05 per message
- Requires WhatsApp Business API approval

### Viber Business Messages
- Popular in Bulgaria/Eastern Europe
- **Minimum monthly**: 100-150 EUR per sender ID
- Best for consistent message volume

---

## Implementation Plan

### Phase 1: Database Schema

**Add fields to `users` table:**
```sql
-- Phone verification fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Consent fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_consent_share_on_acceptance BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_consent_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_notification_channel TEXT DEFAULT 'whatsapp';
-- Values: 'whatsapp', 'viber', 'telegram'

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- E.164 format validation
ALTER TABLE users ADD CONSTRAINT phone_number_format
  CHECK (phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{6,14}$');
```

**Acceptance Criteria:**
- [ ] Migration created and applied
- [ ] TypeScript types updated in `src/types/supabase.ts`

---

### Phase 2: Verification Service

**Create `/src/lib/services/phone-verification.ts`:**

```typescript
interface VerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

// Send OTP via Plivo
export async function sendVerificationCode(
  phoneNumber: string
): Promise<VerificationResult>

// Verify code entered by user
export async function verifyCode(
  verificationId: string,
  code: string
): Promise<{ verified: boolean; error?: string }>
```

**API Routes:**
- `POST /api/verify/phone/send` - Send verification code
- `POST /api/verify/phone/confirm` - Verify entered code

**Acceptance Criteria:**
- [ ] Plivo Verify integration working
- [ ] Rate limiting (1 code per 60 seconds per phone)
- [ ] Code expiry (10 minutes)
- [ ] Max 3 attempts per code

---

### Phase 3: UI Components

**Create `/src/components/ui/phone-verification-modal.tsx`:**

**UI Flow:**
1. User enters phone number (with country code picker, Bulgaria +359 default)
2. User sees consent checkboxes:
   - [ ] "Share my phone with professionals when I accept their application"
   - [ ] "Send me task updates via WhatsApp/Viber" (optional, for future)
3. User clicks "Send Code"
4. User enters 6-digit code
5. User clicks "Verify"
6. Success! Phone saved with consents

**Acceptance Criteria:**
- [ ] Phone input with country code picker
- [ ] Clear consent language (GDPR compliant)
- [ ] Loading/error/success states
- [ ] i18n support (EN/BG/RU)

---

### Phase 4: Profile Integration

**Add to profile page (`/src/app/[lang]/profile/`):**
- Phone number display (masked: +359 88 *** **45)
- "Verify Phone" button if not verified
- "Verified" badge if verified
- Edit consents section

**Trigger points:**
- Profile settings page
- Optional prompt when posting first task
- Optional prompt when accepting first application

**Acceptance Criteria:**
- [ ] Phone verification accessible from profile
- [ ] Masked display for privacy
- [ ] Consent management UI

---

### Phase 5: Application Acceptance Integration

**Auto-share phone on acceptance:**

```typescript
async function acceptApplication(applicationId: string) {
  // 1. Update application status
  await updateApplicationStatus(applicationId, 'accepted');

  // 2. Check customer consent
  const customer = await getCustomer(customerId);

  if (customer.phone_verified && customer.phone_consent_share_on_acceptance) {
    // 3. Include phone in acceptance notification to professional
    await notifyProfessional(professionalId, {
      type: 'application_accepted',
      customerPhone: customer.phone_number,
      taskTitle: task.title
    });
  }
}
```

**Acceptance Criteria:**
- [ ] Phone shared on acceptance (if consented)
- [ ] Professional sees phone in notification
- [ ] Customer can see "Phone shared" confirmation

---

## Environment Variables

```bash
# Plivo credentials
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token

# Rate limiting
PHONE_VERIFY_RATE_LIMIT_SECONDS=60
PHONE_VERIFY_CODE_EXPIRY_MINUTES=10
PHONE_VERIFY_MAX_ATTEMPTS=3
```

---

## Security Considerations

1. **Rate Limiting**: 1 verification per phone per 60 seconds
2. **Code Expiry**: Codes expire after 10 minutes
3. **Attempt Limits**: Max 3 attempts per code
4. **Phone Format**: Validate E.164 format server-side
5. **Consent Audit**: Log consent changes with timestamps
6. **GDPR Compliance**: Users can revoke consent anytime

---

## Acceptance Criteria (Overall)

- [ ] Users can verify phone number in profile
- [ ] Clear consent collection for phone sharing
- [ ] Phone auto-shared on application acceptance (if consented)
- [ ] One-time SMS verification via Plivo
- [ ] All UI translated (EN/BG/RU)
- [ ] GDPR compliant consent management
- [ ] Rate limiting prevents abuse

---

## Priority
**High** - Required for customer-professional communication flow

## Dependencies
- Plivo account setup
- Database migration
- i18n translations for consent language

## Estimated Effort
- Phase 1 (Schema): 1-2 hours
- Phase 2 (Service): 3-4 hours
- Phase 3 (UI): 3-4 hours
- Phase 4 (Profile): 2-3 hours
- Phase 5 (Acceptance): 2-3 hours
- **Total**: 1.5-2 days of development

## Out of Scope (Future)
- WhatsApp Business API integration
- Viber Business Messages integration
- Phone number as login option
- SMS marketing campaigns
