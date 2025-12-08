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

## Development Workflow

**IMPORTANT: Do NOT run `npm run build` after making changes**

- ❌ **NEVER** run `npm run build` automatically after code changes
- ❌ Running builds breaks the local development server
- ✅ The user has `npm run dev` running - changes are hot-reloaded automatically
- ✅ TypeScript errors will show in the terminal and browser during development
- ✅ Only run builds if explicitly requested by the user

**Rationale:**
- Next.js dev server provides instant feedback with hot reload
- Production builds are slow and interrupt the development flow
- Running builds kills the local server and disrupts the user's workflow
- TypeScript type checking happens automatically in the IDE and dev server

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

### Architecture Benefits
- **🎯 Feature Cohesion** - Each business domain (professionals, tasks, etc.) is self-contained
- **🧩 Clear Component Hierarchy** - UI primitives → Shared components → Feature-specific components
- **📦 Clean Imports** - Barrel exports enable simple import patterns
- **🔧 Separation of Concerns** - Global utilities separate from feature-specific logic
- **⚡ Next.js Compatibility** - Full support for App Router with `/src/` directory

### Database Architecture (Supabase PostgreSQL)

**Infrastructure**: Supabase-hosted PostgreSQL with Row Level Security (RLS)

The application has seven main tables:
- **users** - Customer and professional profiles with verification fields
- **tasks** - Service requests with location, budget, and status tracking
- **applications** - Professional bids on tasks
- **reviews** - Bidirectional rating system
- **messages** - Task-specific communication between users
- **notifications** - User notification system
- **safety_reports** - User safety reporting and moderation

**Key Features**:
- User verification (phone, email, VAT number via Supabase Auth)
- Task categorization with Bulgarian service categories
- Location-based matching (city/neighborhood + PostGIS for future features)
- Professional portfolio and rating systems
- Real-time updates via Supabase Realtime
- Row Level Security (RLS) for data privacy
- File storage via Supabase Storage (avatars, task images, documents)

**Database Schema Documentation**: See `/docs/infrastructure/supabase-vercel-setup.md` for complete schema, RLS policies, and setup instructions.

### Feature-Based Architecture
Each business domain is organized as a self-contained feature with all related code co-located:

#### **Feature Structure**
```
/src/features/[feature]/
├── components/         # Feature-specific UI components
├── lib/               # Feature data, types, and utilities  
├── hooks/             # Feature-specific custom hooks (optional)
└── index.ts           # Barrel exports for clean imports
```

#### **Current Features**
- **professionals** - Complete professionals feature (listings, filtering, cards, data)
- **tasks** - Task details, actions, gallery, and activity management *(to be migrated)*
- **browse-tasks** - Task browsing and search functionality *(to be migrated)*

#### **Migration Benefits**
- **🎯 Complete Feature Isolation** - All feature code lives together
- **📦 Barrel Exports** - Clean, simple import patterns
- **🔧 Better Maintainability** - Changes stay within feature boundaries
- **🚀 Improved Performance** - Feature-based code splitting
- **👥 Team Scalability** - Different teams can own different features

#### **New Import Patterns**
```typescript
// ✅ Clean feature imports via barrel exports
import { ProfessionalsPage, ProfessionalCard } from '@/features/professionals'
import { TaskDetailPage, TaskActions } from '@/features/tasks'

// ✅ Shared components from organized directories  
import { Button, Card } from '@/components/ui'
import { Header, Footer } from '@/components/common'

// ✅ Global utilities and constants
import { formatDate } from '@/lib/utils'
import { SUPPORTED_LOCALES } from '@/lib/constants/locales'
```

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

**Usage:**
```typescript
// In professional profile edit form
import { PortfolioGalleryManager } from './portfolio-gallery-manager'

<PortfolioGalleryManager
  items={profile.gallery || []}
  onChange={handleGalleryChange}
  maxItems={5}
/>

// In professional detail page (display only)
import PortfolioGallery from '@/features/professionals/components/sections/portfolio-gallery'

<PortfolioGallery gallery={professional.gallery} />
```

