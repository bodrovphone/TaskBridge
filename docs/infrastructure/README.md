# TaskBridge Infrastructure Documentation

## Overview

This directory contains comprehensive infrastructure documentation for TaskBridge, covering the complete Supabase + Vercel stack setup and configuration.

## Available Documentation

### 1. [Supabase + Vercel Setup Guide](./supabase-vercel-setup.md)
**Complete infrastructure guide** covering:
- ✅ Why Supabase + Vercel (benefits & trade-offs)
- ✅ Architecture overview with diagrams
- ✅ Complete project setup instructions
- ✅ Full database schema (7 tables with indexes)
- ✅ Row Level Security (RLS) policies
- ✅ Authentication setup (Google, Facebook, Phone)
- ✅ Storage buckets configuration
- ✅ Environment variables checklist

### 2. [Supabase Client Setup](./supabase-client-setup.md)
**Next.js integration guide** covering:
- ✅ Client configuration (browser, server, middleware)
- ✅ TypeScript type generation
- ✅ Middleware integration
- ✅ Usage examples for all contexts
- ✅ Authentication implementation
- ✅ File upload examples
- ✅ React Query integration patterns

## Quick Start

### 1. Create Supabase Project

```bash
# Visit https://supabase.com/dashboard
# Click "New Project"
# Choose name, password, region (Europe/Frankfurt for Bulgaria)
# Copy project URL and anon key
```

### 2. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Keep secret!
```

### 3. Apply Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy schema from `supabase-vercel-setup.md`
3. Run SQL to create tables, indexes, triggers
4. Run RLS policies for security

### 4. Generate TypeScript Types

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

### 5. Deploy to Vercel

```bash
# Add environment variables to Vercel project
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

## Implementation Status

✅ **Completed**:
- Supabase packages installed (`@supabase/supabase-js`, `@supabase/ssr`)
- Client utilities created (`/src/lib/supabase/`)
- Middleware integration for session management
- OAuth callback route (`/app/auth/callback/`)
- Environment configuration template (`.env.local.example`)
- Comprehensive documentation (this directory)
- CLAUDE.md updated with Supabase architecture

⏸️ **To Do** (when you're ready):
- Create Supabase project on dashboard
- Apply database schema
- Configure OAuth providers (Google, Facebook)
- Set up phone authentication (optional)
- Generate TypeScript types
- Implement auth UI components
- Build API routes using Supabase client

## Architecture Overview

```
Frontend (Next.js on Vercel)
    ↓
Supabase Client (@supabase/ssr)
    ↓
┌─────────────────────────────────┐
│         Supabase Cloud          │
├─────────────────────────────────┤
│ • PostgreSQL Database + pgvector│
│ • Authentication (OAuth, Phone) │
│ • Storage (Images, Files)       │
│ • Realtime (WebSocket)          │
│ • Row Level Security (RLS)      │
└─────────────────────────────────┘
```

## Security Model

**Row Level Security (RLS)** enforces data access at the database level:
- Users can only view their own private data
- Public profiles visible to all
- Task participants can access task-specific data
- File storage policies mirror database access

**Authentication**:
- Session-based via Supabase Auth
- Automatic session refresh in middleware
- OAuth with Google/Facebook
- Phone verification via SMS

## Cost Estimation

**Free Tier** (Perfect for MVP):
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

**Pro Tier** ($25/month + usage):
- 8GB database storage
- 100GB file storage
- 100,000 monthly active users
- 50GB bandwidth

**Growth Tier** (Custom pricing):
- For apps exceeding Pro tier limits

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Next.js + Supabase**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **Community**: https://github.com/supabase/supabase/discussions

## Related Documentation

- `/CLAUDE.md` - Complete project architecture and guidelines
- `/docs/architecture/` - Universal backend architecture (for future migrations)
- `/docs/features/` - Feature-specific documentation

---

**Last Updated**: October 24, 2024
**Maintained By**: TaskBridge Development Team
