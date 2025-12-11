# Tip Component - User Guide Tour

## Task Description
Implement a user onboarding/guide system using the `Tip` component (`@/components/ui/tip`). Two potential approaches to decide between:

### Option A: Guided Tour
- Step-by-step walkthrough for new users
- Sequential tips highlighting key UI elements
- "Next" / "Previous" navigation between tips
- Progress indicator (e.g., "Step 2 of 5")
- Persist completion state (localStorage or database)

### Option B: Contextual Help Icons
- Small question mark (?) icons next to complex UI elements
- Click to reveal tip with explanation
- Non-intrusive, on-demand help
- Useful for features that need explanation

### Option C: Hybrid
- Combine both: guided tour for first-time users + persistent help icons

## Requirements
- Decide on approach (A, B, or C)
- Identify key UI elements that need tips/explanations
- Implement chosen solution
- Track which tips user has seen (avoid repetition)

## Potential Tip Locations
- Create Task form fields
- Professional profile features
- Notification bell (first time)
- Browse Tasks filters
- Application submission process

## Technical Notes
- `Tip` component already created at `src/components/ui/tip.tsx`
- Supports controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`) modes
- 5 color variants: primary, secondary, success, warning, info
- Arrow automatically points to wrapped element

## Priority
Low (future enhancement)