**Future Enhancements (Post-MVP):**
- Social media links for premium professionals
- Direct file upload to Supabase Storage (currently URL-based)
- Video support

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

**📝 Task File Template:**
```markdown
# Task Title

## Task Description
Brief description of what needs to be done

## Requirements
- Bullet point requirements
- Keep it simple for MVP

## Acceptance Criteria
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2

## Technical Notes
Implementation notes and considerations

## Priority
Low/Medium/High
```

**Benefits:**
- Clear task tracking and progress visibility
- Documentation of decisions and requirements
- Historical record of completed work
- Easy to reference and update task scope

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

**🔧 Implementation:**

```typescript
// Import the helper function
import { getCityLabelBySlug } from '@/features/cities'

// Display city (translated to user's locale)
<span>{getCityLabelBySlug(task.city, t)}</span>

// Dropdown input (stores slugs)
import { getCitiesWithLabels } from '@/features/cities'
const cities = useMemo(() => getCitiesWithLabels(t), [t])

<Select
  selectedKeys={field.state.value ? [field.state.value] : []}
  onSelectionChange={(keys) => {
    const selectedCity = Array.from(keys)[0] as string
    field.handleChange(selectedCity)
  }}
>
  {cities.map((city) => (
    <SelectItem key={city.slug} value={city.slug}>
      {city.label}
    </SelectItem>
  ))}
</Select>
```

**✅ Benefits:**
- Works identically across all locales (EN/BG/RU)
- URL filtering always consistent: `/browse-tasks?city=burgas`
- No locale-specific database queries
- Easy to add new cities (just update translations)
- Database CHECK constraints prevent invalid values

**📝 Translation Keys:**
All city names stored in `/src/lib/intl/[lang]/common.ts`:
```typescript
'cities.sofia': 'Sofia',      // EN: Sofia, BG: София, RU: София
'cities.burgas': 'Burgas',    // EN: Burgas, BG: Бургас, RU: Бургас
// ... etc
```

**⚠️ IMPORTANT:**
- NEVER allow free text input for city selection
- ALWAYS use `getCityLabelBySlug()` when displaying city names
- NEVER display raw slugs to users

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

**🔧 Quick Usage:**

```typescript
import { useTranslation } from 'react-i18next'
import { getCategoryLabelBySlug, getMainCategoriesWithSubcategories } from '@/features/categories'

// Display category label
const { t } = useTranslation()
const label = getCategoryLabelBySlug('plumber', t)  // Returns: "Plumber" / "Водопроводчик"

// Get all categories for picker
const categories = useMemo(() =>
  getMainCategoriesWithSubcategories(t)
, [t])

// Store in form (create-task form example)
form.setFieldValue('category', 'handyman')      // Main category slug
form.setFieldValue('subcategory', 'plumber')    // Subcategory slug
```

**📋 Main Categories (26)**:
`handyman`, `appliance-repair`, `finishing-work`, `construction-work`, `furniture-work`, `cleaning-services`, `logistics`, `household-services`, `pet-services`, `beauty-health`, `auto-repair`, `courier-services`, `digital-marketing`, `ai-services`, `online-advertising`, `advertising-distribution`, `web-development`, `design`, `photo-video`, `tutoring`, `business-services`, `translation-services`, `trainer-services`, `event-planning`, `volunteer-help`, `online-work`

**🏷️ Subcategories (135)**:
Examples: `plumber`, `electrician`, `locksmith`, `carpenter`, `phone-repair`, `computer-help`, `web-developer`, `copywriting`, `dog-walking`, `house-cleaning`

**✅ Benefits:**
- Locale-independent database queries
- Consistent URL filtering: `/browse-tasks?category=plumber`
- Easy translation updates without touching database
- Type-safe category validation

