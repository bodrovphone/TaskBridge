import { defineRouting } from 'next-intl/routing';

/**
 * next-intl routing configuration
 * Defines supported locales and URL prefix behavior
 */
export const routing = defineRouting({
  // All supported locales
  locales: ['bg', 'ua', 'en', 'ru'],

  // Default locale (Bulgarian as primary market)
  defaultLocale: 'bg',

  // Always show locale prefix in URL for consistent SEO
  localePrefix: 'always',

  // Enable automatic locale detection from:
  // 1. Cookie (preferred-language)
  // 2. Accept-Language header from browser
  localeDetection: true,

  // Cookie configuration for locale detection
  localeCookie: {
    name: 'preferred-language',
    maxAge: 365 * 24 * 60 * 60, // 1 year
  },
});

export type Locale = (typeof routing.locales)[number];
