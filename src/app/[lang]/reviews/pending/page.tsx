import { PendingReviewsContent } from './pending-reviews-content'

// Skip static generation for authenticated pages
export const dynamic = 'force-dynamic'

export default function PendingReviewsPage() {
  return <PendingReviewsContent />
}
