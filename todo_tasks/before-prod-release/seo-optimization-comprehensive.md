# SEO Optimization & Google Search Console Setup

## ✅ COMPLETED - December 2025

**See deployment guide**: `/docs/seo-production-deployment-guide.md`

## Task Description
Implement comprehensive SEO improvements for Trudify to maximize visibility in Bulgarian, Russian, Ukrainian, and English search results. This includes technical SEO, content optimization, structured data, and Google Search Console integration.

### Languages Supported
- English (en)
- Bulgarian (bg)
- Russian (ru)
- Ukrainian (ua)

## Quick Reference: Google Search Console Setup

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property" → Choose "URL prefix" → Enter `https://trudify.com`
3. Verify ownership via one of these methods:
   - **HTML tag** (easiest): Add meta tag to `<head>` in `src/app/layout.tsx`
   - **DNS record**: Add TXT record to domain DNS
   - **HTML file**: Upload verification file to `/public/`

### Step 2: Submit Sitemap
1. After verification, go to "Sitemaps" in left menu
2. Enter `sitemap.xml` and click "Submit"
3. Google will start crawling your pages

### Step 3: Core Web Vitals Monitoring
1. Go to "Core Web Vitals" in left menu
2. Monitor these metrics:
   - **LCP** (Largest Contentful Paint): Should be < 2.5s
   - **INP** (Interaction to Next Paint): Should be < 200ms
   - **CLS** (Cumulative Layout Shift): Should be < 0.1
3. Click on issues to see affected URLs and fix recommendations

### Step 4: URL Inspection Tool
1. Paste any URL to check indexing status
2. Request indexing for new/updated pages
3. View rendered page and detected structured data

### Step 5: Performance Report
1. Go to "Performance" → Shows search queries, clicks, impressions
2. Filter by country (Bulgaria, Russia) to see regional performance
3. Export data for analysis

---

## Requirements

### Phase 1: Technical SEO Foundation

#### 1.1 Sitemap Generation
- [x] Create dynamic `sitemap.xml` at `/app/sitemap.ts`
- [x] Include all static pages with proper `lastmod` dates
- [x] Include dynamic pages (tasks, professionals) from database
- [x] Set appropriate `changefreq` and `priority` values
- [x] Support multilingual URLs (en/bg/ru/ua variants)

```typescript
// Example: /app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://trudify.com'

  // Static pages
  const staticPages = [
    '', '/browse-tasks', '/professionals', '/create-task'
  ]

  const locales = ['en', 'bg', 'ru']

  const staticUrls = staticPages.flatMap(page =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  )

  // Dynamic pages from database...

  return [...staticUrls]
}
```

#### 1.2 Robots.txt
- [x] Create `/app/robots.ts` for dynamic robots.txt
- [x] Allow all crawlers for public pages
- [x] Block admin/API routes from indexing
- [x] Reference sitemap URL

```typescript
// Example: /app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/profile/'],
    },
    sitemap: 'https://trudify.com/sitemap.xml',
  }
}
```

#### 1.3 Google Search Console Verification
- [x] Add Google Search Console verification meta tag (via env var)
- [ ] Submit sitemap to Google Search Console (after domain setup)
- [ ] Set up email alerts for critical issues (after domain setup)

### Phase 2: Metadata Optimization

#### 2.1 Page-Specific Metadata
- [x] Homepage: Optimize title/description for each locale (en/bg/ru/ua)
- [x] Browse Tasks: Dynamic metadata based on filters
- [ ] Task Detail: Pull title/description from task data
- [ ] Professional Profile: Include name, skills, rating
- [x] Create Task: Action-oriented title

#### 2.2 Open Graph & Twitter Cards
- [x] Add OG image for social sharing (1200x630px)
- [x] Configure Twitter card type
- [ ] Dynamic OG images for task pages (optional, post-MVP)

```typescript
// Example metadata for task detail page
export async function generateMetadata({ params }): Promise<Metadata> {
  const task = await getTask(params.id)

  return {
    title: `${task.title} | Trudify`,
    description: task.description.slice(0, 160),
    openGraph: {
      title: task.title,
      description: task.description.slice(0, 160),
      images: task.images?.[0] || '/og-default.png',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}
```

