# TaskBridge (Trudify)

> A modern Bulgarian freelance platform connecting customers with verified professionals for various services.

TaskBridge is a full-stack TypeScript application built with Next.js 15, featuring multilingual support (EN/BG/RU), modern UI components, and a comprehensive service marketplace.

## Features

- **Multilingual Support**: EN, BG, RU with smart locale detection
- **Professional Directory**: Browse and filter verified professionals
- **Task Marketplace**: Create, browse, and apply for service requests
- **User Profiles**: Separate customer and professional profiles
- **Modern UI**: NextUI + Radix UI components with Tailwind CSS
- **Mobile Responsive**: Optimized for all device sizes
- **Type-Safe**: Full TypeScript with global API type registry
- **SEO Optimized**: Server-side rendering with Next.js App Router

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router), NextUI, Radix UI (shadcn/ui), Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Supabase PostgreSQL |
| **Auth** | Supabase Auth (Google, Facebook, Telegram) |
| **State** | TanStack Query (React Query) |
| **i18n** | i18next with URL-based locales (`/en/`, `/bg/`, `/ru/`) |
| **DevOps** | Vercel, Supabase |

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Supabase account (https://supabase.com)

### Installation

```bash
# Clone and install
git clone https://github.com/yourusername/taskbridge.git
cd taskbridge
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

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
```

## Project Structure

```
/src/
├── app/                    # Next.js App Router
│   ├── [lang]/            # Locale-specific routes (en, bg, ru)
│   └── api/               # API routes
├── features/              # Self-contained business domains
│   ├── professionals/     # Professionals feature
│   ├── categories/        # Category system
│   └── auth/              # Authentication
├── components/            # Shared UI components
│   ├── ui/               # Design system (shadcn/ui)
│   └── common/           # Layout components (Header, Footer)
├── server/               # Server-side code (domain logic)
├── lib/                  # Global utilities
│   ├── supabase/        # Supabase client configurations
│   ├── intl/            # Translation files (en, bg, ru)
│   └── constants/       # App constants
├── hooks/                # Global custom hooks
└── types/                # Global type definitions
```

## Documentation

Detailed documentation is available in the `/docs/` directory:

| Document | Description |
|----------|-------------|
| [Routes](./docs/routes.md) | Complete route documentation with public/protected routes |
| [Internationalization](./docs/internationalization.md) | i18n setup, locale detection, translation architecture |
| [Categories](./docs/categories.md) | Category system with 26 main + 135 subcategories |
| [API Types](./docs/api-types.md) | Global API type registry usage |
| [Media Optimization](./docs/media-optimization.md) | CLI tool for image/video optimization |
| [Customer Journeys](./docs/customer-journeys.md) | User flows for customers |
| [Professional Journeys](./docs/professional-journeys.md) | User flows for professionals |
| [Supabase Setup](./docs/infrastructure/supabase-vercel-setup.md) | Database schema and infrastructure |

## Key Concepts

### Global API Type Registry

Types are globally available via `API['TypeName']` - no imports needed:

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

See [API Types Documentation](./docs/api-types.md) for complete type list.

### Category System

26 main categories with 135 subcategories, fully translated (EN/BG/RU):

```typescript
import { getCategoryLabelBySlug } from '@/features/categories'

// Display translated category name
const label = getCategoryLabelBySlug('plumber', t)  // "Plumber" / "Водопроводчик"
```

See [Categories Documentation](./docs/categories.md) for full usage guide.

### Authentication

Supabase Auth with multiple providers (Google, Facebook, Telegram):

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
await supabase.auth.signInWithOAuth({ provider: 'google' })
```

### Database

Supabase PostgreSQL with Row Level Security (RLS):

| Table | Description |
|-------|-------------|
| `users` | Customer and professional profiles |
| `tasks` | Service requests with location and budget |
| `applications` | Professional bids on tasks |
| `reviews` | Bidirectional rating system |
| `messages` | Task-specific communication |
| `notifications` | User notification system |

## Environment Variables

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only

# Telegram Bot (optional - for notifications)
TG_BOT_TOKEN=your-bot-token
TG_BOT_USERNAME=your-bot-username
```

## Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

## Contributing

1. Check `todo_tasks/` for available tasks
2. Create a feature branch
3. Run `npm run check` before committing
4. Move completed task to `complete_tasks/`
5. Submit a pull request

## Additional Resources

- [PRD.md](./PRD.md) - Product Requirements Document
- [CLAUDE.md](./CLAUDE.md) - Development guidelines for Claude Code

---

**Built with**: Next.js 15, TypeScript, Supabase, NextUI, Tailwind CSS

**Powered by**: Vercel, Supabase
