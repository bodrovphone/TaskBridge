# E2E Tests: Critical User Flows

## Task Description
Extend the Playwright smoke test suite with critical user flow tests. Phase 1 (unauthenticated) is complete. Phase 2 covers authenticated flows requiring test accounts and secrets.

## Phase 1: Unauthenticated Flows (DONE)

Infrastructure and unauthenticated flow tests — all passing on Chromium + Firefox.

- [x] `e2e/flows/` directory created with `@flow` tagged tests
- [x] `npm run test:e2e:flows` script added
- [x] Separate CI workflow (`e2e-flow-tests.yml`) — runs Mon/Wed/Fri + manual trigger
- [x] Smoke tests unaffected (`e2e-tests.yml` — deploys + daily)
- [x] **Browse & Filter Tasks** — category/city chips, search suggestions, results render
- [x] **View Task Detail** — navigate from browse, verify sections, back navigation
- [x] **Registration page** — intent selector, deep links, Google OAuth button
- [x] **Forgot Password** — submit email, verify success message
- [x] **Navigation Journey** — homepage → browse → task detail → back → professionals

## Phase 2: Authenticated Flows (TODO)

### Requirements
- Create test accounts (customer + professional) for e2e use
- Store test credentials securely via GitHub Actions secrets
- Tests must clean up after themselves (no leftover data in production)
- Each flow should be independent and not depend on other test state

### Customer Flows
- [ ] **Registration** — sign up with email, verify redirect, check profile created
- [ ] **Create Task** — fill out task form, submit, verify task appears in "My Posted Tasks"

### Professional Flows
- [ ] **Professional Registration** — register as professional, fill profile (title, categories, city)
- [ ] **Browse Tasks & Apply** — find a task, submit application with message and price
- [ ] **My Applications** — verify application appears, check status filters work
- [ ] **My Work** — verify accepted work shows in dashboard

### Cross-Role Flows
- [ ] **Application Lifecycle** — customer creates task → professional applies → customer accepts → both see updated status
- [ ] **Task Completion** — accepted task → mark complete → review prompt appears

### Auth Flows
- [ ] **Login/Logout** — email login, verify session, logout, verify redirect
- [ ] **Google OAuth** — verify redirect to Google (don't complete OAuth, just check redirect works)

### Technical Notes
- Use Playwright `storageState` to share auth across tests in same worker
- Consider a `e2e/helpers/auth.ts` helper for login/logout utilities
- Flow tests should run sequentially (not parallel) to avoid race conditions

## Priority
Medium
