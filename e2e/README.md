# E2E Tests — Trudify

End-to-end tests using Playwright, running against production (trudify.com) or a local dev server.

## Running Tests

```bash
# All smoke tests (fast, no auth needed)
npx playwright test --project=chromium

# All flow tests
npx playwright test --project=flows-chromium

# Specific test file
npx playwright test e2e/flows/professional-registration.spec.ts

# With UI mode (interactive)
npx playwright test --ui

# View last report
npx playwright show-report
```

## Test Structure

```
e2e/
├── smoke/              # Fast health checks (no auth, no side effects)
├── flows/              # User journey tests (may create real data)
├── helpers/
│   └── constants.ts    # Shared selectors, URLs, test data
├── Dockerfile          # Docker setup for CI
├── docker-compose.e2e.yml
└── README.md           # This file
```

## Smoke Tests (`e2e/smoke/`)

Quick checks that the site is alive and functional. No authentication, no data mutations.

| File | What it covers |
|------|---------------|
| `pages-load.spec.ts` | All public pages return 200, root `/` redirects to locale, homepage has content |
| `navigation.spec.ts` | Header/footer render, logo visible, footer has links, mobile menu toggle |
| `seo.spec.ts` | Title tags, meta description, OG tags, canonical URL, `lang` attribute |
| `i18n.spec.ts` | All 3 locales load, BG/RU have Cyrillic, EN has Latin, locale stays in URL during nav |

## Flow Tests (`e2e/flows/`)

Real user journeys that test feature behavior. Some create real data (see notes).

| File | What it covers | Auth needed | Creates data |
|------|---------------|-------------|-------------|
| `browse-filter.spec.ts` | Filter section renders, search input with suggestions, category/city chip filtering, task cards display | No | No |
| `navigation-journey.spec.ts` | Homepage → browse → task detail → back → professionals, direct URL nav for all key pages | No | No |
| `task-detail.spec.ts` | Browse → click task → detail page sections render, back navigation works | No | No |
| `auth-pages.spec.ts` | Register page intent selector, customer deep link → auth form, professional deep link pre-fill, Google OAuth button, forgot password flow | No | No |
| `professional-registration.spec.ts` | **Full registration + cleanup** (see below) | **Yes** | **Yes** |

## Authenticated Flow: Professional Registration

**File**: `e2e/flows/professional-registration.spec.ts`

The most complex test — creates a real user, verifies they appear in listings, then cleans up.

### Flow

1. **Navigate** to deep link: `/en/register?intent=professional&categories=plumber&city=sliven`
2. **Sign up** with Gmail alias: `bodrovphone+e2e+{timestamp}@gmail.com`
3. **Complete** professional onboarding (title + categories pre-filled from deep link)
4. **Verify listing**: Go to `/en/professionals` filtered by `category=plumber&city=sliven` — assert the new profile appears
5. **Cleanup via UI**: Navigate to profile edit, clear professional title, set bio to `E2E_TEST_CLEANUP`, save
6. **Verify removal**: Go back to filtered professionals page — assert profile is gone

### Why this approach

- **Gmail aliases** (`+e2e+timestamp`) create unique emails that all land in one inbox — no test email service needed
- **No API cleanup needed** — clearing `professional_title` via the profile edit UI removes the user from public listings (the `meetsListingRequirements()` check requires title >= 3 chars + at least 1 category)
- **`E2E_TEST_CLEANUP` bio marker** — makes it easy to manually find and bulk-delete test users later
- **`city=sliven`** — low-traffic city, unlikely to have real professionals with `plumber` category, so filtered results are predictable
- **Filters bypass ISR** — the professionals listing uses client-side API fetch with query params, so filtered results are always fresh

### Test user cleanup

Test users are left in the database with:
- `professional_title`: cleared (null)
- `bio`: `"E2E_TEST_CLEANUP"`
- Email pattern: `bodrovphone+e2e+*@gmail.com`

To manually clean up:
```sql
DELETE FROM auth.users WHERE id IN (
  SELECT id FROM public.users WHERE bio = 'E2E_TEST_CLEANUP'
);
```

## Planned Tests

| Flow | Priority | Notes |
|------|----------|-------|
| Task creation (guest → auth → submit) | High | Tests the guest-to-auth flow + task form |
| Task application by professional | High | Requires authenticated professional |
| Profile editing (customer) | Medium | Avatar upload, name change |
| Locale switching mid-flow | Medium | Start in BG, switch to RU, verify content |
| Deep link pre-fill accuracy | Medium | Verify all params (title, categories, city) populate correctly |
| Mobile responsive flows | Low | Key flows on mobile viewport |

## Environment

- **Default target**: `https://trudify.com` (production)
- **Override**: `BASE_URL=http://localhost:3000 npx playwright test`
- **Browsers**: Chromium + Firefox (smoke), Chromium + Firefox (flows)
- **Timeout**: 30s per test, 10s for assertions

## Conventions

- Smoke tests: `@smoke` tag, no side effects, fast
- Flow tests: `@flow` tag, may take longer, may need auth
- Test IDs: Add `data-testid` attributes to key UI elements for stable selectors
- Selectors: Prefer `getByRole`, `getByText` over CSS selectors when possible
- Cleanup: Any test that creates data must clean up after itself

*Last updated: 2026-03-02*
