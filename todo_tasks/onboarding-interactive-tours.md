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
- [ ] Implement initial role choice modal (post-registration)
- [ ] Implement tour trigger logic based on user's choice
- [ ] Add "Help" button in mobile menu / hamburger menu to restart tour
- [ ] Store tour completion status in user preferences (Supabase)

### Welcome Prompt (Tour Opt-in)
**Trigger:** After successful registration (first login)

**Design:**
- Centered modal/card (not full-screen, friendly)
- Welcome message: "Welcome to Trudify!"
- Brief value prop: "Would you like a quick tour to get started?"
- Two buttons:
  - **"Yes, show me around"** → Proceeds to Role Choice
  - **"Maybe later"** → Dismisses, user can access via Help button

### Role Choice Modal
**Trigger:** After user clicks "Yes, show me around"

**Design:**
- Full-screen modal with dimmed background
- Question: "What brings you to Trudify?"
- Two large, visually distinct cards/buttons:
  1. **"I need help with a task"** (Customer path) - Icon: clipboard/task
  2. **"I'm looking for work"** (Professional path) - Icon: briefcase/tools
- Choice stored in `onboarding_state.initial_choice`

**Flow:**
```
Registration → Welcome Prompt → "Yes" → Role Choice → Welcome Tour → App
                    │
                    └── "Maybe later" → App (can restart via Help button)

Role Choice:
    "I need help"      →  Customer Welcome Tour
    "Looking for work" →  Professional Welcome Tour
```

### Help Button (Tour Restart)
- Location: Mobile hamburger menu AND desktop user dropdown
- Label: "Help" or "Take a tour"
- Clicking opens a small menu:
  - "Show me how to post a task" → Customer tour
  - "Show me how to find work" → Professional tour
- Available to all users regardless of onboarding state

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
│       ├── OnboardingProvider.tsx    # Wraps app with Onborda context ('use client')
│       ├── WelcomePrompt.tsx         # "Would you like a tour?" opt-in modal
│       ├── RoleChoiceModal.tsx       # "What brings you here?" modal
│       ├── OnboardingTooltip.tsx     # Custom styled tooltip (shadcn/ui)
│       ├── HelpMenu.tsx              # "Help" dropdown for tour restart
│       ├── tours/
│       │   ├── customer-welcome.ts   # Customer tour steps
│       │   ├── professional-welcome.ts
│       │   ├── first-task-posted.ts
│       │   └── first-application.ts
│       └── index.ts
├── hooks/
│   └── use-onboarding.ts             # Tour state management
└── lib/
    ├── intl/
    │   ├── en/onboarding.ts          # English tour translations
    │   ├── bg/onboarding.ts          # Bulgarian tour translations
    │   └── ru/onboarding.ts          # Russian tour translations
    └── onboarding/
        └── tour-config.ts            # Tour definitions
```

### SSR Considerations
- `OnboardingProvider.tsx` must have `'use client'` directive
- Wrap provider at layout level but inside client boundary
- Tour state hydration should happen after mount to avoid hydration mismatches

### State Storage (localStorage)
```typescript
// Key: 'trudify_onboarding'
// Stored as JSON in localStorage

interface OnboardingState {
  welcomePromptShown: boolean      // true after "Welcome" prompt displayed
  tourAccepted: boolean            // true if user clicked "Yes, show me around"
  initialChoice: 'customer' | 'professional' | null
  customerWelcomeCompleted: boolean
  professionalWelcomeCompleted: boolean
  firstTaskTourCompleted: boolean
  firstApplicationTourCompleted: boolean
}

// Default state
const DEFAULT_STATE: OnboardingState = {
  welcomePromptShown: false,
  tourAccepted: false,
  initialChoice: null,
  customerWelcomeCompleted: false,
  professionalWelcomeCompleted: false,
  firstTaskTourCompleted: false,
  firstApplicationTourCompleted: false
}

// Helper in use-onboarding.ts
export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  const stored = localStorage.getItem('trudify_onboarding')
  return stored ? JSON.parse(stored) : DEFAULT_STATE
}

export function updateOnboardingState(updates: Partial<OnboardingState>) {
  const current = getOnboardingState()
  localStorage.setItem('trudify_onboarding', JSON.stringify({ ...current, ...updates }))
}
```

**Why localStorage (not database):**
- Tour state is device-specific UX, not critical user data
- If user clears browser → sees tour again (acceptable)
- Simpler, faster, no migration needed

### Tour Trigger Logic
```typescript
// Pseudo-code for tour triggering
// NOTE: Users can be BOTH customer and professional - trigger based on CONTEXT not role

