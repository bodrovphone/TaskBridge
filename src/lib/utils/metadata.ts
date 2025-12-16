import { Metadata } from 'next'
import { SupportedLocale } from '@/lib/constants/locales'
import { generateAlternateLanguages, generateCanonicalUrl } from './seo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

/**
 * Localized metadata for each page
 * Keys: page identifier, Values: localized title & description
 */
const pageMetadata: Record<string, Record<SupportedLocale, { title: string; description: string }>> = {
  home: {
    en: {
      title: 'Find Verified Professionals',
      description: 'Connect with verified local professionals for any task - from home repairs to deliveries and personal assistance. Secure platform with verified specialists in Bulgaria.',
    },
    bg: {
      title: 'Намерете проверени професионалисти',
      description: 'Свържете се с проверени местни професионалисти за всякакви задачи - от домашни ремонти до доставки и лична помощ. Сигурна платформа с проверени специалисти.',
    },
    ru: {
      title: 'Найдите проверенных специалистов',
      description: 'Свяжитесь с проверенными местными специалистами для любых задач - от ремонта до доставки и личной помощи. Безопасная платформа с проверенными специалистами в Болгарии.',
    },
    ua: {
      title: 'Знайдіть перевірених фахівців',
      description: 'Зв\'яжіться з перевіреними місцевими фахівцями для будь-яких завдань - від ремонту до доставки та особистої допомоги. Безпечна платформа з перевіреними спеціалістами в Болгарії.',
    },
  },
  'browse-tasks': {
    en: {
      title: 'Browse Available Tasks',
      description: 'Find tasks that match your skills. Browse open tasks from customers looking for professionals in Bulgaria. Apply and start earning.',
    },
    bg: {
      title: 'Разгледайте наличните задачи',
      description: 'Намерете задачи, които отговарят на вашите умения. Разгледайте отворени задачи от клиенти, търсещи професионалисти в България.',
    },
    ru: {
      title: 'Просмотр доступных задач',
      description: 'Найдите задачи, соответствующие вашим навыкам. Просматривайте открытые задачи от клиентов, ищущих специалистов в Болгарии.',
    },
    ua: {
      title: 'Перегляд доступних завдань',
      description: 'Знайдіть завдання, що відповідають вашим навичкам. Переглядайте відкриті завдання від клієнтів, які шукають фахівців у Болгарії.',
    },
  },
  professionals: {
    en: {
      title: 'Find Professionals',
      description: 'Browse verified professionals in Bulgaria. Find skilled specialists for home repairs, cleaning, moving, IT services, and more.',
    },
    bg: {
      title: 'Намерете професионалисти',
      description: 'Разгледайте проверени професионалисти в България. Намерете квалифицирани специалисти за ремонти, почистване, преместване, ИТ услуги и още.',
    },
    ru: {
      title: 'Найти специалистов',
      description: 'Просмотрите проверенных специалистов в Болгарии. Найдите квалифицированных мастеров для ремонта, уборки, переезда, IT-услуг и многого другого.',
    },
    ua: {
      title: 'Знайти фахівців',
      description: 'Перегляньте перевірених фахівців у Болгарії. Знайдіть кваліфікованих спеціалістів для ремонту, прибирання, переїзду, IT-послуг та іншого.',
    },
  },
  'create-task': {
    en: {
      title: 'Post a Task',
      description: 'Post your task for free and receive quotes from verified professionals. Get the help you need in Bulgaria.',
    },
    bg: {
      title: 'Публикувайте задача',
      description: 'Публикувайте задачата си безплатно и получете оферти от проверени професионалисти. Получете помощта, от която се нуждаете.',
    },
    ru: {
      title: 'Разместить задачу',
      description: 'Разместите задачу бесплатно и получите предложения от проверенных специалистов. Получите необходимую помощь в Болгарии.',
    },
    ua: {
      title: 'Розмістити завдання',
      description: 'Розмістіть завдання безкоштовно та отримайте пропозиції від перевірених фахівців. Отримайте необхідну допомогу в Болгарії.',
    },
  },
  categories: {
    en: {
      title: 'Service Categories',
      description: 'Browse all service categories available on Trudify. Find professionals for home repairs, cleaning, IT, beauty, and more.',
    },
    bg: {
      title: 'Категории услуги',
      description: 'Разгледайте всички категории услуги в Trudify. Намерете професионалисти за ремонти, почистване, ИТ, красота и още.',
    },
    ru: {
      title: 'Категории услуг',
      description: 'Просмотрите все категории услуг на Trudify. Найдите специалистов для ремонта, уборки, IT, красоты и многого другого.',
    },
    ua: {
      title: 'Категорії послуг',
      description: 'Перегляньте всі категорії послуг на Trudify. Знайдіть фахівців для ремонту, прибирання, IT, краси та іншого.',
    },
  },
  about: {
    en: {
      title: 'About Us',
      description: 'Learn about Trudify - the platform connecting customers with verified professionals in Bulgaria. Our mission, story, and values.',
    },
    bg: {
      title: 'За нас',
      description: 'Научете повече за Trudify - платформата, свързваща клиенти с проверени професионалисти в България. Нашата мисия, история и ценности.',
    },
    ru: {
      title: 'О нас',
      description: 'Узнайте о Trudify - платформе, соединяющей клиентов с проверенными специалистами в Болгарии. Наша миссия, история и ценности.',
    },
    ua: {
      title: 'Про нас',
      description: 'Дізнайтеся про Trudify - платформу, що з\'єднує клієнтів з перевіреними фахівцями в Болгарії. Наша місія, історія та цінності.',
    },
  },
  'how-it-works': {
    en: {
      title: 'How It Works',
      description: 'Learn how Trudify works for customers and professionals. Post tasks, receive quotes, and get work done - simple and secure.',
    },
    bg: {
      title: 'Как работи',
      description: 'Научете как работи Trudify за клиенти и професионалисти. Публикувайте задачи, получете оферти и свършете работата - лесно и сигурно.',
    },
    ru: {
      title: 'Как это работает',
      description: 'Узнайте, как работает Trudify для клиентов и специалистов. Размещайте задачи, получайте предложения и выполняйте работу - просто и безопасно.',
    },
    ua: {
      title: 'Як це працює',
      description: 'Дізнайтеся, як працює Trudify для клієнтів та фахівців. Розміщуйте завдання, отримуйте пропозиції та виконуйте роботу - просто і безпечно.',
    },
  },
  faq: {
    en: {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about Trudify. Learn about posting tasks, hiring professionals, payments, and more.',
    },
    bg: {
      title: 'Често задавани въпроси',
      description: 'Намерете отговори на често задавани въпроси за Trudify. Научете за публикуване на задачи, наемане на професионалисти, плащания и още.',
    },
    ru: {
      title: 'Часто задаваемые вопросы',
      description: 'Найдите ответы на часто задаваемые вопросы о Trudify. Узнайте о размещении задач, найме специалистов, оплате и многом другом.',
    },
    ua: {
      title: 'Часті запитання',
      description: 'Знайдіть відповіді на поширені питання про Trudify. Дізнайтеся про розміщення завдань, найм фахівців, оплату та інше.',
    },
  },
  'for-professionals': {
    en: {
      title: 'For Professionals',
      description: 'Join Trudify as a professional. Find local customers, grow your business, and build your reputation. Start earning today.',
    },
    bg: {
      title: 'За професионалисти',
      description: 'Присъединете се към Trudify като професионалист. Намерете местни клиенти, развийте бизнеса си и изградете репутация.',
    },
    ru: {
      title: 'Для специалистов',
      description: 'Присоединяйтесь к Trudify как специалист. Находите местных клиентов, развивайте бизнес и создавайте репутацию.',
    },
    ua: {
      title: 'Для фахівців',
      description: 'Приєднуйтесь до Trudify як фахівець. Знаходьте місцевих клієнтів, розвивайте бізнес та створюйте репутацію.',
    },
  },
  testimonials: {
    en: {
      title: 'Testimonials',
      description: 'Read success stories from Trudify users. See how customers and professionals are achieving their goals with our platform.',
    },
    bg: {
      title: 'Отзиви',
      description: 'Прочетете истории на успеха от потребители на Trudify. Вижте как клиенти и професионалисти постигат целите си с нашата платформа.',
    },
    ru: {
      title: 'Отзывы',
      description: 'Читайте истории успеха пользователей Trudify. Узнайте, как клиенты и специалисты достигают своих целей с нашей платформой.',
    },
    ua: {
      title: 'Відгуки',
      description: 'Читайте історії успіху користувачів Trudify. Дізнайтеся, як клієнти та фахівці досягають своїх цілей з нашою платформою.',
    },
  },
  privacy: {
    en: {
      title: 'Privacy Policy',
      description: 'Read Trudify privacy policy. Learn how we collect, use, and protect your personal data.',
    },
    bg: {
      title: 'Политика за поверителност',
      description: 'Прочетете политиката за поверителност на Trudify. Научете как събираме, използваме и защитаваме вашите лични данни.',
    },
    ru: {
      title: 'Политика конфиденциальности',
      description: 'Ознакомьтесь с политикой конфиденциальности Trudify. Узнайте, как мы собираем, используем и защищаем ваши личные данные.',
    },
    ua: {
      title: 'Політика конфіденційності',
      description: 'Ознайомтесь з політикою конфіденційності Trudify. Дізнайтеся, як ми збираємо, використовуємо та захищаємо ваші персональні дані.',
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      description: 'Read Trudify terms of service. Understand the rules and guidelines for using our platform.',
    },
    bg: {
      title: 'Условия за ползване',
      description: 'Прочетете условията за ползване на Trudify. Разберете правилата и насоките за използване на нашата платформа.',
    },
    ru: {
      title: 'Условия использования',
      description: 'Ознакомьтесь с условиями использования Trudify. Узнайте правила и рекомендации по использованию нашей платформы.',
    },
    ua: {
      title: 'Умови використання',
      description: 'Ознайомтесь з умовами використання Trudify. Дізнайтеся правила та рекомендації щодо використання нашої платформи.',
    },
  },
  giveaway: {
    en: {
      title: 'Earn Money & Win Prizes - Find Work Fast in Bulgaria',
      description: 'Find work fast and earn money on Trudify. Win gift cards every 2 months. Professionals: get paid for your skills. Customers: get help quick. Join the growing community in Sofia, Plovdiv, Varna, Burgas.',
    },
    bg: {
      title: 'Печелете пари и награди - Намерете работа бързо в България',
      description: 'Намерете работа бързо и печелете пари в Trudify. Спечелете подаръчни карти на всеки 2 месеца. Професионалисти: получете заплащане за уменията си. Клиенти: получете помощ бързо. София, Пловдив, Варна, Бургас.',
    },
    ru: {
      title: 'Зарабатывайте и выигрывайте - Найдите работу быстро в Болгарии',
      description: 'Находите работу быстро и зарабатывайте на Trudify. Выигрывайте подарочные карты каждые 2 месяца. Специалисты: получайте оплату за навыки. Клиенты: получайте помощь быстро. София, Пловдив, Варна, Бургас.',
    },
    ua: {
      title: 'Заробляйте та вигравайте - Знайдіть роботу швидко в Болгарії',
      description: 'Знаходьте роботу швидко та заробляйте на Trudify. Вигравайте подарункові картки кожні 2 місяці. Фахівці: отримуйте оплату за навички. Клієнти: отримуйте допомогу швидко.',
    },
  },
}

