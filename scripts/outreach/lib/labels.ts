/**
 * Localized display labels for cities and sub-categories used in email copy.
 *
 * Mirror of the smaller-scope tables we use in queries.ts but kept separate so
 * email copy doesn't drift from the search-query strings (which are tuned for
 * Google Maps, not for natural reading).
 */

const CITY_LABELS: Record<'bg' | 'ru' | 'ua', Record<string, string>> = {
  bg: {
    sofia: 'София',
    plovdiv: 'Пловдив',
    varna: 'Варна',
    burgas: 'Бургас',
    ruse: 'Русе',
    'stara-zagora': 'Стара Загора',
    pleven: 'Плевен',
    sliven: 'Сливен',
  },
  ru: {
    sofia: 'Софии',
    plovdiv: 'Пловдиве',
    varna: 'Варне',
    burgas: 'Бургасе',
    ruse: 'Русе',
    'stara-zagora': 'Стара-Загоре',
    pleven: 'Плевене',
    sliven: 'Сливене',
  },
  ua: {
    sofia: 'Софії',
    plovdiv: 'Пловдиві',
    varna: 'Варні',
    burgas: 'Бургасі',
    ruse: 'Русе',
    'stara-zagora': 'Стара-Загорі',
    pleven: 'Плевені',
    sliven: 'Слівені',
  },
}

const SUBCAT_LABELS: Record<'bg' | 'ru' | 'ua', Record<string, string>> = {
  bg: {
    'house-cleaning': 'почистване на жилища',
    'apartment-cleaning': 'почистване на апартаменти',
    'office-cleaning': 'почистване на офиси',
    'window-cleaning': 'миене на прозорци',
    'post-construction-cleaning': 'почистване след ремонт',
    'post-renovation-cleaning': 'почистване след ремонт',
    'deep-cleaning': 'основно почистване',
    plumber: 'ВиК услуги',
    electrician: 'електро услуги',
    locksmith: 'ключарски услуги',
    carpenter: 'дърводелски услуги',
    painter: 'бояджийски услуги',
    tiler: 'фаянс и плочки',
    welder: 'заваръчни услуги',
    roofer: 'покривни ремонти',
    'general-handyman': 'майстор за дома',
    'handyman-service': 'майстор за дома',
    'apartment-renovation': 'ремонт на апартаменти',
    'furniture-manufacturing': 'производство на мебели',
    'large-appliance-repair': 'ремонт на едрогабаритна техника',
    'small-appliance-repair': 'ремонт на дребна битова техника',
    'phone-repair': 'ремонт на телефони',
    'computer-help': 'компютърен сервиз',
    'ac-repair': 'климатици',
    'washing-machine-repair': 'ремонт на перални',
    'tv-repair': 'ремонт на телевизори',
    'dog-walking': 'разходка на кучета',
    'pet-sitting': 'гледане на животни',
    'pet-grooming': 'козметика за кучета',
    babysitter: 'детегледачка',
    'elderly-care': 'грижа за възрастни',
    courier: 'куриерски услуги',
    moving: 'хамалски услуги',
    'furniture-delivery': 'доставка на мебели',
    demolition: 'разрушаване и къртене',
    masonry: 'зидарски услуги',
    insulation: 'топлоизолация',
    plastering: 'мазилки и шпакловки',
    flooring: 'настилки',
    drywall: 'гипсокартон',
    'facade-work': 'фасадни ремонти',
  },
  ru: {
    'house-cleaning': 'уборка квартир',
    'office-cleaning': 'уборка офисов',
    plumber: 'сантехника',
    electrician: 'электрика',
    babysitter: 'услуги няни',
  },
  ua: {
    'house-cleaning': 'прибирання квартир',
    plumber: 'сантехніка',
    electrician: 'електрика',
  },
}

export function cityLabelFor(slug: string, lang: 'bg' | 'ru' | 'ua'): string {
  return CITY_LABELS[lang][slug] ?? CITY_LABELS.bg[slug] ?? slug
}

export function subCategoryLabelFor(slug: string, lang: 'bg' | 'ru' | 'ua'): string {
  return SUBCAT_LABELS[lang][slug] ?? SUBCAT_LABELS.bg[slug] ?? slug.replace(/-/g, ' ')
}
