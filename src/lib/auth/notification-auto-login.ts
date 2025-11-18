import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Supported notification channels for auto-login
 */
export type NotificationChannel = 'telegram' | 'viber' | 'email' | 'sms' | 'whatsapp'

/**
 * Generate a secure random token for notification auto-login
 */
function generateSecureToken(): string {
  // Generate 32 random bytes and encode as base64url (URL-safe)
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Create a one-time session token for notification auto-login
 * Works for ALL channels: Telegram, Viber, Email, SMS, etc.
 *
 * @param userId - User ID to create token for
 * @param channel - Notification channel sending the link
 * @param redirectUrl - URL to redirect to after login (optional)
 * @param expirationDays - Token expiration in days (default: 7)
 * @returns The generated token
 */
export async function createNotificationAutoLoginToken(
  userId: string,
  channel: NotificationChannel,
  redirectUrl?: string,
  expirationDays: number = 7
): Promise<string> {
  const supabase = createAdminClient()
  const token = generateSecureToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expirationDays)

  const { error } = await supabase
    .from('notification_session_tokens')
    .insert({
      user_id: userId,
      token,
      notification_channel: channel,
      redirect_url: redirectUrl,
      expires_at: expiresAt.toISOString()
    })

  if (error) {
    console.error('Failed to create notification session token:', error)
    throw new Error('Failed to create session token')
  }

  return token
}

/**
 * Validate a notification session token (does NOT mark as used)
 * Token remains valid for 7 days and can be used multiple times
 *
 * @param token - The token to validate
 * @returns Object with userId, channel, and redirectUrl if valid, null otherwise
 */
export async function validateNotificationAutoLoginToken(
  token: string
): Promise<{ userId: string; channel: NotificationChannel; redirectUrl?: string } | null> {
  const supabase = createAdminClient()

  // Fetch the token
  const { data: tokenData, error } = await supabase
    .from('notification_session_tokens')
    .select('user_id, notification_channel, redirect_url, expires_at')
    .eq('token', token)
    .single()

  if (error || !tokenData) {
    console.error('Token not found:', error)
    return null
  }

  // Check if expired
  if (new Date(tokenData.expires_at) < new Date()) {
    console.error('Token expired')
    return null
  }

  // Token is valid - return user data
  // Note: We do NOT mark it as used - token can be reused within 7-day window
  return {
    userId: tokenData.user_id,
    channel: tokenData.notification_channel as NotificationChannel,
    redirectUrl: tokenData.redirect_url || undefined
  }
}

/**
 * Generate a full auto-login URL with token
 * Works for ALL notification channels, including Telegram WebView
 *
 * Simply appends ?notificationSession=token to the destination URL
 * The useAuth hook will detect this parameter and authenticate the user client-side
 *
 * @param userId - User ID to create token for
 * @param channel - Notification channel sending the link
 * @param destinationPath - Full path to destination (e.g., '/en/tasks/123')
 * @param baseUrl - Base URL of the site (e.g., 'https://trudify.com')
 * @returns Complete URL with notificationSession parameter
 */
export async function generateNotificationAutoLoginUrl(
  userId: string,
  channel: NotificationChannel,
  destinationPath: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
): Promise<string> {
  // Create token (7 day expiration, reusable)
  const token = await createNotificationAutoLoginToken(userId, channel, destinationPath)

  // Build URL with notificationSession parameter
  // The page will detect this and call the auth API to create a session
  const url = new URL(destinationPath, baseUrl)
  url.searchParams.set('notificationSession', token)

  return url.toString()
}
