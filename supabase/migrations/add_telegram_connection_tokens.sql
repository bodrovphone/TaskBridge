-- Create telegram connection tokens table for linking user accounts
-- This enables users to connect Telegram after email/password login

CREATE TABLE IF NOT EXISTS telegram_connection_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_telegram_tokens_user ON telegram_connection_tokens(user_id);
CREATE INDEX idx_telegram_tokens_token ON telegram_connection_tokens(token);
CREATE INDEX idx_telegram_tokens_expires ON telegram_connection_tokens(expires_at);

-- Add notification preferences to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "applicationReceived": true,
  "applicationAccepted": true,
  "applicationRejected": true,
  "messageReceived": true,
  "taskStatusChanged": true,
  "paymentReceived": true,
  "reviewReceived": true,
  "weeklyTaskDigest": true,
  "channel": "telegram"
}'::jsonb;

COMMENT ON TABLE telegram_connection_tokens IS 'Temporary tokens for connecting Telegram accounts to user profiles';
COMMENT ON COLUMN users.notification_preferences IS 'User notification preferences for Telegram and email channels';
