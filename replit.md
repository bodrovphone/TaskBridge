# replit.md

## Overview

Trudify is a full-stack web application that connects people with verified local professionals for various services. Built as a modern task marketplace platform, it enables customers to post tasks and professionals to apply for them, with integrated payment, review, and verification systems.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router and React 18
- **Authentication**: NextAuth.js with Replit OIDC provider
- **Routing**: Next.js App Router for file-based routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Components**: Radix UI primitives with custom styling
- **Localization**: React i18next with multi-language support (EN/BG/RU)

### Backend Architecture
- **Framework**: Next.js API Routes (App Router)
- **Runtime**: Node.js with Next.js serverless functions
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API routes with Next.js Route Handlers
- **Authentication**: NextAuth.js with JWT sessions and database user management
- **File Serving**: Next.js built-in static file serving

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: NextAuth.js with Replit OIDC authentication
- **Session Management**: JWT-based sessions with automatic token refresh
- **User Management**: Automatic user upsert in PostgreSQL on authentication
- **Security**: NextAuth.js built-in CSRF protection, secure JWT handling

### Data Models
- **Users**: Comprehensive user profiles supporting both customers and professionals
- **Tasks**: Job postings with categories, budgets, locations, and status tracking
- **Applications**: Professional applications to tasks with proposals and timelines
- **Reviews**: Bidirectional review system for quality assurance
- **Sessions**: Authentication session storage (required for Replit Auth)

### Frontend Pages
- **Landing**: Unauthenticated welcome page with categories and featured tasks
- **Home**: Authenticated dashboard with personalized content
- **Browse Tasks**: Filterable task marketplace with search and pagination
- **Create Task**: Multi-step task creation form with image upload
- **Task Details**: Individual task view with application system
- **Profile**: User profile management with professional verification

### API Endpoints
- **Authentication**: `/api/auth/*` - User session management
- **Tasks**: `/api/tasks` - CRUD operations with filtering
- **Applications**: Task application management
- **Reviews**: Rating and feedback system
- **User Stats**: Performance metrics and analytics

## Data Flow

### User Authentication Flow
1. Unauthenticated users see landing page
2. Login redirects to Replit OIDC provider
3. Successful auth creates/updates user record
4. Session stored in PostgreSQL with automatic cleanup
5. Frontend checks auth status via `/api/auth/user`

### Task Creation Flow
1. Authenticated user accesses create task form
2. Form validation using React Hook Form + Zod
3. Image upload processing (if implemented)
4. Task created via POST `/api/tasks`
5. Redirect to task details page

### Task Application Flow
1. Professionals browse available tasks
2. Application submitted with proposal and timeline
3. Customer receives notifications (to be implemented)
4. Customer can accept/reject applications
5. Task status updates trigger workflow changes

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless
- **Authentication**: Replit OIDC provider
- **File Storage**: Local storage (production may need cloud storage)
- **Email/SMS**: Not yet implemented (planned for notifications)

### Development Tools
- **Package Manager**: npm
- **TypeScript**: Strict type checking enabled
- **ESLint/Prettier**: Code formatting (configuration not visible)
- **Drizzle Studio**: Database management interface

### Third-Party Libraries
- **UI Components**: Extensive Radix UI ecosystem
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns with Bulgarian locale support
- **Styling**: Tailwind CSS with custom theme variables
- **Icons**: Lucide React icon library

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 on Replit
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Vite dev server with HMR
- **Port Configuration**: Port 5000 mapped to external port 80

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Assets**: Served from built frontend directory
- **Process Management**: Single Node.js process handling both API and static files

### Environment Configuration
- **Database URL**: Required environment variable
- **Session Secret**: Required for session encryption
- **OIDC Configuration**: Replit-provided authentication endpoints
- **File Paths**: Configurable asset and build directories

### Scaling Considerations
- **Database**: Uses connection pooling for efficiency
- **Sessions**: PostgreSQL storage enables horizontal scaling
- **Static Assets**: Can be moved to CDN for better performance
- **API**: Stateless design supports load balancing

## Changelog

Changelog:
- January 21, 2025. Major architectural change: Converted entire application from React/Express to Next.js 15 with App Router
- January 21, 2025. Renamed application from TaskBridge to Trudify across all files and components
- July 20, 2025. Added multi-language localization (EN, BG, RU) and removed region-specific references for gradual scaling
- July 28, 2025. Updated to community-driven support model: replaced "24/7 Support" with "50+ Contract Templates" and "Community Reviews" to align with non-profit organization structure
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.