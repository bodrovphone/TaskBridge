/**
 * Telegram Authentication Utilities
 *
 * Handles verification of Telegram Login Widget data and security checks
 * Documentation: https://core.telegram.org/widgets/login
 */

import { AuthDataValidator, objectToAuthDataMap } from '@telegram-auth/server';
import type { TelegramUserData } from '@telegram-auth/server';

/**
 * Verifies the authenticity of Telegram login data using official validator
 *
 * @param authData - The authentication data received from Telegram Login Widget
 * @param botToken - Your Telegram bot token from environment variables
 * @returns true if authentication is valid, false otherwise
 */
export async function verifyTelegramAuth(
  authData: any,
  botToken: string
): Promise<boolean> {
  if (!botToken) {
    throw new Error('Telegram bot token is not configured');
  }

  try {
    // Create validator instance with bot token
    const validator = new AuthDataValidator({ botToken });

    // Convert object to AuthDataMap format
    const authDataMap = objectToAuthDataMap(authData);

    // Validate the data
    const user = await validator.validate(authDataMap);
    return !!user; // Returns user object if valid, null if invalid
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return false;
  }
}

/**
 * Formats Telegram user data for database storage
 */
export function formatTelegramUser(authData: TelegramUserData) {
  return {
    telegram_id: authData.id,
    telegram_username: authData.username || null,
    telegram_first_name: authData.first_name,
    telegram_last_name: authData.last_name || null,
    telegram_photo_url: authData.photo_url || null,
  };
}
