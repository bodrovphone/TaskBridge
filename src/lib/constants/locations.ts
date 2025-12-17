/**
 * Generic translation function type compatible with both react-i18next and next-intl
 */
type TranslateFunction = (key: string) => string;

export type LocationSlug =
  | 'sofia-center'
  | 'sofia-lyulin'
  | 'sofia-studentski-grad'
  | 'sofia-vitosha'
  | 'plovdiv'
  | 'varna'
  | 'burgas'
  | 'ruse'
  | 'stara-zagora';

export interface LocationOption {
  value: LocationSlug;
  label: string;
  emoji?: string;
}

/**
 * Get all location options with translations
 */
export function getLocationOptions(t: TranslateFunction): LocationOption[] {
  return [
    {
      value: 'sofia-center',
      label: t('locations.sofiaCenter'),
      emoji: '🏛️'
    },
    {
      value: 'sofia-lyulin',
      label: t('locations.sofiaLyulin'),
      emoji: '🏘️'
    },
    {
      value: 'sofia-studentski-grad',
      label: t('locations.sofiaStudentski'),
      emoji: '🎓'
    },
    {
      value: 'sofia-vitosha',
      label: t('locations.sofiaVitosha'),
      emoji: '🏔️'
    },
    {
      value: 'plovdiv',
      label: t('locations.plovdiv'),
      emoji: '🏛️'
    },
    {
      value: 'varna',
      label: t('locations.varna'),
      emoji: '🌊'
    },
    {
      value: 'burgas',
      label: t('locations.burgas'),
      emoji: '🏖️'
    },
    {
      value: 'ruse',
      label: t('locations.ruse'),
      emoji: '🏙️'
    },
    {
      value: 'stara-zagora',
      label: t('locations.staraZagora'),
      emoji: '🌳'
    },
  ];
}

/**
 * Get location label by slug
 */
export function getLocationLabel(slug: LocationSlug, t: TranslateFunction): string {
  const location = getLocationOptions(t).find(loc => loc.value === slug);
  return location?.label || slug;
}
