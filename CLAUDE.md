# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskBridge (branded as "Trudify") is a Bulgarian freelance platform that connects customers with verified professionals for various services. It's a full-stack TypeScript application built with Next.js App Router.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes + Supabase
- **Database**: Supabase PostgreSQL (with pgvector for semantic search)
- **Authentication**: Supabase Auth (Google, Facebook, Phone)
- **Storage**: Supabase Storage (images, documents, avatars)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **UI Components**:
  - **Radix UI** (via shadcn/ui) - Headless, accessible components
  - **NextUI** - Modern React UI library with beautiful components
  - Both libraries work together, use NextUI for new components and keep Radix for existing ones
- **Styling**: Tailwind CSS
- **Routing**: Next.js App Router
- **State Management**: TanStack Query (React Query)
- **Internationalization**: Smart multilingual routing with i18next
  - **URL Structure**: `/en/`, `/bg/`, `/ru/` for SEO-friendly locales
  - **Smart Detection**: Cookie preference → Browser language → English default
  - **Cost-Optimized**: Middleware with early returns (minimal execution for returning users)
- **Animations**: Framer Motion (included with NextUI)
- **Deployment**: Vercel with Supabase integration

## Key Commands

```bash
# Development
npm run dev             # Start Next.js development server

# Building
npm run build           # Build Next.js application for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking

# Database (Supabase)
# See /docs/infrastructure/supabase-vercel-setup.md for setup instructions
# Database migrations managed via Supabase Dashboard or CLI
```

## Architecture

### Clean `/src/` Directory Structure
TaskBridge follows a modern `/src/` structure for better organization and scalability:

```
/src/
├── app/                    # Next.js App Router with multilingual routing
│   ├── page.tsx           # Root redirect to locale
│   ├── [lang]/            # Locale-specific pages (en, bg, ru)
│   │   ├── page.tsx       # Localized homepage
│   │   ├── browse-tasks/  # Browse available tasks (professionals)
│   │   ├── create-task/   # Create new task
│   │   ├── professionals/ # Professionals directory
│   │   ├── profile/       # User profile
│   │   └── tasks/         # Task management routes
│   │       ├── [id]/      # Task detail page
│   │       ├── posted/    # Customer: my posted tasks
│   │       ├── applications/ # Professional: my applications
│   │       └── work/      # Professional: my active work
│   └── api/               # API routes (to be migrated from Express)
├── features/              # 🎯 Self-contained business domains
│   └── professionals/     # Complete professionals feature
│       ├── components/    # Professional-specific UI components
│       ├── lib/          # Professional data, types, and utilities
│       ├── hooks/        # Professional-specific hooks (if needed)
│       └── index.ts      # Barrel exports for clean imports
├── components/           # 🧩 Technical UI organization
│   ├── ui/              # Design system primitives (shadcn/ui)
│   └── common/          # Shared layout components (Header, Footer, etc.)
├── lib/                 # 🔧 Global utilities and configurations
│   ├── supabase/        # Supabase client configurations
│   │   ├── client.ts    # Client-side Supabase client
│   │   ├── server.ts    # Server-side Supabase client
│   │   └── middleware.ts # Middleware session management
│   ├── constants/       # Application constants (locales, categories)
│   └── utils/           # Utility functions (locale detection, URL manipulation)
├── hooks/               # 🎣 Global custom React hooks
└── types/               # 📝 Global TypeScript type definitions
```

### Global API Type Registry

**Location**: `/src/types/api.d.ts`

The codebase uses a global `API` interface for type-safe access to all DTOs and entity types. No imports needed - types are available globally.

**Usage:**
```typescript
// Access any type via API['TypeName'] - no imports required
interface Props {
  professional: API['ProfessionalData']
  tasks: API['TaskSelection'][]
}

const user: API['UserProfile'] = { ... }
const task: API['TaskCreate'] = { title: 'Fix sink', ... }
```

