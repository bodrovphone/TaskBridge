/**
 * Professionals Page (Refactored)
 * Integrates real API data with infinite scroll
 * Reduced from 806 lines to ~200 lines by extracting sections
 *
 * SSR: Receives initial featured professionals from server for instant hydration
 */

'use client'

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useProfessionalFilters } from '../hooks/use-professional-filters';
import SearchFiltersSection from './sections/search-filters-section';
import ResultsSection from './sections/results-section';
import { FilterBar } from './filters/filter-bar';
import { FiltersModal } from './filters/filters-modal';
import { ActiveFilters } from './filters/active-filters';
import type { PaginatedProfessionalsResponse, Professional } from '@/server/professionals/professional.types';

interface ProfessionalsPageProps {
  /** Initial featured professionals from SSR - provides instant content for SEO */
  initialFeaturedProfessionals?: Professional[];
}

export default function ProfessionalsPage({ initialFeaturedProfessionals = [] }: ProfessionalsPageProps) {
  const t = useTranslations();
  const params = useParams();
  const { filters, resetFilters, buildApiQuery, activeFilterCount } = useProfessionalFilters();

  // Get current locale for API requests (for translations)
  const currentLang = (params?.lang as string) || 'bg';

  // Check if any filters are active
  const hasActiveFilters = activeFilterCount > 0;

  // Always fetch featured professionals (used as fallback when filters return no results)
  // Uses SSR initial data for instant hydration - improves SEO and initial load
  const { data: featuredData } = useQuery<PaginatedProfessionalsResponse>({
    queryKey: ['featured-professionals', currentLang],
    queryFn: async () => {
      const response = await fetch(`/api/professionals?featured=true&lang=${currentLang}`);
      if (!response.ok) throw new Error('Failed to fetch featured professionals');
      return response.json();
    },
    // SSR hydration: Use server-fetched data as initial data
    // This means the page renders with content immediately (no loading state)
    initialData: initialFeaturedProfessionals.length > 0
      ? {
          professionals: initialFeaturedProfessionals,
          featuredProfessionals: initialFeaturedProfessionals,
          pagination: { page: 1, limit: 20, total: initialFeaturedProfessionals.length, totalPages: 1, hasNext: false, hasPrevious: false }
        }
      : undefined,
    // Stale time matches ISR revalidation (1 hour) - don't refetch if data is fresh
    staleTime: 60 * 60 * 1000, // 1 hour
    // Always enabled - featured professionals are shown in two scenarios:
    // 1. No filters applied (primary featured section)
    // 2. Filters applied but no results (fallback/suggestion)
  });

  // Fetch filtered professionals with infinite scroll
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<PaginatedProfessionalsResponse>({
    queryKey: ['browse-professionals', buildApiQuery(), currentLang],
    queryFn: async ({ pageParam = 1 }) => {
      // Build query with current page and language
      const params = new URLSearchParams(buildApiQuery());
      params.set('page', String(pageParam));
      params.set('lang', currentLang);

      const response = await fetch(`/api/professionals?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch professionals');
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if hasNext is true, otherwise undefined
      return lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all pages into a single array of professionals
  const professionals = data?.pages.flatMap(page => page.professionals) || [];
  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  // Get featured professionals (20 high-quality professionals with diversity)
  // Used in two scenarios:
  // 1. No filters: Primary featured section
  // 2. Filters with no results: Fallback suggestions
  const featuredProfessionals = featuredData?.professionals || [];

  const handleRetry = () => {
    refetch();
  };

  return (
    <>
      {/* Pinterest-style Masonry Layout */}
      <style jsx global>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 1rem;
        }

        @media (min-width: 640px) {
          .masonry-grid {
            column-count: 2;
          }
        }

        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 3;
            column-gap: 1.25rem;
          }
        }

        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
        }

        @media (min-width: 1024px) {
          .masonry-item {
            margin-bottom: 1.25rem;
          }
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
        {/* Cardboard background - positioned absolutely */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: 'url(/images/cardboard.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            opacity: 0.3
          }}
        />

        {/* Search Filters Section */}
        <SearchFiltersSection
          professionalsCount={pagination?.total || 0}
          isLoading={isLoading}
        />

        {/* Desktop Filters (hidden on mobile) */}
        <div className="hidden md:block mb-6">
          <FilterBar />
        </div>

        {/* Mobile Filters (hidden on desktop) */}
        <div className="md:hidden mb-6 flex justify-end">
          <FiltersModal />
        </div>

        {/* Active Filters Display */}
        <ActiveFilters />

        {/* Results Section (API Data) */}
        <ResultsSection
          professionals={professionals}
          featuredProfessionals={featuredProfessionals}
          isLoading={isLoading}
          error={error}
          onClearFilters={resetFilters}
          onRetry={handleRetry}
          hasActiveFilters={hasActiveFilters}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </main>
    </>
  );
}
