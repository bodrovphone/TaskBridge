# TaskBridge (Trudify)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> A modern Bulgarian freelance platform connecting customers with verified professionals for various services.

TaskBridge is a full-stack TypeScript application built with Next.js 16, featuring multilingual support (EN/BG/RU/UA), a comprehensive service marketplace with 26 categories and 135 subcategories, and real-time notifications via Telegram.

---

## Features

- **Multilingual Support** — English, Bulgarian, Russian, and Ukrainian with smart locale detection
- **Task Marketplace** — Create, browse, and apply for service requests with budget and location filters
- **Professional Directory** — Browse verified professionals with ratings, reviews, and portfolios
- **Dual User Roles** — Seamless customer and professional experiences in one account
- **Real-time Notifications** — Telegram integration for instant updates
- **Category System** — 26 main categories with 135 specialized subcategories
- **City-based Matching** — Location-aware task and professional filtering (8 Bulgarian cities)
- **Review System** — Bidirectional ratings between customers and professionals
- **Mobile Responsive** — Optimized for all device sizes
- **SEO Optimized** — Server-side rendering with Next.js App Router

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16 (App Router), HeroUI, Radix UI (shadcn/ui), Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Supabase PostgreSQL with RLS |
| **Auth** | Supabase Auth (Google, Facebook, Email, Telegram) |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **State** | TanStack Query (React Query) |
| **i18n** | i18next with URL-based locales (`/en/`, `/bg/`, `/ru/`, `/ua/`) |
| **Notifications** | Telegram Bot API, SendGrid Email |
| **Deployment** | Vercel, Supabase |

---

## Getting Started

### Prerequisites

- Node.js >= 24.0.0
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/taskbridge.git
cd taskbridge

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run check            # Run both type-check and lint

# Media Optimization
npm run optimize:images  # Optimize images in public folder
npm run optimize:videos  # Optimize videos in public folder
npm run optimize:media   # Optimize all media files

# Database (requires Supabase CLI)
npm run db:status        # Show pending migrations
npm run db:push          # Push local changes to remote
npm run db:reset         # Reset database
npm run db:migrate       # Run migrations
```

---

## Project Structure

```
/src/
├── app/                     # Next.js App Router
│   ├── [lang]/              # Locale-specific routes (en, bg, ru, ua)
│   │   ├── browse-tasks/    # Task browsing and search
│   │   ├── create-task/     # Task creation flow
│   │   ├── professionals/   # Professional directory
│   │   ├── profile/         # User profile management
│   │   ├── tasks/           # Task detail and management
│   │   └── ...              # Other pages (about, faq, terms, etc.)
│   └── api/                 # API routes
│       ├── tasks/           # Task CRUD operations
│       ├── applications/    # Application management
│       ├── professionals/   # Professional endpoints
│       ├── notifications/   # Notification system
│       └── ...              # Other API routes
│
├── features/                # Self-contained business domains
│   ├── applications/        # Application management feature
│   ├── auth/                # Authentication flows
│   ├── blog/                # Blog system
│   ├── browse-tasks/        # Task browsing feature
│   ├── categories/          # Category system (26 main + 135 sub)
│   ├── cities/              # City/location management
│   ├── home/                # Landing page components
│   ├── professionals/       # Professional listings and profiles
│   └── reviews/             # Review and rating system
│
├── components/              # Shared UI components
│   ├── ui/                  # Design system primitives (shadcn/ui)
│   ├── common/              # Layout components (Header, Footer, etc.)
│   ├── tasks/               # Task-related components
│   ├── categories/          # Category display components
│   ├── reviews/             # Review components
│   └── ...                  # Other shared components
│
├── server/                  # Server-side business logic
│   ├── application/         # Application services
│   ├── professionals/       # Professional services
│   ├── tasks/               # Task services
│   └── shared/              # Shared utilities
│
├── lib/                     # Global utilities and configurations
│   ├── supabase/            # Supabase client (client, server, middleware)
│   ├── intl/                # Translation files (en, bg, ru, ua)
│   ├── services/            # External service integrations
│   ├── constants/           # App constants (locales, categories)
│   └── utils/               # Utility functions
│
├── hooks/                   # Global custom React hooks
└── types/                   # Global TypeScript type definitions
```

---

## Key Concepts

### Global API Type Registry

Types are globally available via `API['TypeName']` — no imports needed:

```typescript
// Access any type directly
const user: API['UserProfile'] = { ... }
const task: API['TaskCreate'] = { title: 'Fix sink', ... }

// In component props
interface Props {
  professional: API['ProfessionalData']
  tasks: API['TaskSelection'][]
}
```

### Category System

26 main categories with 135 subcategories, fully translated (EN/BG/RU/UA):

```typescript
import { getCategoryLabelBySlug } from '@/features/categories'

// Display translated category name
const label = getCategoryLabelBySlug('plumber', t)  // "Plumber" / "Водопроводчик" / "Водопроводчик"
```

### City-based Matching

Slug-based system for consistent filtering across all locales:

```typescript
import { getCityLabelBySlug, getCitiesWithLabels } from '@/features/cities'

// Display translated city name
const cityName = getCityLabelBySlug('sofia', t)  // "Sofia" / "София"

// Get all cities for dropdown
const cities = getCitiesWithLabels(t)
```

### Authentication

Supabase Auth with multiple providers:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// OAuth login
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Email login
await supabase.auth.signInWithPassword({ email, password })
```

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | Customer and professional profiles with verification |
| `tasks` | Service requests with location, budget, and status |
| `applications` | Professional bids on tasks |
| `reviews` | Bidirectional rating system |
| `messages` | Task-specific communication |
| `notifications` | User notification system |
| `safety_reports` | User safety reporting |

All tables use Row Level Security (RLS) for data privacy.

---

## Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database (for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Telegram Bot (optional)
TG_BOT_TOKEN=your-bot-token
TG_BOT_USERNAME=YourBot_bot
ADMIN_TELEGRAM_ID=your-telegram-user-id  # For admin notifications

# SendGrid Email (optional)
SENDGRID_API_KEY=your-sendgrid-key
```

---

## Documentation

Detailed documentation is available in the `/docs/` directory:

| Document | Description |
|----------|-------------|
| [Routes](./docs/routes.md) | Complete route documentation |
| [Internationalization](./docs/internationalization.md) | i18n setup and translation architecture |
| [Categories](./docs/categories.md) | Category system guide |
| [API Types](./docs/api-types.md) | Global type registry usage |
| [Media Optimization](./docs/media-optimization.md) | CLI tool for image/video optimization |
| [Customer Journeys](./docs/customer-journeys.md) | User flows for customers |
| [Professional Journeys](./docs/professional-journeys.md) | User flows for professionals |
| [Infrastructure Setup](./docs/infrastructure/supabase-vercel-setup.md) | Database and deployment setup |
| [Telegram Integration](./docs/TELEGRAM_QUICKSTART.md) | Telegram bot setup |

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

### Manual Deployment

1. Build the application: `npm run build`
2. Start the server: `npm run start`
3. Configure reverse proxy (nginx/caddy) if needed

---

## Contributing

1. Check `todo_tasks/` for available tasks
2. Create a feature branch from `main`
3. Run `npm run check` before committing
4. Move completed task file to `complete_tasks/`
5. Submit a pull request

---

## Project Resources

- [PRD.md](./PRD.md) — Product Requirements Document
- [CLAUDE.md](./CLAUDE.md) — Development guidelines for AI assistance

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Built with** Next.js 16 • TypeScript • Supabase • HeroUI • Tailwind CSS

**Deployed on** Vercel • Supabase