**Available Type Domains:**
| Domain | Types |
|--------|-------|
| User | `UserProfile`, `UserCreate`, `UserUpdate`, `GalleryItem`, `ServiceItem` |
| Task | `Task`, `TaskCreate`, `TaskUpdate`, `TaskStatus`, `TasksResponse` |
| Professional | `Professional`, `ProfessionalDetail`, `ProfessionalData`, `ProfessionalDisplay` |
| Application | `Application`, `ApplicationStatus`, `ApplicationFilters` |
| Review | `Review`, `ReviewSubmit`, `ReviewDisplay`, `PendingReviewTask` |
| Question | `Question`, `Answer`, `QuestionFormData` |
| UI Components | `CompletedTaskDisplay`, `TaskSelection`, `Service` |

**Adding New Types:** Define in domain file → Import in `/src/types/api.d.ts` → Add to `API` interface in `declare global`

### Database Architecture (Supabase PostgreSQL)

Seven main tables: **users**, **tasks**, **applications**, **reviews**, **messages**, **notifications**, **safety_reports**

Key features: RLS for data privacy, Supabase Auth verification, location-based matching, real-time updates, file storage via Supabase Storage.

**Schema Documentation**: See `/docs/infrastructure/supabase-vercel-setup.md`

### Feature-Based Architecture

Each feature in `/src/features/[feature]/` contains: `components/`, `lib/`, `hooks/` (optional), and `index.ts` (barrel exports).

**Current Features**: `professionals` (complete), `tasks` and `browse-tasks` (to be migrated)

**Import patterns**: `import { X } from '@/features/professionals'`, `import { Button } from '@/components/ui'`

## Premium Features

### Professional Gallery (Premium)

**Status**: Implemented - UI ready, backend integrated

**Description**: Premium professionals can showcase their work with a gallery of up to 5 images, each with an optional caption.

**Access Control**:
- **Premium Feature**: Only available to the top 5 professionals per category
- **Ranking Criteria**: Based on completed tasks, rating, and reviews
- **@todo**: Implement ranking system and premium access validation

**Implementation:**
- **Profile Edit**: `/src/app/[lang]/profile/components/portfolio-gallery-manager.tsx`
- **Display**: `/src/features/professionals/components/sections/portfolio-gallery.tsx`
- **Data Model**: `GalleryItem` type in `/src/server/domain/user/user.types.ts`
- **Database**: Stored in `portfolio` JSONB column in users table

**Data Structure:**
```typescript
interface GalleryItem {
  id: string           // Unique ID
  imageUrl: string     // Supabase Storage URL
  caption: string      // Short description (max 200 chars)
  order: number        // Display order (0-4)
  createdAt: string    // ISO date string
}
```

**Key Components**: `PortfolioGalleryManager` (edit), `PortfolioGallery` (display)

## Development Notes

### Task Management Workflow
TaskBridge uses a structured approach to manage development tasks:

**📋 Task Organization:**
- `todo_tasks/` - Contains markdown files for tasks to be completed
- `complete_tasks/` - Contains completed task files moved from todo_tasks

**🔄 Workflow Process:**
1. **Task Creation**: New tasks are described and saved as `.md` files in `todo_tasks/`
2. **Task Naming**: Use descriptive kebab-case names (e.g., `profile-page-customer-avatar-upload.md`)
3. **Task Structure**: Each task file includes:
   - Task Description and Requirements
   - Acceptance Criteria (checkboxes)
   - Technical Notes and Priority
4. **Task Completion**: When finished, move the task file from `todo_tasks/` to `complete_tasks/`

**Task File Template**: Title, Description, Requirements, Acceptance Criteria (checkboxes), Technical Notes, Priority (Low/Medium/High)

### Path Aliases
All paths are configured to point to the `/src/` directory:
- `@/` points to `./src/`
- `@/components/*` points to `./src/components/*`
- `@/lib/*` points to `./src/lib/*`
- `@/hooks/*` points to `./src/hooks/*`
- `@/features/*` points to `./src/features/*`

### City Location Management System

**Architecture**: Locale-independent slug-based system with translation layer

