import { notFound } from 'next/navigation'

/**
 * Catch-all route for undefined paths within a locale.
 * This triggers the custom not-found.tsx page.
 */
export default function CatchAllPage() {
  notFound()
}
