# Migrate All NextUI Components to Radix UI

## Task Description
Complete migration from NextUI to Radix UI (shadcn/ui) across the entire codebase for consistency and better mobile behavior.

## Context
- NextUI Modal components cause mobile keyboard issues
- Radix UI provides better accessibility and native behavior
- Having two UI libraries increases bundle size and inconsistency
- Goal: Single UI library (Radix/shadcn) for all components

## Current State
- **Total files using NextUI**: ~134 source files
- **Dialog/Modal files**: 30 (tracked in separate task)
- **Other component files**: ~104

## Files to Migrate (Non-Dialog)

### Core UI Components
- [ ] `src/components/ui/task-card.tsx`
- [ ] `src/components/ui/posted-task-card.tsx`
- [ ] `src/components/ui/category-card.tsx`
- [ ] `src/components/ui/main-category-card.tsx`
- [ ] `src/components/ui/auth-slide-over.tsx`
- [ ] `src/components/ui/city-autocomplete.tsx`
- [ ] `src/components/ui/fallback-avatar.tsx`
- [ ] `src/components/ui/user-avatar-dropdown.tsx`
- [ ] `src/components/ui/compact-rating-slider.tsx`
- [ ] `src/components/ui/task-hint-banner.tsx`
- [ ] `src/components/ui/notification-setup-chip.tsx`
- [ ] `src/components/ui/notification-warning-banner.tsx`

### Common Components
- [ ] `src/components/common/header.tsx`
- [ ] `src/components/common/language-switcher.tsx`
- [ ] `src/components/common/category-search.tsx`

### Task Components
- [ ] `src/components/tasks/task-form.tsx`
- [ ] `src/components/tasks/application-detail.tsx`
- [ ] `src/components/tasks/application-card.tsx`
- [ ] `src/components/tasks/task-application-badge.tsx`
- [ ] `src/components/tasks/task-image-upload.tsx`
- [ ] `src/components/tasks/pending-confirmation-banner.tsx`
- [ ] `src/components/tasks/completion-timeline.tsx`
- [ ] `src/components/tasks/completion-success-view.tsx`
- [ ] `src/components/tasks/task-status-badge.tsx`
- [ ] `src/components/tasks/applications-list.tsx`
- [ ] `src/components/tasks/task-completion-button.tsx`
- [ ] `src/components/tasks/empty-posted-tasks.tsx`

### Safety Components
- [ ] `src/components/safety/suspension-banner.tsx`

### Review Components
- [ ] `src/components/reviews/hidden-reviews-notice.tsx`

### Feature: Professionals
- [ ] `src/features/professionals/components/professional-card.tsx`
- [ ] `src/features/professionals/components/safety-indicators.tsx`
- [ ] `src/features/professionals/components/safety-warning-banner.tsx`
- [ ] `src/features/professionals/components/filter-controls.tsx`
- [ ] `src/features/professionals/components/sections/search-filters-section.tsx`
- [ ] `src/features/professionals/components/sections/completed-tasks-section.tsx`
- [ ] `src/features/professionals/components/sections/results-section.tsx`
- [ ] `src/features/professionals/components/sections/action-buttons-row.tsx`
- [ ] `src/features/professionals/components/sections/services-section.tsx`
- [ ] `src/features/professionals/components/sections/reviews-section.tsx`
- [ ] `src/features/professionals/components/sections/professional-header.tsx`
- [ ] `src/features/professionals/components/sections/portfolio-gallery.tsx`
- [ ] `src/features/professionals/components/filters/filter-bar.tsx`
- [ ] `src/features/professionals/components/filters/professionals-sort-dropdown.tsx`
- [ ] `src/features/professionals/components/filters/completed-jobs-filter.tsx`
- [ ] `src/features/professionals/components/filters/active-filters.tsx`
- [ ] `src/features/professionals/components/filters/rating-filter.tsx`

### Feature: Browse Tasks
- [ ] `src/features/browse-tasks/components/sections/search-filters-section.tsx`
- [ ] `src/features/browse-tasks/components/sections/results-section.tsx`

### Feature: Applications
- [ ] `src/features/applications/components/my-application-card.tsx`
- [ ] `src/features/applications/components/application-detail-view.tsx`
- [ ] `src/features/applications/components/my-applications-list.tsx`

### Feature: Reviews
- [ ] `src/features/reviews/components/pending-reviews-list.tsx`

### App: Create Task
- [ ] `src/app/[lang]/create-task/page.tsx`
- [ ] `src/app/[lang]/create-task/components/task-details-section.tsx`
- [ ] `src/app/[lang]/create-task/components/title-category-section.tsx`
- [ ] `src/app/[lang]/create-task/components/location-section.tsx`
- [ ] `src/app/[lang]/create-task/components/photos-section.tsx`
- [ ] `src/app/[lang]/create-task/components/timeline-section.tsx`
- [ ] `src/app/[lang]/create-task/components/budget-section.tsx`
- [ ] `src/app/[lang]/create-task/components/reopen-banner.tsx`
- [ ] `src/app/[lang]/create-task/components/category-selection.tsx`
- [ ] `src/app/[lang]/create-task/components/invitation-banner.tsx`
- [ ] `src/app/[lang]/create-task/components/review-section.tsx`

