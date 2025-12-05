# Interactive Onboarding Tours with Onborda

## Task Description
Implement interactive step-by-step onboarding tours to guide new users through the app. Using Onborda library which is built for Next.js with Framer Motion and Tailwind CSS (already in our stack).

## Why Onborda
- Native Next.js App Router support
- Uses Framer Motion (already installed)
- Uses Tailwind CSS (already installed)
- shadcn/ui compatible tooltips
- Multi-tour support (different tours for customers vs professionals)
- TypeScript native
- MIT License
- Actively maintained (last update Dec 2024)

**Links:**
- [GitHub](https://github.com/uixmat/onborda)
- [Documentation](https://www.onborda.dev/)

## Requirements

### Core Features
- [ ] Install and configure Onborda
- [ ] Create custom tooltip component matching our design system
- [ ] Implement tour trigger logic (first visit detection)
- [ ] Add "Restart tour" option in profile/settings
- [ ] Store tour completion status in user preferences (Supabase)

### Tours to Implement

#### 1. Customer Onboarding Tour
**Trigger:** First login as customer OR hasn't posted a task yet
**Steps:**
1. Welcome message + app overview
2. "Post a Task" button highlight → "Start here to get help"
3. Browse professionals → "Or find a professional directly"
4. Profile avatar → "Manage your account here"
5. Notifications bell → "You'll be notified when professionals apply"

#### 2. Professional Onboarding Tour
**Trigger:** First login as professional OR hasn't applied to a task yet
**Steps:**
1. Welcome message + how TaskBridge works for professionals
2. "Browse Tasks" highlight → "Find work opportunities here"
3. Task card example → "Click to see details and apply"
4. "My Applications" → "Track your applications here"
5. Profile completion prompt → "Complete your profile to stand out"

#### 3. First Task Posted Tour (Customer)
**Trigger:** After successfully posting first task
**Steps:**
1. Congratulations message
2. "My Posted Tasks" → "Track your task here"
3. Explain what happens next (professionals will apply)
4. How to review applications

#### 4. First Application Tour (Professional)
**Trigger:** After submitting first application
**Steps:**
1. Congratulations message
2. "My Applications" → "Track status here"
3. Explain what happens next (customer reviews)
4. Tips for better applications

## Technical Implementation

### File Structure
```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingProvider.tsx    # Wraps app with Onborda context
│       ├── OnboardingTooltip.tsx     # Custom styled tooltip (shadcn/ui)
│       ├── tours/
│       │   ├── customer-welcome.ts   # Customer tour steps
│       │   ├── professional-welcome.ts
│       │   ├── first-task-posted.ts
│       │   └── first-application.ts
│       └── index.ts
├── hooks/
│   └── use-onboarding.ts             # Tour state management
└── lib/
    └── onboarding/
        └── tour-config.ts            # Tour definitions
```

### Database Schema Addition
```sql
-- Add to users table or create separate table
ALTER TABLE users ADD COLUMN onboarding_state JSONB DEFAULT '{
  "customer_welcome_completed": false,
  "professional_welcome_completed": false,
  "first_task_tour_completed": false,
  "first_application_tour_completed": false,
  "tours_disabled": false
}'::jsonb;
```

### Tour Trigger Logic
```typescript
// Pseudo-code for tour triggering
function shouldShowTour(user: User, tourId: string): boolean {
  // Check if tours disabled
  if (user.onboarding_state.tours_disabled) return false

  // Check if already completed
  if (user.onboarding_state[`${tourId}_completed`]) return false

  // Tour-specific conditions
  switch (tourId) {
    case 'customer_welcome':
      return user.role === 'customer' && user.tasks_posted === 0
    case 'professional_welcome':
      return user.role === 'professional' && user.applications_count === 0
    // ... etc
  }
}
```

## UI/UX Considerations

### Tooltip Design
- Match our blue/green color scheme
- Rounded corners (our standard border-radius)
- Clear step indicator (1/5, 2/5, etc.)
- "Skip tour" always available
- "Don't show again" option on last step

### Animations
- Smooth spotlight transitions (Framer Motion)
- Subtle pulse on highlighted elements
- Slide-in tooltip animation

### Mobile Considerations
- Full-width tooltips on mobile
- Ensure highlighted elements are scrolled into view
- Touch-friendly buttons (min 44px tap targets)

## Acceptance Criteria
- [ ] Onborda installed and configured
- [ ] Custom tooltip component created
- [ ] Customer welcome tour implemented (5 steps)
- [ ] Professional welcome tour implemented (5 steps)
- [ ] Tour completion stored in database
- [ ] "Restart tour" option in profile settings
- [ ] Tours skip if user has already completed key actions
- [ ] Mobile responsive
- [ ] Translations for EN/BG/RU

## Priority
Medium - Important for user retention but not blocking

## Estimated Complexity
Medium - Onborda handles heavy lifting, mainly configuration work

## Dependencies
- `onborda` npm package
- Framer Motion (already installed)
- Tailwind CSS (already installed)

## References
- [Onborda Documentation](https://www.onborda.dev/)
- [Onborda GitHub](https://github.com/uixmat/onborda)
- Research: Multiple tours for different user journeys
