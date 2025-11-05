# Balkan Freelance Platform - Product Requirements Document

## 1. Executive Summary

### Product Vision

A comprehensive regional task platform connecting people in the Balkans with verified local service providers for any kind of task - from home repairs and delivery services to pet care, childcare, elderly assistance, and personal errands.

### Target Markets

- Primary: Bulgaria, Romania, Serbia, North Macedonia
- Secondary: Greece (future expansion)

### Product Goals

- Create a trusted marketplace for home services in the Balkan region
- Minimize fraud through verification systems
- Provide localized experience with regional payment methods and languages
- Build community trust through comprehensive rating systems

## 2. Product Overview

### Core Value Proposition

**For Task Posters (Customers):**

- Easy task posting for ANY kind of service need
- Access to verified local service providers
- Transparent pricing and deadline management
- Protection through rating/review system

**For Service Providers:**

- Access to diverse local job opportunities across multiple categories
- Verified credential system builds trust
- Direct communication with customers
- Fair rating system for reputation building

### Target Users

- **Primary:** Anyone needing tasks completed (home services, deliveries, personal assistance)
- **Secondary:** Busy professionals, elderly individuals, families with children
- **Service Providers:** Verified individuals offering services across categories:
  - **Home & Repair:** Electricians, plumbers, handymen, cleaners
  - **Delivery & Transport:** Couriers, drivers, movers
  - **Personal Care:** Pet sitters, dog walkers, babysitters, elderly companions
  - **Personal Assistant:** Errand runners, shopping assistants, administrative help
  - **Other Services:** Tutors, fitness trainers, event helpers

## 3. Feature Requirements

### 3.1 User Registration & Authentication

**Status**: ✅ Telegram authentication and notification system **IMPLEMENTED** - Ready for deployment testing

**Implementation Date:** October 31, 2025
**Package Used:** `@telegram-auth/react` + `@telegram-auth/server`

#### Authentication Methods

**Primary Method: Telegram Login (✅ Implemented)**
- One-click authentication via Telegram Login Widget
- Instant account creation with Telegram profile data
- Automatic welcome notification via Telegram bot
- Zero-cost authentication (no SMS/email verification costs)
- Benefits:
  - ✅ Fastest onboarding (1-click if Telegram installed)
  - ✅ Instant notifications via Telegram bot (free, €10k-16k/year savings)
  - ✅ High trust (verified Telegram account)
  - ✅ No password management needed

**Dual Connection Methods Implemented:**
- **Method A (Direct Login):** Login with Telegram button in auth slide-over → Immediate account creation
- **Method B (Post-Login Connection):** Email/password login → Profile Settings → Connect Telegram → Enable notifications

**Secondary Methods: Traditional Auth (Existing)**
- Email/password registration
- Google OAuth
- Facebook Login
- Phone/SMS verification (future)

#### Customer Registration Flow

**Via Telegram (Recommended):**
1. User clicks "Login with Telegram" in auth slide-over
2. Telegram app/widget opens asking for authorization
3. User approves → Profile auto-created with:
   - Full name from Telegram
   - Username from Telegram (@username)
   - Profile photo from Telegram
   - Telegram user ID (for notifications)
4. Instant welcome notification sent via Telegram bot
5. User redirected to complete action (create task, apply, etc.)

**Via Email/Password:**
1. User enters email, password, full name
2. Email verification sent
3. User confirms email
4. Profile created

**Profile Setup (All Methods):**
- Basic profile information (name, location)
- Optional profile photo (or auto-imported from Telegram)
- Location preference (city/region)
- Language preference (EN/BG/RU)
- Notification preferences (Telegram/Email/SMS)

#### Professional Registration

- All customer registration fields
- **Optional business verification:**
  - Bulgarian VAT number (ЕИК/БУЛСТАТ) verification via public API (optional but provides verified badge)
- Phone number verification (recommended)
- Service categories selection
- Professional profile completion:
  - Skills and experience
  - Portfolio/work samples
  - Hourly rate or service pricing
  - Availability calendar

#### Notification System (Telegram Bot)

**Implementation Status:** ✅ **Core Infrastructure Complete** - Bot handler, webhook, token system implemented
**Deployment Status:** ⏸️ Requires Vercel deployment + webhook configuration