### App: Browse Tasks
- [ ] `src/app/[lang]/browse-tasks/components/city-filter.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/filter-bar.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/budget-filter.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/category-filter.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/active-filters.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/sort-dropdown.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/urgency-filter.tsx`

### App: Tasks
- [ ] `src/app/[lang]/tasks/[id]/error.tsx`
- [ ] `src/app/[lang]/tasks/[id]/not-found.tsx`
- [ ] `src/app/[lang]/tasks/[id]/edit/page.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/task-detail-content.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/task-activity.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/sections/task-in-progress-state.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/sections/questions-section.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/sections/applications-section.tsx`
- [ ] `src/app/[lang]/tasks/[id]/edit/components/category-display.tsx`
- [ ] `src/app/[lang]/tasks/posted/components/posted-tasks-page-content.tsx`

### App: Profile
- [ ] `src/app/[lang]/profile/loading.tsx`
- [ ] `src/app/[lang]/profile/professional/components/professional-profile-page-content.tsx`
- [ ] `src/app/[lang]/profile/customer/components/customer-profile-page-content.tsx`
- [ ] `src/app/[lang]/profile/components/email-verification-banner.tsx`
- [ ] `src/app/[lang]/profile/components/telegram-connection.tsx`
- [ ] `src/app/[lang]/profile/components/check-inbox-banner.tsx`
- [ ] `src/app/[lang]/profile/components/skills-selector.tsx`
- [ ] `src/app/[lang]/profile/components/telegram-prompt-banner.tsx`
- [ ] `src/app/[lang]/profile/components/professional-profile-old.tsx`
- [ ] `src/app/[lang]/profile/components/service-categories-selector.tsx`
- [ ] `src/app/[lang]/profile/components/shared/profile-header.tsx`
- [ ] `src/app/[lang]/profile/components/sections/availability-section.tsx`
- [ ] `src/app/[lang]/profile/components/sections/verification-section.tsx`
- [ ] `src/app/[lang]/profile/components/sections/professional-identity-section.tsx`
- [ ] `src/app/[lang]/profile/components/sections/business-settings-section.tsx`

### App: Auth Pages
- [ ] `src/app/[lang]/reset-password/reset-password-content.tsx`
- [ ] `src/app/[lang]/forgot-password/forgot-password-content.tsx`

### App: Legal Pages
- [ ] `src/app/[lang]/privacy/privacy-page-content.tsx`
- [ ] `src/app/[lang]/terms/terms-page-content.tsx`

### App: Reviews
- [ ] `src/app/[lang]/reviews/pending/page.tsx`

### App: Providers & Loading
- [ ] `src/app/providers.tsx` (NextUIProvider - keep until migration complete)
- [ ] `src/app/[lang]/providers.tsx` (NextUIProvider - keep until migration complete)
- [ ] `src/app/[lang]/loading.tsx`

## NextUI to Radix Component Mapping

| NextUI | Radix/shadcn |
|--------|-------------|
| `Button` | `@/components/ui/button` |
| `Input` | `@/components/ui/input` |
| `Textarea` | `@/components/ui/textarea` |
| `Select` | `@/components/ui/select` |
| `Checkbox` | `@/components/ui/checkbox` |
| `RadioGroup` | `@/components/ui/radio-group` |
| `Card` | `@/components/ui/card` |
| `Avatar` | `@/components/ui/avatar` |
| `Badge/Chip` | `@/components/ui/badge` |
| `Dropdown` | `@/components/ui/dropdown-menu` |
| `Tabs` | `@/components/ui/tabs` |
| `Tooltip` | `@/components/ui/tooltip` |
| `Spinner` | Custom or `@/components/ui/spinner` |
| `Skeleton` | `@/components/ui/skeleton` |
| `Image` | `next/image` (already using) |
| `Link` | `next/link` + LocaleLink |
| `Navbar` | Custom header component |
| `Popover` | `@/components/ui/popover` |
| `Accordion` | `@/components/ui/accordion` |
| `Switch` | `@/components/ui/switch` |
| `Slider` | `@/components/ui/slider` |
| `Progress` | `@/components/ui/progress` |

## Migration Strategy

### Phase 1: Simple Components (Low Risk)
Start with standalone components that don't have complex state:
- Badges, Chips, Avatars
- Simple cards
- Static content pages

### Phase 2: Form Components (Medium Risk)
- Input fields
- Select dropdowns
- Checkboxes, Radio groups
- Form validation handling

### Phase 3: Complex Components (High Risk)
- Navigation (Header, Dropdowns)
- Filters and sorting
- Interactive galleries
- Application flows

### Phase 4: Cleanup
- Remove NextUIProvider from providers
- Remove `@nextui-org/react` from package.json
- Clean up unused NextUI theme config

## Priority
**Low** - Long-term technical debt reduction, not blocking features

## Estimated Effort
- **Per simple component**: 15-30 minutes
- **Per complex component**: 1-2 hours
- **Total**: ~50-80 hours (can be done incrementally)

## Notes
- Migrate incrementally - no big bang
- Test each component after migration
- Keep NextUIProvider until all components migrated
- Can coexist with NextUI during migration period
