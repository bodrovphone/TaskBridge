# OAuth Providers Setup (Google & Facebook)

## Task Description
Configure Google and Facebook OAuth authentication for TaskBridge, including local development setup and production app verification.

## Requirements
- Enable Google OAuth for sign-up/sign-in
- Enable Facebook OAuth for sign-up/sign-in
- Configure local development redirect URLs
- Submit apps for production review/verification
- Handle OAuth callback properly in Next.js

## Acceptance Criteria
- [x] Google Cloud Console project created with OAuth 2.0 credentials
- [x] Redirect URLs configured in Google (localhost + production + Supabase callback)
- [x] Client ID/Secret added to Supabase Authentication → Providers
- [x] OAuth methods implemented in auth hook (use-auth.ts)
- [x] Local testing works: Click "Continue with Google" authenticates successfully
- [x] Existing users can link Google OAuth to their email/password accounts
- [x] OAuth callback route handles success/error cases properly
- [ ] Google OAuth consent screen branded (app name, logo, privacy policy, terms)
- [ ] Privacy Policy page created (required for OAuth verification)
- [ ] Terms of Service page created (required for OAuth verification)
- [ ] Production: Google app submitted for verification (removes "unverified app" warning)
- [ ] Facebook Developer app created with Facebook Login product (optional)
- [ ] Facebook OAuth configured and tested (optional)

## Technical Notes

### Google OAuth Setup
1. ✅ Go to [Google Cloud Console](https://console.cloud.google.com/)
2. ✅ Create new project or use existing
3. ✅ Enable Google+ API
4. ✅ Create OAuth 2.0 Client ID (Web application)
5. ✅ Add authorized redirect URIs:
   - `https://nyleceedixybtogrwilv.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
   - Production URL when deployed
6. ✅ Copy Client ID + Client Secret to Supabase Dashboard
7. ✅ Copy Client ID + Client Secret to `.env.local`
8. **Brand OAuth Consent Screen** (recommended before production):
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Click "EDIT APP"
   - Fill in:
     - App name: `Trudify`
     - App logo: Upload 120x120px logo
     - User support email: your-email@example.com
     - Application home page: `https://trudify.com` (or Vercel URL)
     - Privacy policy: `https://trudify.com/en/privacy` (create page first!)
     - Terms of service: `https://trudify.com/en/terms` (create page first!)
     - Authorized domains: `trudify.com`, `vercel.app`, `supabase.co` (required!)
   - Click Save
9. **For production**: Submit for Google verification (required to remove "unverified app" warning)

### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app (Consumer type)
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs in Settings → Facebook Login:
   - `https://nyleceedixybtogrwilv.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
5. Copy App ID + App Secret to Supabase Dashboard
6. **For production**: Submit app for review (required for public access)

### Supabase Configuration
- Dashboard → Authentication → URL Configuration:
  - Site URL: `http://localhost:3000` (dev) / production URL
  - Redirect URLs: Add localhost and production callback URLs
- Dashboard → Authentication → Providers:
  - Enable Google: Add Client ID + Secret
  - Enable Facebook: Add App ID + Secret

### Production App Review Notes
- **Google**: Verification can take 1-2 weeks, requires privacy policy, terms of service, and app demonstration video
- **Facebook**: App review can take 3-7 days, requires detailed use case explanation and demo video
- Both require explaining why you need user email/profile data
- Privacy policy and terms of service URLs must be public and accessible

### Code Already Implemented
- ✅ OAuth buttons in auth slide-overs (`/src/components/ui/auth-slide-over.tsx`)
- ✅ `signInWithGoogle()` and `signInWithFacebook()` in `/src/features/auth/hooks/use-auth.ts`
- ✅ Profile auto-creation handled in auth hook
- ⚠️ May need to verify `/auth/callback` route exists and handles OAuth properly

## Priority
**Medium** - Email/password auth works now, OAuth is a nice-to-have that improves conversion but requires significant setup time for production review.

## Dependencies
- Privacy Policy page (required for OAuth app review)
- Terms of Service page (required for OAuth app review)
- Production deployment (to configure production redirect URLs)

## Estimated Effort
- Setup: 2-3 hours
- Production review process: 1-2 weeks (Google + Facebook approval time)
