-- Check if notifications table exists and drop it for clean recreation
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table for in-app notification center
-- Supports smart delivery routing (in-app, telegram, or both)
-- Tracks notification state (sent/dismissed) and Telegram delivery status

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Delivery & state
  state TEXT NOT NULL DEFAULT 'sent' CHECK (state IN ('sent', 'dismissed')),
  delivery_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'telegram', 'both')),

  -- External delivery tracking (if sent via Telegram)
  telegram_message_id BIGINT,
  telegram_sent_at TIMESTAMPTZ,
  telegram_delivery_status TEXT CHECK (telegram_delivery_status IN ('pending', 'sent', 'failed')),

  -- Action URLs (deep links)
  action_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_state ON notifications(state);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for efficient unread count queries
CREATE INDEX idx_notifications_unread ON notifications(user_id, state)
WHERE state = 'sent';

-- Row Level Security (RLS) Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (dismiss)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'User notifications with smart delivery routing (in-app, Telegram, or both)';
COMMENT ON COLUMN notifications.state IS 'Notification state: sent (unread) or dismissed (read)';
COMMENT ON COLUMN notifications.delivery_channel IS 'Where notification was/will be sent: in_app, telegram, or both';
COMMENT ON COLUMN notifications.metadata IS 'Flexible JSON metadata (taskId, applicationId, professionalName, etc.)';
