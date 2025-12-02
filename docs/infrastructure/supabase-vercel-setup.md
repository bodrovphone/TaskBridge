# Supabase + Vercel Infrastructure Guide

## Overview

TaskBridge uses **Supabase** as the complete backend infrastructure (database, authentication, storage, real-time) deployed on **Vercel**. This document provides comprehensive guidance for setup, development, and deployment.

**Tech Stack:**
- **Frontend/Backend**: Next.js 15 (App Router) on Vercel
- **Database**: Supabase PostgreSQL with pgvector
- **Authentication**: Supabase Auth (Google, Facebook, Phone)
- **Storage**: Supabase Storage for images/files
- **Real-time**: Supabase Realtime for live updates
- **ORM**: Supabase JavaScript Client (no Drizzle/Prisma)

---

## Why Supabase + Vercel?

### ✅ Benefits

**1. All-in-One Backend:**
- PostgreSQL database with built-in REST API
- Authentication with social providers + phone
- File storage with CDN
- Real-time subscriptions
- Row Level Security (RLS) for data protection

**2. Rapid Development:**
- No separate backend service to manage
- Auto-generated REST and GraphQL APIs
- Built-in admin dashboard
- Type-safe client with TypeScript

**3. Cost-Effective MVP:**
- Free tier: 500MB database, 50,000 MAU, 1GB storage
- Scales with usage-based pricing
- No infrastructure management overhead

**4. Vercel Integration:**
- Automatic environment variable sync
- Preview deployments with isolated databases
- Edge functions for serverless compute
- Global CDN for static assets

**5. Developer Experience:**
- Local development with Supabase CLI
- Database migrations with version control
- Studio UI for data management
- Built-in SQL editor and query logs

### ⚠️ Trade-offs

**Vendor Lock-in:**
- Supabase-specific features (RLS, Realtime) are hard to migrate
- **Mitigation**: Abstract critical business logic into services (see `/docs/architecture/universal-backend-architecture.md`)

**Limited Customization:**
- Postgres extensions limited to Supabase-supported ones
- Cannot customize auth flows deeply
- **Mitigation**: Good enough for 90% of use cases

