# TaskBridge (Trudify)

> A modern Bulgarian freelance platform connecting customers with verified professionals for various services.

TaskBridge is a full-stack TypeScript application built with Next.js 15, featuring multilingual support, modern UI components, and a comprehensive service marketplace.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routes Documentation](#routes-documentation)
- [User Flows](#user-flows)
- [Internationalization](#internationalization)
- [Category & Subcategory System](#category--subcategory-system)
- [Authentication Status](#authentication-status)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)

## Features

- **Multilingual Support**: EN, BG, RU with smart locale detection
- **Professional Directory**: Browse and filter verified professionals
- **Task Marketplace**: Create, browse, and apply for service requests
- **User Profiles**: Separate customer and professional profiles
- **Modern UI**: NextUI + Radix UI components with Tailwind CSS
- **Mobile Responsive**: Optimized for all device sizes
- **Type-Safe**: Full TypeScript with Drizzle ORM
- **SEO Optimized**: Server-side rendering with Next.js App Router

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Libraries**:
  - NextUI (modern components: Card, Button, Input, Navbar)
  - Radix UI via shadcn/ui (forms, dialogs, complex interactions)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React, React Icons

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod with drizzle-zod

### Internationalization
- **Library**: i18next + react-i18next
- **Routes**: URL-based locales (`/en/`, `/bg/`, `/ru/`)
- **Detection**: Cookie → Browser → English fallback
- **Translation Files**: Modular language files in `/src/lib/intl/`

### DevOps
- **Deployment**: Vercel
- **Database Hosting**: Neon (PostgreSQL)
- **Node Version**: >=18.0.0

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database (or Neon account)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskbridge.git
cd taskbridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Push database schema
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run check        # Run both type-check and lint
npm run db:push      # Push database schema changes

# Media Optimization
npm run optimize:images  # Optimize images (JPEG, PNG → WebP, AVIF)
npm run optimize:videos  # Optimize videos (MP4, WebM) - requires FFmpeg
npm run optimize:media   # Optimize all media (images + videos)
```

## Media Optimization CLI

TaskBridge includes a powerful CLI tool for optimizing images and videos to improve web performance and reduce load times.

### Features

**Image Optimization**:
- Converts JPEG/PNG to modern formats (WebP, AVIF)
- Generates responsive image variants (320px, 640px, 1024px, 1920px)
- Configurable quality settings (default: 85%)
- Removes EXIF metadata for privacy
- Batch processing with progress indicators

**Video Optimization** (requires FFmpeg):
- Converts to web-optimized MP4 and WebM
- Automatic resolution adjustment
- Generates video thumbnails
- Configurable bitrate and quality

### Installation Requirements

**macOS** (recommended for local use):
```bash
# Install FFmpeg for video optimization (optional)
brew install ffmpeg
```

**Linux**:
```bash
# Debian/Ubuntu
sudo apt-get install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

### Basic Usage

#### Optimize Images
```bash
# Optimize all images in a directory
npm run optimize:images -- --input "public/images/**/*.{jpg,png}"

# With custom output directory
npm run optimize:images -- --input "public/images/*.jpg" --output "public/optimized"

# With custom quality (1-100)
npm run optimize:images -- --input "public/images/*.png" --quality 90

# Dry run (preview without modifying files)
npm run optimize:images -- --input "public/images/**/*" --dry-run
```

#### Optimize Videos
```bash
# Optimize all videos in a directory
npm run optimize:videos -- --input "public/videos/**/*.mp4"

# With custom settings
npm run optimize:videos -- --input "public/videos/*.mp4" --resolution 1920 --bitrate "2M"

# Skip thumbnail generation
npm run optimize:videos -- --input "public/videos/*.mp4" --no-thumbnails
```

#### Optimize All Media
```bash
# Optimize both images and videos
npm run optimize:media -- --input "public/**/*"

# Dry run
npm run optimize:media -- --dry-run
```

### Configuration

Create a `.mediarc` file in the project root for custom settings:

```json
{
  "images": {
    "quality": 85,
    "formats": ["webp", "avif"],
    "sizes": [320, 640, 1024, 1920],
    "outputDir": "public/optimized/images",
    "preserveOriginal": true,
    "removeMetadata": true
  },
  "videos": {
    "formats": ["mp4", "webm"],
    "maxResolution": 1920,
    "bitrate": "1M",
    "outputDir": "public/optimized/videos",
    "generateThumbnails": true
  }
}
```

See `.mediarc.example` for a complete configuration template.

### CLI Options

#### Images Command
```bash
node scripts/optimize/cli.js images [options]

Options:
  -i, --input <pattern>      Input file pattern (default: "public/images/**/*")
  -o, --output <dir>         Output directory
  -q, --quality <number>     Image quality 1-100 (default: 85)
  -f, --formats <formats>    Output formats, comma-separated (default: "webp,avif")
  -c, --config <path>        Path to custom config file
  --dry-run                  Preview changes without modifying files
```

#### Videos Command
```bash
node scripts/optimize/cli.js videos [options]

Options:
  -i, --input <pattern>      Input file pattern (default: "public/videos/**/*")
  -o, --output <dir>         Output directory
  -f, --formats <formats>    Output formats, comma-separated (default: "mp4,webm")
  -r, --resolution <number>  Max resolution width (default: 1920)
  -b, --bitrate <bitrate>    Target bitrate, e.g. "1M", "2M" (default: "1M")
  -c, --config <path>        Path to custom config file
  --dry-run                  Preview changes without modifying files
  --no-thumbnails            Skip thumbnail generation
```

### Performance Targets

- **Images**: 50-70% size reduction without visible quality loss
- **Videos**: 30-50% size reduction while maintaining acceptable quality
- **Processing speed**: 100+ images in under 2 minutes

### Workflow Integration

**Before Committing Media**:
```bash
# Check what would be optimized
npm run optimize:media -- --dry-run

# Optimize all new media
npm run optimize:media
```

**Regular Maintenance**:
```bash
# Optimize images added in last commit
git diff --name-only HEAD~1 | grep -E '\.(jpg|png)$' | xargs -I {} npm run optimize:images -- --input {}
```

### Troubleshooting

**"FFmpeg is not installed"**:
- Video optimization requires FFmpeg
- Install with `brew install ffmpeg` (macOS) or your package manager
- Image optimization works without FFmpeg

**"No files found"**:
- Check your glob pattern syntax
- Use quotes around patterns: `"public/**/*.jpg"`
- Verify files exist in the specified directory

**Large output size**:
- The tool generates multiple formats and sizes
- This is expected - responsive variants improve performance
- Use `--formats webp` to generate only WebP
- Use config file to adjust sizes array

## Project Structure

```
/src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Root redirect to locale
│   ├── [lang]/            # Locale-specific routes
│   └── api/               # API routes (to be migrated)
├── features/              # Self-contained business domains
│   └── professionals/     # Professionals feature
│       ├── components/    # Feature-specific UI
│       ├── lib/          # Feature data & utilities
│       └── index.ts      # Barrel exports
├── components/           # Shared UI components
│   ├── ui/              # Design system (shadcn/ui)
│   └── common/          # Layout components
├── database/            # Database schema & config
├── lib/                 # Global utilities
│   ├── intl/           # Translation files (en, bg, ru)
│   ├── constants/      # App constants
│   └── utils/          # Utility functions
├── hooks/               # Global custom hooks
└── types/               # Global type definitions
```

## Routes Documentation

### Route Tree

```
┌─ / (Root - redirects to locale)
│
├─ /[lang]/ (Landing Page)
│   ├─ Components: HeroSection, FeaturedTasksSection, PopularCategoriesSection
│   ├─ Server Component: Yes
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
├─ /[lang]/browse-tasks
│   ├─ Purpose: Browse and filter available tasks
│   ├─ Components: SearchFilters, TaskCard, ResultsSection
│   ├─ Server Component: Yes
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
├─ /[lang]/create-task
│   ├─ Purpose: Create new service requests
│   ├─ Components: Multi-step form with validation
│   ├─ Server Component: No (form interactivity)
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
├─ /[lang]/professionals
│   ├─ Purpose: Browse verified professionals directory
│   ├─ Components: ProfessionalCard, FilterSection
│   ├─ Server Component: Yes
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
├─ /[lang]/professionals/[id]
│   ├─ Purpose: Individual professional detail page
│   ├─ Components: ProfessionalHeader, PortfolioGallery, ReviewsSection
│   ├─ Server Component: Yes
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
├─ /[lang]/profile
│   ├─ Purpose: User profile management (Customer/Professional tabs)
│   ├─ Components: ProfileForm, AvatarUpload, PortfolioManager
│   ├─ Server Component: No (form interactivity)
│   ├─ Mobile Optimized: Yes
│   └─ Translations: Complete (EN/BG/RU)
│
└─ /[lang]/tasks/[id]
    ├─ Purpose: Individual task detail page
    ├─ Components: TaskGallery, TaskActions, PrivacyToggle, TaskActivity
    ├─ Server Component: Yes (with client sub-components)
    ├─ Mobile Optimized: Yes
    ├─ Translations: Complete (EN/BG/RU)
    └─ Features:
        ├─ Privacy toggle for sensitive information
        ├─ Authentication slide-over (Google/Facebook)
        ├─ Apply/Question actions
        └─ TaskActivity (hidden - for task authors)
```

### Route Details by Type

#### Public Pages (No Auth Required)
All routes are currently **publicly accessible** without authentication:
- Landing page (`/[lang]/`)
- Browse tasks (`/[lang]/browse-tasks`)
- Browse professionals (`/[lang]/professionals`)
- Professional detail (`/[lang]/professionals/[id]`)
- Task detail (`/[lang]/tasks/[id]`)

#### Protected Features (Auth Required - UI Only)
These features show authentication prompts but don't enforce backend auth:
- Create task (`/[lang]/create-task`)
- Apply to task (button on task detail page)
- User profile (`/[lang]/profile`)

#### Server vs Client Components

**Server Components** (default):
- Landing page
- Browse tasks page
- Browse professionals page
- Professional detail page
- Task detail page (main layout)

**Client Components** (interactivity required):
- Create task form
- Profile management form
- Task detail content (translations)
- Authentication slide-over
- All form components

## User Flows

TaskBridge supports two main user types with distinct journeys. See the detailed documentation for complete flow diagrams:

### Customer Journeys

Flows for customers who want to find professionals and get work done.

**[View Customer Journeys Documentation](./docs/customer-journeys.md)**

- Finding and Hiring a Professional
- Posting a Job (Task Creation)
- Managing Applications
- Profile Management
- Authentication Flow

### Professional Journeys

Flows for professionals who want to find work and connect with customers.

**[View Professional Journeys Documentation](./docs/professional-journeys.md)**

- Finding Work
- Application Lifecycle
- Profile Management
- Authentication Flow

## Internationalization

TaskBridge supports three languages with intelligent detection and SEO-friendly URL-based routing:

### Supported Locales
- **English** (en) - Default
- **Bulgarian** (bg) - Primary market
- **Russian** (ru) - Secondary market

### URL Structure

All routes are prefixed with the locale for SEO optimization and user experience:

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

/en/professionals           # Professionals directory in English
/bg/professionals           # Professionals directory in Bulgarian
/ru/professionals           # Professionals directory in Russian

/en/professionals/123       # Professional detail in English
/bg/professionals/123       # Professional detail in Bulgarian
/ru/professionals/123       # Professional detail in Russian

/en/tasks/456               # Task detail in English
/bg/tasks/456               # Task detail in Bulgarian
/ru/tasks/456               # Task detail in Russian

/en/create-task             # Create task form in English
/bg/create-task             # Create task form in Bulgarian
/ru/create-task             # Create task form in Russian

/en/profile                 # User profile in English
/bg/profile                 # User profile in Bulgarian
/ru/profile                 # User profile in Russian
```

### Locale Detection Strategy

The middleware follows a priority-based detection system:

1. **User Preference** (highest priority)
   - Cookie: `preferred_locale` from manual language selection
   - Persisted across sessions

2. **Browser Language**
   - Accept-Language header parsing
   - Matches to supported locales (en, bg, ru)

3. **Default Fallback**
   - English (en) if no preference found

### Route Configuration

Routes are configured in `/src/middleware.ts`:

```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Translation Architecture

Translation files are organized by locale in `/src/lib/intl/`:

| File | Keys | Description |
|------|------|-------------|
| `en.ts` | 588 | English translations (default) |
| `bg.ts` | 614 | Bulgarian translations (primary market) |
| `ru.ts` | 597 | Russian translations (secondary market) |

### Translation Key Namespaces

Organized by feature domain for maintainability:

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `nav.*` | Navigation items | `nav.home`, `nav.browseTasks` |
| `landing.*` | Landing page content | `landing.hero.title`, `landing.featured.title` |
| `professionals.*` | Professionals pages | `professionals.viewProfile`, `professionals.rating` |
| `tasks.*` | Task-related content | `tasks.title`, `tasks.filters.category` |
| `browseTasks.*` | Browse tasks page | `browseTasks.hero.title`, `browseTasks.results.shown` |
| `createTask.*` | Create task form | `createTask.form.title`, `createTask.form.description` |
| `categories.main.*` | Main categories | `categories.main.homeServices.title` |
| `categories.sub.*` | Subcategories | `categories.sub.plumbing`, `categories.sub.electrician` |
| `taskCard.*` | Task card component | `taskCard.budget.from`, `taskCard.deadline.flexible` |
| `profile.*` | Profile pages | `profile.personalInfo`, `profile.statistics` |
| `auth.*` | Authentication UI | `auth.login`, `auth.continueWith` |
| `footer.*` | Footer content | `footer.quickLinks.title`, `footer.legal.privacy` |

### Implementation Examples

#### Client Components (with hooks)
```typescript
'use client'
import { useTranslation } from 'react-i18next'

function ClientComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('landing.hero.title')}</h1>
      <p>{t('landing.hero.subtitle')}</p>
    </div>
  )
}
```

#### Server Components (with params)
```typescript
import { getDictionary } from '@/lib/intl/config'

async function ServerComponent({ params }: { params: { lang: string } }) {
  const dict = await getDictionary(params.lang)

  return (
    <div>
      <h1>{dict['landing.hero.title']}</h1>
      <p>{dict['landing.hero.subtitle']}</p>
    </div>
  )
}
```

#### Using Category Translations
```typescript
import { useTranslation } from 'react-i18next'
import { getCategoryLabelBySlug } from '@/features/categories'

function CategoryDisplay({ slug }: { slug: string }) {
  const { t } = useTranslation()
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
      <LocaleLink href="/create-task">Create Task</LocaleLink>
    </nav>
  )
}
```

### Language Switcher

Users can manually switch languages via the LanguageSwitcher component:

- Location: `/src/components/common/language-switcher.tsx`
- Sets cookie: `preferred_locale`
- Updates localStorage: `preferred_locale`
- Redirects to: `/{new-locale}{current-path}`

### Middleware Optimization

Smart middleware with performance optimizations:

**Early Returns** (90% of requests):
```typescript
// Skip if already has valid locale prefix
if (pathname.startsWith(`/${locale}/`)) {
  return NextResponse.next()
}
```

**Cookie-Based Persistence**:
- Returning users skip detection logic
- Minimal middleware execution on Vercel Edge
- Cost-optimized for high traffic

**Performance Metrics**:
- 90% of requests bypass middleware
- <10ms additional latency for new users
- Zero overhead for locale-prefixed URLs

### SEO Benefits

URL-based locales provide:
- **Clean URLs**: `/bg/professionals` instead of `?lang=bg`
- **Search Engine Indexing**: Each locale treated as separate page
- **Social Sharing**: Language-specific link previews
- **Browser History**: Language preference preserved in URLs
- **Direct Access**: Users can bookmark locale-specific pages

### Adding New Translations

To add a new translation key:

1. Add to `en.ts`:
```typescript
'myFeature.newKey': 'English text',
```

2. Add to `bg.ts`:
```typescript
'myFeature.newKey': 'Български текст',
```

3. Add to `ru.ts`:
```typescript
'myFeature.newKey': 'Русский текст',
```

4. Use in components:
```typescript
const { t } = useTranslation()
return <span>{t('myFeature.newKey')}</span>
```

## Category & Subcategory System

> **Quick Reference**: Categories are stored as locale-independent slugs in the database, with translations managed through i18next keys. Always use utility functions to display translated names.

TaskBridge uses a hierarchical category system with **26 main categories** and **135 subcategories**, fully translated across EN/BG/RU locales.

### Architecture Overview

```
Main Category (e.g., 'handyman')
  └─ Subcategory 1 (e.g., 'plumber')
  └─ Subcategory 2 (e.g., 'electrician')
  └─ Subcategory 3 (e.g., 'locksmith')
  └─ ...

Database: Stores slugs only ('handyman', 'plumber')
UI Display: Shows translated labels ('Handyman', 'Plumber')
```

### Data Storage Locations

| Location | Purpose | Content |
|----------|---------|---------|
| `/src/lib/intl/[lang]/categories.ts` | **Primary source** | Translation keys for all categories |
| `/src/lib/constants/category-visuals.ts` | Visual mapping | Icons & gradient colors per category |
| `/src/features/categories/` | Category utilities | Helper functions & data structures |

### Main Categories (26 Total)

```typescript
// Examples from categories.ts
'categories.main.handyman.title': 'Handyman'
'categories.main.applianceRepair.title': 'Appliance Repair'
'categories.main.webDevelopment.title': 'Web Development'
'categories.main.cleaningServices.title': 'Cleaning Services'
'categories.main.aiServices.title': 'AI Services'
'categories.main.petServices.title': 'Pet Services'
// ... 20 more
```

**Main Category Slugs**: `handyman`, `appliance-repair`, `finishing-work`, `construction-work`, `furniture-work`, `cleaning-services`, `logistics`, `household-services`, `pet-services`, `beauty-health`, `auto-repair`, `courier-services`, `digital-marketing`, `ai-services`, `online-advertising`, `advertising-distribution`, `web-development`, `design`, `photo-video`, `tutoring`, `business-services`, `translation-services`, `trainer-services`, `event-planning`, `volunteer-help`, `online-work`

### Subcategories (135 Total)

```typescript
// Examples from categories.ts - Handyman subcategories
'categories.sub.plumber': 'Plumber'
'categories.sub.electrician': 'Electrician'
'categories.sub.locksmith': 'Locksmith'
'categories.sub.carpenter': 'Carpenter'

// Appliance Repair subcategories
'categories.sub.largeApplianceRepair': 'Large Appliance Repair'
'categories.sub.phoneRepair': 'Phone Repair'
'categories.sub.computerHelp': 'Computer Help'

// ... 128 more subcategories
```

**Subcategory Format**: Always prefixed with `categories.sub.` for translation keys, stored as kebab-case slugs in database (`plumber`, `phone-repair`, `computer-help`)

### Visual Configuration

Each category has visual branding:

```typescript
// /src/lib/constants/category-visuals.ts
{
  'plumber': {
    gradient: 'from-blue-500 to-blue-700',  // Tailwind gradient
    icon: Wrench,                            // Lucide icon
  },
  'web-development': {
    gradient: 'from-indigo-500 to-indigo-700',
    icon: Code,
  }
}
```

**Color Scheme by Domain**:
- **Home & Repair**: Blue tones
- **Delivery & Logistics**: Green tones
- **Personal Services**: Purple tones
- **Professional Services**: Orange tones
- **Learning & Creative**: Pink tones
- **Digital Services**: Indigo tones
- **Translation**: Teal tones
- **Volunteer**: Emerald tones

### How It Works: Slugs vs Translation Keys

**Database Storage** (locale-independent):
```typescript
task = {
  category: 'handyman',        // Main category slug
  subcategory: 'plumber'       // Subcategory slug
}

user = {
  service_categories: ['plumber', 'electrician']  // Array of slugs
}
```

**Translation Keys** (for display only):
```typescript
'categories.main.handyman.title'      // Main category translation
'categories.main.handyman.description'
'categories.sub.plumber'              // Subcategory translation
```

**Display in UI** (shows translated labels):
```typescript
import { useTranslation } from 'react-i18next'
import { getCategoryLabelBySlug } from '@/features/categories'

function TaskCard({ task }) {
  const { t } = useTranslation()

  // Method 1: Direct translation
  const label = t('categories.sub.plumber')  // Returns: "Plumber" / "Водопроводчик"

  // Method 2: Using utility (recommended)
  const label = getCategoryLabelBySlug(task.subcategory, t)

  return <span>{label}</span>
}
```

### Category Picker Flow (Create Task Form)

Located: `/src/app/[lang]/create-task/components/category-selection.tsx`

**User Experience**:
1. User sees: "Plumber" (translated via `t('categories.sub.plumber')`)
2. User clicks category chip
3. Form stores: `category: 'handyman'`, `subcategory: 'plumber'` (slugs)
4. Database receives: Locale-independent slugs
5. Display later: Uses translation key to show localized label again

```typescript
// Selection handler (lines 73-87)
const handleSubcategorySelect = (slug: string) => {
  const subcategory = getSubcategoryBySlug(slug)

  // Stores SLUGS in form, not translation keys
  form.setFieldValue('category', subcategory.mainCategoryId)  // 'handyman'
  form.setFieldValue('subcategory', slug)                      // 'plumber'
}

// Display in chip
<Chip onClick={() => handleSubcategorySelect(category.slug)}>
  {t(category.translationKey)}  // Shows translated label
</Chip>
```

### Key Benefits

✅ **Locale-Independent Database**: Same queries work across all languages
✅ **Consistent Filtering**: URL filters always use slugs (`?category=plumber`)
✅ **Easy Translation Updates**: Change translations without touching database
✅ **Type Safety**: TypeScript ensures valid category slugs
✅ **SEO Friendly**: Clean, consistent URLs regardless of locale

### Usage Examples

#### Display Category Label
```typescript
import { getCategoryLabelBySlug } from '@/features/categories'

// Client component
const { t } = useTranslation()
const label = getCategoryLabelBySlug('plumber', t)  // Returns translated label
```

#### Get All Categories for Dropdown
```typescript
import { getMainCategoriesWithSubcategories } from '@/features/categories'

const categories = useMemo(() =>
  getMainCategoriesWithSubcategories(t)
, [t])

// Returns: [{ title: "Handyman", subcategories: [...], icon, color }, ...]
```

#### Get Subcategories for Main Category
```typescript
import { getSubcategoriesByMainCategory } from '@/features/categories'

const subs = getSubcategoriesByMainCategory('handyman')
// Returns: [{ slug: 'plumber', translationKey: 'categories.sub.plumber' }, ...]
```

#### Get Visual Configuration
```typescript
import { getCategoryVisual } from '@/lib/constants/category-visuals'

const visual = getCategoryVisual('plumber')
// Returns: { gradient: 'from-blue-500 to-blue-700', icon: Wrench }
```

### Adding New Categories

To add a new category:

1. **Add translations** to all three languages:
```typescript
// /src/lib/intl/en/categories.ts
'categories.main.newCategory.title': 'New Category'
'categories.main.newCategory.description': 'Category description'
'categories.sub.newSubcategory': 'New Subcategory'

// /src/lib/intl/bg/categories.ts
'categories.main.newCategory.title': 'Нова категория'
// ... etc

// /src/lib/intl/ru/categories.ts
'categories.main.newCategory.title': 'Новая категория'
// ... etc
```

2. **Add to category data structure**:
```typescript
// /src/features/categories/lib/data.ts
export const MAIN_CATEGORIES = [
  // ... existing categories
  {
    id: 'new-category',
    translationKey: 'categories.main.newCategory',
    subcategories: ['new-subcategory']
  }
]
```

3. **Add visual configuration**:
```typescript
// /src/lib/constants/category-visuals.ts
'new-subcategory': {
  gradient: 'from-purple-500 to-purple-700',
  icon: YourIcon,
}
```

4. **Update database** (if needed):
```sql
-- Add CHECK constraint if enforcing valid categories at DB level
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check
  CHECK (category IN ('handyman', 'appliance-repair', ..., 'new-category'));
```

### Important Rules

⚠️ **NEVER store translation keys in the database**
❌ Bad: `category: 'categories.main.handyman'`
✅ Good: `category: 'handyman'`

⚠️ **ALWAYS use utility functions for display**
❌ Bad: Displaying raw slugs to users (`"plumber"`)
✅ Good: Using `getCategoryLabelBySlug()` or `t()` (`"Plumber"`)

⚠️ **NEVER allow free text category input**
❌ Bad: Text input field for categories
✅ Good: Dropdown/chip selection only

## Authentication Status

### Current State: Authentication Disabled

The application is currently in **public beta mode** with authentication UI implemented but **not enforced**:

#### What Works
- Authentication UI components (login slide-over)
- Google/Facebook OAuth buttons (UI only)
- Profile pages and forms
- Mock authentication system for development

#### What's Missing
- Backend authentication enforcement
- Session management
- Protected API routes
- User authorization checks
- Email/password authentication

#### Pages Requiring Auth (Future)
When authentication is enabled, these pages will be protected:
- `/[lang]/create-task` - Task creation
- `/[lang]/profile` - Profile management
- Task actions (apply, question) - Buttons on task detail pages

#### Mock Auth System
For development purposes, a mock authentication system is available:
- Location: `/src/hooks/use-auth.ts`
- Features: Login state, user data, session persistence
- Usage: Testing protected flows without backend

#### Migration Plan
To enable authentication:
1. Configure NextAuth providers (Google, Facebook, Email)
2. Add authentication middleware
3. Protect API routes
4. Add session verification to protected pages
5. Enable email/password authentication
6. Add password reset flow

## Database Schema

### Main Entities

#### Users
```typescript
{
  id: number
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  city: string
  neighborhood: string
  isProfessional: boolean
  categories: string[]
  hourlyRate: number
  bio: string
  portfolio: string[]
  rating: number
  completedTasks: number
  isPhoneVerified: boolean
  isVatVerified: boolean
  createdAt: Date
}
```

#### Tasks
```typescript
{
  id: number
  title: string
  description: string
  category: string
  city: string
  neighborhood: string
  budget: number
  images: string[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  creatorId: number
  createdAt: Date
  completedAt: Date
}
```

#### Applications
```typescript
{
  id: number
  taskId: number
  professionalId: number
  message: string
  proposedPrice: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}
```

#### Reviews
```typescript
{
  id: number
  taskId: number
  reviewerId: number
  reviewedId: number
  rating: number
  comment: string
  createdAt: Date
}
```

### Database Commands

```bash
# Push schema changes
npm run db:push

# Generate migrations (manual setup required)
drizzle-kit generate:pg
```

## Development

### Code Quality

#### Component Refactoring
The project follows a progressive refactoring strategy:

**Completed Refactorings**:
- `browse-tasks-page.tsx` - 75% reduction (423 → 103 lines)
- `task-activity.tsx` - 43% reduction (292 → 167 lines)
- `landing-page.tsx` - 30% reduction (831 → 581 lines)

**Next Priority**:
- `professionals-page.tsx` (730 lines) → Target: 300 lines

#### TODO Comments Convention
Use `@todo` comments to mark technical debt:
```typescript
// @todo REFACTORING: Extract PopularCategoriesSection
// @todo MIGRATION: Convert Express routes to Next.js API
// @todo FEATURE: Add user authentication
```

### Path Aliases
All imports use `/src/` directory:
```typescript
import { Button } from '@/components/ui'           // shadcn/ui components
import { Header } from '@/components/common'        // Shared layouts
import { ProfessionalCard } from '@/features/professionals'  // Feature components
import { formatDate } from '@/lib/utils'            // Global utilities
import { LOCALES } from '@/lib/constants/locales'   // Constants
```

### Component Guidelines

#### When to Use NextUI
Use NextUI for:
- Cards, Buttons, Navigation
- Simple Dropdowns, Inputs
- Images, Avatars, Chips
- Modern, animated components

#### When to Use Radix UI (shadcn/ui)
Keep Radix UI for:
- Complex forms with validation
- Data tables
- Advanced dialogs and sheets
- Components in `/components/ui/`

### Task Management Workflow

Development tasks are tracked in markdown files:

```
/todo_tasks/        # Tasks to be completed
/complete_tasks/    # Finished tasks (moved from todo_tasks)
```

**Task File Template**:
```markdown
# Task Title

## Task Description
Brief description

## Requirements
- Bullet points

## Acceptance Criteria
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2

## Technical Notes
Implementation notes

## Priority
Low/Medium/High
```

## Deployment

### Vercel Deployment

The application is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth (when enabled)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

### Build Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Performance Optimizations
- Server-side rendering for SEO
- Static generation where possible
- Image optimization with Next.js Image
- Middleware caching for locale detection
- Database connection pooling with Neon

## Contributing

1. Check `todo_tasks/` for available tasks
2. Create a feature branch
3. Make your changes following the code guidelines
4. Run `npm run check` before committing
5. Move completed task to `complete_tasks/`
6. Submit a pull request

## License

MIT

## Documentation

- [PRD.md](./PRD.md) - Product Requirements Document
- [CLAUDE.md](./CLAUDE.md) - Development guidelines for Claude Code
- [Customer Journeys](./docs/customer-journeys.md) - User flows for customers
- [Professional Journeys](./docs/professional-journeys.md) - User flows for professionals
- [docs/](./docs/) - Additional documentation

---

**Built with**: Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, NextUI, Tailwind CSS

**Powered by**: Vercel, Neon Database
