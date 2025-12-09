# Language Confirmation on First Registration

## Task Description
Add a language confirmation step after user registration to ensure notifications are sent in the correct language. Currently, user's `preferred_language` is auto-detected from URL/cookie at registration time, which can be wrong (especially with Google OAuth).

**Note**: This may be a false positive - needs investigation to confirm this is actually causing wrong-language notifications. The issue could also be:
- Google OAuth not preserving locale in redirect
- Language picker API failing silently
- Cookie/DB sync issues

## Background Analysis
See `docs/LOCALIZED_NOTIFICATIONS_IMPLEMENTATION.md` for notification system details.

**Current flow**:
1. User visits site (URL sets `NEXT_LOCALE` cookie)
2. OAuth redirects → callback reads cookie → saves to `preferred_language` in DB
3. Notifications use `preferred_language` from DB
4. If initial detection was wrong, notifications go out in wrong language

**Two separate systems that can diverge**:
- `NEXT_LOCALE` cookie → UI language routing
- `preferred_language` DB field → notification language

## Requirements
- Show language confirmation on first visit after registration
- Store confirmation flag to avoid repeat prompts
- Allow user to change language before confirming
- Update `preferred_language` in DB based on user choice

## Proposed Implementation Options

### Option 1: Welcome Banner (Simplest)
- Dismissible banner at top of page
- "Your notification language is set to English. [Change] [OK]"
- Least intrusive

### Option 2: Onboarding Modal
- Modal dialog after first login
- More prominent but more intrusive

### Option 3: Profile Completion Prompt
- Highlight language setting in profile completion flow
- Natural if we have other onboarding steps

## Acceptance Criteria
- [ ] Investigate if this is actually causing wrong-language notifications
- [ ] Add `language_confirmed` flag to user profile (or similar)
- [ ] Show confirmation UI on first visit after registration
- [ ] User can confirm or change their language preference
- [ ] Confirmation updates `preferred_language` in DB
- [ ] Never show confirmation again after user confirms
- [ ] Works for both OAuth and email registration flows

## Technical Notes
- Check `src/app/auth/callback/route.ts` for registration flow
- Check `src/lib/services/notification-service.ts` for how locale is used
- Language picker already updates DB via `/api/profile` endpoint
- May need new DB column `language_confirmed: boolean`

## Investigation First
Before implementing, verify:
1. Check real user data - are `preferred_language` values actually wrong?
2. Test Google OAuth flow - does it preserve locale correctly?
3. Check if language picker API updates are succeeding

## Priority
Medium - User trust issue but needs investigation to confirm root cause

## Related Files
- `src/app/auth/callback/route.ts`
- `src/lib/services/notification-service.ts`
- `src/lib/utils/notification-i18n.ts`
- `src/components/common/language-switcher.tsx`
- `docs/LOCALIZED_NOTIFICATIONS_IMPLEMENTATION.md`
