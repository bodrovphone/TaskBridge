/**
 * Top 8 Bulgarian cities supported by TaskBridge (MVP)
 * Selected based on population and economic activity
 */
export interface City {
  slug: string;
  translationKey: string; // e.g., 'cities.sofia'
  population: number; // Approximate population for sorting
}

export const CITIES: City[] = [
  {
    slug: 'sofia',
    translationKey: 'cities.sofia',
    population: 1_200_000,
  },
  {
    slug: 'plovdiv',
    translationKey: 'cities.plovdiv',
    population: 340_000,
  },
  {
    slug: 'varna',
    translationKey: 'cities.varna',
    population: 330_000,
  },
  {
    slug: 'burgas',
    translationKey: 'cities.burgas',
    population: 200_000,
  },
  {
    slug: 'ruse',
    translationKey: 'cities.ruse',
    population: 150_000,
  },
  {
    slug: 'stara-zagora',
    translationKey: 'cities.staraZagora',
    population: 140_000,
  },
  {
    slug: 'pleven',
    translationKey: 'cities.pleven',
    population: 120_000,
  },
  {
    slug: 'sliven',
    translationKey: 'cities.sliven',
    population: 90_000,
  },
];

/**
 * Get city by slug
 */
export const getCityBySlug = (slug: string): City | undefined => {
  return CITIES.find(city => city.slug === slug);
};
