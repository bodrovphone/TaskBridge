# OAuth Production Rollout Plan (Hybrid Approach)

## Task Description
Implement a phased rollout strategy for OAuth authentication in production, starting with basic functionality and progressively improving to full professional OAuth experience with app verification.

## Overview
This hybrid approach allows launching to production immediately while OAuth providers are still in review, then upgrading the experience once approvals come through. Prioritizes getting to market quickly while maintaining a clear path to professional OAuth implementation.

## Requirements
- Deploy OAuth to production with acceptable limitations
- Create legal pages required for app review
- Submit for Google and Facebook app verification
- Remove "unverified app" warnings once approved
- Enable full public Facebook OAuth access

## Phased Rollout Strategy

### Phase 1: Soft Launch (This Week) 🚀

**Goal:** Get to production with working OAuth (some limitations acceptable)

**Status:** ✅ Ready to deploy!

**Actions:**
- [ ] Commit and push Facebook OAuth scope fix to repository
  ```bash
  git add src/features/auth/hooks/use-auth.ts
  git commit -m "Fix Facebook OAuth - use public_profile scope only"
  git push origin main
  ```
- [ ] Deploy current code to production (Vercel will auto-deploy)
- [ ] Enable Google OAuth in production
  - Works immediately but shows "unverified app" warning
  - Users can click "Show Advanced" → "Continue to Trudify" to proceed
  - Lower conversion but functional
- [x] Configure Facebook OAuth strategy:
  - **✅ Working in Development Mode** - tested locally
  - **Recommended:** Add beta testers manually in Facebook App Dashboard
  - Configure "Allow users without an email" toggle in Supabase (✅ Done)
- [ ] Set email/password as primary authentication method
- [ ] Add user-facing note: "More login options coming soon!" (optional)

**Expected User Experience:**
```
Google OAuth:
✅ Works for all users
⚠️ Shows "unverified app" warning
⚠️ Requires extra click to proceed
✅ Successful login after warning

Facebook OAuth:
⚠️ Development Mode (testers only)
OR
❌ Disabled/hidden for public

Email/Password:
✅ Works perfectly (primary method)
```

**Success Criteria:**
- [ ] Production deployment successful
- [ ] Google OAuth functional (even with warning)
- [ ] Users can register and log in via email/password
- [ ] No blocking errors preventing user authentication

---

### Phase 2: Legal Pages (Next 1-2 Days) 📝

**Goal:** Create required legal documentation for app review

**Actions:**
- [ ] Create Privacy Policy page
  - Use task: `todo_tasks/privacy-policy-page.md`
  - Route: `/[lang]/privacy`
  - All required GDPR sections
  - Full i18n support (EN/BG/RU)
  - Explain OAuth data usage (Google, Facebook, Telegram)
  - Public URL accessible without login
- [ ] Create Terms of Service page
  - Use task: `todo_tasks/terms-of-service-page.md`
  - Route: `/[lang]/terms`
  - All required legal sections
  - Full i18n support (EN/BG/RU)
  - Public URL accessible without login
- [ ] Add footer links to Privacy + Terms pages
- [ ] (Optional but recommended) Get legal review from Bulgarian lawyer
- [ ] Deploy legal pages to production

**Public URLs Needed:**
```
https://trudify.com/en/privacy (or taskbridge.vercel.app)
https://trudify.com/en/terms
https://trudify.com/bg/privacy
https://trudify.com/bg/terms
https://trudify.com/ru/privacy
https://trudify.com/ru/terms
```

**Success Criteria:**
- [ ] Privacy Policy live and accessible
- [ ] Terms of Service live and accessible
- [ ] Both pages have public URLs (not behind login)
- [ ] Content covers all required OAuth provider sections
- [ ] Footer links working on all pages

---

### Phase 3: Submit for App Review (After Legal Pages Live) 📋

**Goal:** Get Google verification and Facebook app approval

#### Google Verification Submission

**Timeline:** 1-2 weeks for approval

