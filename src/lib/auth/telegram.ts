/**
 * Telegram Authentication Utilities
 *
 * Handles verification of Telegram Login Widget data and security checks
 * Documentation: https://core.telegram.org/widgets/login
 */

import crypto from 'crypto';

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verifies the authenticity of Telegram login data
 *
 * This prevents users from spoofing Telegram authentication by validating
 * the cryptographic hash provided by Telegram
 *
 * @param authData - The authentication data received from Telegram Login Widget
 * @param botToken - Your Telegram bot token from environment variables
 * @returns true if authentication is valid, false otherwise
 */
export function verifyTelegramAuth(
  authData: TelegramAuthData,
  botToken: string
): boolean {
  if (!botToken) {
    throw new Error('Telegram bot token is not configured');
  }

  // Extract hash from data
  const { hash, ...dataWithoutHash } = authData;

  // Check if auth is not too old (1 hour)
  const authAge = Math.floor(Date.now() / 1000) - authData.auth_date;
  if (authAge > 3600) {
    console.warn('Telegram auth data is too old:', authAge, 'seconds');
    return false;
  }

  // Create data check string
  const checkString = Object.keys(dataWithoutHash)
    .sort()
    .map(key => `${key}=${dataWithoutHash[key as keyof typeof dataWithoutHash]}`)
    .join('\n');

  // Create secret key from bot token
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  // Create HMAC hash
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  // Compare hashes
  return hmac === hash;
}

/**
 * Formats Telegram user data for database storage
 */
export function formatTelegramUser(authData: TelegramAuthData) {
  return {
    telegram_id: authData.id,
    telegram_username: authData.username || null,
    telegram_first_name: authData.first_name,
    telegram_last_name: authData.last_name || null,
    telegram_photo_url: authData.photo_url || null,
  };
}
