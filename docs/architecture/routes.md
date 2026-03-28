# Routes Documentation

Complete documentation of all routes in TaskBridge.

## Route Tree

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
├─ /[lang]/tasks/posted
│   ├─ Purpose: Customer's posted tasks management
│   ├─ Server Component: Yes
│   └─ Auth Required: Yes
│
├─ /[lang]/tasks/applications
│   ├─ Purpose: Professional's applications management
│   ├─ Server Component: Yes
│   └─ Auth Required: Yes
│
├─ /[lang]/tasks/work
│   ├─ Purpose: Professional's active work dashboard
│   ├─ Server Component: Yes
│   └─ Auth Required: Yes
│
└─ /[lang]/tasks/[id]
    ├─ Purpose: Individual task detail page
    ├─ Components: TaskGallery, TaskActions, PrivacyToggle, TaskActivity
    ├─ Server Component: Yes (with client sub-components)
    ├─ Mobile Optimized: Yes
    ├─ Translations: Complete (EN/BG/RU)
    └─ Features:
        ├─ Privacy toggle for sensitive information
        ├─ Authentication slide-over (Google/Facebook/Telegram)
        ├─ Apply/Question actions
        └─ TaskActivity (for task authors)
```

## Route Categories

### Public Pages (No Auth Required)

These routes are publicly accessible:

| Route | Purpose |
|-------|---------|
| `/[lang]/` | Landing page |
| `/[lang]/browse-tasks` | Browse and filter available tasks |
| `/[lang]/professionals` | Browse professionals directory |
| `/[lang]/professionals/[id]` | Professional detail page |
| `/[lang]/tasks/[id]` | Task detail page |

### Protected Routes (Auth Required)

These routes require authentication:

| Route | Purpose | User Type |
|-------|---------|-----------|
| `/[lang]/create-task` | Create new task | Customer |
| `/[lang]/profile` | Profile management | Both |
| `/[lang]/tasks/posted` | Manage posted tasks | Customer |
| `/[lang]/tasks/applications` | View applications | Professional |
| `/[lang]/tasks/work` | Active work dashboard | Professional |

### API Routes

All API routes are located in `/src/app/api/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/tasks` | GET | List tasks with filters |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/[id]` | GET | Get task details |
| `/api/professionals` | GET | List professionals |
| `/api/professionals/[id]` | GET | Get professional details |
| `/api/applications` | POST | Submit application |
| `/api/auth/callback` | GET | OAuth callback handler |

## Component Types

### Server Components (default)

Used for SEO and initial data fetching:
- Landing page
- Browse tasks page
- Browse professionals page
- Professional detail page
- Task detail page (main layout)

### Client Components

Used when interactivity is required:
- Create task form
- Profile management form
- Task detail content (translations)
- Authentication slide-over
- All form components
- Modals and dialogs

## URL Structure

All routes use locale-prefixed URLs for SEO:

```
/{locale}/{path}

Examples:
/en/browse-tasks
/bg/professionals/123
/ru/tasks/456
```

See [Internationalization](./internationalization.md) for locale handling details.
