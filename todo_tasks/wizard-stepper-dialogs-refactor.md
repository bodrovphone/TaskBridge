# Wizard/Stepper Dialogs Refactor

## Task Description
Refactor complex dialogs that don't fit well on mobile into wizard-style stepper dialogs. This improves mobile UX by breaking complex forms into digestible steps with clear progress indication.

## Problem
Several dialogs have too many fields/sections displayed at once, causing:
- Poor mobile experience (scrolling required, keyboard covers inputs)
- Cognitive overload for users
- Form abandonment

## Candidates for Refactoring

### 1. AcceptApplicationDialog (434 lines) - **RECOMMENDED FOR POC**
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

**Why this is best for POC:**
- Clear logical separation into steps
- High-value user flow (accepting work)
- Currently most problematic on mobile
- ~434 lines can be split into ~4 focused components

---

### 2. ApplicationFormState (543 lines)
**Location:** `src/components/tasks/application-dialog/ApplicationFormState.tsx`

**Current state:** Professional applies to task with price, timeline, message

**Proposed wizard steps:**
1. **Your Offer** - Proposed price input
2. **Availability** - Timeline selection
3. **Cover Letter** - Message/pitch to customer
4. **Review & Submit** - Summary of application

---

### 3. ReviewDialog (394 lines)
**Location:** `src/features/reviews/components/review-dialog.tsx`

**Current state:** Rate + write review in single view

**Proposed wizard steps:**
1. **Rating** - Star rating selection
2. **Written Review** - Text feedback
3. **Confirm** - Preview and submit

---

### 4. ReportScamDialog (217 lines)
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

## Acceptance Criteria (POC - AcceptApplicationDialog)
- [ ] Create reusable `WizardDialog` base component
- [ ] Refactor AcceptApplicationDialog into 4 steps
- [ ] Step indicator showing progress
- [ ] Back/Next buttons with proper state
- [ ] Mobile-responsive (full height on mobile)
- [ ] Preserve form data when navigating between steps
- [ ] Final step shows summary before submit
- [ ] Translated step titles in EN/BG/RU

## Priority
Medium-Low (UX improvement, not blocking)

## Estimated Complexity
High - requires new base component + refactoring existing dialog

## References
- Radix UI Dialog for base
- Framer Motion for step transitions
- Consider: https://ui.shadcn.com/docs/components/stepper (if available)