**Steps:**
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
- [ ] Click "SUBMIT FOR VERIFICATION"
- [ ] Provide required information:
  - [ ] App name: Trudify
  - [ ] App logo: Upload 120x120px logo
  - [ ] Privacy Policy URL: `https://trudify.com/en/privacy`
  - [ ] Terms of Service URL: `https://trudify.com/en/terms`
  - [ ] Application home page: `https://trudify.com`
  - [ ] Authorized domains: `trudify.com`, `vercel.app`, `supabase.co`
  - [ ] Developer contact email
- [ ] Explain why you need user data:
  ```
  We need access to user email and profile information to:
  1. Create user accounts on our freelance platform
  2. Send task notifications and updates
  3. Enable communication between customers and professionals
  4. Verify user identity for trust and safety
  ```
- [ ] Create demo video showing OAuth flow (2-3 minutes):
  - Show user clicking "Continue with Google"
  - Show consent screen
  - Show successful login
  - Show how email is used in the app
- [ ] Submit application
- [ ] Wait for Google review (1-2 weeks)
- [ ] Respond to any questions from Google reviewers

**Success Criteria:**
- [ ] Verification request submitted
- [ ] All required documents provided
- [ ] Demo video uploaded
- [ ] Google sends confirmation email

#### Facebook App Review Submission

**Timeline:** 3-7 days for approval

