-- Cold-start (April 2026) Task 02: supply heatmap.
-- For each (city × sub_category) cell, show:
--   active_pros  — registered + last_active_at within 30d, not banned
--   tasks_60d    — tasks created in that cell in last 60d
--   invitations  — task_invitation notifications fired for that cell in last 60d
--   coverage_status — bucketed health label
-- "EMPTY (URGENT)" cells are the alo.bg / outreach target list (Task 04).

CREATE OR REPLACE VIEW public.outreach_supply_heatmap AS
WITH task_cells AS (
  SELECT city, subcategory AS sub_category, COUNT(*)::int AS tasks_60d
    FROM public.tasks
   WHERE created_at >= NOW() - INTERVAL '60 days'
     AND subcategory IS NOT NULL
   GROUP BY 1, 2
),
pro_cells AS (
  SELECT u.city, sc AS sub_category, COUNT(*)::int AS active_pros
    FROM public.users u,
         unnest(COALESCE(u.service_categories, ARRAY[]::text[])) AS sc
   WHERE u.last_active_at >= NOW() - INTERVAL '30 days'
     AND COALESCE(u.is_banned, FALSE) = FALSE
     AND u.city IS NOT NULL
   GROUP BY 1, 2
),
invites AS (
  SELECT t.city,
         (n.metadata->>'taskCategory') AS sub_category,
         COUNT(*)::int AS invitations
    FROM public.notifications n
    JOIN public.tasks t ON t.id = (n.metadata->>'taskId')::uuid
   WHERE n.type = 'task_invitation'
     AND n.created_at >= NOW() - INTERVAL '60 days'
     AND t.city IS NOT NULL
   GROUP BY 1, 2
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
  FULL OUTER JOIN pro_cells pc
    ON tc.city = pc.city AND tc.sub_category = pc.sub_category
  LEFT JOIN invites i
    ON i.city = COALESCE(tc.city, pc.city)
   AND i.sub_category = COALESCE(tc.sub_category, pc.sub_category);

COMMENT ON VIEW public.outreach_supply_heatmap IS
  'Cold-start (April 2026) Task 02: supply heatmap. Joins tasks (60d), '
  'active pros (30d, not banned), and task_invitation notifications (60d) '
  'per (city × sub_category) cell. EMPTY (URGENT) cells are outreach targets.';