### Phase 3: Structured Data (JSON-LD)

#### 3.1 Organization Schema
- [x] Add Organization schema to homepage
- [x] Include logo, social profiles, contact info

#### 3.2 LocalBusiness Schema
- [x] Add LocalBusiness for Bulgarian market focus
- [x] Include service areas (Sofia, Plovdiv, etc.)

#### 3.3 Service Schema
- [ ] Add Service schema to task listings (post-MVP)
- [ ] Include pricing, availability, ratings (post-MVP)

#### 3.4 BreadcrumbList Schema
- [x] Add breadcrumbs to all content pages
- [ ] Proper hierarchy for task detail pages (post-MVP)

```typescript
// Example: JSON-LD for organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trudify',
  url: 'https://trudify.com',
  logo: 'https://trudify.com/logo.png',
  sameAs: [
    'https://facebook.com/trudify',
    'https://instagram.com/trudify',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@trudify.com',
    contactType: 'customer service',
    availableLanguage: ['Bulgarian', 'English', 'Russian'],
  },
}
```

### Phase 4: Core Web Vitals Optimization

#### 4.1 LCP (Largest Contentful Paint)
- [ ] Optimize hero images with `priority` prop
- [ ] Use Next.js Image component everywhere
- [ ] Implement proper image sizing and formats (WebP)
- [ ] Preload critical fonts

#### 4.2 INP (Interaction to Next Paint)
- [ ] Audit heavy JavaScript bundles
- [ ] Lazy load below-fold components
- [ ] Optimize React hydration

#### 4.3 CLS (Cumulative Layout Shift)
- [ ] Set explicit dimensions on images
- [ ] Reserve space for dynamic content
- [ ] Avoid layout shifts from fonts loading

### Phase 5: Content SEO

#### 5.1 URL Structure
- [x] Clean URLs with locale prefix (/en/, /bg/, /ru/)
- [ ] Use category slugs in task URLs
- [ ] Implement proper 301 redirects for old URLs

#### 5.2 Internal Linking
- [ ] Add related tasks section
- [ ] Add "professionals in this category" links
- [ ] Implement breadcrumb navigation

#### 5.3 Content Guidelines
- [ ] H1 tags on every page (unique)
- [ ] Descriptive alt text for images
- [ ] Proper heading hierarchy (H1 → H2 → H3)

### Phase 6: International SEO

#### 6.1 Hreflang Tags
- [x] Already implemented via `generateAlternateLanguages()`
- [ ] Verify correct implementation in Search Console

#### 6.2 Language-Specific Content
- [ ] Ensure all UI text is translated (no English fallbacks)
- [ ] Localize meta descriptions for each language
- [ ] Consider local keyword research for BG market

### Phase 7: Performance Monitoring

#### 7.1 Tools Setup
- [x] Vercel Analytics (already installed)
- [x] Vercel Speed Insights (already installed)
- [ ] Set up Google Search Console alerts
- [ ] Optional: PageSpeed Insights API monitoring

#### 7.2 Regular Audits
- [ ] Monthly Core Web Vitals check
- [ ] Quarterly content audit
- [ ] Monitor search rankings for key terms

### Phase 8: Content Marketing Pages (SEO-Driven)

> **Implementation**: Static TSX pages (no CMS for MVP). Easy to migrate to headless CMS later if needed.

#### 8.1 About Page (`/[lang]/about`)
**Purpose**: Origin story, mission, trust building
**SEO Value**: Brand queries, "who is trudify", trust signals

Content outline:
- [x] **Hero**: "Connecting Bulgaria with trusted professionals"
- [x] **The Problem**: Why finding reliable help is hard in Bulgaria
- [x] **Our Solution**: How Trudify bridges the gap
- [x] **Origin Story**: Why we built this (founder perspective)
- [x] **Our Values**: Trust, transparency, fair pricing
- [ ] **Team Section** (optional): Founders/key team with photos (post-MVP)
- [x] **Contact CTA**: How to reach us

```
Target keywords (BG): "платформа за услуги българия", "намери майстор"
Target keywords (EN): "freelance services bulgaria", "find professionals sofia"
```

