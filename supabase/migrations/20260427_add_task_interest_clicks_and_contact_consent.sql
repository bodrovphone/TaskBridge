-- Cold-start initiative (April 2026): "Show contact" button on task detail page.
--
-- Two parts:
--   1. tasks.contact_sharing_consent_at — timestamp when the customer agreed to
--      share their phone with interested pros. Set on task creation after the
--      consent copy goes live. NULL for legacy tasks (those keep the old
--      apply→accept flow only).
--   2. task_interest_clicks — records each authenticated viewer who revealed
--      contact info on a task. Idempotent via the (task_id, viewer_id) unique
--      constraint, so we count distinct interested viewers per task.

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS contact_sharing_consent_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS public.task_interest_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (task_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_task_interest_clicks_task_id
  ON public.task_interest_clicks(task_id);
CREATE INDEX IF NOT EXISTS idx_task_interest_clicks_viewer_id
  ON public.task_interest_clicks(viewer_id);

ALTER TABLE public.task_interest_clicks ENABLE ROW LEVEL SECURITY;

-- The viewer who clicked can see their own row.
CREATE POLICY "Viewers can read own interest clicks"
ON public.task_interest_clicks FOR SELECT
USING (auth.uid() = viewer_id);

-- The task owner can see who has revealed contact on their task.
CREATE POLICY "Task owners can read interest clicks on their tasks"
ON public.task_interest_clicks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks
  WHERE tasks.id = task_interest_clicks.task_id
    AND tasks.customer_id = auth.uid()
));

-- Inserts go through the API (service role); deny direct client inserts.
-- No INSERT policy = no client-side inserts allowed.