function shouldShowTour(user: User, tourId: string, currentContext: 'customer' | 'professional'): boolean {
  // Check if tours disabled
  if (user.onboarding_state.tours_disabled) return false

  // Check if already completed
  if (user.onboarding_state[`${tourId}_completed`]) return false

  // Tour-specific conditions - based on page context, not user role
  switch (tourId) {
    case 'customer_welcome':
      // Show on customer pages (create-task, posted-tasks) if no tasks posted yet
      return currentContext === 'customer' && user.tasks_posted === 0
    case 'professional_welcome':
      // Show on professional pages (browse-tasks, applications) if no applications yet
      return currentContext === 'professional' && user.applications_count === 0
    case 'first_task_posted':
      // Triggered after successful task creation
      return currentContext === 'customer' && !user.onboarding_state.first_task_tour_completed
    case 'first_application':
      // Triggered after successful application submission
      return currentContext === 'professional' && !user.onboarding_state.first_application_tour_completed
  }
}

// Context detection based on current route
function getCurrentContext(pathname: string): 'customer' | 'professional' {
  const professionalRoutes = ['/browse-tasks', '/tasks/applications', '/tasks/work']
  const customerRoutes = ['/create-task', '/tasks/posted']

  if (professionalRoutes.some(route => pathname.includes(route))) return 'professional'
  if (customerRoutes.some(route => pathname.includes(route))) return 'customer'
  return 'customer' // default for ambiguous pages like home
}
```

### Tour Trigger Locations
Where each component/tour is triggered:

| Component/Tour | Trigger Location | Condition |
|------|-----------------|-------|
| `WelcomePrompt` | OnboardingProvider | After auth, if `welcome_prompt_shown === false` |
| `RoleChoiceModal` | WelcomePrompt `onAccept()` | User clicks "Yes, show me around" |
| `customer_welcome` | RoleChoiceModal `onSelect("customer")` | User clicks "I need help with a task" |
| `professional_welcome` | RoleChoiceModal `onSelect("professional")` | User clicks "I'm looking for work" |
| `first_task_posted` | `/app/[lang]/create-task/` success handler | After task creation API success |
| `first_application` | Task detail page apply success handler | After application submission success |

### Help Button Integration
```typescript
// In Header.tsx / MobileMenu.tsx
import { HelpMenu } from '@/components/onboarding'

// Desktop: Add to user dropdown menu
<DropdownItem>
  <HelpMenu />
</DropdownItem>

// Mobile: Add to hamburger menu
<NavbarMenuItem>
  <HelpMenu />
</NavbarMenuItem>
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

### Z-Index & Modal Interactions
- Onborda spotlight overlay needs high z-index (typically z-[9999])
- Must be ABOVE our existing modals/slide-overs (auth-slide-over, notification-center)
- Pause/hide tour if user opens a modal during tour
- Resume tour when modal closes OR skip current step

## Acceptance Criteria

### Phase 1: Core Setup
- [ ] Onborda installed and configured
- [ ] `use-onboarding.ts` hook with localStorage state management
- [ ] Custom tooltip component created (matches design system)

### Phase 2: Welcome Flow
- [ ] WelcomePrompt component implemented (opt-in modal)
- [ ] Shows after first registration with "Yes/Maybe later" options
- [ ] RoleChoiceModal component implemented
- [ ] Shows after user accepts tour ("Yes, show me around")
- [ ] Two clear role options: "I need help" / "I'm looking for work"
- [ ] Choice stored in localStorage (`initialChoice`)
- [ ] Triggers appropriate welcome tour after selection

### Phase 3: Welcome Tours
- [ ] Customer welcome tour implemented (5 steps)
- [ ] Professional welcome tour implemented (5 steps)
- [ ] Tours dim background and spotlight target elements
- [ ] Clear step indicators and skip option

### Phase 4: Contextual Tours
- [ ] First task posted tour implemented (4 steps)
- [ ] First application tour implemented (4 steps)
- [ ] Tours trigger based on page context (not user role)
- [ ] Tours skip if user has already completed key actions

### Phase 5: Help Button & Polish
- [ ] "Help" button added to mobile hamburger menu
- [ ] "Help" button added to desktop user dropdown
- [ ] Help menu allows choosing which tour to restart
- [ ] Mobile responsive across all components
- [ ] Translations for EN/BG/RU (`onboarding.ts` in each locale)
- [ ] Z-index properly handles existing modals/slide-overs

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
