# Cold-start initiative — April 2026

Five tasks born out of the data review on 2026-04-26. The goal: stop the marketplace from dying in cold-start by reducing professional friction and seeding supply manually.

## Context (TL;DR)

After 5+ months live, TruDify state is:

- 116 users, 59 tasks, 17 applications, 12 unique pros applied ever.
- Notification matching engine **works** — but only fires for ~17% of recent tasks because supply (city × sub-category) is empty.
- 29 of 32 "completed" tasks are seed/test (no `completed_at`). Real completions: 3.
- Bottleneck is supply + apply-gate friction. **Not** notification bugs.

## Strategy

Run a "cold-start mode" for 2-3 months: drop the heavy gates, make connecting easy, accept lower data quality in exchange for liquidity. Once we have ~10 real tasks/day with engagement, re-introduce the gates step by step.

## Task list (recommended order)

| # | File | Effort | Why first |
|---|---|---|---|
| 01 | `01-show-contact-button.md` | 1 day | Smallest test of the apply-gate hypothesis |
| 02 | `02-supply-heatmap.md` | half day | Tells us which (city × sub-cat) cells are empty |
| 03 | `03-data-integrity-fixes.md` | half day | Cleans up ghost completions + counter drift |
| 04 | `04-alo-bg-outreach.md` | 1 week ongoing | Manually seeds supply where heatmap shows gaps |
| 05 | `05-cold-start-mode-flow.md` | 3-5 days | Bigger redesign: optional steps in apply→accept→complete |
| 06 | `06-gmaps-resend-outreach-automation.md` | architecture only | Architecture / data model / hygiene rules for Task 07 |
| 07 | `07-fetcher-and-sender-scripts.md` | 2 days | Concrete build: split `outreach:fetch` (autonomous) + `outreach:send` (manual gate) + md logs |

Tasks 01-03 are quick wins. Task 04 was the manual playbook — **Tasks 06 + 07 supersede it** with automation (alo.bg captcha made manual outreach impractical). Task 05 is the real product change.

**For the Claude Code session, the actionable file is Task 07.** It references Task 06 for architecture details so you don't have to repeat reading.

## Source data

The numbers above come from queries on Supabase project `nyleceedixybtogrwilv` (TruDify) on 2026-04-26. If you re-run, the SQL is reproducible — see each task for the queries.

---
**Created:** 2026-04-26
