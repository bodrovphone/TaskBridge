/**
 * Re-export for backwards compatibility.
 * The ApplicationDialog has been refactored into the application-dialog/ folder.
 *
 * New structure:
 * - ApplicationDialog.tsx: Main orchestrator (149 lines, was 749)
 * - ApplicationFormState.tsx: Form UI and validation
 * - ApplicationSuccessState.tsx: Success confirmation UI
 * - validation.ts: Form validation helpers
 * - modal-config.ts: Shared modal configuration
 */
export { default } from './application-dialog/ApplicationDialog'
