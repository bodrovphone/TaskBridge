-- Add Telegram authentication fields to users table
-- Migration: add_telegram_fields_to_users
-- Created: 2025-10-31

-- Add Telegram columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_username TEXT,
ADD COLUMN IF NOT EXISTS telegram_first_name TEXT,
ADD COLUMN IF NOT EXISTS telegram_last_name TEXT,
ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_notification_channel TEXT DEFAULT 'email'
  CHECK (preferred_notification_channel IN ('email', 'telegram', 'whatsapp', 'viber', 'sms'));

-- Create index for faster Telegram user lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Add comment for documentation
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID for authentication and notifications';
COMMENT ON COLUMN users.telegram_username IS 'Telegram @username (without @)';
COMMENT ON COLUMN users.preferred_notification_channel IS 'User preferred channel for notifications';

-- Create notification logs table for tracking
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram', 'whatsapp', 'viber', 'sms')),
  notification_type TEXT NOT NULL, -- 'application_received', 'task_accepted', 'message_received', etc.
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'pending')),
  cost_euros DECIMAL(10, 6) DEFAULT 0, -- Track costs per notification
  error_message TEXT, -- Store error details if failed
  metadata JSONB, -- Store additional data (template used, response time, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Create index for notification logs queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

-- Add comment for documentation
COMMENT ON TABLE notification_logs IS 'Tracks all notifications sent to users across different channels';
COMMENT ON COLUMN notification_logs.cost_euros IS 'Cost per notification in euros (Telegram = 0, others vary)';
COMMENT ON COLUMN notification_logs.metadata IS 'Additional data like template used, delivery time, etc.';