**⚠️ IMPORTANT:**
- NEVER store translation keys in database (`categories.sub.plumber` ❌, `plumber` ✅)
- ALWAYS use utility functions for display (never show raw slugs to users)
- NEVER allow free text category input (dropdown/chip selection only)

### Database & Backend Operations (Supabase)

**Infrastructure Setup**: See `/docs/infrastructure/supabase-vercel-setup.md` for complete guide

**Client Usage**:
```typescript
// Client Components (browser)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server Components & API Routes
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

**Key Operations**:
- **Queries**: Use Supabase client for type-safe database queries
- **Mutations**: All writes go through Supabase client with RLS validation
- **Auth**: Managed via Supabase Auth (Google, Facebook, Phone)
- **Storage**: File uploads via Supabase Storage buckets
- **Real-time**: Subscribe to table changes via Supabase Realtime

**Schema Management**:
- Database schema defined in Supabase Dashboard SQL Editor
- Apply migrations via Supabase CLI or Dashboard
- Generate TypeScript types: `npx supabase gen types typescript --linked > src/types/supabase.ts`

**Security**:
- Row Level Security (RLS) policies enforce data access rules
- Service role key for admin operations (server-only, keep secret!)
- Anon key for client operations (safe to expose)

### Component Development Architecture

**Updated `/src/` Component Structure:**
```
/src/
├── features/              # 🎯 Self-contained business domains
│   └── professionals/     # Complete feature with components, data, hooks
├── components/           # 🧩 Shared UI components
│   ├── ui/              # Design system primitives (shadcn/ui)
│   └── common/          # Layout components (Header, Footer, etc.)
└── app/                 # ⚡ Next.js pages and routing
```

**Component Guidelines:**
- **UI components use both Radix UI and NextUI**:
  - **Radix UI** (via shadcn/ui): Base components in `/src/components/ui/` - Dialog, Select, Form fields
  - **NextUI**: Modern components - Card, Button, Input - beautiful out-of-box
  - Both work together seamlessly with Tailwind CSS
- **NextUI theming**: Configured in `tailwind.config.ts` with custom primary/secondary colors
- **Animation**: NextUI includes Framer Motion for smooth animations
- **Feature Components**: Feature-specific UI lives in `/src/features/[feature]/components/`

### NextUI Integration
- **Provider**: Wrapped in `NextUIProvider` in `/app/providers.tsx`
- **Theme colors**: 
  - Primary: `#0066CC` (blue)
  - Secondary: `#00A86B` (green)
- **Available components**: Card, Button, Input, Modal, Navbar, etc.
- **Usage pattern**: Import from `@nextui-org/react`

### Component Migration Strategy
**✅ Migrated to NextUI:**
- **Header/Navbar** - Uses NextUI Navbar with responsive mobile menu
- **TaskCard** - Uses NextUI Card, Image, Chip, Avatar, and Button components
- **CategoryCard** - Uses NextUI Card with press interactions
- **LanguageSwitcher** - Uses NextUI Dropdown with selection states

**⚠️ Keep with Radix UI:**
- **Form components** in `/components/pages/create-task.tsx` - Complex validation
- **Browse/filter components** in `/components/pages/browse-tasks.tsx` - Complex interactions  
- **All `/components/ui/` shadcn components** - Form fields, dialogs, sheets, etc.

**📋 Migration Guidelines:**
- **Use NextUI for**: Cards, Buttons, Navigation, Simple Dropdowns, Images, Avatars, Chips
- **Keep Radix UI for**: Forms, Complex Dialogs, Data Tables, Advanced Interactions
- Both libraries work together seamlessly in the same project

### Navigation Architecture

**Design Philosophy**: Clear separation of customer and professional contexts to eliminate confusion in dual-role users.

#### Route Structure

**Customer Routes:**
- `/tasks/posted` - View and manage tasks the user created
  - Filter by status: All, Open, In Progress, Completed, Cancelled
  - View applications received on each task
  - Click through to task details and application management

