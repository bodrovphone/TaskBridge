/**
 * Professional Results Section
 * Displays professional cards with loading, error, and empty states
 * Includes both API results and mock data sections
 */

'use client'

import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Card as NextUICard, Button as NextUIButton } from "@nextui-org/react";
import { Search, Coffee, RotateCw, Sparkles } from "lucide-react";
import ProfessionalCard from "../professional-card";
import type { Professional } from '@/server/professionals/professional.types';

interface ResultsSectionProps {
  // API Data
  professionals: Professional[];
  featuredProfessionals: Professional[]; // Featured from API (ignores filters)
  isLoading: boolean;
  error: any;

  // Mock Data (for reference)
  mockProfessionals: any[];

  // Pagination
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;

  // Actions
  onClearFilters: () => void;
  onRetry?: () => void;

  // Filters
  activeFilterCount?: number;
}

export default function ResultsSection({
  professionals,
  featuredProfessionals,
  isLoading,
  error,
  mockProfessionals,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onClearFilters,
  onRetry,
  activeFilterCount = 0
}: ResultsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Error State */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NextUICard className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg border-2 border-amber-200">
            <div className="p-8 text-center">
              {/* Coffee cup animation */}
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{
                  scale: 1,
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  scale: { type: "spring", bounce: 0.6 },
                  rotate: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }}
                className="text-amber-500 mb-6"
              >
                <Coffee size={56} className="mx-auto" strokeWidth={2} />
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('professionals.results.error.title', 'Oops! Something went wrong')}
              </h3>

              <p className="text-gray-700 text-lg mb-2">
                {t('professionals.results.error.description', 'Our servers need a coffee break')}
              </p>

              <p className="text-gray-500 text-sm mb-6">
                {t('professionals.results.error.subtext', "Don't worry, we're on it!")}
              </p>

              {onRetry && (
                <NextUIButton
                  color="warning"
                  variant="shadow"
                  size="lg"
                  onClick={onRetry}
                  startContent={<RotateCw size={20} />}
                  className="font-semibold"
                >
                  {t('professionals.results.error.retry', 'Try Again')}
                </NextUIButton>
              )}
            </div>
          </NextUICard>
        </motion.div>
      ) : isLoading ? (
        /* Loading Skeletons */
        <div className="masonry-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="masonry-item"
            >
              <NextUICard className="animate-pulse">
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </NextUICard>
            </motion.div>
          ))}
        </div>
      ) : professionals.length > 0 ? (
        /* Main Results - API Data */
        <>
          <div id="api-professionals-section">
            {/* Professionals Grid */}
            <div className="masonry-grid">
              {professionals.map((professional, index) => (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="masonry-item"
                >
                  <ProfessionalCard
                    professional={professional as any}
                    featured={professional.featured}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center items-center gap-4 mt-8"
              >
                <NextUIButton
                  variant="bordered"
                  onClick={() => onPageChange(currentPage - 1)}
                  isDisabled={!hasPrevious}
                >
                  {t('professionals.pagination.previous', 'Previous')}
                </NextUIButton>

                <span className="text-sm text-gray-600">
                  {t('professionals.pagination.pageOf', { current: currentPage, total: totalPages, defaultValue: `Page ${currentPage} of ${totalPages}` })}
                </span>

                <NextUIButton
                  variant="bordered"
                  onClick={() => onPageChange(currentPage + 1)}
                  isDisabled={!hasNext}
                >
                  {t('professionals.pagination.next', 'Next')}
                </NextUIButton>
              </motion.div>
            )}
          </div>

          {/* Mock Data Section - Reference Only */}
          {mockProfessionals.length > 0 && (
            <div id="mock-professionals-section" className="border-t-4 border-dashed border-amber-400 pt-12">
              {/* Warning Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">🎭</span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-amber-900">
                    {t('professionals.results.mockTitle', 'Mock Professionals (Reference)')}
                  </h2>
                </div>
                <p className="text-amber-800 mb-3 text-lg">
                  {t('professionals.results.mockDescription', 'Sample data showcasing future features: portfolios, certifications, edge cases')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full font-semibold text-sm">
                    {t('professionals.results.mockBadge1', 'For Development Reference')}
                  </span>
                  <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-semibold text-sm">
                    {t('professionals.results.mockBadge2', 'Not Real Users')}
                  </span>
                </div>
              </div>

              {/* Mock Professionals Grid */}
              <div className="masonry-grid">
                {mockProfessionals.map((professional, index) => (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="masonry-item"
                  >
                    <ProfessionalCard
                      professional={professional}
                      featured={professional.featured}
                      isMock={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State with Featured Professionals */
        <>
          <NextUICard className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg border border-blue-100">
            <div className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <Search className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {t('professionals.results.noResults.title', 'No professionals found')}
              </h3>
              <p className="text-gray-700 mb-6 text-lg max-w-2xl mx-auto">
                {t('professionals.results.noResults.description', 'Try adjusting your filters or search in a different area')}
              </p>
              {activeFilterCount > 0 && (
                <NextUIButton
                  color="primary"
                  variant="shadow"
                  onClick={onClearFilters}
                  size="lg"
                  className="font-semibold"
                >
                  {t('professionals.results.noResults.clearFilters', 'Clear Filters')}
                </NextUIButton>
              )}
            </div>
          </NextUICard>

          {/* Featured Professionals Section - From API */}
          {featuredProfessionals.length > 0 && (
            <div className="mt-12">
              {/* Section Header */}
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="text-yellow-500" size={32} />
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {t('professionals.results.featured.title', 'Featured Professionals')}
                  </h2>
                </div>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  {t('professionals.results.featured.description', 'Check out these top-rated professionals from our network')}
                </p>
              </div>

              {/* Featured Professionals Grid */}
              <div className="masonry-grid">
                {featuredProfessionals.map((professional, index) => (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="masonry-item"
                  >
                    <ProfessionalCard
                      professional={professional as any}
                      featured={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
