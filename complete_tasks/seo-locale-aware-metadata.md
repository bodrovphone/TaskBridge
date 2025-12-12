# SEO: Locale-Aware Metadata for Link Previews

## Task Description

Add `generateMetadata` functions to all pages to provide locale-aware Open Graph (OG) meta tags. This ensures link previews in Telegram, WhatsApp, Slack, and social media show content in the correct language based on the URL locale (`/en/`, `/bg/`, `/ru/`).

## Problem

Currently, the root `layout.tsx` has static metadata in one language, which means:
- Link previews always show the same language regardless of URL locale
- Poor SEO for non-primary language pages
- Inconsistent user experience when sharing links

## Requirements

### Pages Needing Locale-Aware Metadata

**High Priority (frequently shared):**
- [ ] `/[lang]/tasks/[id]/page.tsx` - Task detail pages (dynamic title from task)
- [ ] `/[lang]/tasks/work/page.tsx` - My Work page
- [ ] `/[lang]/browse-tasks/page.tsx` - Browse tasks
- [ ] `/[lang]/professionals/[id]/page.tsx` - Professional profiles (dynamic)
- [ ] `/[lang]/professionals/page.tsx` - Professionals directory
- [ ] `/[lang]/page.tsx` - Homepage
- [ ] `/[lang]/create-task/page.tsx` - Create task

**Medium Priority:**
- [ ] `/[lang]/profile/page.tsx` - User profile
- [ ] `/[lang]/tasks/posted/page.tsx` - Posted tasks
- [ ] `/[lang]/tasks/applications/page.tsx` - My applications

**Low Priority:**
- [ ] `/[lang]/privacy/page.tsx` - Privacy policy
- [ ] `/[lang]/terms/page.tsx` - Terms of service
- [ ] `/[lang]/forgot-password/page.tsx`
- [ ] `/[lang]/reset-password/page.tsx`

### Implementation Pattern

```typescript
import { Metadata } from 'next'

// Translation maps (or import from i18n)
const metadata = {
  en: {
    title: 'My Work - Trudify',
    description: 'Manage your accepted tasks and work progress on Trudify',
  },
  bg: {
    title: 'Моята работа - Trudify',
    description: 'Управлявайте приетите задачи и напредъка си в Trudify',
  },
  ru: {
    title: 'Моя работа - Trudify',
    description: 'Управляйте принятыми задачами и прогрессом в Trudify',
  },
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const locale = (lang as 'en' | 'bg' | 'ru') || 'bg'
  const m = metadata[locale] || metadata.bg

  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: m.title,
      description: m.description,
      locale: locale,
      type: 'website',
      siteName: 'Trudify',
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
    },
  }
}
```

### For Dynamic Pages (tasks/[id], professionals/[id])

```typescript
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}): Promise<Metadata> {
  const { lang, id } = await params

  // Fetch the resource
  const task = await getTask(id)

  if (!task) {
    return { title: 'Not Found - Trudify' }
  }

  // Use task title + localized suffix
  const suffixes = {
    en: 'Task on Trudify',
    bg: 'Задача в Trudify',
    ru: 'Задача в Trudify',
  }

  return {
    title: `${task.title} - ${suffixes[lang] || suffixes.bg}`,
    description: task.description?.slice(0, 160) || '...',
    openGraph: {
      title: task.title,
      description: task.description?.slice(0, 160),
      images: task.images?.[0] ? [{ url: task.images[0] }] : [],
    },
  }
}
```

## Acceptance Criteria

- [ ] All high-priority pages have `generateMetadata` functions
- [ ] Metadata is correctly localized based on URL `[lang]` parameter
- [ ] Link previews show correct language when shared on Telegram/WhatsApp
- [ ] Dynamic pages (task detail, professional profile) show resource-specific titles
- [ ] OpenGraph images are included where available
- [ ] Twitter card metadata is included

## Technical Notes

- Next.js merges metadata from layouts and pages (page overrides layout)
- `generateMetadata` runs on the server during SSR
- Telegram caches previews - use Telegram's @webpagebot to refresh cache during testing
- Consider creating a shared utility for common metadata patterns

## Testing

1. Deploy changes to Vercel preview
2. Share URLs in Telegram to verify previews
3. Use https://www.opengraph.xyz/ to validate OG tags
4. Test each locale variant (`/en/`, `/bg/`, `/ru/`)

## Priority

Medium - Affects sharing experience and SEO

## Related Files

- `src/app/layout.tsx` - Root static metadata (fallback)
- `src/app/[lang]/layout.tsx` - Locale layout (alternates only)
- `src/lib/utils/seo.ts` - SEO utilities
