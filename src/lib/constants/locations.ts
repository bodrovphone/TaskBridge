import { TFunction } from 'i18next';

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
export function getLocationOptions(t: TFunction): LocationOption[] {
  return [
    {
      value: 'sofia-center',
      label: t('locations.sofiaCenter', { defaultValue: 'София, Център' }),
      emoji: '🏛️'
    },
    {
      value: 'sofia-lyulin',
      label: t('locations.sofiaLyulin', { defaultValue: 'София, Люлин' }),
      emoji: '🏘️'
    },
    {
      value: 'sofia-studentski-grad',
      label: t('locations.sofiaStudentski', { defaultValue: 'София, Студентски град' }),
      emoji: '🎓'
    },
    {
      value: 'sofia-vitosha',
      label: t('locations.sofiaVitosha', { defaultValue: 'София, Витоша' }),
      emoji: '🏔️'
    },
    {
      value: 'plovdiv',
      label: t('locations.plovdiv', { defaultValue: 'Пловдив' }),
      emoji: '🏛️'
    },
    {
      value: 'varna',
      label: t('locations.varna', { defaultValue: 'Варна' }),
      emoji: '🌊'
    },
    {
      value: 'burgas',
      label: t('locations.burgas', { defaultValue: 'Бургас' }),
      emoji: '🏖️'
    },
    {
      value: 'ruse',
      label: t('locations.ruse', { defaultValue: 'Русе' }),
      emoji: '🏙️'
    },
    {
      value: 'stara-zagora',
      label: t('locations.staraZagora', { defaultValue: 'Стара Загора' }),
      emoji: '🌳'
    },
  ];
}

/**
 * Get location label by slug
 */
export function getLocationLabel(slug: LocationSlug, t: TFunction): string {
  const location = getLocationOptions(t).find(loc => loc.value === slug);
  return location?.label || slug;
}
