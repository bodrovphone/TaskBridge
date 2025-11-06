/**
 * Professionals Page (Refactored)
 * Integrates real API data with mock reference data
 * Reduced from 806 lines to ~200 lines by extracting sections
 */

'use client'

import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { useProfessionalFilters } from '../hooks/use-professional-filters';
import { fetchProfessionals } from '../lib/professionals-api';
import { mockProfessionals } from '../lib/mock-professionals';
import SearchFiltersSection from './sections/search-filters-section';
import ResultsSection from './sections/results-section';
import { FilterBar } from './filters/filter-bar';
import { FiltersModal } from './filters/filters-modal';
import { ActiveFilters } from './filters/active-filters';
import type { PaginatedProfessionalsResponse } from '@/server/professionals/professional.types';

export default function ProfessionalsPage() {
  const { t } = useTranslation();
  const { filters, resetFilters, buildApiQuery, activeFilterCount } = useProfessionalFilters();

  // API Data State
  const [apiData, setApiData] = useState<PaginatedProfessionalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch professionals from API
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const queryString = buildApiQuery();
        const data = await fetchProfessionals(queryString);

        setApiData(data);
      } catch (err) {
        console.error('Failed to fetch professionals:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfessionals();
  }, [buildApiQuery]);

  // Retry on error
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger re-fetch by changing a state (useEffect will re-run)
    const queryString = buildApiQuery();
    fetchProfessionals(queryString)
      .then(setApiData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // This will be handled by useProfessionalFilters
    // updateFilter('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Pinterest-style Masonry CSS */}
      <style jsx global>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 1.5rem;
          column-fill: balance;
          padding: 0;
        }

        @media (min-width: 640px) {
          .masonry-grid {
            column-count: 2;
          }
        }

        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 3;
          }
        }

        @media (min-width: 1280px) {
          .masonry-grid {
            column-count: 3;
          }
        }

        .masonry-item {
          display: inline-block;
          width: 100%;
          margin-bottom: 1.5rem;
          break-inside: avoid;
          page-break-inside: avoid;
          -webkit-column-break-inside: avoid;
          vertical-align: top;
        }

        .masonry-item .professional-card {
          height: auto !important;
          min-height: unset !important;
        }
      `}</style>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block"
            >
              <div className="bg-white/10 rounded-full px-6 py-2 border border-white/20 mb-6">
                <span className="text-blue-200 font-medium tracking-wide">✨ {t('professionals.hero.badge', 'Professional Network')}</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
            >
              {t('professionals.hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl lg:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light"
            >
              {t('professionals.hero.subtitle')}
            </motion.p>

            {/* Trust indicators - Beta Version */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap justify-center gap-6 mt-12"
            >
              {[
                { icon: '✅', labelKey: 'professionals.hero.stats.verified.label', valueKey: 'professionals.hero.stats.verified.value' },
                { icon: '⭐', labelKey: 'professionals.hero.stats.ratings.label', valueKey: 'professionals.hero.stats.ratings.value' },
                { icon: '🚀', labelKey: 'professionals.hero.stats.jobs.label', valueKey: 'professionals.hero.stats.jobs.value' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + (index * 0.1) }}
                  className="bg-white/10 rounded-xl px-4 py-3 border border-white/20 text-center min-w-[140px]"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-lg font-bold text-white">{t(item.valueKey)}</div>
                  <div className="text-sm text-blue-200">{t(item.labelKey)}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
        {/* Cardboard background - positioned absolutely */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: 'url(/images/cardboard.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            opacity: 0.3
          }}
        />

        {/* Search Filters Section */}
        <SearchFiltersSection
          professionalsCount={apiData?.pagination.total || 0}
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

        {/* Results Section (API + Mock Data) */}
        <ResultsSection
          professionals={apiData?.professionals || []}
          featuredProfessionals={apiData?.featuredProfessionals || []}
          isLoading={isLoading}
          error={error}
          mockProfessionals={mockProfessionals}
          currentPage={apiData?.pagination.page || 1}
          totalPages={apiData?.pagination.totalPages || 1}
          hasNext={apiData?.pagination.hasNext || false}
          hasPrevious={apiData?.pagination.hasPrevious || false}
          onPageChange={handlePageChange}
          onClearFilters={resetFilters}
          onRetry={handleRetry}
          activeFilterCount={activeFilterCount}
        />
      </main>
    </>
  );
}
