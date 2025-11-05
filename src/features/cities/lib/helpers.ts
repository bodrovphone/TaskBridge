import { TFunction } from 'i18next';
import { CITIES, getCityBySlug } from './cities';

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
export const getCitiesWithLabels = (t: TFunction): CityWithLabel[] => {
  return CITIES.map(city => ({
    slug: city.slug,
    label: t(city.translationKey),
    population: city.population,
  })).sort((a, b) => b.population - a.population); // Largest first
};

/**
 * Get city label by slug
 */
export const getCityLabelBySlug = (slug: string, t: TFunction): string => {
  const city = getCityBySlug(slug);
  if (!city) return slug;

  return t(city.translationKey);
};

/**
 * Search cities by query string
 */
export const searchCities = (query: string, t: TFunction): CityWithLabel[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const citiesWithLabels = getCitiesWithLabels(t);

  return citiesWithLabels.filter(city =>
    city.label.toLowerCase().includes(lowerQuery) ||
    city.slug.toLowerCase().includes(lowerQuery)
  );
};
