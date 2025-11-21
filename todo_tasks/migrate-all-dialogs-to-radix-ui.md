# Migrate All Dialogs from NextUI to Radix UI

## Task Description
Migrate all remaining NextUI Modal components to Radix UI Dialog to ensure consistent behavior and better mobile keyboard handling across the application.

## Context
The Accept Application dialog (`accept-application-dialog.tsx`) was successfully migrated from NextUI to Radix UI, which fixed critical mobile keyboard issues:
- ✅ Better keyboard behavior (no unexpected hiding/showing)
- ✅ Proper focus management without aggressive focus trapping
- ✅ Native browser compatibility
- ✅ Cleaner scroll behavior on mobile

All other dialogs in the codebase should be migrated to use the same Radix UI Dialog pattern.

## Requirements

### Find All NextUI Modals
- [ ] Search codebase for all components importing `Modal` from `@nextui-org/react`
- [ ] Create inventory of all dialog/modal components that need migration
- [ ] Identify any special features or complex interactions in each modal

### Migration Pattern
Each dialog should follow the pattern established in `accept-application-dialog.tsx`:
- [ ] Replace NextUI imports with Radix UI Dialog components:
  - `Modal` → `Dialog`
  - `ModalContent` → `DialogContent`
  - `ModalHeader` → `DialogHeader`
  - `ModalBody` → `<div>` with scrolling styles
  - `ModalFooter` → `DialogFooter`
  - `Button` → Keep using Radix UI `Button` from `/components/ui/button`

- [ ] Replace NextUI form components with Radix UI equivalents:
  - `Input` → `/components/ui/input`
  - `Textarea` → `/components/ui/textarea`
  - `Checkbox` → `/components/ui/checkbox`
  - `RadioGroup` → `/components/ui/radio-group`
  - `Select` → `/components/ui/select` (if needed)

- [ ] Preserve all functionality:
  - Mobile responsiveness (full-screen on mobile, modal on desktop)
  - Keyboard detection and adaptive layout
  - Form validation
  - Loading states
  - Error handling

- [ ] Apply consistent styling:
  - `rounded-xl` on desktop dialogs
  - `rounded-t-xl` on headers
  - `rounded-b-xl` on footers
  - Proper overflow and scroll handling
  - Sticky headers and footers

### Mobile Optimizations
Apply mobile keyboard fixes to all dialogs:
- [ ] Add `useKeyboardHeight()` hook
- [ ] Add `useIsMobile()` hook
- [ ] Hide non-essential content when keyboard is open
- [ ] Add focus handlers with `scrollIntoView` for inputs
- [ ] Use `font-size: 16px` on all inputs to prevent iOS zoom
- [ ] Compact layouts when keyboard is visible

## Acceptance Criteria
- [ ] All dialogs use Radix UI Dialog instead of NextUI Modal
- [ ] All dialogs work correctly on mobile (keyboard handling, scrolling)
- [ ] All dialogs work correctly on desktop (rounded corners, proper sizing)
- [ ] No regression in functionality (all features still work)
- [ ] Consistent styling across all dialogs
- [ ] TypeScript types are correct with no errors
- [ ] All dialogs tested on iOS Safari and Chrome

## Technical Notes

### Radix UI Dialog Advantages
- **Better mobile keyboard behavior**: No aggressive focus trapping that causes keyboard to hide/show unexpectedly
- **Native HTML form controls**: Better browser compatibility and performance
- **Simpler API**: Standard React event handlers (`onChange` instead of `onValueChange`)
- **Already installed**: `/components/ui/dialog.tsx` is ready to use

### Key Differences from NextUI
- No built-in `size` prop - use Tailwind classes for sizing
- No `isDismissable` - use `onInteractOutside` prop instead
- No `hideCloseButton` - the close button is always rendered (can hide with CSS if needed)
- No `scrollBehavior` - handle overflow with Tailwind classes
- No `classNames` object - use standard `className` prop

### Migration Checklist per Dialog
1. Replace import statements
2. Update component JSX structure
3. Convert all form components
4. Apply responsive sizing classes
5. Add mobile keyboard handling
6. Test on mobile and desktop
7. Verify all functionality works

## Priority
**Medium** - Not blocking current work, but important for consistency and mobile UX

## Estimated Effort
- **Per dialog**: 30-60 minutes depending on complexity
- **Total**: Depends on number of dialogs (need to inventory first)

## Related Files
- ✅ `/src/components/tasks/accept-application-dialog.tsx` (completed migration example)
- `/src/components/ui/dialog.tsx` (Radix UI Dialog base component)
- `/src/components/ui/input.tsx` (Radix UI Input)
- `/src/components/ui/textarea.tsx` (Radix UI Textarea)
- `/src/components/ui/checkbox.tsx` (Radix UI Checkbox)
- `/src/components/ui/radio-group.tsx` (Radix UI RadioGroup)
- `/src/components/ui/button.tsx` (Radix UI Button)
- `/src/hooks/use-keyboard-height.ts` (Keyboard detection hook)
- `/src/hooks/use-is-mobile.ts` (Mobile detection hook)

## Notes
- Start with simpler dialogs first to build confidence
- Use `accept-application-dialog.tsx` as reference implementation
- Test thoroughly on mobile devices (iOS Safari is critical)
- Consider creating a migration guide document if multiple dialogs exist
