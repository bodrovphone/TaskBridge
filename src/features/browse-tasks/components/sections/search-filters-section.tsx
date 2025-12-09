'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Input, Card as NextUICard, Chip, Button } from "@nextui-org/react";
import { Search, X } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { searchCategoriesAsync, preloadCategoryKeywords, getAllSubcategoriesWithLabels, getMainCategoryById } from '@/features/categories';
import { searchCities, getCitiesWithLabels } from '@/features/cities';
import { useTaskFilters } from '@/app/[lang]/browse-tasks/hooks/use-task-filters';
import { Z_INDEX } from '@/lib/constants/z-index';

interface SearchFiltersSectionProps {
 tasksCount: number;
 isLoading: boolean;
}

export default function SearchFiltersSection({
 tasksCount,
 isLoading
}: SearchFiltersSectionProps) {
 const { t, i18n } = useTranslation();
 const { filters, updateFilter } = useTaskFilters();
 // Initialize searchQuery from URL filter if present
 const [searchQuery, setSearchQuery] = useState(filters.q || '');
 const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
 const [displayText, setDisplayText] = useState('');
 const [isDeleting, setIsDeleting] = useState(false);
 const [isPaused, setIsPaused] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);
 const [categorySuggestions, setCategorySuggestions] = useState<{ value: string; label: string; mainCategoryId?: string }[]>([]);
 const keywordsPreloaded = useRef(false);

 // Preload keywords after 2s delay
 useEffect(() => {
  const timer = setTimeout(() => {
   if (!keywordsPreloaded.current) {
    preloadCategoryKeywords();
    keywordsPreloaded.current = true;
   }
  }, 2000);
  return () => clearTimeout(timer);
 }, []);

 // Preload keywords on input focus
 const handleInputFocus = useCallback(() => {
  if (!keywordsPreloaded.current) {
   preloadCategoryKeywords();
   keywordsPreloaded.current = true;
  }
  if (searchQuery.trim().length >= 2) {
   setShowSuggestions(true);
  }
 }, [searchQuery]);

 // Sync searchQuery with URL filter when it changes externally
 useEffect(() => {
  if (filters.q !== undefined && filters.q !== searchQuery) {
   setSearchQuery(filters.q);
  }
 }, [filters.q]);

 // Handle full-text search submission
 const handleTextSearch = useCallback(() => {
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery.length >= 2) {
   // Clear category filter when doing text search to avoid confusion
   if (filters.category) {
    updateFilter('category', undefined);
   }
   updateFilter('q', trimmedQuery);
   setShowSuggestions(false);
  }
 }, [searchQuery, filters.category, updateFilter]);

 // Clear text search
 const handleClearSearch = useCallback(() => {
  setSearchQuery('');
  updateFilter('q', undefined);
 }, [updateFilter]);

 // Handle Enter key for text search
 const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
   e.preventDefault();
   handleTextSearch();
  }
 }, [handleTextSearch]);

 // Get popular subcategories (not main categories) since tasks store subcategories
 // Note: 'category' filter actually stores subcategory slugs (see use-task-filters.ts)
 const popularCategories = useMemo(() => {
  const allSubcategories = getAllSubcategoriesWithLabels(t);
  // Get most common task subcategories (using actual slugs from subcategories.ts)
  const popularSlugs = [
   'house-cleaning',           // Cleaning Services
   'plumber',                  // Handyman
   'electrician',              // Handyman
   'apartment-renovation',     // Finishing Work
   'computer-help',            // Appliance Repair
   'furniture-assembly',       // Moving & Assembly
   'large-appliance-repair',   // Appliance Repair
   'language-tutoring'         // Lessons & Training
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
   .slice(0, 4) // Top 4 cities: Sofia, Plovdiv, Varna, Burgas
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

 // Search categories async (with lazy-loaded keywords)
 useEffect(() => {
  if (!searchQuery.trim()) {
   setCategorySuggestions([]);
   return;
  }
  let cancelled = false;
  searchCategoriesAsync(searchQuery, t, i18n.language).then(results => {
   if (!cancelled) {
    setCategorySuggestions(results.slice(0, 6));
   }
  });
  return () => { cancelled = true; };
 }, [searchQuery, t, i18n.language]);

 // Search cities (sync - no heavy data)
 const citySuggestions = searchQuery.trim() ? searchCities(searchQuery, t) : [];

 const hasSuggestions = categorySuggestions.length > 0 || citySuggestions.length > 0;

 // Show/hide suggestions based on input
 useEffect(() => {
  setShowSuggestions(searchQuery.trim().length > 0 && hasSuggestions);
 }, [searchQuery, hasSuggestions]);

 // Handle category selection
 const handleCategorySelect = (categorySlug: string) => {
  updateFilter('category', categorySlug);
  setSearchQuery(''); // Clear search input
  setShowSuggestions(false);
 };

 // Handle city selection
 const handleCitySelect = (citySlug: string) => {
  updateFilter('city', citySlug);
  setSearchQuery(''); // Clear search input
  setShowSuggestions(false);
 };

 // Animated typing effect
 useEffect(() => {
  // Don't show typing animation when user is actively typing
  if (searchQuery) return;

  const currentWord = currentExamples[currentTypingIndex];
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
 }, [i18n.language]);

 return (
  <motion.div
   initial={{ opacity: 0, y: 50 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.8, delay: 0.5 }}
   className="mb-12 -mt-8 relative"
   style={{ zIndex: Z_INDEX.SEARCH_CARD }}
  >
   <NextUICard id="task-filters" className="bg-white/95 shadow-2xl border-0 max-w-4xl mx-auto overflow-visible">
    <div className="p-8 overflow-visible">
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="overflow-visible"
     >
      {/* Enhanced Search Input */}
      <div className="relative mb-8 overflow-visible">
       {/* Active Search Query Display */}
       {filters.q && (
        <div className="mb-3 flex items-center gap-2">
         <span className="text-sm text-gray-600">{t('browseTasks.search.searchingFor', 'Searching for')}:</span>
         <Chip
          onClose={handleClearSearch}
          variant="flat"
          color="primary"
          classNames={{
           base: "bg-blue-100",
           content: "font-medium"
          }}
         >
          "{filters.q}"
         </Chip>
        </div>
       )}
       <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="relative w-full sm:flex-1">
         <Search
           className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400"
           style={{ zIndex: Z_INDEX.STICKY_ELEMENTS }}
           size={24}
         />
         <Input
          size="lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
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
            ? t('browseTasks.search.typeToSearch', 'Type to search tasks...')
            : `${displayText}${!isPaused ? '|' : ''}`
          }
          endContent={
           searchQuery && (
            <button
             onClick={() => setSearchQuery('')}
             className="p-1 hover:bg-gray-100 rounded-full transition-colors"
             type="button"
            >
             <X size={18} className="text-gray-400" />
            </button>
           )
          }
         />
         {/* Suggestions Dropdown - inside input wrapper for correct positioning */}
         <AnimatePresence>
          {showSuggestions && searchQuery.trim().length >= 2 && (
           <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2"
            style={{ zIndex: Z_INDEX.SEARCH_SUGGESTIONS }}
           >
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
             <div className="overflow-y-auto px-2 pb-2">
              {/* Search in task content option - always show at top */}
              <div className="border-b border-gray-100 mb-2">
               <Button
                variant="light"
                className="w-full justify-start text-left h-auto py-4 hover:bg-blue-50"
                onPress={handleTextSearch}
               >
                <Search size={18} className="mr-3 text-blue-600" />
                <div className="flex flex-col items-start">
                 <span className="font-medium text-blue-700">
                  {t('browseTasks.search.searchInTasks', 'Search in task content')}
                 </span>
                 <span className="text-sm text-gray-500">
                  {t('browseTasks.search.searchInTasksDesc', 'Find tasks matching "{query}"', { query: searchQuery.trim() })}
                 </span>
                </div>
               </Button>
              </div>

              {/* Categories Section */}
              {categorySuggestions.length > 0 && (
               <div className="mb-2">
                <p className="px-4 pt-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                 {t('browseTasks.search.filterByCategory', 'Filter by category')}
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
                 {t('browseTasks.search.filterByCity', 'Filter by city')}
                </p>
                {citySuggestions.map((city) => (
                 <Button
                  key={city.slug}
                  variant="light"
                  className="w-full justify-start text-left h-auto py-3"
                  onPress={() => handleCitySelect(city.slug)}
                 >
                  <div className="flex flex-col items-start">
                   <span className="font-medium text-gray-900">{city.label}</span>
                  </div>
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
        {/* Search Button */}
        <Button
         size="lg"
         color="primary"
         className="h-16 w-full sm:w-auto sm:px-8 font-semibold text-lg rounded-2xl"
         isDisabled={searchQuery.trim().length < 2}
         onPress={handleTextSearch}
        >
         <Search size={20} className="mr-2" />
         {t('browseTasks.search.searchButton', 'Search')}
        </Button>
       </div>

       {/* Popular Categories & Cities */}
       <div className="mt-6">
        <p className="text-sm text-gray-600 mb-3 font-medium">{t('browseTasks.search.popular')}:</p>
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
            onClick={() => handleCitySelect(city.slug)}
            className="cursor-pointer bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
            startContent={
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
            }
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
       {isLoading ? t('browseTasks.results.loading') : t('browseTasks.results.shown', { count: tasksCount })}
      </span>
     </div>
    </div>
   </NextUICard>
  </motion.div>
 );
}