**Cost**: 🎉 **100% FREE** - Telegram Bot API has no per-message costs (saves €10,000-16,000/year vs SMS/Email)

**Telegram Bot Details:**
- Bot Username: `@Trudify_bot`
- Bot Token: Configured in `.env.local` (TG_BOT_TOKEN)
- Webhook URL: `https://task-bridge-chi.vercel.app/api/telegram/webhook`
- Connection Tokens: 15-minute expiry, single-use, stored in `telegram_connection_tokens` table

**Implementation Files:**
- `/src/lib/services/telegram-bot-handler.ts` - Bot command processor
- `/src/lib/services/telegram-notification.ts` - Notification templates
- `/src/app/api/telegram/webhook/route.ts` - Webhook receiver
- `/src/app/api/telegram/generate-connection-token/route.ts` - Token generation
- `/src/app/api/auth/telegram/route.ts` - Telegram authentication
- `/src/app/[lang]/profile/components/telegram-connection.tsx` - UI component
- `/scripts/setup-telegram-webhook.ts` - Webhook setup script
- `/docs/telegram-setup-migration.md` - Database migration guide

**Available Notifications:**
- 📬 Welcome message on registration
- ✅ New application received (for customers)
- 🎉 Application accepted (for professionals)
- 📋 Application rejected (optional, gentle)
- 💬 New message in task chat
- 📊 Task status updates
- 💰 Payment received
- ⭐ Review received
- 📅 Task deadline reminders
- 📧 Weekly task digest (professionals)

**Notification Preferences:**
- Users can enable/disable each notification type
- Choose notification channel: Telegram (primary), Email (fallback), SMS (future)
- Set digest frequency: Daily, Weekly, Never
- Quiet hours support
- Temporary snooze option

**Technical Implementation:**
- Telegram Bot: @Trudify_bot
- Authentication: Cryptographic hash verification (prevents spoofing)
- Delivery tracking: All notifications logged in database
- Cost tracking: €0 per notification for Telegram
- Fallback: Email if Telegram delivery fails
- Rate limiting: Prevents spam and abuse

### 3.2 Task Management System

#### Task Creation (Customers)

- Task title and detailed description
- Category selection:
  - **Home & Repair:** Electrical, plumbing, cleaning, maintenance, moving
  - **Delivery & Transport:** Package delivery, grocery shopping, pickup/dropoff
  - **Personal Care:** Pet sitting, dog walking, babysitting, elderly care
  - **Personal Assistant:** Errands, administrative tasks, event assistance
  - **Learning & Fitness:** Tutoring, personal training, lessons
  - **Other:** Custom category option
- Photo upload (multiple images supported)
- Budget setting (approximate range or fixed amount)
- Location specification:
  - City level (public)
  - Neighborhood (visible to applied service providers)
  - Exact address (shared after service provider selection)
- Deadline setting (optional)
  - Auto-expiration when deadline passes
- Task urgency level (same day, within week, flexible)
- Special requirements or notes

#### Task Discovery (Professionals)

- Browse tasks by:
  - Location (city/region)
  - Category
  - Budget range
  - Deadline proximity
- Search and filter functionality
- Task application system

### 3.3 Application & Bidding System

**Detailed Plan:** See `/docs/planning/task-application-bidding-system-plan.md`

#### Who Can Apply?

- **ANY registered user** can apply to any "open" task
- No strict role separation - users can be both task givers and professionals
- Constraints:
  - Must be logged in (authenticated)
  - Cannot apply to own tasks
  - One application per task per user
  - Task status must be "open"

#### Application Submission Flow

- Click "Apply" button on task detail page
- Authentication check (show login if needed)
- Application dialog with form fields:
  - **Proposed Price** (required, number input)
  - **Timeline/Availability** (required, select or text)
  - **Application Message** (required, 50-500 chars)
  - **Portfolio Images** (optional, max 5 images)
- Submit and receive confirmation
- Application status visible on task cards

#### Application States

- **Pending** - Awaiting task owner review
- **Accepted** - Professional selected for the task
- **Rejected** - Another professional was selected
- **Withdrawn** - Applicant cancelled before acceptance

#### Task Owner Review Process