/**
 * Generate localized metadata for a page
 *
 * @param pageKey - The page identifier (e.g., 'home', 'browse-tasks')
 * @param locale - Current locale (en, bg, ru, ua)
 * @param pathname - The page path without locale (e.g., '', '/browse-tasks')
 * @returns Metadata object for Next.js
 */
export function generatePageMetadata(
  pageKey: string,
  locale: SupportedLocale,
  pathname: string
): Metadata {
  const meta = pageMetadata[pageKey]?.[locale] || pageMetadata[pageKey]?.['en']

  if (!meta) {
    return {}
  }

  // Map locale to OpenGraph locale format
  const ogLocaleMap: Record<SupportedLocale, string> = {
    bg: 'bg_BG',
    en: 'en_US',
    ru: 'ru_RU',
    ua: 'uk_UA',
  }

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: generateCanonicalUrl(locale, pathname),
      languages: generateAlternateLanguages(pathname),
    },
    openGraph: {
      title: `${meta.title} | Trudify`,
      description: meta.description,
      url: `${baseUrl}/${locale}${pathname}`,
      siteName: 'Trudify',
      locale: ogLocaleMap[locale] || 'en_US',
    },
  }
}

/**
 * Get metadata for a specific page (for use in generateMetadata)
 */
export function getLocalizedMetadata(pageKey: string) {
  return pageMetadata[pageKey]
}
