# Internationalization (i18n)

TaskBridge supports three languages with intelligent detection and SEO-friendly URL-based routing.

## Supported Locales

| Locale | Language | Market |
|--------|----------|--------|
| `en` | English | Default |
| `bg` | Bulgarian | Primary |
| `ru` | Russian | Secondary |

## URL Structure

All routes are prefixed with the locale for SEO optimization:

```
# Root redirects to locale-specific landing
/                           → /{detected-locale}/

# Localized routes
/en/                        # English landing page
/bg/                        # Bulgarian landing page
/ru/                        # Russian landing page

/en/browse-tasks            # Browse tasks in English
/bg/browse-tasks            # Browse tasks in Bulgarian
/ru/browse-tasks            # Browse tasks in Russian

/en/professionals/123       # Professional detail in English
/bg/professionals/123       # Professional detail in Bulgarian
/ru/professionals/123       # Professional detail in Russian
```

## Locale Detection Strategy

The middleware follows a priority-based detection system:

1. **User Preference** (highest priority)
   - Cookie: `preferred_locale` from manual language selection
   - Persisted across sessions

2. **Browser Language**
   - Accept-Language header parsing
   - Matches to supported locales (en, bg, ru)

3. **Default Fallback**
   - English (en) if no preference found

## Translation Architecture

### File Structure

Translation files are organized by locale in `/src/lib/intl/`:

```
/src/lib/intl/
├── config.ts          # i18n configuration
├── types.ts           # TypeScript definitions
├── en/                # English translations
│   ├── index.ts       # Barrel export
│   ├── common.ts      # Common UI terms
│   ├── navigation.ts  # Nav menu, header, footer
│   ├── tasks.ts       # Task management
│   ├── professionals.ts
│   ├── categories.ts  # 26 main + 135 subcategories
│   └── ...
├── bg/                # Bulgarian (same structure)
└── ru/                # Russian (same structure)
```

### Translation Key Namespaces

Organized by feature domain:

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `nav.*` | Navigation items | `nav.home`, `nav.browseTasks` |
| `landing.*` | Landing page | `landing.hero.title` |
| `professionals.*` | Professionals pages | `professionals.viewProfile` |
| `tasks.*` | Task-related | `tasks.title`, `tasks.filters.category` |
| `categories.main.*` | Main categories | `categories.main.handyman.title` |
| `categories.sub.*` | Subcategories | `categories.sub.plumber` |
| `profile.*` | Profile pages | `profile.personalInfo` |
| `auth.*` | Authentication | `auth.login`, `auth.continueWith` |

## Implementation

### Client Components

```typescript
'use client'
import { useTranslations } from 'next-intl'

function ClientComponent() {
  const t = useTranslations()

  return (
    <div>
      <h1>{t('landing.hero.title')}</h1>
      <p>{t('landing.hero.subtitle')}</p>
    </div>
  )
}
```

### Using Category Translations

```typescript
import { useTranslations } from 'next-intl'
import { getCategoryLabelBySlug } from '@/features/categories'

function CategoryDisplay({ slug }: { slug: string }) {
  const t = useTranslations()
  const label = getCategoryLabelBySlug(slug, t)

  return <span>{label}</span>  // Returns translated category name
}
```

### LocaleLink Component

For internal navigation with automatic locale prefixing:

```typescript
import { LocaleLink } from '@/components/locale-link'

function Navigation() {
  return (
    <nav>
      {/* Automatically prefixes with current locale */}
      <LocaleLink href="/browse-tasks">Browse Tasks</LocaleLink>
      <LocaleLink href="/professionals">Professionals</LocaleLink>
    </nav>
  )
}
```

## Language Switcher

Component: `/src/components/common/language-switcher.tsx`

- Sets cookie: `preferred_locale`
- Updates localStorage: `preferred_locale`
- Redirects to: `/{new-locale}{current-path}`

## Middleware Configuration

Routes configured in `/src/middleware.ts`:

```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Performance Optimizations

**Early Returns** (90% of requests):
```typescript
// Skip if already has valid locale prefix
if (pathname.startsWith(`/${locale}/`)) {
  return NextResponse.next()
}
```

**Metrics**:
- 90% of requests bypass middleware
- <10ms additional latency for new users
- Zero overhead for locale-prefixed URLs

## SEO Benefits

URL-based locales provide:
- **Clean URLs**: `/bg/professionals` instead of `?lang=bg`
- **Search Engine Indexing**: Each locale treated as separate page
- **Social Sharing**: Language-specific link previews
- **Browser History**: Language preference preserved in URLs
- **Direct Access**: Users can bookmark locale-specific pages

## Adding New Translations

1. Add to all three language files (`en/`, `bg/`, `ru/`):

```typescript
// en/common.ts
'myFeature.newKey': 'English text',

// bg/common.ts
'myFeature.newKey': 'Български текст',

// ru/common.ts
'myFeature.newKey': 'Русский текст',
```

2. Use in components:

```typescript
const t = useTranslations()
return <span>{t('myFeature.newKey')}</span>
```

3. Validate consistency:

```bash
npx tsx src/lib/intl/validate-translations.ts
```
