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
```

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

### 1. Customer Journey: Finding and Hiring a Professional

```mermaid
graph TD
    A[Landing Page] --> B{User Intent}
    B -->|Browse Tasks| C[Browse Tasks Page]
    B -->|Find Professional| D[Professionals Directory]

    C --> E[Task Detail Page]
    E --> F{Action}
    F -->|Apply| G[Auth Prompt]
    F -->|Ask Question| G
    G --> H[Login/Register]
    H --> I[Submit Application]

    D --> J[Professional Detail]
    J --> K[Contact Professional]
    K --> G
```

### 2. Professional Journey: Finding Work

```mermaid
graph TD
    A[Landing Page] --> B[Browse Tasks]
    B --> C[Filter by Category/Location]
    C --> D[View Task Details]
    D --> E{Interested?}
    E -->|Yes| F[Click Apply]
    E -->|Questions| G[Ask Question]

    F --> H{Authenticated?}
    G --> H
    H -->|No| I[Auth Slide-over]
    H -->|Yes| J[Submit Application]

    I --> K[Login with Google/Facebook]
    K --> J
    J --> L[Application Submitted]
```

### 3. Task Creator Journey: Posting a Job

```mermaid
graph TD
    A[Landing Page] --> B[Create Task Button]
    B --> C{Authenticated?}
    C -->|No| D[Auth Prompt]
    C -->|Yes| E[Create Task Form]

    D --> F[Login/Register]
    F --> E

    E --> G[Step 1: Category & Title]
    G --> H[Step 2: Description & Details]
    H --> I[Step 3: Location & Budget]
    I --> J[Step 4: Photos Upload]
    J --> K[Review & Submit]
    K --> L[Task Published]
    L --> M[Task Detail Page]
    M --> N[Manage Applications]
```

### 4. Authentication Flow

```mermaid
graph TD
    A[Unauthenticated User] --> B[Clicks Protected Action]
    B --> C[Auth Slide-over Opens]
    C --> D{Login Method}

    D -->|Google| E[Google OAuth]
    D -->|Facebook| F[Facebook OAuth]
    D -->|Email| G[Email/Password Form]

    E --> H[OAuth Redirect]
    F --> H
    G --> I[Validate Credentials]

    H --> J{Success?}
    I --> J

    J -->|Yes| K[Create Session]
    J -->|No| L[Show Error]

    K --> M[Close Slide-over]
    M --> N[Complete Original Action]
    L --> C
```

### 5. Profile Management Flow

```mermaid
graph TD
    A[Profile Page] --> B{User Type}

    B -->|Customer| C[Customer Tab]
    B -->|Professional| D[Professional Tab]

    C --> E[Edit Personal Info]
    E --> F[Upload Avatar]
    F --> G[Save Changes]

    D --> H[Edit Professional Info]
    H --> I[Add Categories]
    I --> J[Upload Portfolio]
    J --> K[Set Hourly Rate]
    K --> L[Verification Status]
    L --> G

    G --> M{Valid?}
    M -->|Yes| N[Update Database]
    M -->|No| O[Show Validation Errors]
    N --> P[Success Message]
```

## Internationalization

TaskBridge supports three languages with intelligent detection:

### Supported Locales
- **English** (en) - Default
- **Bulgarian** (bg) - Primary market
- **Russian** (ru) - Secondary market

### URL Structure
All routes are prefixed with the locale:
```
/en/browse-tasks    # English
/bg/browse-tasks    # Bulgarian
/ru/browse-tasks    # Russian
```

### Detection Strategy
1. **User Preference** (highest priority) - Cookie from manual selection
2. **Browser Language** - Accept-Language header
3. **Default Fallback** - English (en)

### Translation Files
Located in `/src/lib/intl/`:
- `en.ts` - 588 translation keys
- `bg.ts` - 614 translation keys
- `ru.ts` - 597 translation keys

### Key Namespaces
- `nav.*` - Navigation items
- `landing.*` - Landing page content
- `professionals.*` - Professionals pages
- `tasks.*` - Task-related pages
- `browseTasks.*` - Browse tasks page
- `createTask.*` - Create task form
- `categories.*` - Service categories
- `common.*` - Global terms

### Implementation
```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('landing.hero.title')}</h1>
}
```

### Middleware Optimization
Smart middleware with early returns for performance:
- 90% of requests skip middleware (cached locale URLs)
- Cookie-based persistence for returning users
- Minimal execution cost on Vercel Edge

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
- [docs/](./docs/) - Additional documentation

---

**Built with**: Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, NextUI, Tailwind CSS

**Powered by**: Vercel, Neon Database
