# Z-Index Layer Constants Refactoring

## Task Description
Create a centralized z-index layer management system to avoid z-index conflicts and make the stacking order clear and maintainable.

## Problem
Currently z-index values are scattered throughout the codebase with inconsistent values:
- Navbar: `z-50`
- Search card: `z-50`
- Search dropdown suggestions: `z-[100]`
- Floating action buttons: `z-[45]` (after manual adjustment)
- Mobile menu: NextUI default (very high)
- Modals/dialogs: NextUI default
- No clear documentation of what should be above what

This leads to:
- Trial-and-error z-index adjustments
- Conflicts between components
- Hard to understand stacking order
- Difficult to add new layers

## Requirements

### 1. Create Z-Index Constants File
Create `/src/lib/constants/z-index.ts` with defined layers:

```typescript
/**
 * Centralized z-index layer management
 * Higher numbers = higher in the stack
 */
export const Z_INDEX = {
  // Base layers (0-10)
  BASE: 0,
  CONTENT: 1,

  // UI elements (10-40)
  STICKY_ELEMENTS: 10,
  DROPDOWNS: 20,
  FILTER_BAR: 30,

  // Overlays (40-60)
  FLOATING_BUTTONS: 45,
  NAVBAR: 50,
  SEARCH_CARD: 50,
  TOOLTIPS: 55,

  // Interactive overlays (60-100)
  DROPDOWN_MENUS: 60,
  SEARCH_SUGGESTIONS: 100,

  // Modals and dialogs (1000+)
  MODAL_BACKDROP: 1000,
  MODAL: 1001,
  MOBILE_MENU: 1100,
  TOAST_NOTIFICATIONS: 2000,
} as const

// Helper to create z-index className
export const zIndex = (layer: keyof typeof Z_INDEX) => `z-[${Z_INDEX[layer]}]`
```

### 2. Update Components
Replace hardcoded z-index values with constants:

**Priority components:**
- `/src/components/common/header.tsx` - Navbar and floating buttons
- `/src/features/professionals/components/sections/search-filters-section.tsx`
- `/src/features/browse-tasks/components/sections/search-filters-section.tsx`
- `/src/features/professionals/components/filters/filters-modal.tsx`
- `/src/app/[lang]/browse-tasks/components/filters-modal.tsx`

**Example migration:**
```typescript
// Before
<div className="fixed bottom-8 z-[45]">

// After
import { Z_INDEX } from '@/lib/constants/z-index'
<div className={`fixed bottom-8 z-[${Z_INDEX.FLOATING_BUTTONS}]`}>
```

### 3. Document the System
Add comments in the constants file explaining:
- When to use each layer
- How to add new layers
- Guidelines for choosing z-index values

### 4. Testing Checklist
After migration, verify:
- [ ] Mobile menu appears above everything
- [ ] Modals/dialogs appear above floating buttons
- [ ] Floating buttons appear above page content but below modals
- [ ] Search suggestions dropdown appears above search card
- [ ] Filter dropdowns work correctly
- [ ] Navbar stays on top of page content
- [ ] Toast notifications appear above everything

## Acceptance Criteria
- [ ] Z-index constants file created with clear layer definitions
- [ ] All components using hardcoded z-index migrated to use constants
- [ ] No z-index conflicts in common user flows
- [ ] Documentation added explaining the system
- [ ] All layers tested on mobile and desktop

## Technical Notes
- Use Tailwind's arbitrary values: `z-[${value}]`
- Consider using Tailwind's default z-index scale where appropriate (z-0, z-10, z-20, z-30, z-40, z-50)
- NextUI components may need explicit z-index overrides via `classNames` prop
- Test on both mobile and desktop viewports

## Priority
**Medium** - Current workaround is functional, but proper layer management will prevent future issues

## Estimated Effort
1-2 hours
- 30 min: Create constants file and design layer system
- 30 min: Migrate components
- 30 min: Testing and adjustments
