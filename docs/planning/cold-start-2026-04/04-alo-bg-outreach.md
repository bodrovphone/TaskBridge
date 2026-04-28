# Task 04 — alo.bg outreach to seed supply

**Effort:** 1 week ongoing (manual)
**Priority:** P0 (without supply, all other work is wasted)
**Owner:** Alex (or a VA)

## Why this task

We have ~12 unique professionals who ever applied. The matching engine cannot fire when no pro exists in a (city × sub-category) cell. The fastest legal way to add supply is to contact existing professionals on alo.bg / OLX / Bazar.bg and invite them to register on TruDify with a real customer task waiting for them.

We do **NOT** create shadow profiles from scraped data — that risks GDPR fines and damages trust. We use alo.bg only as a **lead source for direct outreach**.

## Inputs

- Top 10 `EMPTY (URGENT)` cells from Task 02 heatmap. These are the cells where customers post but no pro exists.
- Real open tasks in those cells — see `SELECT id, title, city, category FROM tasks WHERE status='open'`. We have ~21 open right now.

## Process (per outreach batch of ~50 leads)

1. Pick **one** (city × sub-category) cell from the heatmap. For example: Varna × appliance-repair.
2. Find a real, currently open task in that cell to use as bait. Note its URL: `https://trudify.com/bg/tasks/<id>`.
3. On alo.bg, search for professionals offering that service in that city. Collect 30-50 listings with:
   - Name (or business name)
   - Phone
   - Short description of services they offer
   - alo.bg listing URL (for reference)
   - Save to a Google Sheet or a CSV
4. For each lead, send personalised outreach via the contact channel they already accept publicly (phone / email / Viber). Template (BG):

   > Здравейте, [Name]!
   > Видях обявата ви в alo.bg за [service]. Имам клиент във Варна, който търси точно това: [task title].
   > Може да отговорите директно на клиента тук: https://trudify.com/bg/tasks/<id>
   > Регистрацията е безплатна, без комисиона, без скрити такси.
   > Ако не ви интересува — извинявам се за безпокойството.
   > [Alex / TruDify]

5. Track in the sheet: sent_at, replied, registered, applied_to_task.

## Avoid

- **No mass scraping or bulk SMS.** Personal, manual messages only. EU + spam laws + alo.bg ToS.
- **No fake profiles on TruDify.** If they register, it's a real account they control.
- **No follow-up if they say no or don't reply.** One message, then move on.

## Success metric (after 50 leads)

| Metric | Target |
|---|---|
| Reply rate | ≥ 20% (10 of 50) |
| Registration rate | ≥ 10% (5 of 50) |
| Application rate | ≥ 4% (2 of 50) |

If you hit those numbers in **one** cell, scale the playbook to the next cell on the heatmap.
If you don't, the bottleneck isn't supply quantity — it's the message, the registration form, or the value promise. Do not scale yet, fix one of those instead.

## Done when

- 50 outreach messages sent for at least one (city × sub-category) cell
- Tracking sheet updated with results
- Decision documented: scale the playbook, or change the message/value-prop first
