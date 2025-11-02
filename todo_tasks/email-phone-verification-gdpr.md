# Email/Phone Verification & GDPR Compliance

## Overview
Implement proper email/phone change workflows with verification and GDPR-compliant data handling.

## Problems to Solve

### 1. Email Change Flow
**Current:** Email field is editable in profile form
**Issue:** Changing email should require:
- Verification via new email
- Confirmation from old email (security)
- Update in both `auth.users` and `public.users`

**Solution:**
- Make email read-only in profile form
- Add "Change Email" button → Opens separate modal
- Send verification link to new email
- Require current password confirmation
- Update Supabase auth email via `supabase.auth.updateUser()`

### 2. Phone Number Verification
**Current:** Phone can be edited but `is_phone_verified` doesn't update
**Issue:** Need SMS verification flow

**Solution Options:**
- **Option A:** Twilio/Vonage SMS (costs money)
- **Option B:** Supabase Phone Auth (free tier: 10k MAU)
- **Option C:** Manual verification (admin reviews docs)

**Recommendation:** Start with Option C for MVP, add Option B when scaling

### 3. GDPR Compliance

**Required Features:**
- [ ] **Data Export**: User can download all their data (JSON/PDF)
- [ ] **Data Deletion**: User can request account deletion
- [ ] **Privacy Policy**: Clear explanation of data usage
- [ ] **Consent Tracking**: Log when user accepted terms
- [ ] **Data Minimization**: Don't collect unnecessary data
- [ ] **Right to Rectification**: Users can correct their data (✅ Done via profile edit)

**Files to Create:**
- `/app/[lang]/privacy/page.tsx` - Privacy policy page
- `/app/[lang]/terms/page.tsx` - Terms of service page
- `/app/api/gdpr/export/route.ts` - Data export endpoint
- `/app/api/gdpr/delete/route.ts` - Account deletion endpoint

### 4. Sensitive Data Handling

**Current Issues:**
- Profile completion % exposes data existence
- No audit log for profile changes
- No rate limiting on profile updates

**Needed:**
- Audit log table (`user_profile_changes`)
- Rate limiting middleware
- Encryption for sensitive fields (VAT number, phone)

## Priority
**MEDIUM** - Not blocking MVP launch, but needed before public release in EU

## Estimated Effort
- Email change flow: 4 hours
- Phone verification: 8 hours (Option B) or 1 hour (Option C)
- GDPR data export: 2 hours
- GDPR account deletion: 3 hours
- Privacy/Terms pages: 2 hours
- **Total: ~20 hours**

## Dependencies
- Phone Auth: Supabase Phone provider setup
- SMS: Twilio/Vonage account (if chosen)
- Legal: Lawyer-reviewed privacy policy text

## References
- GDPR Requirements: https://gdpr.eu/checklist/
- Supabase Auth: https://supabase.com/docs/guides/auth
- Email Change: https://supabase.com/docs/guides/auth/auth-email-templates
