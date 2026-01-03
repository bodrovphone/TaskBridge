/**
 * Professionals Page Skeleton
 *
 * CRITICAL FOR CLS (Cumulative Layout Shift):
 * This skeleton reserves the exact same space as the real component during Suspense.
 * Without this, the page would collapse to 0 height during hydration, causing the
 * footer to jump from top to bottom of the page (CLS score of 0.9+).
 *
 * NOTE: Hero is server-rendered in page.tsx, so skeleton only covers the main content.
 */
export default function ProfessionalsSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 min-h-[800px]">
      {/* Search Section Skeleton - matches SearchFiltersSection */}
      <div className="mb-12 -mt-8 relative z-10">
        <div className="bg-white/95 shadow-2xl border-0 max-w-4xl mx-auto rounded-2xl overflow-visible">
          <div className="p-4 sm:p-8">
            {/* Search Input Skeleton */}
            <div className="relative mb-4 sm:mb-8">
              <div className="flex flex-row gap-2">
                <div className="flex-1 h-12 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl animate-pulse" />
                <div className="hidden sm:block h-16 w-32 bg-blue-100 rounded-2xl animate-pulse" />
              </div>

              {/* Popular Tags Skeleton */}
              <div className="mt-4 sm:mt-6">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3" />
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-8 w-20 bg-gray-100 rounded-full animate-pulse ${i > 3 ? 'hidden sm:block' : ''}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count Skeleton */}
            <div className="pt-4 border-t border-gray-100">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar Skeleton - Desktop */}
      <div className="hidden md:block mb-6">
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Filter Button Skeleton - Mobile */}
      <div className="md:hidden mb-6 flex justify-end">
        <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Featured Section Header Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-purple-200 rounded animate-pulse" />
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Masonry Grid Skeleton - matches professional cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Avatar/Header Skeleton */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Name */}
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  {/* Title */}
                  <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-yellow-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Bio Skeleton */}
              <div className="mt-4 space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse" />
              </div>

              {/* Categories Skeleton */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-16 bg-blue-50 rounded-full animate-pulse" />
                ))}
              </div>

              {/* Stats Skeleton */}
              <div className="mt-4 flex items-center gap-4">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>

            {/* Footer/CTA Skeleton */}
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-gray-100">
              <div className="h-10 w-full bg-blue-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
