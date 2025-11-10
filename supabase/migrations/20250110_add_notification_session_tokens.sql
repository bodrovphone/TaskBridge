-- Create notification_session_tokens table for auto-login via notification links
-- Works for ALL channels: Telegram, Viber, Email, SMS, etc.
CREATE TABLE IF NOT EXISTS notification_session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  notification_channel TEXT NOT NULL, -- 'telegram', 'viber', 'email', 'sms', etc.
  redirect_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX idx_notification_session_tokens_token ON notification_session_tokens(token);
CREATE INDEX idx_notification_session_tokens_user_id ON notification_session_tokens(user_id);
CREATE INDEX idx_notification_session_tokens_expires_at ON notification_session_tokens(expires_at);
CREATE INDEX idx_notification_session_tokens_channel ON notification_session_tokens(notification_channel);

-- RLS Policies (only service role should access these)
ALTER TABLE notification_session_tokens ENABLE ROW LEVEL SECURITY;

-- No user-facing policies - only server/admin should access
CREATE POLICY "Service role can manage tokens" ON notification_session_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Cleanup function to delete expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_notification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notification_session_tokens
  WHERE expires_at < NOW();
END;
$$;

-- Comment
COMMENT ON TABLE notification_session_tokens IS 'One-time tokens for auto-login from notification links (all channels: Telegram, Viber, Email, SMS)';
COMMENT ON COLUMN notification_session_tokens.notification_channel IS 'Channel that sent the notification: telegram, viber, email, sms, etc.';
