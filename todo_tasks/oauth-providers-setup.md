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
- [ ] Google Cloud Console project created with OAuth 2.0 credentials
- [ ] Facebook Developer app created with Facebook Login product
- [ ] Redirect URLs configured in both providers (localhost + production)
- [ ] Client ID/Secret added to Supabase Authentication → Providers
- [ ] Local testing works: Click "Continue with Google/Facebook" authenticates successfully
- [ ] Production apps submitted for review (Google verification, Facebook app review)
- [ ] OAuth callback route handles success/error cases properly
- [ ] User profile auto-created on first OAuth sign-in

## Technical Notes

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or use existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URIs:
   - `https://nyleceedixybtogrwilv.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
   - Production URL when deployed
6. Copy Client ID + Client Secret to Supabase Dashboard
7. **For production**: Submit for Google verification (required to remove "unverified app" warning)

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
