/**
 * Top 40 Bulgarian cities supported by TaskBridge
 * Selected based on population and economic activity
 * Covers ~95% of Bulgarian population
 */
export interface City {
  slug: string;
  translationKey: string; // e.g., 'cities.sofia'
  population: number; // Approximate population for sorting
}

export const CITIES: City[] = [
  // Major cities (>100k)
  { slug: 'sofia', translationKey: 'cities.sofia', population: 1_200_000 },
  { slug: 'plovdiv', translationKey: 'cities.plovdiv', population: 340_000 },
  { slug: 'varna', translationKey: 'cities.varna', population: 330_000 },
  { slug: 'burgas', translationKey: 'cities.burgas', population: 200_000 },
  { slug: 'ruse', translationKey: 'cities.ruse', population: 150_000 },
  { slug: 'stara-zagora', translationKey: 'cities.staraZagora', population: 140_000 },
  { slug: 'pleven', translationKey: 'cities.pleven', population: 120_000 },

  // Regional centers (50k-100k)
  { slug: 'sliven', translationKey: 'cities.sliven', population: 90_000 },
  { slug: 'dobrich', translationKey: 'cities.dobrich', population: 90_000 },
  { slug: 'shumen', translationKey: 'cities.shumen', population: 80_000 },
  { slug: 'pernik', translationKey: 'cities.pernik', population: 80_000 },
  { slug: 'haskovo', translationKey: 'cities.haskovo', population: 75_000 },
  { slug: 'yambol', translationKey: 'cities.yambol', population: 70_000 },
  { slug: 'pazardzhik', translationKey: 'cities.pazardzhik', population: 70_000 },
  { slug: 'blagoevgrad', translationKey: 'cities.blagoevgrad', population: 70_000 },
  { slug: 'veliko-tarnovo', translationKey: 'cities.velikoTarnovo', population: 70_000 },
  { slug: 'vratsa', translationKey: 'cities.vratsa', population: 55_000 },
  { slug: 'gabrovo', translationKey: 'cities.gabrovo', population: 55_000 },
  { slug: 'asenovgrad', translationKey: 'cities.asenovgrad', population: 50_000 },

  // Smaller cities (30k-50k)
  { slug: 'vidin', translationKey: 'cities.vidin', population: 45_000 },
  { slug: 'kazanlak', translationKey: 'cities.kazanlak', population: 45_000 },
  { slug: 'kardzhali', translationKey: 'cities.kardzhali', population: 45_000 },
  { slug: 'kyustendil', translationKey: 'cities.kyustendil', population: 45_000 },
  { slug: 'montana', translationKey: 'cities.montana', population: 40_000 },
  { slug: 'targovishte', translationKey: 'cities.targovishte', population: 40_000 },
  { slug: 'dimitrovgrad', translationKey: 'cities.dimitrovgrad', population: 35_000 },
  { slug: 'silistra', translationKey: 'cities.silistra', population: 35_000 },
  { slug: 'lovech', translationKey: 'cities.lovech', population: 35_000 },
  { slug: 'razgrad', translationKey: 'cities.razgrad', population: 30_000 },
  { slug: 'dupnitsa', translationKey: 'cities.dupnitsa', population: 30_000 },
  { slug: 'gorna-oryahovitsa', translationKey: 'cities.gornaOryahovitsa', population: 30_000 },
  { slug: 'smolyan', translationKey: 'cities.smolyan', population: 30_000 },
  { slug: 'petrich', translationKey: 'cities.petrich', population: 30_000 },
  { slug: 'sandanski', translationKey: 'cities.sandanski', population: 28_000 },
  { slug: 'samokov', translationKey: 'cities.samokov', population: 27_000 },
  { slug: 'sevlievo', translationKey: 'cities.sevlievo', population: 25_000 },
  { slug: 'lom', translationKey: 'cities.lom', population: 23_000 },
  { slug: 'karlovo', translationKey: 'cities.karlovo', population: 23_000 },
  { slug: 'troyan', translationKey: 'cities.troyan', population: 22_000 },

  // Popular tourist/resort areas (high expat populations)
  { slug: 'bansko', translationKey: 'cities.bansko', population: 10_000 },
  { slug: 'nesebar', translationKey: 'cities.nesebar', population: 10_000 },
  { slug: 'sunny-beach', translationKey: 'cities.sunnyBeach', population: 8_000 },
  { slug: 'sveti-vlas', translationKey: 'cities.svetiVlas', population: 5_000 },
  { slug: 'sozopol', translationKey: 'cities.sozopol', population: 5_000 },
  { slug: 'pomorie', translationKey: 'cities.pomorie', population: 14_000 },
  { slug: 'primorsko', translationKey: 'cities.primorsko', population: 3_000 },
  { slug: 'golden-sands', translationKey: 'cities.goldenSands', population: 3_000 },
  { slug: 'albena', translationKey: 'cities.albena', population: 2_000 },
  { slug: 'balchik', translationKey: 'cities.balchik', population: 12_000 },
  { slug: 'obzor', translationKey: 'cities.obzor', population: 2_500 },
  { slug: 'borovets', translationKey: 'cities.borovets', population: 1_500 },
];

/**
 * Get city by slug
 */
export const getCityBySlug = (slug: string): City | undefined => {
  return CITIES.find(city => city.slug === slug);
};

/**
 * Get all city slugs (for database CHECK constraint)
 */
export const getCitySlugs = (): string[] => {
  return CITIES.map(city => city.slug);
};