- View all applications in organized list
- Sort by: Newest, Price, Rating, Experience
- Filter by: Status (All, Pending, Accepted, Rejected)
- See professional's:
  - Avatar, name, rating
  - Proposed price and timeline
  - Application message
  - Stats (completed tasks, ratings, specializations)
  - Portfolio images
- Actions: Accept, Reject, Message

#### Acceptance Flow

- When task owner accepts an application:
  1. Confirmation dialog shown
  2. All other applications automatically rejected
  3. Task status → "in_progress"
  4. Contact information revealed to both parties:
     - Full name, phone number, email
     - Exact task address (if provided)
  5. Notifications sent to all applicants
  6. Both parties can now communicate directly

#### Task Completion Workflow

**MVP Simplified Approach - No Support Team:**
- Both customer and professional must confirm completion
- Either party can mark task as completed first
- Other party can either:
  - ✅ **Confirm** → Task status: "completed"
  - ❌ **Reject** → Task returns to "in_progress" (can retry)
- **No dispute system** - customers simply reject and communicate

**Completion Steps:**
1. Professional or customer marks as "Completed"
2. Other party receives notification to confirm or reject
3. If confirmed → Task status: "completed"
4. If rejected → Task returns to "in_progress", both parties can message
5. Review period opens (7 days after completion)
6. Task archived after 30 days

**Customer Confirmation Flow:**
- When customer confirms completion, they see:
  - ✅ Confirm or ❌ Reject radio selection
  - If confirming:
    - **Actual Price Paid** (optional field) - tracks actual payment vs original budget
    - **Rating** (1-5 stars) - optional immediate rating
    - **Review Text** (optional) - brief review text input
  - If rejecting:
    - **Rejection Reason** (required) - predefined reasons + "Other"
    - **Description** (required) - specific details about the issue
    - **Info disclaimer:** "This task will return to 'In Progress' status and may become visible to other professionals again if work cannot be completed with current professional"

**Professional Completion Flow:**
- Professional marks task as complete with:
  - Required checklist confirmation (requirements completed, customer satisfied)
  - Optional completion notes
  - No photo upload needed (removed for MVP simplicity)

**Rejection Flow (MVP):**
- Customer can reject completion with reason:
  - Work not completed
  - Poor quality
  - Different from agreed scope
  - Other issues
- Task status returns to "in_progress"
- Professional can rework and mark complete again
- If professional cannot resolve issues, either party can cancel task
- Cancelled tasks may become "open" again for other professionals

**Task Creation Constraints (Post-Completion):**

To ensure accountability and maintain platform trust, customers face restrictions when creating new tasks:

**Priority 1: HARD BLOCK - Pending Confirmations (CRITICAL)**
- **Trigger:** Task status is `pending_customer_confirmation`
- **What happened:** Professional marked task as complete, awaiting customer response
- **Rule:** ❌ Customer **CANNOT** create new task until they respond (confirm or reject)
- **Grace period:** None - immediate enforcement
- **Rationale:** Professional completed work and is waiting for payment/feedback

**Priority 2: SOFT BLOCK - Missing Reviews (IMPORTANT)**
- **Trigger:** Task status is `completed` but `reviewedByCustomer: false`
- **What happened:** Task confirmed complete but customer didn't leave review
- **Rule:** ⚠️ Customer can create **3 new tasks** without review (grace period)
- **After 3 tasks:** ❌ Hard block until reviews submitted
- **Rationale:** Task is resolved, just need feedback to help professionals

**Priority 3: Tasks In Progress (NO BLOCK)**
- **Trigger:** Task status is `in_progress`
- **Rule:** ✅ No blocking - customers can have multiple simultaneous tasks
- **Optional:** Show soft reminder if >5 active tasks
- **Rationale:** Legitimate to have multiple projects running

#### Cancellation/Decline After Acceptance

- Either party can cancel if deal falls through
- Reasons: No-show, unsatisfactory work, mutual agreement
- Task status → "open" (reactivated)
- Can receive new applications
- Cancellation tracked (impacts reputation)

#### Contact Exchange

- Contact info hidden until application accepted
- After acceptance, both parties see:
  - Full name
  - Phone number
  - Email address
  - Exact task location
- All further communication direct (off-platform)

### 3.4 Rating & Review System

#### Bidirectional Reviews

