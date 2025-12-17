/**
 * Professional Search Filters Section
 * Adapted from browse-tasks search filters for professional listings
 */

'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Input, Card as NextUICard, Chip, Button } from "@nextui-org/react";
import { Search, MapPin } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { searchCategories, getAllSubcategoriesWithLabels, getMainCategoryById } from '@/features/categories';
import { searchCities, getCitiesWithLabels } from '@/features/cities';
import { useSearchLocationPreference } from '@/hooks/use-search-location-preference';
import { useProfessionalFilters } from '../../hooks/use-professional-filters';
import { Z_INDEX } from '@/lib/constants/z-index';

interface SearchFiltersSectionProps {
  professionalsCount: number;
  isLoading: boolean;
}

export default function SearchFiltersSection({
  professionalsCount,
  isLoading
}: SearchFiltersSectionProps) {
  const t = useTranslations();
  const params = useParams();
  const currentLocale = (params?.lang as string) || 'bg';
  const { filters, updateFilter } = useProfessionalFilters();
  const { saveLocation } = useSearchLocationPreference();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get popular subcategories (not main categories) since professionals select subcategories
  const popularCategories = useMemo(() => {
    const allSubcategories = getAllSubcategoriesWithLabels(t);
    // Get most common subcategories (using actual slugs from subcategories.ts)
    const popularSlugs = [
      'house-cleaning',           // Cleaning Services
      'plumber',                  // Handyman
      'electrician',              // Handyman
      'apartment-renovation',     // Finishing Work
    ];

    return allSubcategories
      .filter(cat => popularSlugs.includes(cat.slug))
      .filter(cat => cat.slug !== filters.category) // Hide if selected
      .map(cat => ({
        slug: cat.slug,
        title: cat.label,
        icon: getMainCategoryById(cat.mainCategoryId)?.icon,
        color: getMainCategoryById(cat.mainCategoryId)?.color || 'blue'
      }));
  }, [t, filters.category]);

  const popularCities = useMemo(() =>
    getCitiesWithLabels(t)
      .slice(0, 2) // Top 2 cities: Sofia, Plovdiv
      .filter(city => city.slug !== filters.city), // Hide if selected
    [t, filters.city]
  );

  // Build typing examples from popular categories + cities (dynamically translated)
  const typingExamples = useMemo(() => {
    const categoryNames = popularCategories.slice(0, 4).map(cat => cat.title.toLowerCase());
    const cityNames = popularCities.map(city => city.label);
    return [...categoryNames, ...cityNames];
  }, [popularCategories, popularCities]);

  const currentExamples = typingExamples;

  // Search categories and cities based on input
  const categorySuggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length > 200) return [];
    // Skip if no letters (gibberish like "1111111")
    if (!/[a-zA-Zа-яА-ЯёЁ]/u.test(trimmed)) return [];
    return searchCategories(searchQuery, t).slice(0, 6); // Limit to 6 categories
  }, [searchQuery, t]);

  // Search cities locally (instant, no API)
  const citySuggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 1 || trimmed.length > 200) return [];
    // Skip if no letters
    if (!/[a-zA-Zа-яА-ЯёЁ]/u.test(trimmed)) return [];
    return searchCities(searchQuery, t).slice(0, 6); // Limit to 6 cities
  }, [searchQuery, t]);

  const hasSuggestions = categorySuggestions.length > 0 || citySuggestions.length > 0;

  // Show/hide suggestions based on input
  useEffect(() => {
    setShowSuggestions(searchQuery.trim().length > 0 && hasSuggestions);
  }, [searchQuery, hasSuggestions]);

  // Smooth scroll to results after filter selection
  // Uses requestAnimationFrame to ensure scroll happens after React re-render
  const scrollToResults = useCallback(() => {
    // Use double RAF to ensure DOM is fully updated after state change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const resultsElement = document.getElementById('professionals-results');
        if (resultsElement) {
          const headerOffset = 100; // Account for fixed header
          const elementPosition = resultsElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          // Only scroll if results are below the current viewport
          if (elementPosition > window.innerHeight * 0.3) {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }, []);

  // Handle category selection
  const handleCategorySelect = (categorySlug: string) => {
    // Pass skipScrollRestore=true to avoid race condition with scrollToResults
    updateFilter('category', categorySlug, true);
    setSearchQuery(''); // Clear search input
    setShowSuggestions(false);
    scrollToResults();
  };

  // Handle city selection
  const handleCitySelect = (citySlug: string, cityLabel?: string) => {
    // Pass skipScrollRestore=true to avoid race condition with scrollToResults
    updateFilter('city', citySlug, true);
    setSearchQuery(''); // Clear search input
    setShowSuggestions(false);
    // Save to localStorage if we have the label
    if (cityLabel) {
      saveLocation(citySlug, cityLabel);
    }
    scrollToResults();
  };

  // Animated typing effect
  useEffect(() => {
    // Don't show typing animation when user is actively typing
    if (searchQuery) return;

    // Guard: Don't animate if no examples available
    if (currentExamples.length === 0) return;

    const currentWord = currentExamples[currentTypingIndex % currentExamples.length];

    // Guard: Skip if word is undefined (shouldn't happen with modulo, but extra safety)
    if (!currentWord) return;

    const typingSpeed = isDeleting ? 50 : 100;
    const pauseDuration = 2000;

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && displayText === currentWord) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentTypingIndex((prev) => (prev + 1) % currentExamples.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayText(prev => {
        if (isDeleting) {
          return currentWord.substring(0, prev.length - 1);
        } else {
          return currentWord.substring(0, prev.length + 1);
        }
      });
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentTypingIndex, displayText, isDeleting, isPaused, currentExamples, searchQuery]);

  // Reset typing animation when language changes
  useEffect(() => {
    setCurrentTypingIndex(0);
    setDisplayText('');
    setIsDeleting(false);
    setIsPaused(false);
  }, [currentLocale]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="mb-12 -mt-8 relative"
      style={{ zIndex: Z_INDEX.SEARCH_CARD }}
    >
      <NextUICard className="bg-white/95 shadow-2xl border-0 max-w-4xl mx-auto overflow-visible">
        <div className="p-8 overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="overflow-visible"
          >
            {/* Enhanced Search Input */}
            <div className="relative mb-8 overflow-visible">
              <div className="relative">
                <Search
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400"
                  style={{ zIndex: Z_INDEX.STICKY_ELEMENTS }}
                  size={24}
                />
                <Input
                  size="lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (hasSuggestions) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // Delay to allow button click to register before closing
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  classNames={{
                    input: "pl-16 pr-4 text-xl font-light h-16",
                    inputWrapper: "bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-16"
                  }}
                  placeholder={
                    searchQuery
                      ? t('professionals.search.searching')
                      : `${displayText}${!isPaused ? '|' : ''}`
                  }
                />

                {/* Category Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2"
                      style={{ zIndex: Z_INDEX.SEARCH_SUGGESTIONS }}
                    >
                      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] mx-1 mb-1">
                        <div className="overflow-y-auto px-2 pb-2">
                          {/* Categories Section */}
                          {categorySuggestions.length > 0 && (
                            <div className="mb-2">
                              <p className="px-4 pt-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {t('professionals.search.categories')}
                              </p>
                              {categorySuggestions.map((category) => (
                                <Button
                                  key={category.value}
                                  variant="light"
                                  className="w-full justify-start text-left h-auto py-3"
                                  onPress={() => handleCategorySelect(category.value)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium text-gray-900">{category.label}</span>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Cities Section */}
                          {citySuggestions.length > 0 && (
                            <div>
                              <p className="px-4 pt-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {t('professionals.search.cities')}
                              </p>
                              {citySuggestions.map((city) => (
                                <Button
                                  key={city.slug}
                                  variant="light"
                                  className="w-full justify-start text-left h-auto py-3"
                                  onPress={() => handleCitySelect(city.slug, city.label)}
                                  startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                                >
                                  <span className="font-medium text-gray-900">{city.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Popular Categories & Cities */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3 font-medium">{t('professionals.search.popular')}:</p>
                <div className="flex flex-wrap gap-3">
                  {/* Category Chips */}
                  {popularCategories.map((category) => {
                    const Icon = category.icon;
                    const colorClasses = {
                      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200',
                      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200',
                      green: 'from-green-50 to-green-100 border-green-200 text-green-700 hover:from-green-100 hover:to-green-200',
                      purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200',
                      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200',
                      pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-pink-200',
                    }[category.color] || 'from-gray-50 to-gray-100 border-gray-200 text-gray-700';

                    return (
                      <Chip
                        key={category.slug}
                        onClick={() => handleCategorySelect(category.slug)}
                        className={`cursor-pointer bg-gradient-to-r ${colorClasses} border font-medium transition-all duration-200 hover:scale-105 hover:shadow-md`}
                        startContent={Icon ? <Icon className="w-4 h-4" /> : undefined}
                        variant="flat"
                      >
                        {category.title}
                      </Chip>
                    );
                  })}

                  {/* City Chips */}
                  {popularCities.map((city) => {
                    return (
                      <Chip
                        key={city.slug}
                        onClick={() => handleCitySelect(city.slug, city.label)}
                        className="cursor-pointer bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
                        startContent={<MapPin className="w-4 h-4" />}
                        variant="flat"
                      >
                        {city.label}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>


          {/* Results Count */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">
              {isLoading
                ? t('professionals.results.loading')
                : t('professionals.results.showing', { count: professionalsCount, defaultValue: `Showing ${professionalsCount} professionals` })
              }
            </span>
          </div>
        </div>
      </NextUICard>
    </motion.div>
  );
}