**Professional Routes:**
- `/browse-tasks` - Discover and browse available tasks (existing)
- `/tasks/applications` - View all applications submitted to tasks
  - Filter by status: All, Pending, Accepted, Rejected, Withdrawn
  - Track application status and responses
  - Quick actions to view task or withdraw application
- `/tasks/work` - Manage active work and professional dashboard
  - **In Progress** (default) - Active accepted applications
  - **Pending Confirmations** - Tasks awaiting confirmation
  - **Completed** - Historical work record

#### Navigation Menu Organization

**Header User Avatar Dropdown** - Contextual sections:
```
Profile (standalone)

For Customers:
- My Posted Tasks → /tasks/posted

For Professionals:
- Browse Tasks → /browse-tasks
- My Applications → /tasks/applications
- My Work → /tasks/work

General:
- Settings
- Help
```

**Profile Page Quick Actions:**
- "My Posted Tasks" button → `/tasks/posted`
- "My Work" button → `/tasks/work`

**Benefits:**
- ✅ No confusion between customer and professional roles
- ✅ Clear URL semantics (`/tasks/posted` vs `/tasks/applications` vs `/tasks/work`)
- ✅ Each route has single, focused purpose
- ✅ Scalable for future features
- ✅ Mobile-responsive with section headers
- ✅ Full i18n support (EN/BG/RU)

**Implementation Details:**
- All pages use NextUI Tabs for filters with badge counts
- Mock data included for development
- Empty states customized for each page/filter
- Translation keys namespaced: `postedTasks.*`, `myApplications.*`, `myWork.*`
- Comprehensive task documentation: `/todo_tasks/09-navigation-architecture-refactor.md`

### Task Detail Page (`/app/[lang]/tasks/[id]/`)
The task detail page features a comprehensive view of individual tasks with advanced functionality:

**🏗️ Architecture:**
- **Server Component**: Main page (`page.tsx`) handles data fetching and SEO optimization
- **Client Component**: `task-detail-content.tsx` handles translations and interactivity
- **Modular Components**: Split into focused, reusable components

**🔐 Privacy & Authentication Features:**
- **Privacy Toggle**: (`privacy-toggle.tsx`) - Automatically hides sensitive client information for non-authenticated users
- **Authentication Slide-over**: (`auth-slide-over.tsx`) - Portal-based slide-over with Google/Facebook login options
- **Mock Authentication**: (`/hooks/use-auth.ts`) - Development-ready auth system for testing

**🎯 Key Components:**
- **TaskGallery**: Image carousel with navigation
- **TaskActions**: Apply/Question buttons with authentication flow
- **PrivacyToggle**: Client information with conditional visibility
- **TaskActivity**: (Hidden) - Applications and questions management for task authors

**💬 TaskActivity Component (Author-Only):**
- **Purpose**: Allows task creators to manage applications and respond to questions
- **Features**: Tabbed interface for Applications/Questions, Accept/Reject functionality, messaging system
- **Status**: Currently hidden - requires proper author verification logic
- **Location**: `/app/[lang]/tasks/[id]/components/task-activity.tsx`
- **Mock Data**: Includes sample applications and questions for development

**🌐 Internationalization:**
- Full i18n support across all components (EN/BG/RU)
- Server-side rendering maintained for SEO benefits
- Dynamic content properly translated

### Internationalization
- **Smart multilingual routing** with URL-based locales (`/en/`, `/bg/`, `/ru/`)
- **Production-ready middleware** with cost optimization and early returns
- **Type-safe utilities** in `/lib/utils/` for locale detection and URL manipulation
- **User preference persistence** via cookies and localStorage
- **Error boundaries** and graceful fallbacks for i18n initialization
- **Modular translation resources** - Separated language files for better maintainability