**Steps:**
- [ ] Go to [Facebook App Review](https://developers.facebook.com/apps/4351312728438333/app-review/)
- [ ] Request "email" permission (Standard Access)
- [ ] Fill in review submission:
  - [ ] Privacy Policy URL: `https://trudify.com/en/privacy`
  - [ ] Terms of Service URL: `https://trudify.com/en/terms`
  - [ ] App icon (1024x1024px)
  - [ ] Contact email
- [ ] Explain how you use "email" permission:
  ```
  We request email permission to:
  1. Create user accounts and enable login
  2. Send task notifications (new applications, messages, updates)
  3. Provide customer support
  4. Send account-related emails (password reset, verification)

  Users can manage notification preferences in their profile settings.
  ```
- [ ] Provide screenshots showing:
  - Login flow with "Continue with Facebook" button
  - How email is displayed in user profile
  - Notification settings page
  - Where users can see/edit their email
- [ ] Create demo video (2-3 minutes):
  - Show Facebook login flow
  - Show user profile with email
  - Show notification preferences
  - Show how email is used in the platform
- [ ] Submit for review
- [ ] Wait for Facebook review (3-7 days)
- [ ] Respond to any reviewer questions

**Success Criteria:**
- [ ] App review submitted
- [ ] "email" permission requested
- [ ] All screenshots and videos uploaded
- [ ] Facebook sends confirmation

---

### Phase 4: Production Polish (After Approvals) ✨

**Goal:** Upgrade to fully verified, professional OAuth experience

#### After Google Verification Approved

**Actions:**
- [ ] Receive approval email from Google
- [ ] Test Google OAuth - "unverified app" warning should be gone
- [ ] Celebrate! 🎉 Professional Google login experience
- [ ] Update marketing materials to highlight Google login

**Expected User Experience:**
```
Before:
⚠️ "Unverified app" warning
→ Click "Show Advanced"
→ Click "Continue to Trudify"

After:
✅ Smooth, professional consent screen
→ Click "Continue"
→ Instant login
```

#### After Facebook App Review Approved

**Actions:**
- [ ] Receive approval email from Facebook
- [ ] Update Facebook OAuth scope to include email:
  ```typescript
  // In use-auth.ts
  scopes: 'public_profile,email',  // Add email back
  ```
- [ ] Toggle OFF "Allow users without an email" in Supabase (optional)
- [ ] Switch Facebook app to "Live Mode" in dashboard
- [ ] Test Facebook OAuth with non-tester account
- [ ] Facebook login now available to ALL users
- [ ] Email included in Facebook user profiles
- [ ] Celebrate! 🎉 Full Facebook integration

**Expected User Experience:**
```
Before:
❌ "App not available" (for public users)
OR
⚠️ Development Mode (testers only)
⚠️ No email address returned

After:
✅ Works for ALL users
✅ Smooth consent screen
✅ Email included in profile
✅ Instant login
```

---

## Timeline Summary

| Phase | Duration | Status | Goal |
|-------|----------|--------|------|
| **Phase 1: Soft Launch** | This Week | 🚀 Ready | Production with working OAuth (some limitations) |
| **Phase 2: Legal Pages** | 1-2 Days | 📝 Pending | Privacy Policy + Terms of Service live |
| **Phase 3: App Review** | 2-3 Weeks | 📋 Pending | Submit to Google + Facebook |
| **Phase 4: Polish** | After Approvals | ✨ Future | Professional OAuth experience |

**Total Time to Full OAuth:** ~3-4 weeks from today

---

## Risk Mitigation

### What if Google/Facebook reject the application?

**Google Rejection:**
- Common reasons: Insufficient privacy policy, unclear data usage
- Response time: 1-2 days for feedback
- Action: Address concerns and resubmit
- Fallback: Continue with "unverified" warning (still works)

**Facebook Rejection:**
- Common reasons: Insufficient explanation, missing screenshots
- Response time: 1-2 days for feedback
- Action: Provide more details and resubmit
- Fallback: Keep Development Mode (testers only) or disable Facebook login

### What if legal review takes too long?

- Use AI-generated templates as starting point
- Launch with email/password only
- Add OAuth after legal docs approved
- Most important: DON'T let this delay launch

### What if users complain about "unverified app" warning?

- Add FAQ explaining it's temporary
- Emphasize email/password as alternative
- Show verification in progress
- Timeline: "Full Google integration coming in 2-3 weeks"

---

## Success Metrics

### Phase 1 Success (Immediate)
- [ ] Production deployment with zero downtime
- [ ] >80% of users can successfully authenticate
- [ ] Google OAuth conversion rate tracked
- [ ] Email/password as primary method (>60% of signups)

### Phase 2 Success (Legal Pages)
- [ ] Privacy Policy receives <5 support questions
- [ ] Terms of Service clearly understood by users
- [ ] Pages indexed by Google (SEO)
- [ ] Legal review completed (if applicable)

### Phase 3 Success (App Review)
- [ ] Google verification approved on first try
- [ ] Facebook app review approved on first try
- [ ] No major revision requests

### Phase 4 Success (Final Polish)
- [ ] Google OAuth conversion rate improves 20-30%
- [ ] Facebook OAuth available to all users
- [ ] Email collection rate from Facebook >90%
- [ ] Zero OAuth-related support tickets

---

## Decision Points

### Should we disable Facebook login for public users?

**Option A: Keep Facebook in Development Mode (Recommended)**
- Pro: Test with real users (manually added testers)
- Pro: Get feedback before full public release
- Con: Manual work to add testers

**Option B: Hide Facebook button for public**
- Pro: No confusion for users who can't use it
- Pro: Cleaner UI during review period
- Con: Delay getting user feedback

**Option C: Show "Coming Soon" message**
- Pro: Set expectations
- Pro: Build anticipation
- Con: Users might be disappointed

**Recommendation:** Option A (Development Mode with testers)

### Should we wait for legal review before launching?

**Wait for Legal Review:**
- Pro: Safer legally
- Pro: Better quality legal documents
- Con: 3-5 days delay minimum
- Con: Launch momentum lost

**Launch Without Legal Review:**
- Pro: Get to market faster
- Pro: Iterate based on user feedback
- Con: Possible legal oversights
- Risk: Low (similar platforms use AI-generated docs)

**Recommendation:** Launch with AI-generated legal docs, get review in parallel

---

## Priority
**High** - Production readiness depends on this phased rollout plan

## Dependencies
- `privacy-policy-page.md` - Legal page creation
- `terms-of-service-page.md` - Legal page creation
- Production deployment to Vercel
- Domain configuration (trudify.com or taskbridge.vercel.app)

## Estimated Effort
- Phase 1: 2-3 hours (deployment + configuration)
- Phase 2: 1-2 days (legal pages + review)
- Phase 3: 4-6 hours (app review submissions)
- Phase 4: 1-2 hours (post-approval updates)
- **Total active work:** 2-3 days
- **Total calendar time:** 3-4 weeks (due to review wait times)

## Notes
- OAuth review is NOT a blocker for production launch
- Email/password auth is sufficient for MVP
- User feedback is more valuable than perfect OAuth
- Can improve OAuth experience iteratively
- Most successful startups launch before everything is perfect