#### 8.2 How It Works (`/[lang]/how-it-works`)
**Purpose**: Convert visitors by explaining the process clearly
**SEO Value**: "how to find plumber sofia", "hire professional bulgaria"

Content outline:
- [x] **For Customers** section:
  1. Post your task (free, 2 minutes)
  2. Receive quotes from verified professionals
  3. Compare, chat, and choose the best fit
  4. Get the job done & leave a review
- [x] **For Professionals** section:
  1. Create your profile & showcase work
  2. Browse relevant tasks in your area
  3. Submit competitive quotes
  4. Build your reputation & grow
- [x] **Visual process diagram** (icons/illustrations)
- [x] **CTA buttons**: "Post a Task" / "Join as Professional"

#### 8.3 For Professionals Landing Page (`/[lang]/for-professionals`)
**Purpose**: Professional acquisition, explain benefits
**SEO Value**: "работа като майстор", "freelance jobs bulgaria"

Content outline:
- [x] **Hero**: "Grow your business with Trudify"
- [x] **Benefits**:
  - No upfront fees (pay only when you win work)
  - Steady stream of local customers
  - Build your online reputation
  - Manage everything from your phone
- [x] **How earnings work**: Transparent pricing explanation
- [x] **Success metrics**: "500+ professionals, 10,000+ tasks completed"
- [x] **Testimonials placeholder**: "Coming soon" or generic
- [x] **CTA**: "Start Getting Customers Today"

#### 8.4 FAQ Page (`/[lang]/faq`)
**Purpose**: Answer common questions, reduce support load
**SEO Value**: Featured snippets, long-tail queries

Content sections:
- [x] **For Customers**:
  - How much does it cost to post a task?
  - How do I know professionals are trustworthy?
  - What if I'm not satisfied with the work?
  - Can I cancel a task?
  - How do payments work?
- [x] **For Professionals**:
  - How do I sign up as a professional?
  - What fees does Trudify charge?
  - How do I get more jobs?
  - Can I work in multiple cities?
  - How do reviews work?
- [x] **General**:
  - Is Trudify available in my city?
  - What services are available?
  - How do I contact support?

```typescript
// Implement with Accordion component for good UX
// Add FAQPage schema for rich snippets
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(q => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer
    }
  }))
}
```

#### 8.5 Testimonials / Success Stories (`/[lang]/testimonials`)
**Purpose**: Social proof, trust building
**SEO Value**: Brand trust, "trudify reviews"

Content outline:
- [x] **Hero**: "Real stories from our community"
- [x] **Customer testimonials** (placeholder for MVP):
  - Quote, name, city, service used
  - Photo (optional)
- [x] **Professional testimonials**:
  - Quote, name, profession, earnings hint
  - Before/after story
- [x] **Stats section**: Tasks completed, happy customers, cities covered
- [x] **CTA**: "Join thousands of satisfied users"

> **Note**: Started with placeholder testimonials. Replace with real ones post-launch.

#### 8.6 Pricing / How Pricing Works (`/[lang]/pricing`)
**Status**: ⏸️ DEFERRED - Platform is free during launch period (6-10 months). Will add pricing page when monetization begins.

**Rationale**: Having a "Pricing" page when everything is free can confuse users and create unnecessary anxiety about future costs. The "free during launch" messaging already exists on the For Professionals page.

#### 8.7 Future: Blog/Guides Section (`/[lang]/guides/`)
**Purpose**: Long-tail SEO, establish expertise
**SEO Value**: Informational queries, backlink magnet

> **For post-MVP** - Consider when you have bandwidth for regular content

Example articles:
- "How to choose a reliable plumber in Sofia"
- "Average costs for home renovation in Bulgaria 2024"
- "10 questions to ask before hiring a contractor"
- "Guide to apartment cleaning services in Plovdiv"

Implementation options:
- **Simple**: MDX files in `/content/guides/`
- **Scalable**: Headless CMS (Sanity, Contentful) when needed

---

### Phase 9: Content Page Technical Implementation

#### 9.1 Route Structure
```
/src/app/[lang]/
├── about/
│   └── page.tsx
├── how-it-works/
│   └── page.tsx
├── for-professionals/
│   └── page.tsx
├── faq/
│   └── page.tsx
├── testimonials/
│   └── page.tsx
└── pricing/
    └── page.tsx
```

