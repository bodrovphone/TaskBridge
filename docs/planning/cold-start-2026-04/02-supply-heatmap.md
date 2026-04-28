# Task 02 — Supply heatmap (city × sub-category)

**Effort:** half day
**Priority:** P0 (input for Task 04 outreach)
**Owner:** Alex

## Why this task

The notification matching engine sends 0 invitations when no professional matches a task's `(sub-category × city)` pair. We saw 24 of 29 recent tasks land in this dead zone.

Before sending alo.bg outreach, we need to know **exactly which cells in the (city × sub-category) grid are empty** so we don't waste effort recruiting pros where we already have plenty.

## What to build

A simple admin SQL view or `/admin/heatmap` page. For each `(city, sub_category)` cell, show:

- Count of **active professionals** (registered, profile complete, last_active_at within 30 days)
- Count of **tasks created** in that cell in the last 60 days
- Count of **invitations sent** for those tasks
- "Coverage status": healthy / weak / empty

## Reference SQL (starter)

```sql
-- Tasks per (city × sub-category) in last 60 days
WITH task_cells AS (
  SELECT city, category AS sub_category, COUNT(*) AS tasks_60d
  FROM public.tasks
  WHERE created_at >= NOW() - INTERVAL '60 days'
  GROUP BY 1,2
),
pro_cells AS (
  SELECT u.city, sc AS sub_category, COUNT(*) AS active_pros
  FROM public.users u, unnest(COALESCE(u.service_categories, ARRAY[]::text[])) AS sc
  WHERE u.last_active_at >= NOW() - INTERVAL '30 days'
    AND u.is_banned = false
  GROUP BY 1,2
),
invites AS (
  SELECT (n.metadata->>'taskCategory') AS sub_category,
         t.city,
         COUNT(*) AS invitations
  FROM public.notifications n
  JOIN public.tasks t ON t.id = (n.metadata->>'taskId')::uuid
  WHERE n.type = 'task_invitation'
    AND n.created_at >= NOW() - INTERVAL '60 days'
  GROUP BY 1,2
)
SELECT COALESCE(tc.city, pc.city) AS city,
       COALESCE(tc.sub_category, pc.sub_category) AS sub_category,
       COALESCE(pc.active_pros, 0) AS active_pros,
       COALESCE(tc.tasks_60d, 0) AS tasks_60d,
       COALESCE(i.invitations, 0) AS invitations,
       CASE
         WHEN COALESCE(pc.active_pros, 0) = 0 AND COALESCE(tc.tasks_60d, 0) >= 1 THEN 'EMPTY (URGENT)'
         WHEN COALESCE(pc.active_pros, 0) BETWEEN 1 AND 2 THEN 'WEAK'
         WHEN COALESCE(pc.active_pros, 0) >= 3 THEN 'OK'
         ELSE 'NO DEMAND'
       END AS coverage_status
FROM task_cells tc
FULL OUTER JOIN pro_cells pc ON tc.city = pc.city AND tc.sub_category = pc.sub_category
LEFT JOIN invites i ON i.city = COALESCE(tc.city, pc.city)
                    AND i.sub_category = COALESCE(tc.sub_category, pc.sub_category)
ORDER BY tasks_60d DESC NULLS LAST, active_pros ASC;
```

Note: this assumes `users.service_categories` (text[]) holds sub-categories matching `notifications.metadata->>'taskCategory'`. **Verify this assumption** — the task schema has `category` (high-level) but matching uses sub-category. Check your actual matching code in the API/edge function for the source of truth.

## Output

A table sorted with **EMPTY (URGENT)** cells on top — these are the cells where customers post tasks but no pro exists. That's the alo.bg outreach target list.

Example expected output (illustration):

| city | sub_category | active_pros | tasks_60d | status |
|---|---|---|---|---|
| varna | appliance-repair | 0 | 2 | EMPTY (URGENT) |
| sofia | cleaning | 0 | 1 | EMPTY (URGENT) |
| burgas | cleaning | 0 | 2 | EMPTY (URGENT) |
| sofia | plastering | 4 | 2 | OK |

## Done when

- Query runs and returns sensible data
- Either saved as a Supabase view, OR rendered as an `/admin/heatmap` page (whichever is faster)
- Top 10 EMPTY cells exported to a CSV / clipboard for use in Task 04