#### Translation Resources Structure (Modular Chunks)
```
/src/lib/intl/
├── config.ts          # i18n configuration and initialization
├── types.ts           # TypeScript type definitions for translations
├── validate-translations.ts  # Validation script (npm run validate:translations)
├── en/                # English translations (1,203 keys total)
│   ├── index.ts       # Barrel export combining all chunks
│   ├── common.ts      # ~52 keys - Common UI terms, messages, locations
│   ├── navigation.ts  # ~31 keys - Nav menu, header, footer
│   ├── landing.ts     # ~124 keys - Landing page content
│   ├── tasks.ts       # ~190 keys - Browse, create, task cards
│   ├── professionals.ts  # ~129 keys - Professional listings & profiles
│   ├── applications.ts   # ~163 keys - Application management
│   ├── profile.ts     # ~166 keys - User profiles & settings
│   ├── categories.ts  # ~245 keys - 26 main + 135 subcategories
│   ├── auth.ts        # ~30 keys - Authentication
│   ├── task-completion.ts  # ~72 keys - Task status & completion
│   └── notifications.ts    # ~68 keys - Notifications & posted tasks
├── bg/                # Bulgarian translations (same structure)
└── ru/                # Russian translations (same structure)
```

**Benefits of Chunked Structure:**
- ✅ **Reduced Token Usage** - Edit only relevant chunks instead of 1,400+ line files
- ✅ **Better Maintainability** - Easy to find and edit specific translations
- ✅ **Fewer Merge Conflicts** - Teams can work on different features simultaneously
- ✅ **Clear Organization** - Translations organized by feature/domain
- ✅ **Type Safety** - TypeScript ensures all languages have identical keys
- ✅ **Validation** - Automated script checks key consistency across languages

#### Implementation Details
- **Translation Config** (`/src/lib/intl/config.ts`) - Centralized i18next setup with modular barrel exports
- **Barrel Exports** (`/src/lib/intl/[lang]/index.ts`) - Combines all chunks into single object
- **LocaleLink Component** (`/components/locale-link.tsx`) - Automatically prefixes internal links with current locale
- **Constants** (`/lib/constants/locales.ts`) - Centralized locale configuration, no hardcoded strings
- **Middleware** (`/middleware.ts`) - Smart detection: Cookie → Browser → English default, optimized for minimal cost
- **Language Priority**: User manual selection (highest) → Browser detection → English fallback
- **Performance**: 90% of requests skip middleware via early returns for existing locale URLs

#### Working with Translations
```bash
# Validate all translations have same keys
npx tsx src/lib/intl/validate-translations.ts

# Add a new translation key
# 1. Find the appropriate chunk (e.g., tasks.ts for task-related keys)
# 2. Add the key to all 3 languages (en, bg, ru) in the same chunk
# 3. Run validation to ensure consistency
```

#### Translation Key Structure
Translation keys follow a hierarchical namespace pattern organized by chunks:
- **common.ts**: Global terms (welcome, login, save, language.*, locations.*, message.*, error.*)
- **navigation.ts**: Navigation & footer (nav.*, footer.*)
- **landing.ts**: Landing page (landing.*)
- **tasks.ts**: Task management (tasks.*, browseTasks.*, task.*, createTask.*, taskCard.*)
- **professionals.ts**: Professionals (professionals.*, professionalDetail.*)
- **applications.ts**: Applications (applications.*, myApplications.*, application.*, acceptApplication.*, rejectApplication.*)
- **profile.ts**: User profiles (profile.*)
- **categories.ts**: Service categories (categories.*, categoryGroups.*)
- **auth.ts**: Authentication (auth.*)
- **task-completion.ts**: Task status & completion (taskCompletion.*, taskStatus.*)
- **notifications.ts**: Notifications & detail pages (notifications.*, taskDetail.*, postedTasks.*)

### Authentication (Supabase Auth)

**Status**: Supabase Auth infrastructure configured, ready for implementation

