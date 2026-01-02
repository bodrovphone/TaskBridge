/**
 * Centralized Z-Index Layer Management
 *
 * This file defines all z-index values used throughout the application.
 * Using constants ensures consistency and prevents z-index conflicts.
 *
 * USAGE GUIDELINES:
 * 1. Always use these constants instead of hardcoded z-index values
 * 2. Higher numbers = higher in the stacking order
 * 3. Use appropriate layer for your component's purpose
 * 4. Test on both desktop and mobile viewports
 *
 * LAYER HIERARCHY (lowest to highest):
 * - BASE (0-10): Default page content
 * - UI_ELEMENTS (10-40): Sticky elements, dropdowns, filters
 * - OVERLAYS (40-60): Floating buttons, navbar, tooltips
 * - INTERACTIVE_OVERLAYS (60-100): Dropdown menus, search suggestions
 * - MODALS (1000+): Modals, mobile menus, toasts
 *
 * HOW TO ADD NEW LAYERS:
 * 1. Determine which category your layer belongs to
 * 2. Choose a value within that range
 * 3. Add constant with descriptive name
 * 4. Update this documentation
 *
 * @example
 * import { Z_INDEX } from '@/lib/constants/z-index'
 *
 * // Using in className
 * <div className={`fixed bottom-8 z-[${Z_INDEX.FLOATING_BUTTONS}]`}>
 *
 * // Using with template literals
 * const className = `fixed z-[${Z_INDEX.NAVBAR}] w-full`
 */

export const Z_INDEX = {
  // ============================================
  // BASE LAYERS (0-10)
  // Default stacking context for page content
  // ============================================

  /** Base layer - default page content */
  BASE: 0,

  /** Regular content elements */
  CONTENT: 1,

  // ============================================
  // UI ELEMENTS (10-40)
  // Interactive elements that need to be above content
  // ============================================

  /** Sticky headers, sidebars, and fixed elements */
  STICKY_ELEMENTS: 10,

  /** Standard dropdown menus (non-critical) */
  DROPDOWNS: 20,

  /** Filter bars and search filters */
  FILTER_BAR: 30,

  // ============================================
  // OVERLAYS (40-60)
  // Components that float above page content
  // ============================================

  /** Search card and search-related UI */
  SEARCH_CARD: 40,

  /** Main navigation bar - must be above search cards */
  NAVBAR: 50,

  /** Tooltips and popovers */
  TOOLTIPS: 55,

  // ============================================
  // INTERACTIVE OVERLAYS (60-100)
  // Critical interactive elements that should be above most UI
  // ============================================

  /** Dropdown menus from navbar and other components */
  DROPDOWN_MENUS: 60,

  /** Floating action buttons (FABs) - must be above search card, navbar, and dropdowns */
  FLOATING_BUTTONS: 65,

  /** Search suggestions and autocomplete dropdowns */
  SEARCH_SUGGESTIONS: 100,

  // ============================================
  // MODALS AND DIALOGS (1000+)
  // Full-screen or large overlay components
  // ============================================

  /** Modal backdrop/overlay */
  MODAL_BACKDROP: 1000,

  /** Modal dialogs and sheets */
  MODAL: 1001,

  /** Mobile hamburger menu (should be above modals) */
  MOBILE_MENU: 9999,

  /** Toast notifications (should be above everything) */
  TOAST_NOTIFICATIONS: 10000,
} as const

/**
 * Helper function to create z-index className
 * Uses Tailwind's arbitrary value syntax: z-[value]
 *
 * @param layer - Key from Z_INDEX constant
 * @returns Tailwind className string
 *
 * @example
 * import { zIndex } from '@/lib/constants/z-index'
 *
 * <div className={zIndex('NAVBAR')}>
 *   Navigation content
 * </div>
 */
export const zIndex = (layer: keyof typeof Z_INDEX): string => {
  return `z-[${Z_INDEX[layer]}]`
}

/**
 * Type for z-index layer names
 * Useful for type-safe props and utilities
 */
export type ZIndexLayer = keyof typeof Z_INDEX
