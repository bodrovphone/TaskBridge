# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskBridge (branded as "Trudify") is a Bulgarian freelance platform that connects customers with verified professionals for various services. It's a full-stack TypeScript application built with Next.js App Router.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: 
  - **Radix UI** (via shadcn/ui) - Headless, accessible components
  - **NextUI** - Modern React UI library with beautiful components
  - Both libraries work together, use NextUI for new components and keep Radix for existing ones
- **Styling**: Tailwind CSS
- **Routing**: Next.js App Router
- **State Management**: TanStack Query (React Query)
- **Authentication**: Currently disabled (no auth required)
- **Internationalization**: Smart multilingual routing with i18next
  - **URL Structure**: `/en/`, `/bg/`, `/ru/` for SEO-friendly locales
  - **Smart Detection**: Cookie preference → Browser language → English default
  - **Cost-Optimized**: Middleware with early returns (minimal execution for returning users)
- **Animations**: Framer Motion (included with NextUI)
- **Deployment**: Configured for Vercel deployment

## Key Commands

```bash
# Building
npm run build           # Build Next.js application for production  
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking

# Database
npm run db:push         # Push schema changes to database using Drizzle
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
│   │   ├── browse-tasks/  # Browse available tasks
│   │   ├── create-task/   # Create new task
│   │   ├── professionals/ # Professionals directory
│   │   └── profile/       # User profile
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
├── database/            # 🗃️ Database schema and configurations
│   └── schema.ts        # Database schema with Drizzle ORM
├── lib/                 # 🔧 Global utilities and configurations
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

### Database Schema
The application has four main entities:
- **users** - Customer and professional profiles with verification fields
- **tasks** - Service requests with location, budget, and status tracking
- **applications** - Professional bids on tasks
- **reviews** - Bidirectional rating system

Key features include:
- User verification (phone, VAT)
- Task categorization with Bulgarian service categories
- Location-based matching (city/neighborhood)
- Professional portfolio and rating systems

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

## Development Notes

### Path Aliases
All paths are configured to point to the `/src/` directory:
- `@/` points to `./src/`
- `@/components/*` points to `./src/components/*`
- `@/lib/*` points to `./src/lib/*`
- `@/hooks/*` points to `./src/hooks/*`
- `@/features/*` points to `./src/features/*`
- `@/database/*` points to `./src/database/*`

### Database Operations
- Use Drizzle ORM for all database operations
- Schema is defined in `/src/database/schema.ts` with Zod validation
- Run `npm run db:push` after schema changes

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

#### Implementation Details
- **LocaleLink Component** (`/components/locale-link.tsx`) - Automatically prefixes internal links with current locale
- **Constants** (`/lib/constants/locales.ts`) - Centralized locale configuration, no hardcoded strings
- **Middleware** (`/middleware.ts`) - Smart detection: Cookie → Browser → English default, optimized for minimal cost
- **Language Priority**: User manual selection (highest) → Browser detection → English fallback
- **Performance**: 90% of requests skip middleware via early returns for existing locale URLs

### Authentication
- **Currently disabled** - no authentication required to access pages
- Authentication system was removed during Next.js migration
- Pages are publicly accessible

### API Migration Status
- **Express API routes need migration** to Next.js API routes
- Original Express routes were in `/server/routes.ts` (now deleted)
- API routes should be created in `/app/api/` directory

### Deployment & Environment
- Configured for Vercel deployment
- Database connection via `DATABASE_URL` environment variable
- Static assets served by Next.js

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

#### Large Component Refactoring Progress
- **✅ browse-tasks-page.tsx** (423 → 103 lines) - 75% reduction via HeroSection, SearchFiltersSection, ResultsSection
- **✅ task-activity.tsx** (292 → 167 lines) - 43% reduction via ApplicationsSection, QuestionsSection
- **✅ landing-page.tsx** (831 → 581 lines) - 30% reduction via HeroSection, FeaturedTasksSection
- **⏸️ sidebar.tsx** (771 lines) - Skipped (shadcn/ui design system component)
- **🎯 professionals-page.tsx** (730 lines) → Target: 300 lines via section extraction (next priority)