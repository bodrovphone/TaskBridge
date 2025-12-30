/**
 * Browse Tasks Skeleton
 *
 * CRITICAL FOR CLS (Cumulative Layout Shift):
 * This skeleton reserves the exact same space as the real component during Suspense.
 * Without this, the page would collapse to 0 height during hydration, causing the
 * footer to jump from top to bottom of the page (CLS score of 0.9+).
 *
 * NOTE: Hero is server-rendered in page.tsx, so skeleton only covers the main content.
 */
export default function BrowseTasksSkeleton() {
  return (
    <>
      {/* Main Content Skeleton - min-h matches the real component */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 min-h-[600px]">
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
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2 sm:mb-3" />
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`h-8 w-24 bg-gray-100 rounded-full animate-pulse ${i > 3 ? 'hidden sm:block' : ''}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Count Skeleton */}
              <div className="pt-4 border-t border-gray-100">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar Skeleton - Desktop */}
        <div className="hidden md:block mb-6">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Filter Button Skeleton - Mobile */}
        <div className="md:hidden mb-6 flex justify-end">
          <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Results Section Skeleton - matches task card grid */}
        <div>
          {/* Featured Tasks Header Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-blue-200 rounded animate-pulse" />
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-64 bg-gray-100 rounded animate-pulse mb-6" />

          {/* Task Cards Grid Skeleton */}
          <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Image Skeleton */}
                <div className="w-full h-40 bg-gray-200 animate-pulse" />

                {/* Content Skeleton */}
                <div className="p-4 space-y-4">
                  {/* Category and Time */}
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-24 bg-gray-100 rounded-md animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>

                  {/* Title */}
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>

                {/* Footer Skeleton */}
                <div className="px-4 pb-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-col min-[590px]:flex-row gap-3">
                    <div className="h-10 flex-1 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-10 flex-1 bg-green-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
