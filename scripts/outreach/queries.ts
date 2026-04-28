/**
 * Maps a (city, sub_category) pair to a Google Maps search query in the local
 * language. Bulgarian is the default — most leads will be there. Russian and
 * Ukrainian variants are supported for non-BG diaspora cells.
 *
 * If a (sub_category, city) combo isn't in the table, fall back to a generic
 * "<sub_category_label> <city_label>" string built from translations.
 */

const BG_CITIES: Record<string, string> = {
  sofia: 'София',
  plovdiv: 'Пловдив',
  varna: 'Варна',
  burgas: 'Бургас',
  ruse: 'Русе',
  'stara-zagora': 'Стара Загора',
  pleven: 'Плевен',
  sliven: 'Сливен',
}

const RU_CITIES: Record<string, string> = {
  sofia: 'София',
  plovdiv: 'Пловдив',
  varna: 'Варна',
  burgas: 'Бургас',
  ruse: 'Русе',
  'stara-zagora': 'Стара-Загора',
  pleven: 'Плевен',
  sliven: 'Сливен',
}

/**
 * Sub-category slug → BG search noun. Only the categories most likely to have
 * Google Maps presence are populated. Add more as we run more cells.
 */
const BG_SUBCATEGORIES: Record<string, string> = {
  // Cleaning
  'house-cleaning': 'почистване на апартаменти',
  'office-cleaning': 'професионално почистване офиси',
  'window-cleaning': 'миене на прозорци',
  'post-construction-cleaning': 'почистване след ремонт',

  // Handyman / trades
  plumber: 'ВиК услуги',
  electrician: 'електротехник',
  locksmith: 'ключар',
  carpenter: 'дърводелец',
  painter: 'бояджия',
  tiler: 'фаянс плочки майстор',
  welder: 'заварчик',
  roofer: 'покривни ремонти',
  'general-handyman': 'майстор за дома',

  // Appliances
  'phone-repair': 'ремонт на телефони',
  'computer-help': 'компютърен сервиз',
  'ac-repair': 'климатици сервиз',
  'washing-machine-repair': 'ремонт на перални',
  'tv-repair': 'ремонт на телевизори',

  // Pets
  'dog-walking': 'разходка на кучета',
  'pet-sitting': 'гледане на животни',
  'pet-grooming': 'козметичен салон за кучета',

  // Personal care
  babysitter: 'детегледачка',
  'elderly-care': 'грижа за възрастни',

  // Transport
  courier: 'куриерски услуги',
  moving: 'хамалски услуги',
  'furniture-delivery': 'доставка на мебели',

  // Construction / finishing
  demolition: 'разрушаване и къртене',
  masonry: 'зидария услуги',
  insulation: 'топлоизолация',
  plastering: 'мазилки и шпакловки',
  flooring: 'настилки и подови покрития',
  drywall: 'гипсокартон',
  'facade-work': 'фасадни ремонти',
}

const RU_SUBCATEGORIES: Record<string, string> = {
  'house-cleaning': 'уборка квартир',
  'office-cleaning': 'уборка офисов',
  plumber: 'сантехник',
  electrician: 'электрик',
  babysitter: 'няня',
}

const UA_SUBCATEGORIES: Record<string, string> = {
  'house-cleaning': 'прибирання квартир',
  plumber: 'сантехнік',
  electrician: 'електрик',
}

/**
 * Note: language uses TruDify's locale codes — 'ua' (not 'uk') for Ukrainian.
 * The Apify actor accepts ISO codes, so we still pass 'uk' to it; only our
 * internal labelling uses 'ua' to stay consistent with the rest of the app.
 */
export function buildGmapsQuery(
  city: string,
  subCategory: string,
  language: 'bg' | 'ru' | 'ua',
): string {
  if (language === 'ru') {
    const c = RU_CITIES[city] ?? city
    const s = RU_SUBCATEGORIES[subCategory] ?? subCategory
    return `${s} ${c}`
  }
  if (language === 'ua') {
    const c = BG_CITIES[city] ?? city  // UA diaspora targets in Bulgaria
    const s = UA_SUBCATEGORIES[subCategory] ?? subCategory
    return `${s} ${c}`
  }
  const c = BG_CITIES[city] ?? city
  const s = BG_SUBCATEGORIES[subCategory] ?? subCategory
  return `${s} ${c}`
}

/**
 * Apify expects ISO 639-1, so 'ua' → 'uk' on the wire. Keep this mapping in
 * one place so callers don't hand-roll it.
 */
export function apifyLangCode(language: 'bg' | 'ru' | 'ua'): string {
  return language === 'ua' ? 'uk' : language
}
