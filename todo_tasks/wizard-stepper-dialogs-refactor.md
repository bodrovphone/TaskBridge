# Wizard/Stepper Dialogs Refactor

## Task Description
Refactor complex dialogs that don't fit well on mobile into wizard-style stepper dialogs. This improves mobile UX by breaking complex forms into digestible steps with clear progress indication.

## Status
**In Progress** - First dialog completed, awaiting mobile testing before continuing.

## Problem
Several dialogs have too many fields/sections displayed at once, causing:
- Poor mobile experience (scrolling required, keyboard covers inputs)
- Cognitive overload for users
- Form abandonment

## Completed

### ✅ ApplicationFormState (Apply on Task) - COMPLETED
**Location:** `src/components/tasks/application-dialog/ApplicationFormState.tsx`
**Reduced:** 543 lines → 270 lines

**Implementation:**
- Created reusable `WizardDialog` component (`src/components/ui/wizard-dialog.tsx`)
- Split into 4 step components:
  - `PriceStep.tsx` - Proposed price input with budget hint
  - `TimelineStep.tsx` - Visual timeline card selection
  - `MessageStep.tsx` - Cover letter with character counter
  - `ReviewStep.tsx` - Summary with edit buttons
- Full i18n support (EN/BG/RU)
- Mobile-responsive (full-screen on mobile, modal on desktop)
- Framer Motion animations between steps
- Step indicator with progress tracking

**Files created:**
- `src/components/ui/wizard-dialog.tsx`
- `src/components/tasks/application-dialog/steps/PriceStep.tsx`
- `src/components/tasks/application-dialog/steps/TimelineStep.tsx`
- `src/components/tasks/application-dialog/steps/MessageStep.tsx`
- `src/components/tasks/application-dialog/steps/ReviewStep.tsx`
- `src/components/tasks/application-dialog/steps/index.ts`

---

## Candidates for Next Phase (after mobile testing)

### 1. AcceptApplicationDialog (434 lines) - **HIGH PRIORITY**
**Location:** `src/components/tasks/accept-application-dialog.tsx`

**Current state:** Single long form with:
- Application summary (price, timeline, message preview)
- Contact method selection (phone/email/custom)
- Custom contact input
- Optional message to professional
- Contact sharing agreement checkbox

**Proposed wizard steps:**
1. **Review Application** - Show professional's offer details (price, timeline, message)
2. **Share Contact** - Choose how to share your contact info
3. **Add Message** (optional) - Write a message to the professional
4. **Confirm** - Summary + agreement checkbox + submit

**Why this should be next:**
- Clear logical separation into steps
- High-value user flow (accepting work)
- Currently most problematic on mobile
- ~434 lines can be split into ~4 focused components

---

### 2. ReviewDialog (394 lines)
**Location:** `src/features/reviews/components/review-dialog.tsx`

**Current state:** Rate + write review in single view

**Proposed wizard steps:**
1. **Rating** - Star rating selection
2. **Written Review** - Text feedback
3. **Confirm** - Preview and submit

---

### 3. ReportScamDialog (217 lines)
**Location:** `src/components/safety/report-scam-dialog.tsx`

**Current state:** Report form with category, description, evidence

**Proposed wizard steps:**
1. **What happened?** - Category selection
2. **Details** - Description
3. **Evidence** (optional) - Upload screenshots
4. **Submit** - Review and confirm

---

## Technical Approach

### Reusable Wizard Component
Create a generic `WizardDialog` component:

```tsx
interface WizardStep {
  id: string
  title: string
  component: React.ReactNode
  isOptional?: boolean
  canSkip?: boolean
}

interface WizardDialogProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: () => void
  onCancel: () => void
}
```

### Features
- Step indicator (dots or numbered)
- Back/Next navigation
- Skip optional steps
- Progress persistence (don't lose data on back)
- Mobile-optimized (full-screen on mobile, modal on desktop)
- Keyboard-aware (inputs stay visible)
- Animation between steps (Framer Motion)

### Component Location
`src/components/ui/wizard-dialog.tsx`

## Acceptance Criteria

### Phase 1 - POC (ApplicationFormState) ✅ COMPLETED
- [x] Create reusable `WizardDialog` base component
- [x] Refactor ApplicationFormState into 4 steps
- [x] Step indicator showing progress
- [x] Back/Next buttons with proper state
- [x] Mobile-responsive (full height on mobile)
- [x] Preserve form data when navigating between steps
- [x] Final step shows summary before submit
- [x] Translated step titles in EN/BG/RU

### Phase 2 - AcceptApplicationDialog (pending mobile testing)
- [ ] Refactor AcceptApplicationDialog into 4 steps using WizardDialog
- [ ] Test on mobile devices
- [ ] Verify contact sharing flow works correctly

## Priority
Medium-Low (UX improvement, not blocking)

## Estimated Complexity
High - requires new base component + refactoring existing dialog

## References
- Radix UI Dialog for base
- Framer Motion for step transitions
- Consider: https://ui.shadcn.com/docs/components/stepper (if available)
