/**
 * Category Keywords Database
 * Maps natural language search terms to subcategory slugs
 *
 * Structure: subcategorySlug -> { en: [], bg: [], ru: [] }
 * Keywords include: action phrases, objects, common searches
 */

export type CategoryKeywords = Record<string, {
  en: string[];
  bg: string[];
  ru: string[];
}>;

export const CATEGORY_KEYWORDS: CategoryKeywords = {
  // ===== HANDYMAN =====
  'plumber': {
    en: ['plumber', 'plumbing', 'pipe', 'pipes', 'faucet', 'tap', 'toilet', 'leak', 'leaking', 'drain', 'clogged', 'water', 'bathroom', 'sink', 'shower', 'bathtub', 'fix pipe', 'fix faucet', 'fix toilet', 'fix leak', 'fix', 'repair', 'broken pipe', 'unclog', 'water heater', 'boiler', 'need plumber'],
    bg: ['водопроводчик', 'ВиК', 'тръба', 'тръби', 'кран', 'тоалетна', 'течове', 'запушване', 'канал', 'мивка', 'душ', 'вана', 'бойлер', 'поправка кран', 'поправка', 'ремонт', 'запушен канал', 'течаща тръба', 'счупена тръба'],
    ru: ['сантехник', 'сантехника', 'труба', 'трубы', 'кран', 'унитаз', 'течь', 'течет', 'засор', 'канализация', 'раковина', 'душ', 'ванна', 'бойлер', 'починить кран', 'починить', 'ремонт', 'прочистить', 'замена труб', 'установка смесителя'],
  },
  'electrician': {
    en: ['electrician', 'electrical', 'wiring', 'wire', 'outlet', 'socket', 'light', 'lighting', 'switch', 'circuit', 'breaker', 'fuse', 'power', 'voltage', 'install light', 'fix outlet', 'fix light', 'fix switch', 'fix', 'repair', 'broken outlet', 'no power', 'need electrician'],
    bg: ['електричар', 'електротехник', 'електрически', 'кабел', 'контакт', 'осветление', 'лампа', 'ключ', 'прекъсвач', 'бушон', 'ток', 'монтаж лампа', 'смяна контакт', 'поправка', 'ремонт', 'няма ток'],
    ru: ['электрик', 'электричество', 'проводка', 'провод', 'розетка', 'свет', 'освещение', 'выключатель', 'автомат', 'щиток', 'замена розетки', 'установка люстры', 'подключение', 'короткое замыкание', 'починить', 'ремонт', 'нет света'],
  },
  'handyman-service': {
    en: ['handyman', 'odd jobs', 'small repairs', 'fix', 'repair', 'mount', 'hang', 'install', 'assembly', 'drill', 'shelf', 'curtain', 'picture', 'tv mount', 'minor repairs', 'broken', 'need help', 'need handyman', 'fix something'],
    bg: ['майстор', 'дребни ремонти', 'поправка', 'ремонт', 'монтаж', 'окачване', 'пробиване', 'рафт', 'завеса', 'картина', 'телевизор монтаж', 'битови ремонти', 'счупено', 'нужен майстор'],
    ru: ['мастер на час', 'мелкий ремонт', 'муж на час', 'починить', 'повесить', 'установить', 'сборка', 'полка', 'карниз', 'картина', 'телевизор повесить', 'бытовой ремонт', 'сломалось', 'нужен мастер'],
  },
  'carpenter': {
    en: ['carpenter', 'carpentry', 'wood', 'wooden', 'door', 'window', 'frame', 'cabinet', 'closet', 'wardrobe', 'woodwork', 'fix door', 'fix window', 'fix', 'repair', 'install door', 'wooden floor', 'broken door', 'broken window'],
    bg: ['дърводелец', 'дърводелски', 'дърво', 'дървен', 'врата', 'прозорец', 'рамка', 'шкаф', 'гардероб', 'паркет', 'ламинат', 'монтаж врата', 'поправка', 'ремонт', 'счупена врата'],
    ru: ['плотник', 'столяр', 'дерево', 'деревянный', 'дверь', 'окно', 'рама', 'шкаф', 'гардероб', 'паркет', 'ламинат', 'установка двери', 'деревянные работы', 'починить', 'ремонт', 'сломанная дверь'],
  },
  'locksmith': {
    en: ['locksmith', 'lock', 'key', 'door lock', 'change lock', 'install lock', 'locked out', 'safe', 'unlock', 'security lock', 'deadbolt', 'fix lock', 'fix', 'repair', 'broken lock', 'stuck lock', 'new lock'],
    bg: ['ключар', 'брава', 'ключ', 'смяна брава', 'монтаж брава', 'заключване', 'сейф', 'отключване', 'патрон', 'секретна брава', 'поставяне брава', 'поправка', 'ремонт', 'счупена брава'],
    ru: ['слесарь', 'замок', 'ключ', 'дверной замок', 'замена замка', 'установка замка', 'установка', 'врезка замка', 'сейф', 'открыть дверь', 'личинка', 'защелка', 'поставить замок', 'починить', 'ремонт', 'сломанный замок'],
  },

  // ===== APPLIANCE REPAIR =====
  'large-appliance-repair': {
    en: ['appliance repair', 'washing machine', 'washer', 'dryer', 'dishwasher', 'refrigerator', 'fridge', 'freezer', 'oven', 'stove', 'fix appliance', 'fix', 'repair', 'broken appliance', 'broken washer', 'broken fridge', 'not working'],
    bg: ['ремонт уреди', 'пералня', 'сушилня', 'съдомиялна', 'хладилник', 'фризер', 'фурна', 'печка', 'бяла техника', 'поправка уред', 'поправка', 'ремонт', 'счупен', 'не работи'],
    ru: ['ремонт техники', 'стиральная машина', 'стиралка', 'сушилка', 'посудомойка', 'холодильник', 'морозилка', 'духовка', 'плита', 'бытовая техника', 'починить', 'ремонт', 'сломался', 'не работает'],
  },
  'small-appliance-repair': {
    en: ['small appliance', 'microwave', 'toaster', 'blender', 'mixer', 'coffee maker', 'kettle', 'iron', 'vacuum', 'fan', 'heater', 'fix', 'repair', 'broken'],
    bg: ['малки уреди', 'микровълнова', 'тостер', 'блендер', 'миксер', 'кафемашина', 'чайник', 'ютия', 'прахосмукачка', 'вентилатор', 'калорифер', 'поправка', 'ремонт', 'счупен'],
    ru: ['мелкая техника', 'микроволновка', 'тостер', 'блендер', 'миксер', 'кофеварка', 'чайник', 'утюг', 'пылесос', 'вентилятор', 'обогреватель', 'починить', 'ремонт', 'сломался'],
  },
  'computer-help': {
    en: ['computer', 'pc', 'laptop', 'notebook', 'computer repair', 'slow computer', 'virus', 'windows', 'mac', 'software', 'install program', 'computer setup', 'fix computer', 'fix', 'repair', 'broken computer', 'not working'],
    bg: ['компютър', 'компютърна помощ', 'лаптоп', 'ремонт компютър', 'бавен компютър', 'вирус', 'уиндоус', 'софтуер', 'инсталиране', 'настройка', 'поправка', 'ремонт', 'счупен компютър'],
    ru: ['компьютер', 'компьютерная помощь', 'ноутбук', 'ремонт компьютера', 'медленный компьютер', 'вирус', 'виндовс', 'программа', 'установка', 'настройка', 'починить', 'ремонт', 'сломался'],
  },
  'digital-tech-repair': {
    en: ['tablet', 'ipad', 'kindle', 'e-reader', 'smart device', 'gadget', 'electronic', 'tech repair', 'fix', 'repair', 'broken tablet'],
    bg: ['таблет', 'айпад', 'електронна книга', 'смарт устройство', 'джаджа', 'електроника', 'ремонт техника', 'поправка', 'ремонт', 'счупен'],
    ru: ['планшет', 'айпад', 'электронная книга', 'смарт устройство', 'гаджет', 'электроника', 'ремонт техники', 'починить', 'ремонт', 'сломался'],
  },
  'phone-repair': {
    en: ['phone', 'smartphone', 'iphone', 'android', 'samsung', 'screen', 'cracked screen', 'battery', 'phone repair', 'mobile', 'fix phone', 'fix screen', 'fix', 'repair', 'broken phone', 'broken screen'],
    bg: ['телефон', 'смартфон', 'айфон', 'андроид', 'самсунг', 'екран', 'счупен екран', 'батерия', 'ремонт телефон', 'мобилен', 'поправка', 'ремонт', 'счупен телефон'],
    ru: ['телефон', 'смартфон', 'айфон', 'андроид', 'самсунг', 'экран', 'разбитый экран', 'батарея', 'ремонт телефона', 'мобильный', 'починить', 'ремонт', 'сломался'],
  },

  // ===== CLEANING SERVICES =====
  'apartment-cleaning': {
    en: ['apartment cleaning', 'flat cleaning', 'home cleaning', 'house cleaner', 'maid', 'clean apartment', 'clean house', 'clean', 'cleaning', 'tidy up', 'regular cleaning', 'need cleaner'],
    bg: ['почистване апартамент', 'почистване жилище', 'чистачка', 'домашно почистване', 'редовно почистване', 'почистване', 'чисто', 'нужна чистачка'],
    ru: ['уборка квартиры', 'уборка дома', 'клининг', 'домработница', 'регулярная уборка', 'убрать квартиру', 'уборка', 'убраться', 'нужна уборщица'],
  },
  'deep-cleaning': {
    en: ['deep cleaning', 'thorough cleaning', 'spring cleaning', 'intensive cleaning', 'detailed cleaning', 'clean', 'cleaning'],
    bg: ['основно почистване', 'генерално почистване', 'пролетно почистване', 'детайлно почистване', 'почистване'],
    ru: ['генеральная уборка', 'глубокая уборка', 'капитальная уборка', 'тщательная уборка', 'уборка'],
  },
  'post-renovation-cleaning': {
    en: ['post renovation', 'after construction', 'builders clean', 'post construction cleaning', 'renovation cleanup'],
    bg: ['почистване след ремонт', 'след строителство', 'строителен боклук', 'почистване след строеж'],
    ru: ['уборка после ремонта', 'послестроительная уборка', 'после стройки', 'строительная пыль'],
  },
  'dry-cleaning': {
    en: ['dry cleaning', 'carpet cleaning', 'upholstery', 'sofa cleaning', 'mattress cleaning', 'curtain cleaning', 'fabric cleaning'],
    bg: ['химическо чистене', 'пране килим', 'тапицерия', 'пране диван', 'пране матрак', 'пране завеси'],
    ru: ['химчистка', 'чистка ковров', 'чистка мебели', 'чистка дивана', 'чистка матраса', 'чистка штор'],
  },
  'house-cleaning': {
    en: ['house cleaning', 'home cleaning', 'domestic cleaning', 'residential cleaning', 'clean house', 'housekeeping'],
    bg: ['почистване къща', 'домашно почистване', 'битово почистване', 'чиста къща'],
    ru: ['уборка дома', 'домашняя уборка', 'бытовая уборка', 'убрать дом', 'уборщица'],
  },

  // ===== FINISHING WORK =====
  'apartment-renovation': {
    en: ['renovation', 'remodel', 'apartment renovation', 'flat renovation', 'home renovation', 'refurbishment', 'makeover'],
    bg: ['ремонт апартамент', 'обновяване', 'реновиране', 'ремонт жилище', 'ремонт на дома'],
    ru: ['ремонт квартиры', 'ремонт', 'отделка', 'косметический ремонт', 'капитальный ремонт', 'евроремонт'],
  },
  'tile-installation': {
    en: ['tile', 'tiles', 'tiling', 'ceramic', 'floor tiles', 'wall tiles', 'bathroom tiles', 'kitchen tiles', 'grout'],
    bg: ['плочки', 'фаянс', 'теракот', 'керамични плочки', 'облицовка', 'поставяне плочки', 'фугиране'],
    ru: ['плитка', 'кафель', 'керамика', 'укладка плитки', 'облицовка', 'затирка', 'керамогранит'],
  },
  'plastering': {
    en: ['plastering', 'plaster', 'drywall', 'gypsum', 'stucco', 'wall plaster', 'ceiling plaster', 'skim coat'],
    bg: ['мазилка', 'шпакловка', 'гипсокартон', 'гипс', 'измазване', 'шпакловане', 'латекс'],
    ru: ['штукатурка', 'шпаклевка', 'гипсокартон', 'выравнивание стен', 'побелка', 'штукатурные работы'],
  },
  'insulation': {
    en: ['insulation', 'thermal insulation', 'soundproofing', 'foam', 'mineral wool', 'styrofoam', 'waterproofing'],
    bg: ['изолация', 'топлоизолация', 'шумоизолация', 'хидроизолация', 'стиропор', 'минерална вата'],
    ru: ['утепление', 'теплоизоляция', 'звукоизоляция', 'гидроизоляция', 'пенопласт', 'минвата'],
  },
  'heating-installation': {
    en: ['heating', 'radiator', 'boiler', 'central heating', 'underfloor heating', 'heat pump', 'hvac', 'air conditioning', 'ac'],
    bg: ['отопление', 'радиатор', 'котел', 'парно', 'подово отопление', 'климатик', 'климатизация'],
    ru: ['отопление', 'радиатор', 'котел', 'батарея', 'теплый пол', 'кондиционер', 'климат'],
  },

  // ===== CONSTRUCTION WORK =====
  'general-labor': {
    en: ['labor', 'helper', 'construction helper', 'demolition', 'cleanup', 'heavy lifting', 'manual labor'],
    bg: ['общи работи', 'помощник', 'разрушаване', 'събаряне', 'чистене', 'тежък труд'],
    ru: ['разнорабочий', 'подсобник', 'демонтаж', 'снос', 'уборка мусора', 'грузчик'],
  },
  'welding': {
    en: ['welding', 'welder', 'metal work', 'steel', 'iron', 'gate', 'fence', 'railing', 'metal fabrication'],
    bg: ['заваряване', 'заварчик', 'метални работи', 'желязо', 'стомана', 'порта', 'ограда', 'парапет'],
    ru: ['сварка', 'сварщик', 'металлоконструкции', 'железо', 'сталь', 'ворота', 'забор', 'перила'],
  },
  'turning': {
    en: ['lathe', 'turning', 'machining', 'metal turning', 'cnc', 'milling'],
    bg: ['струговане', 'стругар', 'фрезоване', 'металообработка', 'ЦПУ'],
    ru: ['токарные работы', 'токарь', 'фрезеровка', 'металлообработка', 'ЧПУ'],
  },
  'carpentry': {
    en: ['carpentry', 'wooden construction', 'timber', 'beam', 'roof structure', 'pergola', 'deck', 'wooden deck'],
    bg: ['дърводелство', 'дървени конструкции', 'греди', 'покривна конструкция', 'пергола', 'тераса'],
    ru: ['плотницкие работы', 'деревянные конструкции', 'балки', 'стропила', 'пергола', 'терраса'],
  },
  'bricklaying': {
    en: ['bricklaying', 'masonry', 'brick', 'block', 'wall', 'foundation', 'concrete', 'cement'],
    bg: ['зидария', 'тухли', 'блокове', 'стена', 'основи', 'бетон', 'цимент', 'зидане'],
    ru: ['кладка', 'кирпич', 'блоки', 'стена', 'фундамент', 'бетон', 'цемент', 'каменщик'],
  },

  // ===== FURNITURE WORK =====
  'furniture-manufacturing': {
    en: ['custom furniture', 'furniture making', 'built-in', 'cabinet making', 'custom cabinet', 'bespoke furniture'],
    bg: ['мебели по поръчка', 'изработка мебели', 'вградени мебели', 'корпусна мебел'],
    ru: ['мебель на заказ', 'изготовление мебели', 'встроенная мебель', 'корпусная мебель'],
  },
  'furniture-repair': {
    en: ['furniture repair', 'fix furniture', 'broken furniture', 'chair repair', 'table repair', 'drawer repair'],
    bg: ['ремонт мебели', 'поправка мебели', 'счупена мебел', 'ремонт стол', 'ремонт маса'],
    ru: ['ремонт мебели', 'починить мебель', 'сломанная мебель', 'ремонт стула', 'ремонт стола'],
  },
  'furniture-assembly': {
    en: ['furniture assembly', 'ikea assembly', 'assemble furniture', 'put together', 'flatpack', 'bed assembly', 'wardrobe assembly'],
    bg: ['сглобяване мебели', 'монтаж мебели', 'сглобяване икеа', 'монтаж легло', 'монтаж гардероб'],
    ru: ['сборка мебели', 'собрать мебель', 'икеа сборка', 'сборка кровати', 'сборка шкафа'],
  },
  'furniture-restoration': {
    en: ['furniture restoration', 'antique restoration', 'refinishing', 'wood restoration', 'vintage furniture'],
    bg: ['реставрация мебели', 'реставрация антики', 'обновяване мебели', 'стара мебел'],
    ru: ['реставрация мебели', 'реставрация антиквариата', 'обновление мебели', 'старая мебель'],
  },
  'furniture-upholstery': {
    en: ['upholstery', 'reupholster', 'sofa upholstery', 'chair upholstery', 'fabric', 'leather', 'cushion'],
    bg: ['тапицерия', 'претапициране', 'тапициране диван', 'тапициране стол', 'плат', 'кожа'],
    ru: ['перетяжка мебели', 'обивка', 'перетяжка дивана', 'перетяжка кресла', 'ткань', 'кожа'],
  },

  // ===== LOGISTICS =====
  'cargo-transport': {
    en: ['cargo transport', 'truck', 'van', 'freight', 'hauling', 'transport', 'delivery truck', 'moving truck'],
    bg: ['товарен транспорт', 'камион', 'бус', 'превоз товари', 'транспорт'],
    ru: ['грузоперевозки', 'грузовик', 'фура', 'перевозка грузов', 'транспорт', 'газель'],
  },
  'loaders': {
    en: ['loaders', 'loading', 'unloading', 'movers', 'heavy lifting', 'carry'],
    bg: ['товарачи', 'товарене', 'разтоварване', 'преместване', 'носене'],
    ru: ['грузчики', 'погрузка', 'разгрузка', 'переноска', 'такелаж'],
  },
  'construction-waste-removal': {
    en: ['waste removal', 'junk removal', 'debris removal', 'construction waste', 'rubbish', 'disposal', 'dumpster'],
    bg: ['извозване отпадъци', 'строителни отпадъци', 'боклук', 'изхвърляне', 'контейнер'],
    ru: ['вывоз мусора', 'строительный мусор', 'вывоз отходов', 'контейнер', 'утилизация'],
  },
  'furniture-appliance-moving': {
    en: ['furniture moving', 'appliance moving', 'piano moving', 'heavy items', 'large items'],
    bg: ['преместване мебели', 'преместване уреди', 'преместване пиано', 'тежки предмети'],
    ru: ['перевозка мебели', 'перевозка техники', 'перевозка пианино', 'тяжелые вещи'],
  },
  'office-relocation': {
    en: ['office moving', 'office relocation', 'business moving', 'commercial moving', 'office move'],
    bg: ['преместване офис', 'бизнес преместване', 'офис релокация'],
    ru: ['переезд офиса', 'офисный переезд', 'перевозка офиса', 'коммерческий переезд'],
  },

  // ===== HOUSEHOLD SERVICES =====
  'gardening': {
    en: ['gardening', 'garden', 'lawn', 'mowing', 'landscaping', 'plants', 'trees', 'pruning', 'hedge', 'yard'],
    bg: ['градинарство', 'градина', 'трева', 'косене', 'озеленяване', 'растения', 'дървета', 'подрязване'],
    ru: ['садовник', 'сад', 'газон', 'покос травы', 'озеленение', 'растения', 'деревья', 'обрезка'],
  },
  'babysitting': {
    en: ['babysitter', 'babysitting', 'nanny', 'childcare', 'child care', 'kids', 'children', 'au pair'],
    bg: ['бавачка', 'гледане деца', 'детегледачка', 'грижа за деца'],
    ru: ['няня', 'присмотр за детьми', 'бебиситтер', 'уход за детьми', 'сиделка для детей'],
  },
  'caregiver': {
    en: ['caregiver', 'elderly care', 'senior care', 'home care', 'nurse', 'companion', 'assisted living'],
    bg: ['гледане възрастни', 'грижа за възрастни', 'болногледач', 'придружител'],
    ru: ['сиделка', 'уход за пожилыми', 'уход за больными', 'компаньон', 'помощь пожилым'],
  },
  'housekeeper': {
    en: ['housekeeper', 'housekeeping', 'domestic help', 'household help', 'maid service'],
    bg: ['домашна помощница', 'домакиня', 'битови услуги', 'помощ в дома'],
    ru: ['домработница', 'домоправительница', 'помощница по хозяйству', 'домашняя помощь'],
  },
  'sewing': {
    en: ['sewing', 'tailor', 'alterations', 'hemming', 'zipper', 'repair clothes', 'seamstress'],
    bg: ['шиене', 'шивач', 'корекции', 'скъсяване', 'цип', 'поправка дрехи'],
    ru: ['швея', 'шитье', 'ателье', 'подшить', 'молния', 'ремонт одежды', 'портной'],
  },

  // ===== AUTO REPAIR =====
  'roadside-assistance': {
    en: ['roadside assistance', 'breakdown', 'tow', 'towing', 'flat tire', 'jump start', 'battery jump', 'locked out car'],
    bg: ['пътна помощ', 'авария', 'репатрак', 'теглене', 'спукана гума', 'стартиране'],
    ru: ['автопомощь', 'эвакуатор', 'буксировка', 'прикурить', 'спустило колесо', 'техпомощь'],
  },
  'maintenance-diagnostics': {
    en: ['car service', 'oil change', 'diagnostics', 'inspection', 'tune up', 'maintenance', 'check engine'],
    bg: ['автосервиз', 'смяна масло', 'диагностика', 'преглед', 'техническо обслужване'],
    ru: ['автосервис', 'замена масла', 'диагностика', 'техосмотр', 'ТО', 'проверка авто'],
  },
  'auto-electrical': {
    en: ['auto electrical', 'car electrical', 'alternator', 'starter', 'car battery', 'wiring', 'lights'],
    bg: ['автоелектрика', 'автоелектричар', 'алтернатор', 'стартер', 'акумулатор'],
    ru: ['автоэлектрик', 'электрика авто', 'генератор', 'стартер', 'аккумулятор', 'проводка'],
  },
  'body-work': {
    en: ['body work', 'dent', 'scratch', 'paint', 'car paint', 'bumper', 'fender', 'collision repair'],
    bg: ['автотенекеджия', 'боядисване', 'драскотина', 'вдлъбнатина', 'броня', 'калник'],
    ru: ['кузовной ремонт', 'покраска авто', 'царапина', 'вмятина', 'бампер', 'рихтовка'],
  },
  'engine-repair': {
    en: ['engine repair', 'motor', 'transmission', 'gearbox', 'clutch', 'timing belt', 'engine overhaul'],
    bg: ['ремонт двигател', 'мотор', 'скоростна кутия', 'съединител', 'ремонт кола'],
    ru: ['ремонт двигателя', 'мотор', 'коробка передач', 'сцепление', 'капремонт', 'ГРМ'],
  },

  // ===== COURIER SERVICES =====
  'courier-delivery': {
    en: ['courier', 'delivery', 'parcel', 'package', 'express delivery', 'same day delivery', 'urgent delivery'],
    bg: ['куриер', 'доставка', 'колет', 'пратка', 'експресна доставка', 'бърза доставка'],
    ru: ['курьер', 'доставка', 'посылка', 'отправление', 'срочная доставка', 'экспресс'],
  },
  'grocery-delivery': {
    en: ['grocery delivery', 'supermarket', 'shopping', 'groceries', 'food shopping', 'errands'],
    bg: ['доставка хранителни', 'супермаркет', 'пазаруване', 'продукти'],
    ru: ['доставка продуктов', 'супермаркет', 'закупка продуктов', 'продукты на дом'],
  },
  'food-delivery': {
    en: ['food delivery', 'restaurant delivery', 'takeout', 'take away', 'meal delivery'],
    bg: ['доставка храна', 'ресторант доставка', 'поръчка храна'],
    ru: ['доставка еды', 'доставка из ресторана', 'еда на дом'],
  },
  'medicine-delivery': {
    en: ['medicine delivery', 'pharmacy', 'prescription', 'medication', 'drug store'],
    bg: ['доставка лекарства', 'аптека', 'рецепта', 'медикаменти'],
    ru: ['доставка лекарств', 'аптека', 'медикаменты', 'рецепт'],
  },
  'courier-by-car': {
    en: ['car courier', 'driver', 'personal driver', 'car delivery', 'vehicle delivery'],
    bg: ['куриер с кола', 'шофьор', 'личен шофьор', 'доставка с автомобил'],
    ru: ['курьер на авто', 'водитель', 'личный водитель', 'доставка на машине'],
  },

  // ===== DIGITAL MARKETING =====
  'contextual-advertising': {
    en: ['google ads', 'ppc', 'pay per click', 'adwords', 'search ads', 'contextual advertising'],
    bg: ['гугъл реклама', 'контекстна реклама', 'платена реклама', 'PPC'],
    ru: ['контекстная реклама', 'гугл реклама', 'яндекс директ', 'PPC', 'платная реклама'],
  },
  'seo-optimization': {
    en: ['seo', 'search engine', 'optimization', 'ranking', 'keywords', 'backlinks', 'google ranking'],
    bg: ['SEO', 'оптимизация', 'търсачки', 'класиране', 'ключови думи'],
    ru: ['SEO', 'поисковая оптимизация', 'продвижение сайта', 'ключевые слова', 'раскрутка'],
  },
  'copywriting': {
    en: ['copywriting', 'content writing', 'blog', 'articles', 'product description', 'web content'],
    bg: ['копирайтинг', 'писане на съдържание', 'статии', 'блог', 'описания'],
    ru: ['копирайтинг', 'написание текстов', 'статьи', 'блог', 'контент', 'рерайт'],
  },
  'social-media-marketing': {
    en: ['smm', 'social media', 'facebook', 'instagram', 'tiktok', 'social marketing', 'influencer'],
    bg: ['SMM', 'социални мрежи', 'фейсбук', 'инстаграм', 'тикток', 'маркетинг'],
    ru: ['SMM', 'соцсети', 'фейсбук', 'инстаграм', 'тикток', 'продвижение в соцсетях'],
  },
  'email-marketing': {
    en: ['email marketing', 'newsletter', 'email campaign', 'mailchimp', 'email automation'],
    bg: ['имейл маркетинг', 'бюлетин', 'имейл кампания', 'мейлчимп'],
    ru: ['email маркетинг', 'рассылка', 'email кампания', 'емейл рассылка'],
  },

  // ===== AI SERVICES =====
  'ai-content-creation': {
    en: ['ai content', 'chatgpt', 'ai writing', 'ai generated', 'ai assistant', 'ai text'],
    bg: ['AI съдържание', 'изкуствен интелект', 'ChatGPT', 'AI текст'],
    ru: ['AI контент', 'нейросеть', 'ChatGPT', 'ИИ тексты', 'генерация контента'],
  },
  'ai-consulting': {
    en: ['ai consulting', 'ai strategy', 'ai implementation', 'machine learning', 'ai advisor'],
    bg: ['AI консултация', 'AI стратегия', 'машинно обучение'],
    ru: ['AI консалтинг', 'ИИ стратегия', 'машинное обучение', 'внедрение ИИ'],
  },
  'ai-development': {
    en: ['ai development', 'ml development', 'neural network', 'deep learning', 'ai bot', 'chatbot'],
    bg: ['AI разработка', 'чатбот', 'невронни мрежи', 'машинно обучение'],
    ru: ['разработка ИИ', 'чатбот', 'нейросети', 'машинное обучение', 'бот'],
  },
  'ai-data-analytics': {
    en: ['data analytics', 'data science', 'big data', 'data analysis', 'bi', 'business intelligence'],
    bg: ['анализ данни', 'data science', 'бизнес интелигентност', 'big data'],
    ru: ['аналитика данных', 'data science', 'big data', 'бизнес аналитика'],
  },

  // ===== ONLINE ADVERTISING =====
  'online-ad-placement': {
    en: ['online advertising', 'banner ads', 'display ads', 'ad placement', 'digital advertising'],
    bg: ['онлайн реклама', 'банер реклама', 'дисплей реклама', 'интернет реклама'],
    ru: ['онлайн реклама', 'баннерная реклама', 'интернет реклама', 'размещение рекламы'],
  },

  // ===== ADVERTISING DISTRIBUTION =====
  'flyer-distribution': {
    en: ['flyer distribution', 'leaflet', 'pamphlet', 'handout', 'flyers', 'brochure distribution'],
    bg: ['раздаване флаери', 'листовки', 'брошури', 'рекламни материали'],
    ru: ['раздача листовок', 'флаеры', 'буклеты', 'промо материалы'],
  },
  'poster-hanging': {
    en: ['poster hanging', 'poster placement', 'bill posting', 'advertisement poster'],
    bg: ['окачване плакати', 'поставяне плакати', 'афиши'],
    ru: ['расклейка объявлений', 'плакаты', 'афиши', 'постеры'],
  },
  'mailbox-advertising': {
    en: ['mailbox advertising', 'direct mail', 'mailbox flyer', 'letterbox drop'],
    bg: ['реклама в пощенски кутии', 'директна поща', 'пощенски кутии'],
    ru: ['реклама в почтовые ящики', 'директ мейл', 'раскладка по ящикам'],
  },
  'sandwich-board-advertising': {
    en: ['sandwich board', 'walking advertising', 'human billboard', 'street advertising'],
    bg: ['жива реклама', 'ходеща реклама', 'рекламен костюм'],
    ru: ['промоутер', 'живая реклама', 'человек-реклама', 'уличная реклама'],
  },

  // ===== ONLINE WORK =====
  'data-research': {
    en: ['data research', 'internet research', 'web research', 'information gathering', 'market research'],
    bg: ['проучване', 'интернет изследване', 'събиране информация', 'пазарно проучване'],
    ru: ['исследование', 'интернет поиск', 'сбор информации', 'маркетинговое исследование'],
  },
  'content-filling': {
    en: ['content filling', 'website content', 'catalog filling', 'product upload', 'data upload'],
    bg: ['попълване съдържание', 'попълване сайт', 'качване продукти', 'каталог'],
    ru: ['наполнение сайта', 'наполнение каталога', 'загрузка товаров', 'контент менеджер'],
  },
  'typing': {
    en: ['typing', 'text typing', 'document typing', 'fast typing', 'transcription'],
    bg: ['набиране текст', 'писане текст', 'бързо писане', 'препис'],
    ru: ['набор текста', 'печать текста', 'перепечатка', 'машинопись'],
  },
  'data-entry': {
    en: ['data entry', 'database entry', 'spreadsheet', 'excel', 'form filling', 'data input'],
    bg: ['въвеждане данни', 'база данни', 'ексел', 'таблици', 'попълване форми'],
    ru: ['ввод данных', 'база данных', 'эксель', 'таблицы', 'заполнение форм'],
  },
  'transcription': {
    en: ['transcription', 'audio transcription', 'video transcription', 'dictation', 'speech to text'],
    bg: ['транскрипция', 'аудио транскрипция', 'видео транскрипция', 'диктовка'],
    ru: ['транскрибация', 'расшифровка аудио', 'расшифровка видео', 'стенография'],
  },

  // ===== DESIGN =====
  'logo-design': {
    en: ['logo', 'logo design', 'brand logo', 'business logo', 'company logo', 'branding'],
    bg: ['лого', 'лого дизайн', 'фирмено лого', 'брандинг'],
    ru: ['логотип', 'дизайн логотипа', 'фирменный стиль', 'брендинг'],
  },
  'interior-design': {
    en: ['interior design', 'home design', 'room design', 'apartment design', 'interior decorator'],
    bg: ['интериорен дизайн', 'дизайн интериор', 'дизайн стая', 'обзавеждане'],
    ru: ['дизайн интерьера', 'интерьер квартиры', 'дизайн комнаты', 'дизайнер интерьера'],
  },
  'web-app-design': {
    en: ['web design', 'app design', 'ui design', 'ux design', 'interface design', 'mobile design'],
    bg: ['уеб дизайн', 'дизайн приложение', 'UI дизайн', 'UX дизайн', 'интерфейс'],
    ru: ['веб дизайн', 'дизайн приложения', 'UI дизайн', 'UX дизайн', 'интерфейс'],
  },
  'print-design': {
    en: ['print design', 'flyer design', 'poster design', 'business card', 'brochure design', 'banner'],
    bg: ['принт дизайн', 'дизайн флаер', 'дизайн плакат', 'визитка', 'брошура'],
    ru: ['полиграфия', 'дизайн флаера', 'дизайн плаката', 'визитка', 'буклет'],
  },
  'printing-services': {
    en: ['printing', 'print shop', 'business cards', 'banners', 'posters', 'stickers', 'labels'],
    bg: ['печат', 'печатница', 'визитки', 'банери', 'плакати', 'стикери'],
    ru: ['печать', 'типография', 'визитки', 'баннеры', 'плакаты', 'наклейки'],
  },

  // ===== WEB DEVELOPMENT =====
  'website-creation': {
    en: ['website', 'web development', 'create website', 'build website', 'wordpress', 'web developer'],
    bg: ['уебсайт', 'създаване сайт', 'изработка сайт', 'уордпрес', 'уеб разработка'],
    ru: ['сайт', 'создание сайта', 'разработка сайта', 'вордпресс', 'веб разработка'],
  },
  'website-improvements': {
    en: ['website update', 'website fix', 'website changes', 'site maintenance', 'website edit'],
    bg: ['обновяване сайт', 'поправка сайт', 'промени сайт', 'поддръжка сайт'],
    ru: ['доработка сайта', 'обновление сайта', 'правки сайта', 'поддержка сайта'],
  },
  'landing-page': {
    en: ['landing page', 'one page', 'single page', 'sales page', 'squeeze page'],
    bg: ['лендинг', 'лендинг страница', 'продажна страница', 'едностраничен сайт'],
    ru: ['лендинг', 'посадочная страница', 'одностраничник', 'продающая страница'],
  },
  'website-layout': {
    en: ['html', 'css', 'frontend', 'website coding', 'responsive', 'psd to html'],
    bg: ['HTML', 'CSS', 'фронтенд', 'кодиране', 'респонсив', 'верстка'],
    ru: ['верстка', 'HTML', 'CSS', 'фронтенд', 'адаптивная верстка', 'PSD в HTML'],
  },
  'qa-testing': {
    en: ['qa', 'testing', 'software testing', 'bug testing', 'quality assurance', 'test'],
    bg: ['тестване', 'QA', 'софтуерно тестване', 'контрол качество'],
    ru: ['тестирование', 'QA', 'тестировщик', 'контроль качества', 'поиск багов'],
  },

  // ===== PHOTO/VIDEO =====
  'photographer': {
    en: ['photographer', 'photography', 'photo shoot', 'photoshoot', 'portrait', 'wedding photographer'],
    bg: ['фотограф', 'фотография', 'фотосесия', 'портрет', 'сватбен фотограф'],
    ru: ['фотограф', 'фотосъемка', 'фотосессия', 'портрет', 'свадебный фотограф'],
  },
  'videographer': {
    en: ['videographer', 'video shooting', 'video production', 'cameraman', 'wedding video', 'filming'],
    bg: ['видеограф', 'видео заснемане', 'оператор', 'сватбено видео', 'филмиране'],
    ru: ['видеограф', 'видеосъемка', 'оператор', 'свадебное видео', 'съемка'],
  },
  'photo-editing': {
    en: ['photo editing', 'photoshop', 'retouching', 'photo retouch', 'image editing', 'color correction'],
    bg: ['обработка снимки', 'фотошоп', 'ретуш', 'корекция цвят'],
    ru: ['обработка фото', 'фотошоп', 'ретушь', 'цветокоррекция', 'редактирование фото'],
  },
  'video-editing': {
    en: ['video editing', 'video cut', 'premiere', 'after effects', 'montage', 'video production'],
    bg: ['видео монтаж', 'видео обработка', 'монтаж', 'премиер', 'афтър ефектс'],
    ru: ['монтаж видео', 'видеомонтаж', 'обработка видео', 'премьер', 'афтер эффектс'],
  },
  'video-digitization': {
    en: ['video digitization', 'vhs to digital', 'tape conversion', 'film scanning', 'old video'],
    bg: ['дигитализация видео', 'VHS към цифрово', 'конвертиране касети'],
    ru: ['оцифровка видео', 'VHS в цифру', 'оцифровка кассет', 'перегон видео'],
  },

  // ===== BUSINESS SERVICES =====
  'accounting': {
    en: ['accounting', 'accountant', 'bookkeeping', 'taxes', 'tax return', 'financial reports'],
    bg: ['счетоводство', 'счетоводител', 'данъци', 'данъчна декларация', 'финансови отчети'],
    ru: ['бухгалтерия', 'бухгалтер', 'налоги', 'налоговая декларация', 'отчетность'],
  },
  'legal-services': {
    en: ['lawyer', 'legal', 'attorney', 'legal advice', 'contract', 'legal consultation'],
    bg: ['адвокат', 'правни услуги', 'юрист', 'консултация', 'договор'],
    ru: ['юрист', 'адвокат', 'юридические услуги', 'консультация', 'договор'],
  },
  'real-estate': {
    en: ['real estate', 'realtor', 'property', 'rent', 'buy house', 'sell house', 'apartment'],
    bg: ['недвижими имоти', 'брокер', 'имот', 'наем', 'продажба имот', 'апартамент'],
    ru: ['недвижимость', 'риелтор', 'аренда', 'купить квартиру', 'продать квартиру'],
  },
  'call-center': {
    en: ['call center', 'phone support', 'customer service', 'telemarketing', 'cold calling'],
    bg: ['кол център', 'телефонна поддръжка', 'обслужване клиенти', 'телемаркетинг'],
    ru: ['колл-центр', 'телефонная поддержка', 'обзвон', 'телемаркетинг'],
  },
  'financial-services': {
    en: ['financial advisor', 'investment', 'loans', 'credit', 'financial planning', 'insurance'],
    bg: ['финансов консултант', 'инвестиции', 'кредит', 'заем', 'застраховка'],
    ru: ['финансовый консультант', 'инвестиции', 'кредит', 'займ', 'страхование'],
  },

  // ===== PET SERVICES =====
  'cat-care': {
    en: ['cat care', 'cat sitting', 'cat sitter', 'cat boarding', 'feed cat', 'cat grooming'],
    bg: ['грижа за котка', 'гледане котка', 'котешка хигиена'],
    ru: ['передержка кошек', 'уход за кошкой', 'присмотр за котом', 'кошачий груминг'],
  },
  'dog-care': {
    en: ['dog care', 'dog walking', 'dog sitter', 'dog sitting', 'dog boarding', 'pet sitter'],
    bg: ['грижа за куче', 'разходка куче', 'гледане куче', 'кучешка хигиена'],
    ru: ['выгул собак', 'уход за собакой', 'присмотр за собакой', 'передержка собак'],
  },
  'pet-hotel': {
    en: ['pet hotel', 'pet boarding', 'dog hotel', 'cat hotel', 'pet daycare', 'kennel'],
    bg: ['хотел за домашни любимци', 'пансион за кучета', 'пансион за котки'],
    ru: ['гостиница для животных', 'зоогостиница', 'передержка животных'],
  },
  'pet-transportation': {
    en: ['pet transport', 'pet taxi', 'animal transport', 'vet transport', 'pet delivery'],
    bg: ['транспорт домашни любимци', 'такси за животни', 'превоз животни'],
    ru: ['перевозка животных', 'зоотакси', 'транспорт питомцев'],
  },
  'fish-care': {
    en: ['fish care', 'aquarium', 'fish tank', 'aquarium cleaning', 'aquarium maintenance'],
    bg: ['грижа за риби', 'аквариум', 'почистване аквариум'],
    ru: ['уход за рыбками', 'аквариум', 'чистка аквариума', 'обслуживание аквариума'],
  },

  // ===== BEAUTY & HEALTH =====
  'massage': {
    en: ['massage', 'masseuse', 'relaxation', 'therapeutic massage', 'sports massage', 'spa'],
    bg: ['масаж', 'масажист', 'релаксиращ масаж', 'спортен масаж', 'СПА'],
    ru: ['массаж', 'массажист', 'расслабляющий массаж', 'спортивный массаж', 'СПА'],
  },
  'nail-care': {
    en: ['manicure', 'pedicure', 'nails', 'nail art', 'gel nails', 'nail salon'],
    bg: ['маникюр', 'педикюр', 'нокти', 'гел лак', 'ноктопластика'],
    ru: ['маникюр', 'педикюр', 'ногти', 'гель лак', 'наращивание ногтей'],
  },
  'cosmetology': {
    en: ['cosmetology', 'facial', 'skin care', 'beauty treatment', 'aesthetics', 'dermatology'],
    bg: ['козметика', 'козметолог', 'грижа за кожата', 'почистване лице'],
    ru: ['косметология', 'косметолог', 'уход за кожей', 'чистка лица'],
  },
  'lash-care': {
    en: ['eyelash', 'lash extensions', 'lash lift', 'false lashes', 'lash perm'],
    bg: ['мигли', 'удължаване мигли', 'ламиниране мигли', 'изкуствени мигли'],
    ru: ['ресницы', 'наращивание ресниц', 'ламинирование ресниц'],
  },
  'brow-care': {
    en: ['eyebrow', 'brow shaping', 'microblading', 'brow lamination', 'brow tinting'],
    bg: ['вежди', 'оформяне вежди', 'микроблейдинг', 'ламиниране вежди'],
    ru: ['брови', 'оформление бровей', 'микроблейдинг', 'ламинирование бровей'],
  },
  'psychologist': {
    en: ['psychologist', 'psychology', 'therapist', 'therapy', 'counselor', 'counseling', 'mental health', 'anxiety', 'depression', 'stress', 'psychotherapy', 'counselling', 'life coach', 'emotional support', 'trauma', 'ptsd', 'relationship counseling', 'couples therapy', 'family therapy'],
    bg: ['психолог', 'психология', 'терапевт', 'терапия', 'консултация', 'психично здраве', 'тревожност', 'депресия', 'стрес', 'психотерапия', 'емоционална подкрепа', 'травма', 'семейна терапия', 'двойки терапия'],
    ru: ['психолог', 'психология', 'терапевт', 'терапия', 'консультация', 'психическое здоровье', 'тревожность', 'депрессия', 'стресс', 'психотерапия', 'эмоциональная поддержка', 'травма', 'семейная терапия', 'психологическая помощь'],
  },

  // ===== EVENT PLANNING =====
  'event-host': {
    en: ['event host', 'mc', 'master of ceremonies', 'host', 'presenter', 'emcee'],
    bg: ['водещ', 'церемониймайстор', 'презентатор', 'водещ събитие'],
    ru: ['ведущий', 'тамада', 'конферансье', 'ведущий мероприятий'],
  },
  'music-entertainment': {
    en: ['dj', 'musician', 'band', 'live music', 'singer', 'karaoke', 'entertainment'],
    bg: ['DJ', 'музикант', 'група', 'жива музика', 'певец', 'караоке'],
    ru: ['DJ', 'музыкант', 'группа', 'живая музыка', 'певец', 'караоке'],
  },
  'animators': {
    en: ['animator', 'clown', 'kids entertainment', 'party entertainer', 'face painting'],
    bg: ['аниматор', 'клоун', 'детски парти', 'рисуване на лице'],
    ru: ['аниматор', 'клоун', 'детский праздник', 'аквагрим'],
  },
  'catering': {
    en: ['catering', 'food service', 'event food', 'party food', 'buffet', 'chef'],
    bg: ['кетъринг', 'храна за събития', 'парти храна', 'шведска маса', 'готвач'],
    ru: ['кейтеринг', 'выездное питание', 'банкет', 'фуршет', 'повар'],
  },
  'baking-desserts': {
    en: ['cake', 'bakery', 'custom cake', 'wedding cake', 'cupcakes', 'desserts', 'pastry'],
    bg: ['торта', 'сладкарница', 'торта по поръчка', 'сватбена торта', 'десерти'],
    ru: ['торт', 'торт на заказ', 'свадебный торт', 'капкейки', 'десерты', 'выпечка'],
  },

  // ===== TRANSLATION SERVICES =====
  'written-translation': {
    en: ['translation', 'translate', 'document translation', 'text translation', 'translator'],
    bg: ['превод', 'писмен превод', 'превод документи', 'преводач'],
    ru: ['перевод', 'письменный перевод', 'перевод текста', 'переводчик'],
  },
  'translation-editing': {
    en: ['proofreading', 'editing', 'translation editing', 'review', 'correction'],
    bg: ['редакция', 'корекция', 'редактиране превод', 'проверка'],
    ru: ['редактирование', 'корректура', 'редакция перевода', 'вычитка'],
  },
  'document-translation': {
    en: ['certified translation', 'notarized', 'official translation', 'legal translation'],
    bg: ['легализиран превод', 'заверен превод', 'нотариален превод', 'официален превод'],
    ru: ['нотариальный перевод', 'заверенный перевод', 'официальный перевод'],
  },
  'oral-translation': {
    en: ['interpreter', 'interpreting', 'oral translation', 'simultaneous', 'consecutive'],
    bg: ['устен превод', 'преводач', 'симултанен превод', 'консекутивен'],
    ru: ['устный перевод', 'переводчик', 'синхронный перевод', 'последовательный'],
  },
  'technical-translation': {
    en: ['technical translation', 'medical translation', 'legal translation', 'specialized'],
    bg: ['технически превод', 'медицински превод', 'юридически превод', 'специализиран'],
    ru: ['технический перевод', 'медицинский перевод', 'юридический перевод'],
  },

  // ===== TRAINER SERVICES =====
  'yoga': {
    en: ['yoga', 'yoga instructor', 'yoga class', 'meditation', 'pilates', 'stretching'],
    bg: ['йога', 'йога инструктор', 'медитация', 'пилатес', 'разтягане'],
    ru: ['йога', 'инструктор йоги', 'медитация', 'пилатес', 'растяжка'],
  },
  'group-fitness': {
    en: ['fitness', 'gym', 'workout', 'aerobics', 'zumba', 'personal trainer', 'fitness trainer'],
    bg: ['фитнес', 'тренировка', 'аеробика', 'зумба', 'персонален треньор'],
    ru: ['фитнес', 'тренировка', 'аэробика', 'зумба', 'персональный тренер'],
  },
  'team-sports': {
    en: ['football', 'basketball', 'volleyball', 'tennis', 'coach', 'sports coach'],
    bg: ['футбол', 'баскетбол', 'волейбол', 'тенис', 'треньор'],
    ru: ['футбол', 'баскетбол', 'волейбол', 'теннис', 'тренер'],
  },
  'water-sports': {
    en: ['swimming', 'swim coach', 'diving', 'water polo', 'swimming lessons'],
    bg: ['плуване', 'треньор плуване', 'гмуркане', 'водна топка'],
    ru: ['плавание', 'тренер по плаванию', 'дайвинг', 'уроки плавания'],
  },
  'martial-arts': {
    en: ['martial arts', 'karate', 'boxing', 'judo', 'taekwondo', 'self defense', 'kickboxing'],
    bg: ['бойни изкуства', 'карате', 'бокс', 'джудо', 'таекуондо', 'самоотбрана'],
    ru: ['единоборства', 'карате', 'бокс', 'дзюдо', 'тхэквондо', 'самооборона'],
  },

  // ===== TUTORING =====
  'subject-tutors': {
    en: ['tutor', 'tutoring', 'math tutor', 'physics', 'chemistry', 'homework help', 'private lessons'],
    bg: ['репетитор', 'частни уроци', 'математика', 'физика', 'химия', 'помощ домашни'],
    ru: ['репетитор', 'частные уроки', 'математика', 'физика', 'химия', 'помощь с уроками'],
  },
  'language-tutors': {
    en: ['language tutor', 'english tutor', 'language lessons', 'spanish', 'french', 'german'],
    bg: ['езиков репетитор', 'английски', 'уроци по език', 'испански', 'немски'],
    ru: ['репетитор языка', 'английский', 'уроки языка', 'испанский', 'немецкий'],
  },
  'academic-writing': {
    en: ['essay', 'thesis', 'dissertation', 'academic writing', 'research paper', 'coursework'],
    bg: ['есе', 'дипломна работа', 'дисертация', 'курсова работа', 'научна работа'],
    ru: ['эссе', 'диплом', 'диссертация', 'курсовая', 'научная работа', 'реферат'],
  },
  'music-teachers': {
    en: ['music teacher', 'piano lessons', 'guitar lessons', 'singing lessons', 'music tutor'],
    bg: ['учител музика', 'уроци пиано', 'уроци китара', 'уроци пеене'],
    ru: ['учитель музыки', 'уроки фортепиано', 'уроки гитары', 'уроки вокала'],
  },
  'driving-instructors': {
    en: ['driving instructor', 'driving lessons', 'driving school', 'learn to drive', 'license'],
    bg: ['шофьорски курс', 'уроци шофиране', 'автошкола', 'шофьорска книжка'],
    ru: ['инструктор вождения', 'уроки вождения', 'автошкола', 'водительские права'],
  },

  // ===== VOLUNTEER HELP =====
  'elderly-assistance': {
    en: ['elderly help', 'senior assistance', 'help elderly', 'volunteer care', 'companion'],
    bg: ['помощ възрастни', 'грижа възрастни', 'доброволческа помощ', 'придружител'],
    ru: ['помощь пожилым', 'волонтерская помощь', 'уход за пожилыми'],
  },
  'volunteer-transportation': {
    en: ['volunteer driver', 'free ride', 'transport help', 'medical transport'],
    bg: ['доброволец шофьор', 'безплатен превоз', 'помощ транспорт'],
    ru: ['волонтер водитель', 'бесплатный проезд', 'помощь с транспортом'],
  },
  'fuel-delivery': {
    en: ['fuel delivery', 'gas delivery', 'emergency fuel', 'out of gas'],
    bg: ['доставка гориво', 'бензин', 'спешно гориво'],
    ru: ['доставка топлива', 'бензин', 'экстренная заправка'],
  },
  'housing-assistance': {
    en: ['housing help', 'shelter', 'temporary housing', 'accommodation help'],
    bg: ['помощ жилище', 'подслон', 'временно настаняване'],
    ru: ['помощь с жильем', 'приют', 'временное жилье'],
  },
  'volunteer-food-delivery': {
    en: ['food bank', 'meal delivery', 'food assistance', 'free food', 'charity food'],
    bg: ['хранителна банка', 'доставка храна', 'безплатна храна', 'благотворителност'],
    ru: ['продовольственная помощь', 'доставка еды', 'бесплатная еда', 'благотворительность'],
  },
};