- Customers rate professionals on:
  - Quality of work (1-5 stars)
  - Timeliness (1-5 stars)
  - Communication (1-5 stars)
  - Overall satisfaction (1-5 stars)
  - Written review (optional)
- Professionals rate customers on:
  - Clear task description (1-5 stars)
  - Payment promptness (1-5 stars)
  - Communication (1-5 stars)
  - Overall experience (1-5 stars)
  - Written review (optional)

#### Review Management & Visibility (MVP)

**Smart Negative Review Hiding:**
- Reviews with ≤3 stars are **hidden by default**
- Negative reviews become visible when pattern detected:
  - Professional has 2+ reviews with ≤3 stars
  - OR another customer also left ≤3 star review
- Prevents single unfair review from destroying reputation
- Patterns of poor service become visible to all users
- High ratings (>3 stars) always visible immediately

**Standard Review Rules:**
- Reviews published after task completion
- Both parties must submit reviews to see each other's
- 30-day review window
- Review authenticity verification

### 3.5 Safety & Trust System (MVP - No Support Team)

**Design Philosophy:** Automated safety mechanisms without requiring manual admin/support intervention.

#### Professional Verification

- Optional VAT number verification for verified badge
- Phone number verification (mandatory)
- Basic profile completeness check
- Trust indicators displayed on profile

#### Scam/Abuse Reporting System

**Automated Two-Report Suspension:**
- "Report Scam/Abuse" button on tasks and profiles
- Report types:
  - Fraud/scam attempts
  - Threatening behavior
  - Off-platform payment requests
  - Identity theft
  - Harassment
- **1st report:** Logged, no immediate action
- **2nd report** (from different user): Automatic account suspension
- False reports tracked and may result in reporter suspension
- Professional can appeal via email (manual review post-MVP)

#### Safety Indicators

**Implementation Status:** ✅ **COMPLETED** (Phase 4 - October 23, 2024)

**Visual Trust Badges System:**
- ✅ **Phone Verified** - Green badge/icon
- ✅ **Email Verified** - Green badge/icon
- ✅ **Clean Safety Record** - Green badge (no reports/issues)
- ⚠️ **Has Negative Reviews** - Yellow warning badge with tooltip
- 🛡️ **Multiple Reports** - Red danger badge with detailed warning

**Two Display Modes:**
- **Badges Mode** - Full chips with text labels (profile detail pages)
- **Compact Mode** - Small circular icons only (listing cards)

**Warning Banners:**
- Prominent yellow banner for professionals with multiple negative reviews
- Prominent red danger banner for professionals with multiple safety reports
- Displayed at top of professional profile pages before main content
- Includes explanatory text about the safety concern

**Components Implemented:**
- `SafetyIndicators` component with dual modes
- `SafetyWarningBanner` component for serious warnings
- Integrated into professional profile headers and listing cards
- Full internationalization (EN/BG/RU)
- Interactive tooltips with detailed safety information

#### Task Authenticity

- Photo requirement for task posts
- Location verification
- Suspicious activity detection (multiple similar posts, etc.)
- Community-driven safety through reporting system

### 3.6 Location Management System

**Status**: 🔄 **IN PROGRESS** - Architecture defined, migration in progress

**Design Philosophy:** Locale-independent, slug-based city system that works consistently across all languages and features.

#### Architecture Overview

**Storage Format:**
- Cities stored as **slugs** (e.g., `sofia`, `burgas`, `plovdiv`) in database
- Slugs are locale-independent identifiers
- Display labels translated via i18n system (`cities.sofia` → "София" / "Sofia" / "София")
- URL structure matches storage: `?city=burgas` filters by slug

**Benefits:**
- ✅ **Locale Independence:** Works identically in EN/BG/RU
- ✅ **Data Consistency:** No mismatches between translated city names
- ✅ **Clean URLs:** `?city=burgas` instead of `?city=Бургас`
- ✅ **Query Performance:** Simple exact-match queries on indexed column
- ✅ **Scalability:** Easy to add new cities (add slug + translations)
- ✅ **Future-Proof:** Ready for map picker integration

#### Supported Cities (MVP - Top 8 Bulgarian Cities)

Selected based on population and economic activity. All cities have:
- Unique slug identifier
- Translation keys for EN/BG/RU
- Population data for sorting