**Cost at Scale:**
- After free tier: $25/month + usage
- Storage and bandwidth can add up
- **Mitigation**: Monitor usage, optimize queries, implement caching

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Frontend + API)                │
│                                                               │
│  ┌─────────────┐      ┌──────────────┐     ┌──────────────┐ │
│  │  Next.js    │──────│  API Routes  │─────│ Middleware   │ │
│  │  App Router │      │  /app/api/*  │     │ (Auth Check) │ │
│  └─────────────┘      └──────────────┘     └──────────────┘ │
│         │                     │                     │         │
└─────────┼─────────────────────┼─────────────────────┼─────────┘
          │                     │                     │
          │ Supabase Client     │ Supabase Admin      │ Auth
          │ (@supabase/ssr)     │ (Server-side)       │ Token
          ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │  Supabase    │  │  Supabase    │       │
│  │   Database   │  │    Auth      │  │   Storage    │       │
│  │  + pgvector  │  │  (Google,    │  │  (Images,    │       │
│  │              │  │  Facebook,   │  │   Files)     │       │
│  │              │  │   Phone)     │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Supabase    │  │   Database   │                         │
│  │  Realtime    │  │  Functions   │                         │
│  │ (WebSocket)  │  │  (Triggers)  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Setup

### 1. Create Supabase Project

```bash
# Option A: Via Supabase Dashboard (Recommended for first project)
# 1. Go to https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Choose project name: "taskbridge-production"
# 4. Set database password (save securely!)
# 5. Choose region: "Europe (Frankfurt)" for Bulgarian users
# 6. Click "Create new project"

# Option B: Via Supabase CLI (Advanced)
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Install Supabase CLI (Optional but Recommended)

```bash
# macOS
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# NPM (Cross-platform)
npm install -g supabase
```

### 3. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here

# Server-side only (don't expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

# Optional: Database URL for direct Postgres access
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

**Where to find these values:**
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy `URL` and `anon public` key (safe to expose)
4. Copy `service_role` key (keep secret, server-only)

### 4. Add to Vercel

```bash
# Option A: Vercel Dashboard
# 1. Go to project settings → Environment Variables
# 2. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# 3. Add SUPABASE_SERVICE_ROLE_KEY (mark as "Secret")

# Option B: Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 5. Configure Supabase Integration (Optional)

Vercel has official Supabase integration for automatic environment sync:

```bash
# 1. Go to Vercel project → Integrations
# 2. Search "Supabase"
# 3. Click "Add Integration"
# 4. Authorize and link your Supabase project
# 5. Environment variables sync automatically
```

---

## Database Schema Setup

### Schema Design

Based on TaskBridge requirements, here's the complete database schema:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector"; -- For future semantic search

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Basic Info (synced from Supabase Auth)
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,

  -- Profile Info
  user_type TEXT CHECK (user_type IN ('customer', 'professional', 'both')) DEFAULT 'customer',
  city TEXT,
  neighborhood TEXT,
  country TEXT DEFAULT 'Bulgaria',
  bio TEXT,
  preferred_language TEXT CHECK (preferred_language IN ('en', 'bg', 'ru', 'ua')) DEFAULT 'bg',

  -- Verification Status
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  email_verified_at TIMESTAMP WITH TIME ZONE,

  -- Professional-specific fields
  vat_number TEXT UNIQUE,
  is_vat_verified BOOLEAN DEFAULT FALSE,
  vat_verified_at TIMESTAMP WITH TIME ZONE,
  company_name TEXT,
  years_experience INTEGER,
  hourly_rate_bgn DECIMAL(10, 2),
  service_categories TEXT[], -- Array of category slugs

  -- Statistics (updated by triggers)
  tasks_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  response_time_hours DECIMAL(10, 2),
  acceptance_rate DECIMAL(5, 2),

  -- Settings
  notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}'::jsonb,
  privacy_settings JSONB DEFAULT '{"show_phone": false, "show_email": false}'::jsonb,

  -- Metadata
  last_active_at TIMESTAMP WITH TIME ZONE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_users_city ON public.users(city);
CREATE INDEX idx_users_service_categories ON public.users USING GIN(service_categories);
CREATE INDEX idx_users_average_rating ON public.users(average_rating DESC) WHERE user_type IN ('professional', 'both');

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Task Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Location
  city TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  location_notes TEXT,
  coordinates GEOGRAPHY(POINT, 4326), -- For future map features

  -- Budget & Timeline
  budget_min_bgn DECIMAL(10, 2),
  budget_max_bgn DECIMAL(10, 2),
  budget_type TEXT CHECK (budget_type IN ('fixed', 'hourly', 'negotiable')) DEFAULT 'negotiable',
  deadline TIMESTAMP WITH TIME ZONE,
  estimated_duration_hours INTEGER,

  -- Task Status
  status TEXT CHECK (status IN (
    'draft',
    'open',
    'in_progress',
    'pending_customer_confirmation',
    'completed',
    'cancelled',
    'disputed'
  )) DEFAULT 'open',

  -- Relationships
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_professional_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  accepted_application_id UUID, -- Reference to applications table

  -- Completion & Review
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by_professional_at TIMESTAMP WITH TIME ZONE,
  confirmed_by_customer_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_customer BOOLEAN DEFAULT FALSE,
  reviewed_by_professional BOOLEAN DEFAULT FALSE,

  -- Cancellation
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES public.users(id),
  cancellation_reason TEXT,

  -- Media
  images TEXT[], -- Array of Supabase Storage URLs
  documents TEXT[], -- Array of document URLs

  -- Metadata
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  is_urgent BOOLEAN DEFAULT FALSE,
  requires_license BOOLEAN DEFAULT FALSE,
  requires_insurance BOOLEAN DEFAULT FALSE
);

-- Indexes for tasks
CREATE INDEX idx_tasks_customer_id ON public.tasks(customer_id);
CREATE INDEX idx_tasks_professional_id ON public.tasks(selected_professional_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_city ON public.tasks(city);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline) WHERE status = 'open';

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Relationships
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Application Details
  proposed_price_bgn DECIMAL(10, 2) NOT NULL,
  estimated_duration_hours INTEGER,
  message TEXT NOT NULL,
  availability_date TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT CHECK (status IN (
    'pending',
    'accepted',
    'rejected',
    'withdrawn'
  )) DEFAULT 'pending',

  -- Response
  responded_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,

  -- Unique constraint: one application per professional per task
  CONSTRAINT unique_application UNIQUE (task_id, professional_id)
);

-- Indexes for applications
CREATE INDEX idx_applications_task_id ON public.applications(task_id);
CREATE INDEX idx_applications_professional_id ON public.applications(professional_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Relationships
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Review Content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('customer_to_professional', 'professional_to_customer')) NOT NULL,

  -- Review Categories (optional detailed ratings)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

  -- Response
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,

  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,

  -- Unique constraint: one review per person per task
  CONSTRAINT unique_review UNIQUE (task_id, reviewer_id, reviewee_id)
);

-- Indexes for reviews
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_task_id ON public.reviews(task_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- ============================================
-- MESSAGES TABLE (for task-specific communication)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Relationships
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Message Content
  content TEXT NOT NULL,
  attachments TEXT[], -- Array of file URLs

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_system_message BOOLEAN DEFAULT FALSE
);

-- Indexes for messages
CREATE INDEX idx_messages_task_id ON public.messages(task_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id) WHERE is_read = FALSE;
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Recipient
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Notification Details
  type TEXT NOT NULL, -- 'new_application', 'application_accepted', 'task_completed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link to relevant page

  -- Related entities (nullable)
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Delivery
  sent_via_email BOOLEAN DEFAULT FALSE,
  sent_via_sms BOOLEAN DEFAULT FALSE,
  sent_via_push BOOLEAN DEFAULT FALSE
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- SAFETY REPORTS TABLE
-- ============================================
CREATE TABLE public.safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Reporter & Reported
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,

  -- Report Details
  report_type TEXT CHECK (report_type IN (
    'inappropriate_behavior',
    'scam',
    'poor_quality',
    'no_show',
    'fake_profile',
    'other'
  )) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Screenshots, documents

  -- Status
  status TEXT CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,

  -- Action Taken
  action_taken TEXT, -- 'warning', 'temporary_ban', 'permanent_ban', 'none'
  action_details TEXT
);

-- Indexes for safety reports
CREATE INDEX idx_safety_reports_reported_user ON public.safety_reports(reported_user_id);
CREATE INDEX idx_safety_reports_status ON public.safety_reports(status);
CREATE INDEX idx_safety_reports_created_at ON public.safety_reports(created_at DESC);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update user statistics when review is created
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reviewee's statistics
  UPDATE public.users
  SET
    average_rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_statistics_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

-- Function: Increment application count
CREATE OR REPLACE FUNCTION increment_task_application_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks
  SET applications_count = applications_count + 1
  WHERE id = NEW.task_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_applications_count
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION increment_task_application_count();
```

### Applying the Schema

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to your project dashboard
2. Click "SQL Editor" in sidebar
3. Copy/paste the schema above
4. Click "Run"

**Option B: Via Migration Files (Recommended for Team)**
```bash
# Create migration file
npx supabase migration new initial_schema

# Edit the file in supabase/migrations/
# Paste schema SQL

# Apply migration
npx supabase db push
```

---

## Row Level Security (RLS) Policies

RLS is Supabase's security layer. **Critical for production** - ensures users can only access their own data.

```sql
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view all professional profiles (public data)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
USING (user_type IN ('professional', 'both'));

-- Users can view their own profile (all data)
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- New users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- TASKS TABLE POLICIES
-- ============================================

-- Anyone can view open tasks
CREATE POLICY "Open tasks are viewable by everyone"
ON public.tasks FOR SELECT
USING (status = 'open');

-- Task creators can view their own tasks (all statuses)
CREATE POLICY "Customers can view own tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = customer_id);

-- Assigned professionals can view tasks assigned to them
CREATE POLICY "Professionals can view assigned tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = selected_professional_id);

-- Users who applied can view the task
CREATE POLICY "Applicants can view tasks they applied to"
ON public.tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.task_id = tasks.id
    AND applications.professional_id = auth.uid()
  )
);

-- Customers can create tasks
CREATE POLICY "Customers can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own tasks
CREATE POLICY "Customers can update own tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = customer_id);

-- Professionals can update tasks when marking completion
CREATE POLICY "Professionals can update assigned tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = selected_professional_id)
WITH CHECK (auth.uid() = selected_professional_id);

-- ============================================
-- APPLICATIONS TABLE POLICIES
-- ============================================

-- Professionals can view their own applications
CREATE POLICY "Professionals can view own applications"
ON public.applications FOR SELECT
USING (auth.uid() = professional_id);

-- Task owners can view applications to their tasks
CREATE POLICY "Customers can view applications to their tasks"
ON public.applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = applications.task_id
    AND tasks.customer_id = auth.uid()
  )
);

-- Professionals can create applications
CREATE POLICY "Professionals can create applications"
ON public.applications FOR INSERT
WITH CHECK (auth.uid() = professional_id);

-- Professionals can update their own applications
CREATE POLICY "Professionals can update own applications"
ON public.applications FOR UPDATE
USING (auth.uid() = professional_id);

-- Task owners can update application status
CREATE POLICY "Customers can update applications to their tasks"
ON public.applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = applications.task_id
    AND tasks.customer_id = auth.uid()
  )
);

-- ============================================
-- REVIEWS TABLE POLICIES
-- ============================================

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (NOT is_hidden);

-- Users can create reviews for tasks they participated in
CREATE POLICY "Task participants can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = reviewer_id AND (
    -- Customer reviewing professional
    (review_type = 'customer_to_professional' AND
     EXISTS (
       SELECT 1 FROM public.tasks
       WHERE tasks.id = task_id
       AND tasks.customer_id = auth.uid()
       AND tasks.selected_professional_id = reviewee_id
     ))
    OR
    -- Professional reviewing customer
    (review_type = 'professional_to_customer' AND
     EXISTS (
       SELECT 1 FROM public.tasks
       WHERE tasks.id = task_id
       AND tasks.selected_professional_id = auth.uid()
       AND tasks.customer_id = reviewee_id
     ))
  )
);

-- Reviewees can respond to reviews
CREATE POLICY "Reviewees can respond to reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewee_id)
WITH CHECK (auth.uid() = reviewee_id);

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Recipients can update read status
CREATE POLICY "Recipients can mark messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (using service role)
-- No policy needed - handled by service role key

-- ============================================
-- SAFETY REPORTS TABLE POLICIES
-- ============================================

-- Users can view reports they created
CREATE POLICY "Users can view own reports"
ON public.safety_reports FOR SELECT
USING (auth.uid() = reporter_id);

-- Users can create safety reports
CREATE POLICY "Users can create safety reports"
ON public.safety_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports (handled by service role)
-- No policy needed for admin access
```

**Apply RLS Policies:**
1. Copy/paste into SQL Editor
2. Run all policies
3. Test with test users to ensure access control works

---

## Authentication Setup

### Configure Auth Providers

**1. Email/Password (Built-in)**
Already enabled by default.

**2. Google OAuth**
```bash
# 1. Go to Google Cloud Console (console.cloud.google.com)
# 2. Create new project or select existing
# 3. Enable Google+ API
# 4. Create OAuth 2.0 credentials
# 5. Set authorized redirect URI:
#    https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback

# 6. In Supabase Dashboard → Authentication → Providers → Google
# 7. Enable Google provider
# 8. Paste Client ID and Client Secret
# 9. Save
```

**3. Facebook Login**
```bash
# 1. Go to Facebook Developers (developers.facebook.com)
# 2. Create app → Consumer → Next
# 3. Add Facebook Login product
# 4. Set OAuth Redirect URI:
#    https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback

# 5. In Supabase Dashboard → Authentication → Providers → Facebook
# 6. Enable Facebook provider
# 7. Paste App ID and App Secret
# 8. Save
```

**4. Phone Authentication**
```bash
# 1. In Supabase Dashboard → Authentication → Providers → Phone
# 2. Enable Phone provider
# 3. Choose SMS provider:
#    - Twilio (recommended, $15/month minimum)
#    - Vonage
#    - MessageBird
# 4. Enter provider credentials
# 5. Configure phone verification settings
# 6. Save

# For development: Use Test Phone Numbers
# Settings → Phone Auth → Add test phone: +15555551234
```

### Email Templates

Customize auth emails for better branding:

```bash
# 1. Supabase Dashboard → Authentication → Email Templates
# 2. Customize each template:
#    - Confirm signup
#    - Magic Link
#    - Change Email Address
#    - Reset Password

# Example custom template:
Subject: Welcome to TaskBridge - Verify your email

Hi {{ .Email }},

Welcome to TaskBridge! Click the link below to verify your email:

{{ .ConfirmationURL }}

This link expires in 24 hours.

Best regards,
The TaskBridge Team
https://taskbridge.com
```

---

## Storage Setup

### Create Storage Buckets

```sql
-- Via SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('task-images', 'task-images', true),
  ('task-documents', 'task-documents', false), -- Private documents
  ('portfolio', 'portfolio', true);
```

### Storage Policies

```sql
-- Avatars: Anyone can view, users can upload their own
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Task Images: Anyone can view, task creators can upload
CREATE POLICY "Task images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-images');

CREATE POLICY "Task owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-images' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id::text = (storage.foldername(name))[1]
    AND tasks.customer_id = auth.uid()
  )
);

-- Task Documents: Only task participants can access
CREATE POLICY "Task documents are private"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-documents' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id::text = (storage.foldername(name))[1]
    AND (
      tasks.customer_id = auth.uid() OR
      tasks.selected_professional_id = auth.uid()
    )
  )
);

-- Portfolio: Professionals can upload, anyone can view
CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload to their portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Next Steps

1. **[Setup Supabase Client](/docs/infrastructure/supabase-client-setup.md)** - Configure client in Next.js
2. **[Database Migrations](/docs/infrastructure/database-migrations.md)** - Version control your schema
3. **[API Integration Guide](/docs/infrastructure/api-integration.md)** - Build API routes with Supabase
4. **[Authentication Flow](/docs/infrastructure/auth-implementation.md)** - Implement auth in app
5. **[Deployment Guide](/docs/infrastructure/deployment.md)** - Deploy to Vercel with Supabase

---

**Document Version:** 1.0
**Last Updated:** October 24, 2024
**Next Review:** After Supabase project creation
