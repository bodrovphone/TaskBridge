# Phone Number Verification - Research & Implementation Plan

## Task Description
Research and implement phone number verification for TaskBridge, enabling verified phone numbers for:
1. Automatic sharing of customer phone to professional upon application acceptance
2. Future Viber/WhatsApp transactional notifications
3. User consent collection for notification preferences

## Research Summary

### Current State
- **Auth providers**: Email/password, Google OAuth, Facebook OAuth (Telegram auth commented out)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Email**: SendGrid (Twilio company)
- **Notifications**: Telegram notifications already implemented (see `/src/lib/services/telegram-notification.ts`)

---

## Provider Analysis

### 1. Supabase Built-in Phone Auth

**How it works:**
- Supabase supports phone login via SMS OTP out of the box
- Supported providers: Twilio, Twilio Verify, MessageBird, Vonage, TextLocal
- Uses "Send SMS Hook" for custom provider integration

**Pricing:**
- **Supabase MFA Phone Feature**: $75/month for first project (if using MFA)
- **Third-party SMS costs**: Depends on provider (see below)

**Pros:**
- Native Supabase integration (no extra auth infrastructure)
- Supports custom SMS providers via Auth Hooks
- Phone number stored automatically in `auth.users`
- Works with existing Supabase RLS policies

**Cons:**
- SMS costs add up quickly (~$0.05-0.10 per verification)
- Requires enabling phone auth provider in dashboard
- Extra monthly cost if using MFA feature

**Best for:** Full phone-as-login authentication