**City List:**
1. **Sofia** (`sofia`) - Capital, 1.2M population
2. **Plovdiv** (`plovdiv`) - 340k population
3. **Varna** (`varna`) - Black Sea coast, 330k population
4. **Burgas** (`burgas`) - Black Sea coast, 200k population
5. **Ruse** (`ruse`) - Danube River, 150k population
6. **Stara Zagora** (`stara-zagora`) - 140k population
7. **Pleven** (`pleven`) - 120k population
8. **Sliven** (`sliven`) - 90k population

**Post-MVP Expansion:**
- Additional major cities (Dobrich, Shumen, Pernik, etc.)
- Neighborhood/district support for major cities
- Interactive map picker with city boundaries

#### User Interface

**City Input Controls:**
- **Dropdown selection** (no free text input)
- Search/filter within dropdown for quick access
- Displays translated city names
- Sorted by population (largest first)
- Stores slug value on selection

**Locations Where City Selection Appears:**
1. **Task Creation** - Required field, dropdown selection
2. **Professional Profile** - Service area selection
3. **Browse Tasks** - Filter by city dropdown
4. **Browse Professionals** - Filter by city dropdown
5. **User Profile** - Optional location field

#### Database Schema

**Tasks Table:**
```sql
city TEXT NOT NULL,  -- Stores slug: 'sofia', 'burgas', etc.
neighborhood TEXT,   -- Optional, free text for now
location_notes TEXT  -- Additional location details
```

**Users Table (Professionals):**
```sql
city TEXT,           -- Stores slug: 'sofia', 'burgas', etc.
service_areas TEXT[] -- Array of city slugs (future: serve multiple cities)
```

**Indexes:**
```sql
CREATE INDEX idx_tasks_city ON tasks(city);
CREATE INDEX idx_users_city ON users(city);
```

#### Migration Strategy

**Phase 1: Data Normalization (Current)**
- Audit existing city data in database
- Create mapping: "Burgas"/"Бургас" → `burgas`
- Run migration to normalize all city values to slugs
- Add validation to prevent free-text input

**Phase 2: Frontend Updates**
- ✅ Update create-task form to use city dropdown (slugs only)
- ✅ Update professional profile to use city dropdown
- ✅ Update all filters to use slug-based queries
- ✅ Ensure translations work across all locales

**Phase 3: Validation & Constraints**
- Add database constraint: `city IN ('sofia', 'plovdiv', 'varna', ...)`
- Add TypeScript types: `CitySlug` union type
- Add API validation: Reject non-slug city values

#### Implementation Details

**City Constants** (`/src/features/cities/lib/cities.ts`):
```typescript
export const CITIES: City[] = [
  { slug: 'sofia', translationKey: 'cities.sofia', population: 1_200_000 },
  { slug: 'plovdiv', translationKey: 'cities.plovdiv', population: 340_000 },
  { slug: 'varna', translationKey: 'cities.varna', population: 330_000 },
  { slug: 'burgas', translationKey: 'cities.burgas', population: 200_000 },
  { slug: 'ruse', translationKey: 'cities.ruse', population: 150_000 },
  { slug: 'stara-zagora', translationKey: 'cities.staraZagora', population: 140_000 },
  { slug: 'pleven', translationKey: 'cities.pleven', population: 120_000 },
  { slug: 'sliven', translationKey: 'cities.sliven', population: 90_000 },
];
```

**Translation Keys** (all locales: EN/BG/RU):
```typescript
cities: {
  sofia: 'София' / 'Sofia' / 'София',
  plovdiv: 'Пловдив' / 'Plovdiv' / 'Пловдив',
  varna: 'Варна' / 'Varna' / 'Варна',
  burgas: 'Бургас' / 'Burgas' / 'Бургас',
  ruse: 'Русе' / 'Ruse' / 'Русе',
  staraZagora: 'Стара Загора' / 'Stara Zagora' / 'Стара Загора',
  pleven: 'Плевен' / 'Pleven' / 'Плевен',
  sliven: 'Сливен' / 'Sliven' / 'Сливен',
}
```

**API Query Example:**
```typescript
// Browse tasks with city filter
GET /api/tasks?city=burgas&category=plumbing

// Backend repository query
query = query.eq('city', params.city) // Exact slug match
```

