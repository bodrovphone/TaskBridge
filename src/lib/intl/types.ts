// TypeScript type definitions for translation keys
// Ensures all languages have the same keys based on English translations

import type en from './en';

// Translation object type based on English translations
export type TranslationKeys = typeof en;

// Helper type to ensure translation objects match the English structure
export type Translation = {
  [K in keyof TranslationKeys]: string;
};