**Available Providers**:
- **Email/Password**: Built-in (enabled by default)
- **Google OAuth**: Configure in Supabase Dashboard → Authentication → Providers
- **Facebook Login**: Configure in Supabase Dashboard → Authentication → Providers
- **Phone (SMS)**: Configure with Twilio/Vonage integration

**Implementation**:
```typescript
// Client-side auth example
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Sign up
await supabase.auth.signUp({ email, password })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${location.origin}/auth/callback` }
})

// Sign out
await supabase.auth.signOut()
```

**OAuth Callback**: `/app/auth/callback/route.ts` handles OAuth redirects

**Middleware**: Automatically refreshes user sessions via `/middleware.ts`

**User Context**: Access current user in Server Components:
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Documentation**: See `/docs/infrastructure/supabase-client-setup.md` for auth implementation examples

### Telegram Authentication & Notifications

**Status**: ✅ Fully implemented and ready for production

**Product Details**: See `/PRD.md` Section 3.1 for complete authentication flows and notification system

**Implementation Guide:**

#### Quick Start - Sending Notifications

```typescript
// Import notification service
import { sendTemplatedNotification } from '@/lib/services/telegram-notification';

// Send a notification using pre-built template
await sendTemplatedNotification(
  userId,
  'applicationReceived',  // template name
  'Fix My Laptop',        // taskTitle
  'Ivan Petrov'           // professionalName
);

// Or send custom notification
import { sendTelegramNotification } from '@/lib/services/telegram-notification';

await sendTelegramNotification({
  userId: user.id,
  message: '<b>Custom notification!</b>\n\nYour task has an update.',
  notificationType: 'task_update',
  parseMode: 'HTML'
});
```

#### Database Fields (users table)

```sql
telegram_id BIGINT             -- Telegram user ID for notifications
telegram_username TEXT         -- @username
telegram_first_name TEXT       -- User's first name
telegram_last_name TEXT        -- User's last name
telegram_photo_url TEXT        -- Profile photo URL
preferred_notification_channel -- telegram/email/sms/viber
```

#### Available Notification Templates

See `/src/lib/services/telegram-notification.ts` for all templates:
- `welcome`, `applicationReceived`, `applicationAccepted`, `applicationRejected`
- `messageReceived`, `taskCompleted`, `paymentReceived`

#### Key Implementation Files

- `/src/lib/auth/telegram.ts` - Auth verification utilities
- `/src/lib/services/telegram-notification.ts` - Notification service with templates
- `/src/app/api/auth/telegram/route.ts` - Authentication endpoint
- `/src/app/api/notifications/telegram/route.ts` - Notification API
- `/src/components/ui/auth-slide-over.tsx` - Login UI with Telegram button
- `/supabase/migrations/add_telegram_fields_to_users.sql` - Database schema

#### Configuration

```bash
# Required environment variables
TG_BOT_TOKEN=your_bot_token_from_botfather
TG_BOT_USERNAME=Trudify_bot

# Add to Vercel: Dashboard → Settings → Environment Variables
```

#### Testing

```bash
# Test notification delivery
npx tsx scripts/test-telegram-notification.ts <user_id>
```

**Cost Savings**: €10,000-16,000/year vs WhatsApp/Viber/SMS alternatives

### API Routes

**Status**: Ready to implement with Supabase client

**Structure**: API routes in `/app/api/` directory use Supabase for data access

**Example API Route**:
```typescript
// /app/api/tasks/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'open')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

**Security**: RLS policies automatically enforce data access rules

### Deployment & Environment

**Platform**: Vercel with Supabase integration

**Required Environment Variables**:
```bash
# Supabase (get from https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-only!
```

**Setup**:
1. Create Supabase project at https://supabase.com/dashboard
2. Apply database schema from `/docs/infrastructure/supabase-vercel-setup.md`
3. Add environment variables to Vercel project settings
4. Deploy to Vercel - environment syncs automatically