**🎯 Key Principles:**
- **Database Storage**: Store city slugs only (e.g., `burgas`, `sofia`, `plovdiv`)
- **Display**: Always translate slugs to localized names via `getCityLabelBySlug()`
- **Input**: Dropdown selection only (no free text input)
- **Consistency**: Same slug works across all locales for filtering and routing

**📍 Supported Cities (MVP - Top 8):**
1. Sofia (`sofia`) - 1.2M population
2. Plovdiv (`plovdiv`) - 340K
3. Varna (`varna`) - 330K
4. Burgas (`burgas`) - 200K
5. Ruse (`ruse`) - 150K
6. Stara Zagora (`stara-zagora`) - 140K
7. Pleven (`pleven`) - 120K
8. Sliven (`sliven`) - 90K

**Usage**: `getCityLabelBySlug(slug, t)` for display, `getCitiesWithLabels(t)` for dropdowns. Translation keys in `/src/lib/intl/[lang]/common.ts` as `cities.sofia`, `cities.burgas`, etc.

**Rules**: NEVER allow free text city input. ALWAYS use `getCityLabelBySlug()` for display. NEVER show raw slugs to users.

### Category & Subcategory System

> **Quick Reference**: For complete documentation, see [README.md - Category & Subcategory System](#category--subcategory-system)

**Architecture**: Hierarchical system with **26 main categories** and **135 subcategories**, using locale-independent slugs with i18next translation layer

**🎯 Key Principles:**
- **Database Storage**: Store category/subcategory slugs only (e.g., `handyman`, `plumber`)
- **Display**: Always translate slugs via `getCategoryLabelBySlug()` or `t('categories.sub.plumber')`
- **Input**: Dropdown/chip selection only (no free text input)
- **Consistency**: Same slug works across all locales for filtering and routing

**📁 Data Locations:**
- **Translations**: `/src/lib/intl/[lang]/categories.ts` (EN/BG/RU)
- **Visuals**: `/src/lib/constants/category-visuals.ts` (icons & colors)
- **Utilities**: `/src/features/categories/` (helper functions)

**Usage**: `getCategoryLabelBySlug(slug, t)` for display, `getMainCategoriesWithSubcategories(t)` for pickers.

**26 main categories** (e.g., `handyman`, `cleaning-services`, `web-development`) with **135 subcategories** (e.g., `plumber`, `electrician`, `house-cleaning`). Full list in `/src/lib/intl/en/categories.ts`.

**Rules**: NEVER store translation keys in DB (`plumber` not `categories.sub.plumber`). ALWAYS use utility functions for display. NEVER allow free text category input.

### Supabase Client Usage

```typescript
// Client Components: import { createClient } from '@/lib/supabase/client'
// Server Components: import { createClient } from '@/lib/supabase/server'
```

Generate types: `npx supabase gen types typescript --linked > src/types/supabase.ts`
Full setup guide: `/docs/infrastructure/supabase-vercel-setup.md`

### Component Guidelines

- **Radix UI** (shadcn/ui) in `/src/components/ui/`: Forms, Dialogs, Data Tables, complex interactions
- **NextUI** (`@nextui-org/react`): Cards, Buttons, Navigation, Dropdowns, Images, Avatars, Chips
- Both work together seamlessly. NextUI provider in `/app/providers.tsx`
- **Theme**: Primary `#0066CC`, Secondary `#00A86B` (configured in `tailwind.config.ts`)

### Navigation Architecture

Clear separation of customer and professional contexts:

| Role | Route | Purpose |
|------|-------|---------|
| Customer | `/tasks/posted` | Manage created tasks (filter by status) |
| Professional | `/browse-tasks` | Discover available tasks |
| Professional | `/tasks/applications` | Track submitted applications |
| Professional | `/tasks/work` | Active work dashboard |

All pages use NextUI Tabs with badge counts. Translation keys: `postedTasks.*`, `myApplications.*`, `myWork.*`

### Task Detail Page (`/app/[lang]/tasks/[id]/`)

Server component (`page.tsx`) for data fetching/SEO + client component (`task-detail-content.tsx`) for interactivity. Key sub-components: `TaskGallery`, `TaskActions`, `PrivacyToggle`, `TaskActivity` (author-only, currently hidden - needs proper auth verification).

### Internationalization

Modular translation chunks in `/src/lib/intl/{en,bg,ru}/` with barrel exports. Each locale has: `common.ts`, `navigation.ts`, `landing.ts`, `tasks.ts`, `professionals.ts`, `applications.ts`, `profile.ts`, `categories.ts`, `auth.ts`, `task-completion.ts`, `notifications.ts`.

**Key files**: Config (`/src/lib/intl/config.ts`), LocaleLink (`/components/locale-link.tsx`), Constants (`/lib/constants/locales.ts`)

**Adding translations**: Add key to appropriate chunk in all languages, then validate: `npx tsx src/lib/intl/validate-translations.ts`

**Language priority**: Cookie → Browser → English fallback. Middleware in `/middleware.ts` with early returns for performance.

### Authentication (Supabase Auth)

**Providers**: Email/Password, Google OAuth, Facebook Login, Phone (SMS)
**OAuth callback**: `/app/auth/callback/route.ts`
**Session refresh**: Automatic via `/middleware.ts`
**Docs**: `/docs/infrastructure/supabase-client-setup.md`

### Deep Registration Links (Campaign Link Generator)

**What**: Pre-filled registration URLs for advertising campaigns (Facebook, Instagram, social media). When the user asks to "generate a deep registration link" or "generate a deep link", generate a Trudify registration URL with pre-filled fields.

**Production Domain**: `https://trudify.com`

**URL Format**:
```
https://trudify.com/{lang}/register?intent=professional&title={title}&categories={categories}&city={city}
```

**Parameters**:
| Parameter | Required | Description |
|-----------|----------|-------------|
| `lang` (path) | Yes | `en`, `bg`, `ru` - match the post/audience language |
| `intent` | Yes | `professional` for service providers, `customer` for clients |
| `title` | No | Professional title in the audience's language (free text, URL-encoded) |
| `categories` | No | Comma-separated category slugs (always English slugs) |
| `city` | No | City slug (always English slug) |

**How to generate from a Facebook/social media post**:

1. **Detect language** from the post text → set `lang` (`bg` for Bulgarian, `ru` for Russian, `en` for English)
2. **Determine intent**:
   - Post is someone **looking for a professional** (e.g., "Looking for a plumber") → `intent=customer` (no title/categories needed, just lang and city if mentioned)
   - Post is someone **offering services** (e.g., "I'm an electrician in Sofia") → `intent=professional` with `title`, `categories`, `city`
3. **Extract professional title** from the post in the original language (e.g., "Електротехник", "Сантехник")
4. **Map to category slugs** by matching the profession to the closest subcategory slugs from the list below
5. **Extract city** if mentioned and map to city slug

**Available City Slugs**: `sofia`, `plovdiv`, `varna`, `burgas`, `ruse`, `stara-zagora`, `pleven`, `sliven`

**Common Category Slugs** (full list in `/src/lib/intl/en/categories.ts`):
- Home repair: `plumber`, `electrician`, `locksmith`, `carpenter`, `painter`, `tiler`, `welder`, `roofer`, `general-handyman`
- Appliances: `phone-repair`, `computer-help`, `ac-repair`, `washing-machine-repair`, `tv-repair`
- Cleaning: `house-cleaning`, `office-cleaning`, `window-cleaning`, `post-construction-cleaning`
- Pets: `dog-walking`, `pet-sitting`, `pet-grooming`, `veterinary-care`
- Personal: `babysitter`, `elderly-care`, `personal-assistant`
- Transport: `courier`, `moving`, `furniture-delivery`
- Digital: `web-developer`, `copywriting`, `seo-specialist`, `smm-specialist`
- Creative: `photo`, `video`, `graphic-designer`, `interior-designer`
- Education: `math-tutor`, `language-tutor`, `music-teacher`
- Fitness: `fitness-trainer`, `yoga-instructor`
- Construction: `demolition`, `foundation-work`, `masonry`, `insulation`
- Finishing: `plastering`, `flooring`, `drywall`, `facade-work`

**Examples**:

Post in Bulgarian: "Търся електротехник в София за ремонт на апартамент"
→ Customer looking for an electrician in Sofia
```
https://trudify.com/bg/register?intent=customer&city=sofia
```

Post in Russian: "Я сантехник в Бургасе, ищу заказы"
→ Professional offering plumbing in Burgas
```
https://trudify.com/ru/register?intent=professional&title=Сантехник&categories=plumber&city=burgas
```

Post in Bulgarian: "Предлагам услуги по почистване на домове и офиси в Пловдив"
→ Professional offering cleaning in Plovdiv
```
https://trudify.com/bg/register?intent=professional&title=Почистване&categories=house-cleaning,office-cleaning&city=plovdiv
```

**Guidelines**:
- Use 1-3 most relevant category slugs (don't overload)
- Title should be in the post's language, short and professional
- Always match `lang` to the post language
- If city is not mentioned, omit the `city` parameter
- For customer intent, title and categories are usually not needed

### Telegram Authentication & Notifications

**Status**: ✅ Fully implemented and ready for production

**Product Details**: See `/PRD.md` Section 3.1 for complete authentication flows and notification system

**Implementation Guide:**

**Usage**: `sendTemplatedNotification(userId, templateName, taskTitle, professionalName)` or `sendTelegramNotification({userId, message, notificationType, parseMode})`

**Templates** (in `/src/lib/services/telegram-notification.ts`): `welcome`, `applicationReceived`, `applicationAccepted`, `applicationRejected`, `messageReceived`, `taskCompleted`, `paymentReceived`

**Key files**: Auth (`/src/lib/auth/telegram.ts`), Notifications (`/src/lib/services/telegram-notification.ts`), API endpoints (`/src/app/api/auth/telegram/`, `/src/app/api/notifications/telegram/`)

**Env vars**: `TG_BOT_TOKEN`, `TG_BOT_USERNAME=Trudify_bot`

### Deployment

**Platform**: Vercel with Supabase integration. **Env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only). RLS policies enforce data access.

### Code Quality & Maintenance

#### TODO Comment Convention
- Use `@todo` comments to mark future refactoring tasks and technical debt
- Format: `@todo CATEGORY: Description of work needed`
- Categories: REFACTORING, MIGRATION, FEATURE, BUG, PERFORMANCE, etc.
- **Always check for `@todo` comments** when working in a file or feature
- Examples:
  ```typescript
  // @todo REFACTORING: Extract PopularCategoriesSection to reduce component size
  // @todo MIGRATION: Convert Express API routes to Next.js API routes
  // @todo FEATURE: Add user authentication flow
  ```

#### ESLint & Unused Code Policy

**CRITICAL: DELETE unused code, don't prefix with underscores.** Remove unused imports, variables, and parameters entirely. Only use underscore prefix when removing would break a required function signature contract (rare).

#### CSS Performance Guidelines

**NEVER use `backdrop-blur`** - causes flickering in Chrome on modals/overlays/drawers. Use solid backgrounds with opacity instead: `bg-black/80` or `bg-white/95`.

#### Critical CSS for Web Vitals

~1.5KB of critical CSS inlined in `/src/app/layout.tsx` (`criticalCSS` constant) for LCP/FCP optimization. Only update when adding **new Tailwind classes to above-the-fold content**. Test with `npm run critical-css`.

#### Large Component Refactoring Progress
- **✅ browse-tasks-page.tsx** (423 → 103 lines) - 75% reduction via HeroSection, SearchFiltersSection, ResultsSection
- **✅ task-activity.tsx** (292 → 167 lines) - 43% reduction via ApplicationsSection, QuestionsSection
- **✅ landing-page.tsx** (831 → 581 lines) - 30% reduction via HeroSection, FeaturedTasksSection
- **⏸️ sidebar.tsx** (771 lines) - Skipped (shadcn/ui design system component)
- **🎯 professionals-page.tsx** (730 lines) → Target: 300 lines via section extraction (next priority)