/**
 * Search keywords for a query in a specific language
 * Returns matching subcategory slugs with relevance score
 *
 * Improved algorithm:
 * - Splits query into words for better matching
 * - "need an electric" matches "electrician" via prefix matching
 * - Each word is checked independently against keywords
 */
export const searchKeywords = (
  query: string,
  language: 'en' | 'bg' | 'ru'
): { slug: string; score: number }[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  // Split query into words, filter out short words (< 3 chars) and common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'for', 'in', 'on', 'at', 'is', 'it', 'my', 'me', 'i', 'need', 'want', 'have', 'get', 'can', 'do', 'be', 'с', 'в', 'на', 'и', 'для', 'мне', 'нужен', 'нужна', 'нужно', 'за', 'от', 'към', 'ми', 'трябва']);
  const queryWords = lowerQuery
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));

  // Also try the full query for phrase matching
  const allQueries = [...queryWords];
  if (queryWords.length > 1) {
    allQueries.push(lowerQuery); // Add full query for phrase matching
  }

  const results: Map<string, number> = new Map();

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const langKeywords = keywords[language] || [];
    let bestScore = 0;

    // Check each query word/phrase against all keywords
    for (const queryPart of allQueries) {
      for (const keyword of langKeywords) {
        const lowerKeyword = keyword.toLowerCase();
        let score = 0;

        // Exact match - highest score
        if (lowerKeyword === queryPart) {
          score = 100;
        }
        // Keyword starts with query word (e.g., "electrician".startsWith("electric"))
        else if (lowerKeyword.startsWith(queryPart) && queryPart.length >= 4) {
          score = 90;
        }
        // Query word starts with keyword (e.g., "plumbing".startsWith("plumb"))
        else if (queryPart.startsWith(lowerKeyword) && lowerKeyword.length >= 4) {
          score = 85;
        }
        // Keyword contains query word
        else if (lowerKeyword.includes(queryPart) && queryPart.length >= 4) {
          score = 70;
        }
        // Query word contains keyword (for short keywords)
        else if (queryPart.includes(lowerKeyword) && lowerKeyword.length >= 4) {
          score = 65;
        }

        if (score > bestScore) {
          bestScore = score;
        }

        // Found exact match, no need to check more keywords
        if (score === 100) break;
      }

      if (bestScore === 100) break;
    }

    if (bestScore > 0) {
      const existing = results.get(slug) || 0;
      results.set(slug, Math.max(existing, bestScore));
    }
  }

  // Convert to array and sort by score descending
  return Array.from(results.entries())
    .map(([slug, score]) => ({ slug, score }))
    .sort((a, b) => b.score - a.score);
};