**Display Example:**
```typescript
// Get translated label for display
import { getCitiesWithLabels } from '@/features/cities'

const cities = getCitiesWithLabels(t)
// Returns: [{ slug: 'burgas', label: 'Бургас' }, ...]
```

#### Future Enhancements (Post-MVP)

**Geographic Features:**
- Interactive map picker with city boundaries
- Neighborhood/district support for major cities
- Distance-based search (show tasks within X km)
- Service area radius for professionals

**Advanced Filtering:**
- Multi-city selection for professionals (serve multiple cities)
- Cross-city search with distance indicators
- Popular areas/neighborhoods as filter options

**Data Quality:**
- Geocoding integration (convert addresses to coordinates)
- Location verification via Google Maps API
- Automatic city detection from address input

## 4. Technical Requirements

### 4.1 Platform Architecture

- **Frontend:** Next.js (React-based framework)
- **Backend:** Next.js API routes
- **Database:** MongoDB
- **Deployment:** Vercel (recommended for Next.js) or self-hosted
- **File Storage:** MongoDB GridFS or cloud storage for images

### 4.2 Core Technologies

- **Framework:** Next.js 14+ (App Router)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js or custom JWT implementation
- **Styling:** Tailwind CSS or styled-components
- **Image handling:** Next.js Image optimization
- **Forms:** React Hook Form with validation

### 4.3 Integration Requirements

- Bulgarian VAT number verification API
- SMS gateway for local providers
- Email service provider
- Map services (Google Maps/OpenStreetMap)
- **Payment gateway integration**

### 4.4 Localization

- Multi-language support:
  - Bulgarian (primary)
  - Romanian
  - Serbian
  - Macedonian
  - Greek (future)
- Regional phone number formats
- Local currency display
- Cultural considerations in UX/UI

## 5. User Experience Requirements

### 5.1 Design Principles

- **Minimal but attractive design**
- Clean, modern interface
- Intuitive navigation
- Mobile-responsive
- Fast loading times
- Accessibility compliance (WCAG 2.1 AA)

### 5.2 Key User Flows

#### Customer Journey

1. Register → Create Task → Receive Applications → Select Service Provider → Get Contact Details → Communicate Directly → Rate & Review

#### Service Provider Journey

1. Register → Browse Tasks → Apply → Get Selected → Receive Customer Contact → Complete Work → Receive Rating

### 5.3 Navigation Architecture

**Design Philosophy:** Clear separation of customer and professional contexts to eliminate confusion in dual-role users.

#### Route Structure

**Customer Routes:**
- `/tasks/posted` - View and manage tasks the user created
  - Filter by status: All, Open, In Progress, Completed, Cancelled
  - View applications received on each task
  - Click through to task details and application management

**Professional Routes:**
- `/browse-tasks` - Discover and browse available tasks
- `/tasks/applications` - View all applications submitted to tasks
  - Filter by status: All, Pending, Accepted, Rejected, Withdrawn
  - Track application status and responses
  - Quick actions to view task or withdraw application
- `/tasks/work` - Manage active work and professional dashboard
  - **In Progress** (default) - Active accepted applications
  - **Pending Confirmations** - Tasks awaiting confirmation
  - **Completed** - Historical work record

#### Navigation Menu Organization

