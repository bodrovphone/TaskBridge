# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskBridge (branded as "Trudify") is a Bulgarian freelance platform that connects customers with verified professionals for various services. It's a full-stack TypeScript application built with Next.js App Router.

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Radix UI components with Tailwind CSS
- **Routing**: Next.js App Router
- **State Management**: TanStack Query (React Query)
- **Authentication**: Currently disabled (no auth required)
- **Internationalization**: i18next
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

### Next.js App Router Structure
- `/app/` - Next.js App Router pages and API routes
  - `/app/page.tsx` - Landing page (no authentication required)
  - `/app/browse-tasks/page.tsx` - Browse available tasks
  - `/app/create-task/page.tsx` - Create new task
  - `/app/profile/page.tsx` - User profile
  - `/app/api/` - API routes (to be migrated from Express)
- `/components/` - React UI components
- `/lib/` - Shared utilities and configurations
- `/hooks/` - Custom React hooks

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

## Development Notes

### Path Aliases
- `@/` points to project root
- `@/components/*` points to `./components/*`
- `@/lib/*` points to `./lib/*`
- `@/hooks/*` points to `./hooks/*`
- `@/shared/*` points to `./shared/*`

### Database Operations
- Use Drizzle ORM for all database operations
- Schema is defined in `/shared/schema.ts` with Zod validation
- Run `npm run db:push` after schema changes

### Component Development
- UI components use Radix UI with Tailwind styling
- All components are now in `/components/` directory
- Follow existing patterns for consistent styling and behavior

### Internationalization
- Uses i18next for Bulgarian/English translations
- Text content should be translatable via the i18n system

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