**Sources:**
- [Supabase Phone Login Docs](https://supabase.com/docs/guides/auth/phone-login)
- [Send SMS Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)

---

### 2. Twilio Verify (Recommended for SendGrid Users)

**How it works:**
- Standalone verification API (separate from login)
- Send OTP via SMS, Voice, WhatsApp, or Email
- Auto-validates codes server-side

**Pricing:**
- **Base**: $0.05 per successful verification
- **SMS cost**: ~$0.0079/SMS (US), varies by country
- **Bulgaria SMS**: ~$0.05-0.08 per SMS (estimated)
- **WhatsApp**: Supported as channel

**Bundle with SendGrid?**
- **No direct bundle** - Twilio acquired SendGrid but they're billed separately
- However, same Twilio account can manage both
- Volume discounts may be negotiated for combined usage

**Pros:**
- Already part of Twilio ecosystem (you use SendGrid)
- Simple API, well-documented
- Built-in fraud protection (Fraud Guard at $2,500/100k SMS)
- WhatsApp channel available

**Cons:**
- Per-verification fee ON TOP of SMS cost
- More expensive than alternatives

**Sources:**
- [Twilio Verify Pricing](https://www.twilio.com/en-us/verify/pricing)
- [Twilio SMS Bulgaria Pricing](https://www.twilio.com/en-us/sms/pricing/bg)

---

### 3. Plivo Verify (Best Value)

**How it works:**
- Similar to Twilio Verify but NO per-verification fee
- You only pay for SMS/Voice calls
- Built-in Fraud Shield (FREE)

**Pricing:**
- **Verification fee**: $0 (FREE!)
- **Bulgaria SMS**: ~$0.0055 per SMS
- **Fraud Shield**: FREE (vs Twilio's $2,500)
- **Free inbound SMS**

**Comparison:**
| Provider | Per SMS (Bulgaria) | Verification Fee | Fraud Protection |
|----------|-------------------|------------------|------------------|
| Twilio | ~$0.08 | $0.05/success | $2,500/100k |
| Plivo | ~$0.0055 | $0 | FREE |
| **Savings** | **~93%** | **100%** | **100%** |

**Pros:**
- Significantly cheaper than Twilio
- No verification surcharge
- Free fraud protection
- Good documentation
- 190+ countries supported

**Cons:**
- Separate account from SendGrid
- Less brand recognition than Twilio
- May need to manage two providers

**Sources:**
- [Plivo Verify Pricing](https://www.plivo.com/verify/pricing/)
- [Plivo Bulgaria SMS Pricing](https://www.plivo.com/sms/pricing/bg/)

---

### 4. Telegram Gateway (Cheapest Option)

**How it works:**
- Send verification codes via Telegram instead of SMS
- User must have Telegram app and registered phone number
- Fallback to SMS/WhatsApp if user not on Telegram

**Pricing:**
- **$0.01 per verification** (50x cheaper than SMS!)
- Automatic refunds for undelivered codes
- No per-message fees

**Pros:**
- Extremely cheap ($0.01 vs $0.05-0.10)
- End-to-end encrypted
- No SIM swap fraud risk
- Works globally
- Already have Telegram bot (Trudify_bot)

**Cons:**
- Only works for Telegram users (~950M users worldwide)
- Bulgaria Telegram penetration unknown (popular in Eastern Europe)
- Needs SMS fallback for non-Telegram users
- Relatively new service

**Sources:**
- [Telegram Gateway](https://core.telegram.org/gateway)
- [Telegram Gateway API](https://core.telegram.org/gateway/api)

---

### 5. Firebase Phone Auth (Alternative)

**How it works:**
- Google's phone authentication service
- Free tier available

**Pricing:**
- **Free tier**: 10,000 verifications/month (Blaze plan)
- **After free tier**: $0.01-0.06 per SMS (country dependent)
- **Requires**: Google Cloud billing account

**Pros:**
- Generous free tier
- Google infrastructure reliability
- Well-documented

**Cons:**
- Separate auth system from Supabase
- Would need to sync users between Firebase and Supabase
- More complex architecture
- Not recommended for Supabase projects

**Sources:**
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## Future Notifications Analysis

### WhatsApp Business API

**Pricing (2024/2025):**
- **Service messages** (24hr window): FREE
- **Utility messages** (transactional): ~$0.02-0.05 per message
- **Authentication messages**: ~$0.03-0.06 per message
- Volume tiers reduce costs at scale (starting July 2025)

**Key Points:**
- Free service window makes customer support cheap
- Transactional notifications (order updates, etc.) have reasonable costs
- Requires WhatsApp Business API approval
- Can use Twilio as BSP (Business Solution Provider)

**Sources:**
- [WhatsApp Business Platform Pricing](https://business.whatsapp.com/products/platform-pricing)

### Viber Business Messages

**Pricing (2024):**
- **Transactional messages**: Per-message fee (cheaper than promotional)
- **Session messages**: 60 messages within 24hr window
- **Minimum monthly**: 100-150 EUR per sender ID
- **Bulgaria domestic rate**: Available (contact provider)

**Key Points:**
- Popular in Bulgaria and Eastern Europe
- Minimum monthly commitment required
- Best for businesses with consistent message volume

**Sources:**
- [Viber Business Pricing](https://www.infobip.com/viber-business/pricing)

---

## Recommendation

### For Phone Verification: Hybrid Approach

**Primary: Telegram Gateway + SMS Fallback**

```
User enters phone number
→ Check if phone registered on Telegram
   → YES: Send via Telegram Gateway ($0.01)
   → NO: Fall back to SMS via Plivo ($0.0055)
```

**Why this approach:**
1. **Cost savings**: 50-90% cheaper than Twilio-only
2. **Bulgaria market fit**: Telegram popular in Eastern Europe
3. **User experience**: Telegram codes arrive instantly
4. **Fraud protection**: Telegram has built-in anti-fraud
5. **Future-proof**: Already have Telegram bot infrastructure

### Alternative: Plivo-Only (Simpler)

If you prefer simplicity over maximum cost savings:
- Use Plivo Verify for all phone verifications
- ~$0.0055 per verification (Bulgaria)
- No need to manage multiple providers

### NOT Recommended

- **Twilio Verify**: Too expensive for startup
- **Firebase Phone Auth**: Adds complexity with Supabase
- **Supabase Phone Login**: Better for login, not just verification

---

## Implementation Plan

### Phase 1: Database Schema (Day 1)

**Add fields to `users` table:**
```sql
-- Add phone verification fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_consent_notifications BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_consent_share_on_acceptance BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_messaging_channel TEXT DEFAULT 'telegram';
-- Values: 'telegram', 'whatsapp', 'viber', 'sms'

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Add constraint for valid phone format (E.164)
ALTER TABLE users ADD CONSTRAINT phone_number_format
  CHECK (phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{6,14}$');
```

**Acceptance Criteria:**
- [ ] Migration created and applied
- [ ] TypeScript types updated
- [ ] No breaking changes to existing users

---

### Phase 2: Verification Service (Days 2-3)

**Create `/src/lib/services/phone-verification.ts`:**

```typescript
// Phone verification service with Telegram Gateway + Plivo fallback

interface VerificationResult {
  success: boolean;
  channel: 'telegram' | 'sms';
  requestId?: string;
  error?: string;
}

// Send verification code
export async function sendVerificationCode(
  phoneNumber: string
): Promise<VerificationResult>

// Verify code entered by user
export async function verifyCode(
  phoneNumber: string,
  code: string,
  requestId: string
): Promise<{ verified: boolean; error?: string }>

// Check if phone is on Telegram (for optimization)
export async function checkTelegramAvailability(
  phoneNumber: string
): Promise<boolean>
```

**API Routes:**
- `POST /api/verify/phone/send` - Send verification code
- `POST /api/verify/phone/verify` - Verify entered code
- `GET /api/verify/phone/status` - Check verification status

**Acceptance Criteria:**
- [ ] Telegram Gateway integration working
- [ ] Plivo fallback working
- [ ] Rate limiting implemented (1 code per 60 seconds)
- [ ] Error handling for all edge cases

---

### Phase 3: Consent Collection UI (Day 4)

**Create phone verification modal with consent:**

```typescript
// /src/components/ui/phone-verification-modal.tsx

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phoneNumber: string, consents: UserConsents) => void;
  context: 'profile' | 'application-acceptance' | 'settings';
}

interface UserConsents {
  shareOnAcceptance: boolean;  // Share phone when application accepted
  allowNotifications: boolean;  // Allow Viber/WhatsApp notifications
  preferredChannel: 'telegram' | 'whatsapp' | 'viber' | 'sms';
}
```

**UI Flow:**
1. User enters phone number (with country code picker)
2. User sees consent checkboxes:
   - [ ] "Share my phone number with professionals when I accept their application"
   - [ ] "Send me task updates via [Telegram/WhatsApp/Viber]" (dropdown)
3. User clicks "Send Code"
4. User enters 6-digit code
5. User clicks "Verify"
6. Success! Phone saved with consents

**Acceptance Criteria:**
- [ ] Phone input with country code picker (Bulgaria default)
- [ ] Clear consent language (GDPR compliant)
- [ ] Loading states during verification
- [ ] Error messages for invalid codes
- [ ] Success state with confirmation
- [ ] i18n support (EN/BG/RU)

---

### Phase 4: Profile Integration (Day 5)

**Add to profile page:**
- Phone number display (masked: +359 88 *** **45)
- "Verify Phone" button if not verified
- Edit consents section
- Re-verify option if number changes

**Trigger points:**
- Profile settings page
- First time posting a task
- First time accepting an application

**Acceptance Criteria:**
- [ ] Phone verification accessible from profile
- [ ] Masked display for verified numbers
- [ ] Consent management UI
- [ ] "Verified" badge on profile

---

### Phase 5: Application Acceptance Flow (Day 6)

**Auto-share phone on acceptance:**

```typescript
// When customer accepts professional's application:

async function acceptApplication(applicationId: string) {
  // 1. Update application status
  await updateApplicationStatus(applicationId, 'accepted');

  // 2. Check if customer has verified phone + consent
  const customer = await getCustomerWithPhoneConsent(customerId);

  if (customer.phone_verified && customer.phone_consent_share_on_acceptance) {
    // 3. Share phone with professional
    await sharePhoneWithProfessional(
      customerId,
      professionalId,
      taskId
    );

    // 4. Notify professional via their preferred channel
    await sendNotification(professionalId, 'phone_shared', {
      customerPhone: customer.phone_number,
      taskTitle: task.title
    });
  }
}
```

**Acceptance Criteria:**
- [ ] Phone auto-shared on acceptance (if consent given)
- [ ] Professional receives notification with phone
- [ ] Customer can see "Phone shared" in activity log
- [ ] Privacy-respecting (only share if consented)

---

## Environment Variables

```bash
# Telegram Gateway (Primary)
TG_GATEWAY_API_TOKEN=your_telegram_gateway_token

# Plivo (Fallback)
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_PHONE_NUMBER=+359xxxxxxxxx  # Bulgarian sender number

# Rate limiting
PHONE_VERIFY_RATE_LIMIT_SECONDS=60
PHONE_VERIFY_CODE_EXPIRY_MINUTES=10
```

---

## Cost Projections

### MVP Phase (100 users/month)
| Scenario | Telegram Gateway | Plivo SMS | Total |
|----------|-----------------|-----------|-------|
| 70% Telegram users | 70 × $0.01 = $0.70 | 30 × $0.0055 = $0.17 | **$0.87/month** |
| 50% Telegram users | 50 × $0.01 = $0.50 | 50 × $0.0055 = $0.28 | **$0.78/month** |
| Plivo only | - | 100 × $0.0055 = $0.55 | **$0.55/month** |
| Twilio only | - | 100 × $0.13 = $13.00 | **$13.00/month** |

### Growth Phase (1,000 users/month)
| Scenario | Telegram Gateway | Plivo SMS | Total |
|----------|-----------------|-----------|-------|
| 70% Telegram | 700 × $0.01 = $7 | 300 × $0.0055 = $1.65 | **$8.65/month** |
| Plivo only | - | 1000 × $0.0055 = $5.50 | **$5.50/month** |
| Twilio only | - | 1000 × $0.13 = $130 | **$130/month** |

### Scale Phase (10,000 users/month)
| Scenario | Telegram Gateway | Plivo SMS | Total |
|----------|-----------------|-----------|-------|
| 70% Telegram | $70 | $16.50 | **$86.50/month** |
| Plivo only | - | $55 | **$55/month** |
| Twilio only | - | $1,300 | **$1,300/month** |

**Summary:** Plivo-only is cheapest at scale; Telegram hybrid slightly more expensive but better UX.

---

## Security Considerations

1. **Rate Limiting**: 1 verification per phone per 60 seconds
2. **Code Expiry**: Codes expire after 10 minutes
3. **Attempt Limits**: Max 3 attempts per code
4. **Phone Format**: Validate E.164 format server-side
5. **Consent Audit**: Log all consent changes with timestamps
6. **GDPR Compliance**: Users can revoke consent anytime
7. **Data Retention**: Store only necessary phone data

---

## Acceptance Criteria (Overall)

- [ ] Users can verify phone number in profile
- [ ] Clear consent collection for phone sharing
- [ ] Clear consent collection for notifications
- [ ] Phone auto-shared on application acceptance (if consented)
- [ ] Verification works via Telegram or SMS fallback
- [ ] All UI translated (EN/BG/RU)
- [ ] GDPR compliant consent management
- [ ] Rate limiting prevents abuse
- [ ] Cost-effective provider integration

---

## Technical Notes

### Supabase Phone Auth vs Custom Verification

We're NOT using Supabase's built-in phone auth because:
1. We want phone verification, not phone-as-login
2. Custom verification gives us more control over consent flow
3. Avoids $75/month MFA phone feature cost
4. Can use cheaper providers (Telegram, Plivo)

### SendGrid + Twilio Bundle Question

**Answer:** No direct bundle exists. SendGrid and Twilio Verify are billed separately even though Twilio owns SendGrid. However:
- Same Twilio account can manage both
- Volume discounts negotiable for combined usage
- For your scale, Plivo is still cheaper than bundling with Twilio

---

## Priority
**High** - Required for core marketplace functionality (customer-professional communication)

## Dependencies
- Telegram Gateway account setup
- Plivo account setup
- Database migration
- i18n translations for consent language

## Estimated Effort
- Phase 1 (Schema): 2 hours
- Phase 2 (Service): 4-6 hours
- Phase 3 (UI): 4-6 hours
- Phase 4 (Profile): 2-3 hours
- Phase 5 (Acceptance): 3-4 hours
- **Total**: 2-3 days of active development

## Future Enhancements (Not in Scope)
- WhatsApp Business API integration
- Viber Business Messages integration
- SMS marketing campaigns
- Phone number as login option
