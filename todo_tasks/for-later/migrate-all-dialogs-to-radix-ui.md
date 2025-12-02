# Migrate All Dialogs from NextUI to Radix UI

## Task Description
Migrate all remaining NextUI Modal components to Radix UI Dialog to ensure consistent behavior and better mobile keyboard handling across the application.

## Context
The Accept Application dialog (`accept-application-dialog.tsx`) was successfully migrated from NextUI to Radix UI, which fixed critical mobile keyboard issues:
- Better keyboard behavior (no unexpected hiding/showing)
- Proper focus management without aggressive focus trapping
- Native browser compatibility
- Cleaner scroll behavior on mobile

All other dialogs in the codebase should be migrated to use the same Radix UI Dialog pattern.

## Files to Migrate (29 total)

### Standalone Dialog Files (15)
- [ ] `src/components/tasks/mark-completed-dialog.tsx`
- [ ] `src/components/tasks/cancel-task-dialog.tsx`
- [ ] `src/components/tasks/cancel-task-confirm-dialog.tsx`
- [ ] `src/components/tasks/ask-question-dialog.tsx`
- [ ] `src/components/tasks/validation-error-dialog.tsx`
- [ ] `src/components/tasks/customer-remove-professional-dialog.tsx`
- [ ] `src/components/tasks/reject-application-dialog.tsx`
- [ ] `src/components/tasks/confirm-completion-dialog.tsx`
- [ ] `src/components/tasks/professional-withdraw-dialog.tsx`
- [ ] `src/components/safety/report-scam-dialog.tsx`
- [ ] `src/components/common/reviews-dialog.tsx`
- [ ] `src/components/common/completed-tasks-dialog.tsx`
- [ ] `src/features/reviews/components/review-enforcement-dialog.tsx`
- [ ] `src/features/reviews/components/review-dialog.tsx`
- [ ] `src/features/applications/components/withdraw-dialog.tsx`

### Standalone Modal Files (6)
- [ ] `src/app/[lang]/profile/components/statistics-modal.tsx`
- [ ] `src/app/[lang]/profile/components/settings-modal.tsx`
- [ ] `src/app/[lang]/browse-tasks/components/filters-modal.tsx`
- [ ] `src/features/professionals/components/filters/filters-modal.tsx`
- [ ] `src/components/categories/suggest-category-modal.tsx`
- [ ] `src/components/modals/task-selection-modal.tsx`

### Inline Modals in Components (8)
- [ ] `src/app/[lang]/profile/components/shared/personal-info-section.tsx`
- [ ] `src/app/[lang]/profile/components/avatar-upload.tsx`
- [ ] `src/app/[lang]/profile/components/sections/service-categories-section.tsx`
- [ ] `src/app/[lang]/profile/components/portfolio-gallery-manager.tsx`
- [ ] `src/app/[lang]/profile/components/professional-setup-form.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/task-actions.tsx`
- [ ] `src/app/[lang]/tasks/[id]/components/task-gallery.tsx`
- [ ] `src/app/[lang]/tasks/work/components/my-work-content.tsx`
- [ ] `src/app/[lang]/tasks/applications/components/applications-page-content.tsx`

### Already Migrated (1)
- [x] `src/components/tasks/accept-application-dialog.tsx` - Reference implementation

## Migration Pattern

Each dialog should follow the pattern established in `accept-application-dialog.tsx`:

### Import Changes
```typescript
// Before (NextUI)
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'

// After (Radix UI)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
```

### Component Mapping
- `Modal` → `Dialog`
- `ModalContent` → `DialogContent`
- `ModalHeader` → `DialogHeader` + `DialogTitle`
- `ModalBody` → `<div>` with scrolling styles
- `ModalFooter` → `DialogFooter`

### Form Component Mapping
- `Input` → `@/components/ui/input`
- `Textarea` → `@/components/ui/textarea`
- `Checkbox` → `@/components/ui/checkbox`
- `RadioGroup` → `@/components/ui/radio-group`
- `Select` → `@/components/ui/select`

## Key Differences from NextUI
- No built-in `size` prop - use Tailwind classes for sizing
- No `isDismissable` - use `onInteractOutside` prop instead
- No `hideCloseButton` - close button always rendered (hide with CSS if needed)
- No `scrollBehavior` - handle overflow with Tailwind classes
- No `classNames` object - use standard `className` prop

## Mobile Optimizations
Apply to dialogs with form inputs:
- Add `useKeyboardHeight()` hook for keyboard detection
- Add `useIsMobile()` hook for responsive behavior
- Use `font-size: 16px` on inputs to prevent iOS zoom
- Add focus handlers with `scrollIntoView`

## Acceptance Criteria
- [ ] All dialogs use Radix UI Dialog instead of NextUI Modal
- [ ] All dialogs work correctly on mobile (keyboard handling, scrolling)
- [ ] All dialogs work correctly on desktop (rounded corners, proper sizing)
- [ ] No regression in functionality
- [ ] TypeScript types are correct with no errors

## Priority
**Medium** - Not blocking current work, but important for consistency and mobile UX

## Estimated Effort
- **Per dialog**: 30-60 minutes depending on complexity
- **Total**: ~15-30 hours for all 29 files

## Reference Files
- `src/components/tasks/accept-application-dialog.tsx` - Completed migration example
- `src/components/ui/dialog.tsx` - Radix UI Dialog base component
- `src/hooks/use-keyboard-height.ts` - Keyboard detection hook
- `src/hooks/use-is-mobile.ts` - Mobile detection hook
