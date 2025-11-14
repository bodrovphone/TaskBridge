/**
 * Privacy utility functions for masking sensitive information
 */

/**
 * Mask phone number for preview
 * Example: +359 888 123 456 → +359 888 *** ***
 */
export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 6) return phone;

  const countryCode = cleaned.slice(0, 3); // +359
  const prefix = cleaned.slice(3, 6); // 888
  const masked = '*** ***';

  return `+${countryCode} ${prefix} ${masked}`;
}

/**
 * Mask email for preview
 * Example: john.doe@example.com → j***e@example.com
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!domain || username.length <= 2) return email;

  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}