**Optional**: Use Vercel-Supabase integration for automatic env sync

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

**⚠️ CRITICAL: Delete unused code, don't prefix with underscores**

**Rule**: When fixing ESLint `no-unused-vars` warnings, **DELETE** the unused imports, variables, or parameters. Do NOT prefix them with underscores.

**Why**:
- Unused code is dead code and should be removed
- Underscore prefixes hide the problem instead of solving it
- Clean code has no unused variables

**Exceptions** (very rare):
- Interface/type definitions that must match an external API signature
- Callback parameters required by a library but not used in implementation
- When removing would break the function signature contract

**Examples:**

```typescript
// ❌ BAD: Don't prefix with underscore
const [value, _setValue] = useState()
function handleClick(_event: Event, data: Data) { }
import { Foo, _Bar } from './module'

// ✅ GOOD: Remove the unused code entirely
const [value] = useState()  // Removed setValue
function handleClick(data: Data) { }  // Removed event param
import { Foo } from './module'  // Removed Bar import

// ✅ ACCEPTABLE (rare cases): When signature must be preserved
interface ApiCallback {
  (error: Error | null, data: Data): void  // error param required by API
}
const myCallback: ApiCallback = (_error, data) => {
  // We don't use error but API requires this signature
}
```

**Action**: When you see unused variable warnings:
1. First, check if the variable is actually needed
2. If not needed, DELETE it completely
3. If it's part of a destructure, remove it from the destructure
4. If it's an import, remove it from the import statement
5. Only if removal breaks a required signature, then use underscore prefix

#### CSS Performance Guidelines

**⚠️ CRITICAL: Avoid `backdrop-blur` in Chrome**

**Issue**: The CSS `backdrop-blur` property causes severe visual flickering and performance issues in Chrome/Chromium browsers, especially on:
- Modal overlays and dialogs
- Slide-over panels and drawers
- Dropdown menus with transparent backgrounds
- Any animated or transitioning elements

**Symptoms**:
- Content behind blur flickers during animations
- White flashes when modals open/close
- Janky scrolling with blurred backgrounds
- Inconsistent rendering across Chrome versions

**Solution**:
- **NEVER use `backdrop-blur` unless absolutely critical for design**
- Use solid background colors with opacity instead: `bg-black/80` or `bg-white/95`
- If blur is required, test extensively in Chrome and provide fallbacks
- Consider using `will-change: transform` for performance hints
- Document any `backdrop-blur` usage with performance justification

**Example - Bad**:
```css
/* ❌ Causes flickering in Chrome */
.modal-overlay {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
}
```

**Example - Good**:
```css
/* ✅ Smooth and performant */
.modal-overlay {
  background: rgba(0, 0, 0, 0.8);  /* Solid opacity, no blur */
}
```

**Related Components with Issues**:
- Notification center slide-over (removed `backdrop-blur-sm`)
- Modal dialogs (using solid backgrounds)
- Authentication slide-over (solid backgrounds recommended)

**Testing Checklist**:
- [ ] Test all modals/overlays in Chrome (not just Safari/Firefox)
- [ ] Verify smooth open/close animations without flicker
- [ ] Check background elements don't flash white
- [ ] Ensure mobile Chrome performance is acceptable

#### Large Component Refactoring Progress
- **✅ browse-tasks-page.tsx** (423 → 103 lines) - 75% reduction via HeroSection, SearchFiltersSection, ResultsSection
- **✅ task-activity.tsx** (292 → 167 lines) - 43% reduction via ApplicationsSection, QuestionsSection
- **✅ landing-page.tsx** (831 → 581 lines) - 30% reduction via HeroSection, FeaturedTasksSection
- **⏸️ sidebar.tsx** (771 lines) - Skipped (shadcn/ui design system component)
- **🎯 professionals-page.tsx** (730 lines) → Target: 300 lines via section extraction (next priority)