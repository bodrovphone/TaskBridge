-- Migration: Add 'telegram' to preferred_contact constraint
-- Created: 2025-11-09
-- Purpose: Allow users to set Telegram as their preferred contact method

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_preferred_contact_check;

-- Add new constraint that includes 'telegram'
ALTER TABLE users
ADD CONSTRAINT users_preferred_contact_check
CHECK (preferred_contact IN ('email', 'phone', 'sms', 'app', 'telegram'));

-- Verification query (run manually after migration)
-- SELECT preferred_contact, COUNT(*) as count
-- FROM users
-- GROUP BY preferred_contact
-- ORDER BY count DESC;
