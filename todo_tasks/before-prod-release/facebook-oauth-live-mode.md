# Facebook OAuth - Switch to Live Mode

## Task Description
Enable Facebook Login for all users by switching the Facebook app from Development Mode to Live Mode.

## Current State (Dec 16, 2024)
- Facebook App ID: `4351312728438333`
- Mode: **Development** (only admins/testers can log in)
- Status: **⏳ Waiting for Business Verification**
- Error for regular users: "Приложение неактивно" (App inactive)

## Progress

| Step | Status |
|------|--------|
| App Configuration (platform, privacy, data handling) | ✅ Done |
| Business Verification | ⏳ Submitted (Dec 16, 2024) - waiting 1-3 days |
| App Review | ⏸️ Blocked by Business Verification |
| Go Live | ⏸️ Blocked by App Review |

## After Business Verification Approved
1. Complete App Review (add testing instructions)
2. Submit for Facebook review
3. Switch app to Live Mode
4. Uncomment Facebook button in code (`auth-slide-over.tsx`)

**MVP Decision:** Launch with Google + Email. Enable Facebook when verification completes.

## Requirements

### 1. Prerequisites (need production domain first)
- [ ] Production domain live (`trudify.com`)
- [ ] Privacy Policy page published at `https://trudify.com/privacy`
- [ ] Terms of Service page (optional but recommended) at `https://trudify.com/terms`

### 2. Facebook Developer Console Configuration
- [ ] Go to [Facebook Developers](https://developers.facebook.com/apps/4351312728438333/)
- [ ] **Settings → Basic**:
  - [ ] Add App Icon (1024x1024)
  - [ ] Set Privacy Policy URL: `https://trudify.com/privacy`
  - [ ] Set Terms of Service URL: `https://trudify.com/terms`
  - [ ] Add App Domains: `trudify.com`
- [ ] **Facebook Login → Settings**:
  - [ ] Verify Valid OAuth Redirect URI: `https://nyleceedixybtogrwilv.supabase.co/auth/v1/callback`
- [ ] Toggle **App Mode** from "Development" to "Live"

### 3. Test After Going Live
- [ ] Test Facebook login from production URL
- [ ] Verify callback redirects correctly
- [ ] Confirm user data (email, name) is received

## Acceptance Criteria
- [ ] Facebook Login button uncommented in `auth-slide-over.tsx`
- [ ] Any user can log in via Facebook (not just testers)
- [ ] No "App inactive" error appears
- [ ] User profile data populates correctly after login

## Code Changes Required

### Uncomment Facebook Login Button
**File**: `src/components/ui/auth-slide-over.tsx` (lines ~429-445)

The Facebook login button is currently commented out. After switching to Live Mode:
1. Search for `@todo BEFORE-PROD: Uncomment when Facebook app is switched to Live Mode`
2. Uncomment the `<NextUIButton>` block for Facebook login
3. Test the login flow

## Technical Notes
- Current redirect URI in Supabase: `https://nyleceedixybtogrwilv.supabase.co/auth/v1/callback`
- If switching to production Supabase, update redirect URI in Facebook settings
- Data deletion callback URL may be required by Facebook (can add later)

## Priority
High - Required for production launch

## Dependencies
- Production domain must be live first
- Privacy policy page must exist
