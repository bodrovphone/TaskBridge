# hrefLang SEO Implementation

## What We Added

1. **SEO Utility Functions** (`/src/lib/utils/seo.ts`)
   - `generateAlternateLanguages()` - Creates hrefLang alternates for all locales
   - `generateCanonicalUrl()` - Creates canonical URL for current locale

2. **Global hrefLang** (`/src/app/[lang]/layout.tsx`)
   - Added to layout metadata
   - Automatically applied to all pages
   - Uses root path as default

## How It Works

### Generated HTML Output

For a page like `/en/browse-tasks`, Next.js will generate:

```html
<head>
  <link rel="canonical" href="https://trudify.com/en/browse-tasks" />
  <link rel="alternate" hrefLang="en" href="https://trudify.com/en/browse-tasks" />
  <link rel="alternate" hrefLang="bg" href="https://trudify.com/bg/browse-tasks" />
  <link rel="alternate" hrefLang="ru" href="https://trudify.com/ru/browse-tasks" />
  <link rel="alternate" hrefLang="x-default" href="https://trudify.com/en/browse-tasks" />
</head>
```

## Override for Specific Pages

If you want to customize metadata for specific pages, add `generateMetadata` to the page:

### Example: Browse Tasks Page

```typescript
// /src/app/[lang]/browse-tasks/page.tsx
import { Metadata } from 'next'
import { generateAlternateLanguages, generateCanonicalUrl } from '@/lib/utils/seo'
import { validateLocale } from '@/lib/utils/locale-detection'
import type { SupportedLocale } from '@/lib/constants/locales'

interface PageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = validateLocale(lang) as SupportedLocale
  const pathname = '/browse-tasks'

  return {
    title: 'Browse Tasks - Trudify',
    description: 'Find work opportunities on Trudify',
    alternates: {
      canonical: generateCanonicalUrl(locale, pathname),
      languages: generateAlternateLanguages(pathname)
    }
  }
}

export default async function BrowseTasksPage({ params }: PageProps) {
  // Your page component
}
```

## Environment Variable

Uses your existing `NEXT_PUBLIC_BASE_URL`:

```bash
NEXT_PUBLIC_BASE_URL=https://trudify.com
```

## SEO Benefits

1. **Google understands language versions** - No duplicate content penalties
2. **Correct language shown in search results** - Users see their language
3. **Proper indexing** - All three versions indexed separately
4. **hreflang="x-default"** - English shown for unknown languages

## Testing

1. **View page source** - Check for `<link rel="alternate" hrefLang="...">` tags
2. **Google Search Console** - Verify no hrefLang errors
3. **SEO tools** - Use Screaming Frog or Sitebulb to audit

## What Happens Next

- **Google crawls** `/en/browse-tasks` → Discovers `/bg/` and `/ru/` versions
- **Russian user searches** → Google shows `/ru/browse-tasks` in results
- **Bulgarian user searches** → Google shows `/bg/browse-tasks` in results
- **Unknown language** → Google shows `/en/browse-tasks` (x-default)