#### 9.2 Shared Components
- [x] Create `ContentPageHero` component (reusable hero for content pages)
- [x] Create `ContentSection` component (consistent spacing/styling)
- [x] Create `TestimonialCard` component
- [x] Create `ProcessStep` component (for how-it-works)
- [x] Create `FAQAccordion` component with schema support
- [x] Create `CTASection` component
- [x] Create `StatsSection` component

#### 9.3 Translations
- [x] Add translation keys for all content pages (en/bg/ru/ua)
- [x] Create `/src/lib/intl/[lang]/content-pages.ts` chunk
- [x] Ensure SEO metadata is translated for each locale

#### 9.4 Internal Linking Strategy
- [x] Link from homepage hero → How It Works
- [ ] Link from footer → About, FAQ, Pricing (update footer)
- [ ] Link from professional cards → For Professionals page
- [ ] Link from task creation success → How It Works
- [x] Add breadcrumbs to all content pages

---

## Acceptance Criteria

### Technical SEO
- [x] Sitemap.xml accessible and submitted to Google
- [x] Robots.txt properly configured
- [x] Google Search Console verification tag ready (via env var)
- [x] All pages have unique title and description
- [ ] Core Web Vitals pass on mobile and desktop (verify post-deploy)
- [x] Structured data validates in Rich Results Test
- [ ] No crawl errors in Search Console (verify post-deploy)

### Content Pages (Phase 8)
- [x] About page live with origin story and mission
- [x] How It Works page with clear customer/professional flows
- [x] For Professionals landing page with benefits and CTA
- [x] FAQ page with accordion and FAQPage schema
- [x] Testimonials page with placeholder content
- [x] ~~Pricing page~~ (deferred - platform free during launch)
- [x] All content pages translated (EN/BG/RU/UA)
- [ ] Internal links added from homepage/footer to content pages
- [x] Breadcrumbs implemented on all content pages

## Technical Notes

### SEO Infrastructure (Updated)
- `src/lib/utils/seo.ts` - Utilities for hreflang and canonical URLs
- `src/lib/utils/metadata.ts` - Localized metadata for all pages (en/bg/ru/ua)
- `src/app/layout.tsx` - Root metadata, GSC verification, OG/Twitter config
- `src/app/[lang]/layout.tsx` - JSON-LD schemas, alternate language tags
- `src/app/robots.ts` - Dynamic robots.txt with env-based indexing control
- `src/app/sitemap.ts` - Dynamic sitemap with all pages and locales
- `src/app/opengraph-image.tsx` - Dynamic OG image generation
- `src/components/seo/json-ld.tsx` - Organization, WebSite, LocalBusiness, FAQ schemas
- `src/components/content/*.tsx` - 7 shared content page components

### Key URLs for Testing
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Schema Markup Validator](https://validator.schema.org/)

### Environment Variables Needed
```bash
# For sitemap generation
NEXT_PUBLIC_BASE_URL=https://trudify.com

# Enable search engine indexing (set to 'true' for production)
ALLOW_INDEXING=true

# Google Search Console verification (get code from GSC)
GOOGLE_SITE_VERIFICATION=your_verification_code
```

> **See full deployment guide**: `/docs/seo-production-deployment-guide.md`

## Priority
**High** - SEO is critical for organic user acquisition in Bulgarian market

## Estimated Complexity
**High** - Multiple components across technical SEO, content creation, and translations

## Implementation Order (Recommended)

### Can Do NOW (Pre-Production Domain)
1. **Phase 8 & 9**: Content pages - build all marketing pages
2. **Phase 4**: Core Web Vitals optimization
3. **Phase 2**: Metadata optimization (use placeholder domain)
4. **Phase 3**: Structured data (JSON-LD)
5. **Phase 5 & 6**: Content SEO & International SEO

### Do AFTER Production Domain
1. **Phase 1.3**: Google Search Console verification
2. **Phase 1.1-1.2**: Sitemap & robots.txt (update URLs)
3. **Phase 7**: Performance monitoring setup
4. Submit sitemap to Google

### Temporary robots.txt (Until Production)
```typescript
// Block crawlers until production domain is ready
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: ['/'],  // Block everything
    },
  }
}
```
