import { CITIES, getCityBySlug } from './cities';

/**
 * Generic translation function type compatible with both react-i18next and next-intl
 */
type TranslateFunction = (key: string) => string;

/**
 * City with translated label
 */
export interface CityWithLabel {
  slug: string;
  label: string;
  population: number;
}

/**
 * Get all cities with translated labels
 */
export const getCitiesWithLabels = (t: TranslateFunction): CityWithLabel[] => {
  return CITIES.map(city => ({
    slug: city.slug,
    label: t(city.translationKey),
    population: city.population,
  })).sort((a, b) => b.population - a.population); // Largest first
};

/**
 * Get city label by slug
 * Returns translated name from i18n for known cities
 */
export const getCityLabelBySlug = (slug: string, t: TranslateFunction): string => {
  const city = getCityBySlug(slug);
  if (city) {
    return t(city.translationKey);
  }
  // Fallback for unknown slugs (shouldn't happen with CHECK constraints)
  return slug;
};

/**
 * Search cities by query string
 */
export const searchCities = (query: string, t: TranslateFunction): CityWithLabel[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const citiesWithLabels = getCitiesWithLabels(t);

  return citiesWithLabels.filter(city =>
    city.label.toLowerCase().includes(lowerQuery) ||
    city.slug.toLowerCase().includes(lowerQuery)
  );
};
