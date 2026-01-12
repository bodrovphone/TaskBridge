/**
 * Professional Results Section
 * Displays professional cards with loading, error, and empty states
 * Includes infinite scroll and featured professionals
 */

'use client'

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { Card as NextUICard, Button as NextUIButton, Spinner } from "@heroui/react";
import { Search, Coffee, RotateCw, Sparkles } from "lucide-react";
import ProfessionalCard from "../professional-card";
import type { Professional } from '@/server/professionals/professional.types';
import { useEffect, useRef } from "react";

/**
 * Animated empty state card for no results
 */
function NoResultsCard({
  t,
  onClearFilters
}: {
  t: ReturnType<typeof useTranslations>
  onClearFilters?: () => void
}) {
  return (
    <NextUICard className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl border-2 border-purple-200">
      <div className="p-6 sm:p-8 text-center">
        {/* Animated Search Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
          className="mb-4"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Search className="w-12 h-12 text-purple-500 mx-auto" strokeWidth={2.5} />
            </motion.div>
            {/* Sparkles around the icon */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-5 h-5 text-pink-500" />
            </motion.div>
          </div>
        </motion.div>

        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t('professionals.results.noResults.title')}
        </h3>

        <p className="text-gray-700 mb-1 max-w-md mx-auto">
          {t('professionals.results.noResults.description')}
        </p>

        <p className="text-gray-500 text-sm mb-4">
          {t('professionals.results.noResults.subtext')}
        </p>

        {onClearFilters && (
          <NextUIButton
            color="secondary"
            variant="shadow"
            size="md"
            onClick={onClearFilters}
            className="font-semibold"
          >
            {t('professionals.results.noResults.clearFilters')}
          </NextUIButton>
        )}
      </div>
    </NextUICard>
  );
}

interface ResultsSectionProps {
  // API Data
  professionals: Professional[];
  featuredProfessionals: Professional[]; // Featured from API (ignores filters)
  isLoading: boolean;
  error: Error | null;

  // Actions
  onClearFilters: () => void;
  onRetry?: () => void;

  // Filters & Infinite Scroll
  hasActiveFilters?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function ResultsSection({
  professionals,
  featuredProfessionals,
  isLoading,
  error,
  onClearFilters,
  onRetry,
  hasActiveFilters = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore
}: ResultsSectionProps) {
  const t = useTranslations();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll: Intersection Observer
  useEffect(() => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  return (
    <motion.div
      id="professionals-results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-16"
    >
      {error ? (
        /* Error State */
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
              {t('professionals.results.error.title')}
            </h3>

            <p className="text-gray-700 text-lg mb-2">
              {t('professionals.results.error.description')}
            </p>

            <p className="text-gray-500 text-sm mb-6">
              {t('professionals.results.error.subtext')}
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
                {t('professionals.results.error.retry')}
              </NextUIButton>
            )}
          </div>
        </NextUICard>
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
      ) : !hasActiveFilters && featuredProfessionals.length > 0 ? (
        /* NO FILTERS: Show ONLY Featured Professionals */
        <div>
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="text-yellow-500" size={32} />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t('professionals.results.featured.title')}
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('professionals.results.featured.description')}
            </p>
          </div>

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
                  professional={professional}
                  featured={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ) : hasActiveFilters && professionals.length > 0 ? (
        /* FILTERS ACTIVE: Show ONLY Filtered Results with Infinite Scroll */
        <div>
          <div className="masonry-grid">
            {professionals.map((professional, index) => (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 1) }}
                className="masonry-item"
              >
                <ProfessionalCard
                  professional={professional}
                  featured={professional.featured}
                />
              </motion.div>
            ))}
          </div>

          {/* Infinite Scroll Trigger & Loading Indicator */}
          {hasNextPage && (
            <div ref={observerTarget} className="flex justify-center mt-8 py-4">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3">
                  <Spinner size="sm" color="primary" />
                  <span className="text-gray-600">{t('professionals.results.loadingMore')}</span>
                </div>
              ) : null}
            </div>
          )}

          {/* End of results message */}
          {!hasNextPage && professionals.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-8 py-4 text-gray-500"
            >
              {t('professionals.results.allLoaded')}
            </motion.div>
          )}
        </div>
      ) : hasActiveFilters && professionals.length === 0 ? (
        /* FILTERS ACTIVE BUT NO RESULTS: Show colorful "no results" + Featured Professionals as fallback */
        <div className="space-y-12">
          <NoResultsCard t={t} onClearFilters={onClearFilters} />

          {/* Featured Professionals as Fallback */}
          {featuredProfessionals.length > 0 && (
            <div className="border-t border-gray-200 pt-12">
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="text-yellow-500" size={32} />
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {t('professionals.results.featured.title')}
                  </h2>
                </div>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  {t('professionals.results.featured.description')}
                </p>
              </div>

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
                      professional={professional}
                      featured={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: Show colorful empty state */
        <NoResultsCard t={t} />
      )}
    </motion.div>
  );
}
