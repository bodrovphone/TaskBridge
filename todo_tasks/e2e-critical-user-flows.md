# E2E Tests: Critical User Flows

## Task Description
Extend the Playwright smoke test suite with critical user flow tests (Phase 2). These tests cover real user journeys that exercise authentication, database operations, and core business logic against production.

## Requirements
- Create test accounts (customer + professional) for e2e use
- Store test credentials securely via GitHub Actions secrets
- Tests must clean up after themselves (no leftover data in production)
- Each flow should be independent and not depend on other test state

## Flows to Cover

### Customer Flows
- [ ] **Registration** — sign up with email, verify redirect, check profile created
- [ ] **Create Task** — fill out task form, submit, verify task appears in "My Posted Tasks"
- [ ] **Browse & Filter Tasks** — search by category, city, keyword; verify results update
- [ ] **View Task Detail** — open a task, verify all sections render (gallery, description, location)

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
- [ ] **Forgot Password** — submit email, verify success message

## Acceptance Criteria
- [ ] Test accounts created and credentials stored in GitHub secrets
- [ ] All flows pass on Chromium (Firefox optional for flow tests)
- [ ] Tests in `e2e/flows/` directory, tagged with `@flow`
- [ ] `npm run test:e2e:flows` script added
- [ ] GitHub Actions workflow updated to run flows on manual trigger only (not on every deploy)

## Technical Notes
- Use Playwright `storageState` to share auth across tests in same worker
- Consider a `e2e/helpers/auth.ts` helper for login/logout utilities
- Flow tests should run sequentially (not parallel) to avoid race conditions
- Keep flow tests separate from smoke tests — smoke runs on every deploy, flows run on-demand/daily

## Priority
Medium
