'use client'

import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Input, Card as NextUICard, Chip } from "@nextui-org/react";
import { Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchFiltersSectionProps {
 filters: {
  search: string;
  category: string;
  city: string;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
  status: string;
  sortBy: string;
 };
 onFilterChange: (key: string, value: string) => void;
 tasksCount: number;
 isLoading: boolean;
}

// Popular category chips
const POPULAR_CATEGORIES = [
 { key: 'houseCleaning', icon: '🧹' },
 { key: 'plumbing', icon: '🔧' },
 { key: 'electrical', icon: '⚡' },
 { key: 'delivery', icon: '📦' },
 { key: 'moving', icon: '🏠' },
 { key: 'tutoring', icon: '📚' },
];

// Animated typing examples by language
const TYPING_EXAMPLES = {
 en: ['cleaning', 'repair', 'delivery', 'moving', 'tutoring', 'gardening'],
 bg: ['почистване', 'ремонт', 'доставка', 'преместване', 'уроци', 'градинарство'],
 ru: ['уборка', 'ремонт', 'доставка', 'переезд', 'репетиторство', 'садоводство']
};

export default function SearchFiltersSection({ 
 filters, 
 onFilterChange, 
 tasksCount, 
 isLoading 
}: SearchFiltersSectionProps) {
 const { t, i18n } = useTranslation();
 const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
 const [displayText, setDisplayText] = useState('');
 const [isDeleting, setIsDeleting] = useState(false);
 const [isPaused, setIsPaused] = useState(false);
 
 const currentLanguage = i18n.language as keyof typeof TYPING_EXAMPLES;
 const currentExamples = TYPING_EXAMPLES[currentLanguage] || TYPING_EXAMPLES.en;

 // Animated typing effect
 useEffect(() => {
  // Don't show typing animation when user is actively typing
  if (filters.search) return;
  
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
 }, [currentTypingIndex, displayText, isDeleting, isPaused, currentExamples, filters.search]);
 
 // Reset typing animation when language changes
 useEffect(() => {
  setCurrentTypingIndex(0);
  setDisplayText('');
  setIsDeleting(false);
  setIsPaused(false);
 }, [currentLanguage]);

 return (
  <motion.div 
   initial={{ opacity: 0, y: 50 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.8, delay: 0.5 }}
   className="mb-12 -mt-8 relative z-10"
  >
   <NextUICard className="bg-white/95 shadow-2xl border-0 max-w-4xl mx-auto">
    <div className="p-8">
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
     >
      {/* Enhanced Search Input */}
      <div className="relative mb-8">
       <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={24} />
        <Input
         size="lg"
         value={filters.search}
         onChange={(e) => onFilterChange('search', e.target.value)}
         classNames={{
          input: "pl-16 pr-4 text-xl font-light h-16",
          inputWrapper: "bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-16"
         }}
         placeholder={
          filters.search 
           ? '' 
           : `${displayText}${!isPaused ? '|' : ''}`
         }
        />
       </div>
       
       {/* Popular Categories */}
       <div className="mt-6">
        <p className="text-sm text-gray-600 mb-3 font-medium">{t('browseTasks.search.popular')}:</p>
        <div className="flex flex-wrap gap-3">
         {POPULAR_CATEGORIES.map((category) => (
          <Chip
           key={category.key}
           onClick={() => onFilterChange('search', t(`categories.${category.key}`))}
           className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-700 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
           startContent={
            <span className="text-lg">{category.icon}</span>
           }
           variant="flat"
          >
           {t(`categories.${category.key}`)}
          </Chip>
         ))}
        </div>
       </div>
      </div>
     </motion.div>

     {/* Advanced Filters - Collapsible */}
     {(filters.category || filters.city || filters.budgetMin || filters.budgetMax || filters.sortBy !== 'newest') && (
      <motion.div
       initial={{ opacity: 0, height: 0 }}
       animate={{ opacity: 1, height: "auto" }}
       transition={{ duration: 0.3 }}
       className="border-t border-gray-100 pt-6"
      >
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
         <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Filter size={16} />
          {t('browseTasks.filters.city')}
         </label>
         <select 
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200"
          value={filters.city}
          onChange={(e) => onFilterChange('city', e.target.value)}
         >
          <option value="">{t('browseTasks.filters.allCities')}</option>
          <option value="sofia">{t('browseTasks.filters.cities.sofia')}</option>
          <option value="plovdiv">{t('browseTasks.filters.cities.plovdiv')}</option>
          <option value="varna">{t('browseTasks.filters.cities.varna')}</option>
          <option value="burgas">{t('browseTasks.filters.cities.burgas')}</option>
         </select>
        </div>

        <div className="space-y-2">
         <label className="text-sm font-medium text-gray-700">
          {t('browseTasks.filters.budget')}
         </label>
         <div className="flex gap-2">
          <input 
           type="number" 
           placeholder={t('browseTasks.filters.budgetMin')}
           className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200"
           value={filters.budgetMin}
           onChange={(e) => onFilterChange('budgetMin', e.target.value)}
          />
          <input 
           type="number" 
           placeholder={t('browseTasks.filters.budgetMax')}
           className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200"
           value={filters.budgetMax}
           onChange={(e) => onFilterChange('budgetMax', e.target.value)}
          />
         </div>
        </div>

        <div className="space-y-2 md:col-span-2">
         <label className="text-sm font-medium text-gray-700">
          {t('browseTasks.filters.sortBy')}
         </label>
         <select 
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-3 bg-white focus:outline-none focus:border-blue-500 transition-colors duration-200"
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
         >
          <option value="newest">{t('browseTasks.filters.sort.newest')}</option>
          <option value="oldest">{t('browseTasks.filters.sort.oldest')}</option>
          <option value="highBudget">{t('browseTasks.filters.sort.highBudget')}</option>
          <option value="lowBudget">{t('browseTasks.filters.sort.lowBudget')}</option>
         </select>
        </div>
       </div>
      </motion.div>
     )}
     
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