**Header User Avatar Dropdown:**
```
Profile

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

**Benefits:**
- ✅ No confusion between customer and professional roles
- ✅ Clear URL semantics (`/tasks/posted` vs `/tasks/applications`)
- ✅ Each route has single, focused purpose
- ✅ Scalable for future features
- ✅ Mobile-responsive with section headers

### 5.4 Performance Requirements

- Page load time < 3 seconds
- Mobile responsiveness across devices
- 99.5% uptime target
- Support for slow internet connections

## 6. MVP Feature Prioritization

### Must Have (MVP v1.0 - UI Focus)

- User registration (both types)
- Optional VAT verification system
- Task posting and browsing
- **Application submission UI:** ✅ COMPLETED
  - Application dialog/modal with form
  - Price, timeline, message inputs
  - Portfolio image upload
  - Application status badges
- **Applications Management UI:** ✅ COMPLETED
  - Applications list with filtering (All/Pending/Accepted/Rejected)
  - Sorting options (Newest/Price/Rating/Experience)
  - Application cards showing professional info and proposal
  - Application detail modal with full professional profile
  - Portfolio gallery with image carousel
  - Professional reviews display
  - Accept/Reject action dialogs with confirmation flows
  - Auto-rejection of other applications when one is accepted
  - Integration with notification system (deep linking)
  - Fully internationalized (EN/BG/RU)
  - Mobile-responsive design with bottom-sheet modals
- **Task completion UI:**
  - Dual confirmation dialogs
  - Completion status indicators
  - Review prompts
- **Notification Center UI:** ✅ COMPLETED
  - Header bell icon with unread badge
  - Notifications slide-over panel with tabs
  - Filter by type (All, Applications, Tasks, System)
  - Mark as read/unread functionality
  - Real-time unread badge counter
  - Persistent state with localStorage
  - Internationalization support (EN, BG, RU)
  - Mobile-responsive design
- Contact exchange system
- Rating/review system
- Search and filters
- Photo upload

### Should Have (v1.1)

- Advanced search filters
- **Email notification templates**
- Service provider portfolios
- Task categories expansion
- Multiple language support
- **Task activity log/timeline**
- **Navigation Architecture:** ✅ COMPLETED
  - Clear role separation (Customer vs Professional views)
  - `/tasks/posted` - Customer view for managing posted tasks
  - `/tasks/applications` - Professional view for submitted applications
  - `/tasks/work` - Professional view for active work (In Progress, Pending Confirmations)
  - Context-aware navigation menu with sections ("For Customers", "For Professionals")
  - Full internationalization (EN/BG/RU)

### Could Have (v2.0)

- Mobile apps (iOS/Android)
- In-app messaging system
- Video calls integration
- Advanced analytics
- Premium service provider features
- **Real-time WebSocket notifications**
- **Dispute resolution UI**
- **Application comparison mode**

### Won't Have (Initial Release)

- Payment processing (escrow system)
- Backend/Database implementation (focus on UI mockups)
- In-app video/audio calls
- Complex verification processes
- Document uploads beyond images

## 7. Business Requirements

### 7.1 Monetization Strategy (Future)

- Commission-based model (post-MVP)
- Premium service provider listings
- Featured task placements
- Advertisement revenue

### 7.2 Success Metrics

- User acquisition rate
- Task completion rate
- User retention (30/60/90 days)
- Average task value
- Professional verification success rate
- Customer satisfaction scores

### 7.3 Legal & Compliance

- GDPR compliance
- Local data protection laws
- Terms of service and privacy policy
- Dispute resolution framework
- Professional licensing compliance per country

## 8. Risk Assessment

### High Risk

- Professional verification fraud
- Cross-border payment complexity
- Regulatory differences between countries

### Medium Risk

- User adoption in competitive market
- Language localization accuracy
- Platform scalability

### Low Risk

- Technical implementation
- Basic feature development

## 9. Launch Strategy

### Phase 1: Bulgaria (Months 1-3)

- MVP development and testing
- Bulgarian VAT verification integration
- Local marketing and professional recruitment

### Phase 2: Regional Expansion (Months 4-6)

- Romania and Serbia market entry
- Multi-language implementation
- Cross-border operational framework

### Phase 3: Full Balkan Coverage (Months 7-12)

- North Macedonia and Greece expansion
- Advanced features rollout
- Payment system integration

## 10. Next Steps

1. **Technical Architecture Planning** - Define detailed technical specifications
1. **Design System Creation** - Develop UI/UX wireframes and design system
1. **Legal Framework Setup** - Establish terms, privacy policies, and regional compliance
1. **API Integration Research** - Verify availability and terms for VAT number verification APIs
1. **Team Assembly** - Identify development, design, and business development resources
1. **Market Research** - Conduct competitive analysis and user interviews in target markets

-----

## 11. Related Documentation

- **Application & Bidding System Plan:** `/docs/planning/task-application-bidding-system-plan.md`
  - Comprehensive 21-section plan covering complete user flows
  - Database schema specifications
  - API endpoints design
  - UI component requirements
  - Security and privacy considerations

-----

**Document Version:** 2.7
**Last Updated:** October 31, 2025
**Next Review:** November 2025

**Major Changes in v2.7:**
- ✅ **Telegram Authentication & Notification System - FULLY IMPLEMENTED**
  - **Package Upgrade:** Migrated from `react-telegram-login` to `@telegram-auth/react` (actively maintained, better TypeScript support)
  - **Dual Connection Methods:**
    - Method A: Direct Telegram login in auth slide-over (browser-based with phone verification)
    - Method B: Post-login connection via Profile Settings → Connect Telegram button
  - **Bot Infrastructure:**
    - Bot `/start` command handler with deep link support (`t.me/Trudify_bot?start=connect_{token}`)
    - Webhook API route at `/api/telegram/webhook` (receives bot updates)
    - Secure token system (15-min expiry, single-use, cryptographically verified)
  - **Database:**
    - `telegram_connection_tokens` table for secure account linking
    - `notification_preferences` JSONB column in users table
    - All Telegram user fields (telegram_id, username, first_name, last_name, photo_url)
  - **UI Components:**
    - TelegramConnection component in Profile Settings with connection status
    - Full i18n support (EN/BG/RU) - 17 new translation keys
    - Benefits display, error handling, loading states
  - **Deployment Ready:**
    - Webhook setup script: `/scripts/setup-telegram-webhook.ts`
    - Database migration guide: `/docs/telegram-setup-migration.md`
    - Environment variables configured
  - **Remaining Tasks:**
    - ⏳ Notification preferences UI (enable/disable specific notification types)
    - ⏳ Full end-to-end testing after Vercel deployment + webhook configuration
  - **Documentation:**
    - Implementation task: `/todo_tasks/telegram-bot-connection-for-notifications.md`
    - UX improvement task: `/todo_tasks/telegram-connection-visibility-improvement.md`

**Major Changes in v2.6:**
- ✅ **Safety Indicators UI Implementation** - Phase 4 Complete
  - Implemented `SafetyIndicators` component with dual display modes
  - Implemented `SafetyWarningBanner` for serious safety alerts
  - Integrated into professional profiles and listing cards
  - Visual trust badges system (Phone/Email Verified, Clean Record, Warnings)
  - Full internationalization (EN/BG/RU) with interactive tooltips
  - Comprehensive implementation in `/todo_tasks/07-mvp-task-rejection-and-safety.md`

**Major Changes in v2.5:**
- 🚨 **Task Creation Constraints & Review Enforcement** - Two-tier accountability system
  - **HARD BLOCK:** Pending confirmations (`pending_customer_confirmation`) - customer MUST respond
  - **SOFT BLOCK:** Missing reviews - 3 task grace period before enforcement
  - In-progress tasks don't block (allows multiple simultaneous projects)
  - Detailed implementation plan in `/todo_tasks/08-completion-and-review-enforcement.md`

**Major Changes in v2.4:**
- ✅ **Navigation Architecture Implementation** - Complete dual-role UX separation
  - Implemented `/tasks/posted` for customer task management
  - Implemented `/tasks/applications` for professional application tracking
  - Implemented `/tasks/work` for professional active work dashboard
  - Context-aware navigation menu with role-based sections
  - Full internationalization across EN/BG/RU
  - Comprehensive task document in `/todo_tasks/09-navigation-architecture-refactor.md`

**Major Changes in v2.3:**
- 🔄 **Simplified MVP Safety & Dispute System** - No support team required
  - Task rejection flow instead of complex dispute resolution
  - Automated two-report suspension system for scam/abuse
  - Smart negative review hiding (pattern detection)
  - Community-driven safety without manual intervention
  - Comprehensive documentation in `/todo_tasks/07-mvp-task-rejection-and-safety.md`

**Major Changes in v2.2:**
- ✅ **Applications Management UI completed** - Full implementation details added
  - Complete filtering, sorting, and viewing system
  - Accept/Reject dialogs with confirmation flows
  - Deep linking from notifications to specific applications
  - Mobile-optimized with bottom-sheet modals
  - Full i18n support across all components

**Major Changes in v2.1:**
- ✅ Marked Application Submission UI as completed
- ✅ Marked Notification Center UI as completed with detailed implementation notes
- Updated notification center features with actual implementation details

**Major Changes in v2.0:**
- Added comprehensive Application & Bidding System section (3.3)
- Updated MVP feature prioritization with UI-focused tasks
- Added reference to detailed planning documentation
- Clarified dual confirmation workflow for task completion
- Added notification center requirements