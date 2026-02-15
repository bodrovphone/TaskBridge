/** Public pages that should load without authentication */
export const PUBLIC_PAGES = [
  { path: '/en/', label: 'Homepage (EN)' },
  { path: '/en/browse-tasks', label: 'Browse Tasks' },
  { path: '/en/professionals', label: 'Professionals' },
  { path: '/en/create-task', label: 'Create Task' },
  { path: '/en/categories', label: 'Categories' },
  { path: '/en/about', label: 'About' },
  { path: '/en/terms', label: 'Terms' },
  { path: '/en/privacy', label: 'Privacy' },
  { path: '/en/faq', label: 'FAQ' },
  { path: '/en/register', label: 'Register' },
  { path: '/en/for-customers', label: 'For Customers' },
  { path: '/en/for-professionals', label: 'For Professionals' },
  { path: '/en/testimonials', label: 'Testimonials' },
  { path: '/en/blog', label: 'Blog' },
] as const

export const LOCALES = ['en', 'bg', 'ru'] as const

/** Selectors for common UI elements */
export const SELECTORS = {
  header: 'header',
  footer: 'footer',
  logo: 'header a[href]',
  navLinks: 'header nav a',
  languageSwitcher: '[data-testid="language-switcher"]',
  mobileMenuButton: 'header button[aria-label]',
} as const
