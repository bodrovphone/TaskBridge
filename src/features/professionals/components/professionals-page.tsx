'use client'

// @todo REFACTORING: Split this 730-line component into smaller sections:
// - ProfessionalsHeroSection (search + categories)
// - ProfessionalsFiltersSection (desktop/mobile filters) 
// - ProfessionalsGridSection (masonry grid + pagination)
// Target: Reduce from 730 lines to ~300 lines

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { motion } from "framer-motion";
import { 
 Card as NextUICard, 
 Button as NextUIButton, 
 Input,
 Select,
 SelectItem,
 Chip
} from "@heroui/react";
import { Search, Filter, SlidersHorizontal, X, Briefcase } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { ProfessionalsTypingPlaceholder } from "@/components/common";
import CompactRatingSlider from "@/components/ui/compact-rating-slider";
import SortingPicker from "@/components/ui/sorting-picker";
import FilterControls from "./filter-controls";
import ProfessionalCard from "./professional-card";
import { mockProfessionals } from "../lib";
import { getCategoryOptions, getCategoryLabelBySlug } from '@/features/categories';
import { getLocationOptions, getLocationLabel } from '@/lib/constants/locations';
import type { LocationSlug } from '@/lib/constants/locations';

export default function ProfessionalsPage() {
 const { t } = useTranslation();
 const router = useRouter();
 const params = useParams();
 const searchParams = useSearchParams();
 const lang = params?.lang as string || 'en';

 const [filters, setFilters] = useState({
  search: "",
  category: "all",
  location: "",
  minRating: 0,
  mostActive: false,
  gender: "",
  sortBy: "featured"
 });

 // Read category from URL query params on mount
 useEffect(() => {
  const categoryParam = searchParams.get('category');
  const locationParam = searchParams.get('location');
  const ratingParam = searchParams.get('rating');

  const updates: any = {};
  if (categoryParam && categoryParam !== filters.category) {
   updates.category = categoryParam;
  }
  if (locationParam && locationParam !== filters.location) {
   updates.location = locationParam;
  }
  if (ratingParam && Number(ratingParam) !== filters.minRating) {
   updates.minRating = Number(ratingParam);
  }

  if (Object.keys(updates).length > 0) {
   setFilters(prev => ({ ...prev, ...updates }));

   // Scroll to results section when navigating with category/location/rating params
   setTimeout(() => {
    const resultsSection = document.getElementById('professionals-results-section');
    if (resultsSection) {
     resultsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
     });
    }
   }, 300); // Delay to allow filters to render
  }
 }, [searchParams]);

 // Get category and location options with translations
 const categoryOptions = useMemo(() => getCategoryOptions(t), [t]);
 const locationOptions = useMemo(() => getLocationOptions(t), [t]);

 // Create select items for categories
 const categorySelectItems = useMemo(() => {
  const items = [
   <SelectItem key="all">{t('professionals.allCategories')}</SelectItem>
  ];
  
  categoryOptions.forEach(category => {
   items.push(
    <SelectItem key={category.value} >
     {category.label}
    </SelectItem>
   );
  });
  
  return items;
 }, [categoryOptions, t]);

 const handleFilterChange = (key: string, value: any) => {
  const newFilters = { ...filters, [key]: value };
  setFilters(newFilters);

  // Update URL with query params for shareability
  const params = new URLSearchParams();
  if (newFilters.category !== "all") params.set('category', newFilters.category);
  if (newFilters.location) params.set('location', newFilters.location);
  if (newFilters.minRating > 0) params.set('rating', newFilters.minRating.toString());

  const queryString = params.toString();
  const newUrl = `/${lang}/professionals${queryString ? `?${queryString}` : ''}`;
  router.push(newUrl, { scroll: false });
 };

 const clearFilters = () => {
  setFilters({
   search: "",
   category: "all",
   location: "",
   minRating: 0,
   mostActive: false,
   gender: "",
   sortBy: "featured"
  });
  // Clear URL params
  router.push(`/${lang}/professionals`, { scroll: false });
 };

 // Filter categories based on search term
 const filteredCategories = useMemo(() => {
  if (!filters.search.trim()) return categoryOptions;
  
  return categoryOptions.filter(option => 
   option.label.toLowerCase().includes(filters.search.toLowerCase()) ||
   option.value.toLowerCase().includes(filters.search.toLowerCase())
  );
 }, [categoryOptions, filters.search]);

 // Filter and sort professionals
 const filteredProfessionals = useMemo(() => {
  let result = [...mockProfessionals];
  
  // Category filter
  if (filters.category !== "all") {
   result = result.filter(professional =>
    professional.categories.includes(filters.category)
   );
  }
  
  // Location filter
  if (filters.location) {
   result = result.filter(professional =>
    professional.location.toLowerCase().includes(filters.location.toLowerCase())
   );
  }
  
  // Rating filter
  if (filters.minRating > 0) {
   result = result.filter(professional => professional.rating >= filters.minRating);
  }
  
  // Gender filter
  if (filters.gender) {
   // Mock gender filtering - in real app this would be based on data
   if (filters.gender === "male") {
    result = result.filter(p => ["Георги Иванов", "Димитър Стоянов", "Петър Георгиев"].includes(p.name));
   } else if (filters.gender === "female") {
    result = result.filter(p => ["Мария Петрова", "Елена Димитрова", "Анна Николова"].includes(p.name));
   }
  }
  
  // Most active filter
  if (filters.mostActive) {
   result = result.filter(professional => professional.completedJobs > 50);
  }
  
  // Sorting
  switch (filters.sortBy) {
   case "rating":
    result.sort((a, b) => b.rating - a.rating);
    break;
   case "jobs":
    result.sort((a, b) => b.completedJobs - a.completedJobs);
    break;
   case "featured":
   default:
    result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    break;
  }
  
  return result;
 }, [filters]);

 // Show all professionals (both featured and regular) in a single section
 const allProfessionals = filteredProfessionals;

 const hasActiveFilters = filters.search || filters.category !== "all" || filters.location || filters.minRating > 0 || filters.mostActive || filters.gender;

 const getActiveFilters = () => {
  const active = [];
  if (filters.search) active.push({ key: 'search', label: `"${filters.search}"`, value: filters.search });
  if (filters.category !== "all") active.push({ key: 'category', label: getCategoryLabelBySlug(filters.category, t), value: filters.category });
  if (filters.location) active.push({ key: 'location', label: getLocationLabel(filters.location as LocationSlug, t), value: filters.location });
  if (filters.minRating > 0) active.push({ key: 'minRating', label: `${filters.minRating}+ stars`, value: filters.minRating });
  if (filters.mostActive) active.push({ key: 'mostActive', label: t('professionals.mostActive', { fallback: 'Most Active' }), value: 'mostActive' });
  if (filters.gender) active.push({ key: 'gender', label: t(`professionals.gender.${filters.gender}`, { fallback: filters.gender === 'male' ? 'Male' : 'Female' }), value: filters.gender });
  return active;
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
    
    /* Ensure cards have variable height */
    .masonry-item .professional-card {
     height: auto !important;
     min-height: unset !important;
    }
   `}</style>

   {/* Hero Section */}
   <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 -mt-16 pt-20 pb-10">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white min-h-[150px] md:min-h-[300px] flex items-center justify-center">
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
         <span className="text-blue-200 font-medium tracking-wide">✨ {t('professionals.hero.badge', { fallback: 'Professional Network' })}</span>
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

       {/* Trust indicators */}
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-wrap justify-center gap-6 mt-12"
       >
        {[
         { icon: '🔒', text: 'Verified Professionals', count: '2,000+' },
         { icon: '⭐', text: 'Average Rating', count: '4.9/5' },
         { icon: '✅', text: 'Completed Jobs', count: '10,000+' }
        ].map((item, index) => (
         <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 + (index * 0.1) }}
          className="bg-white/10 rounded-xl px-4 py-3 border border-white/20 text-center min-w-[140px]"
         >
          <div className="text-2xl mb-1">{item.icon}</div>
          <div className="text-lg font-bold text-white">{item.count}</div>
          <div className="text-sm text-blue-200">{item.text}</div>
         </motion.div>
        ))}
       </motion.div>
      </motion.div>
    </div>
   </div>

   <main 
    className="relative"
    style={{
     backgroundImage: 'url(/images/cardboard.png)',
     backgroundRepeat: 'repeat',
     backgroundSize: 'auto'
    }}
   >
    {/* Background overlay */}
    <div className="absolute inset-0 bg-white/70 "></div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pb-16">
     {/* Enhanced Centralized Search Bar */}
     <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="mb-12 mt-10 relative z-30"
     >
      <NextUICard className="bg-white/98 shadow-2xl border-0 max-w-5xl mx-auto overflow-hidden">
       <div className="p-8 lg:p-10">
        <motion.div
         whileFocus={{ scale: 1.01 }}
         transition={{ duration: 0.3, ease: "easeOut" }}
        >
         <div className="relative group">
          <Input
           size="lg"
           placeholder={filters.search ? '' : ' '}
           value={filters.search}
           onChange={(e) => handleFilterChange("search", e.target.value)}
           startContent={
            <motion.div
             animate={{ 
              rotate: filters.search ? 360 : 0,
              scale: filters.search ? 1.1 : 1 
             }}
             transition={{ duration: 0.4, ease: "easeInOut" }}
             className="flex items-center justify-center"
            >
             <Search className="text-blue-500 group-focus-within:text-blue-600" size={24} />
            </motion.div>
           }
           classNames={{
            base: "max-w-full",
            mainWrapper: "h-full",
            input: "text-lg font-medium placeholder:text-gray-400",
            inputWrapper: "h-20 px-6 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 group-focus-within:border-blue-500 group-hover:border-blue-300 shadow-xl group-focus-within:shadow-2xl transition-all duration-500 ease-out group-focus-within:bg-white"
           }}
          />
          {/* Enhanced typing placeholder overlay */}
          {!filters.search && (
           <div 
            className="absolute left-16 top-1/2 transform -translate-y-1/2 pointer-events-none text-lg font-medium"
            style={{ zIndex: 1 }}
           >
            <ProfessionalsTypingPlaceholder />
           </div>
          )}
          
          {/* Search suggestions overlay */}
          <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: filters.search && !filteredCategories.length ? 1 : 0 }}
           className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
           <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-lg">Enter</kbd>
          </motion.div>
         </div>
        </motion.div>
        
        {/* Enhanced Quick Category Suggestions */}
        <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.8 }}
         className="mt-8 space-y-4"
        >
         <div className="text-center">
          <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{t('professionals.popularCategories')}</span>
         </div>
         <div className="flex flex-wrap gap-3 justify-center">
          {['plumbing', 'house-cleaning', 'tutoring', 'electrician', 'painting', 'carpenter', 'apartment-cleaning', 'handyman'].map((category, index) => (
           <motion.button
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + (index * 0.05) }}
            whileHover={{ 
             scale: 1.05, 
             y: -2,
             boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFilterChange("category", category)}
            className="group relative px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
           >
            <span className="relative z-10">{getCategoryLabelBySlug(category, t)}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-400/0 group-hover:from-blue-400/10 group-hover:to-blue-400/20 rounded-xl transition-all duration-300"></div>
           </motion.button>
          ))}
         </div>
        </motion.div>

        {/* Enhanced Category Results */}
        {filters.search && filteredCategories.length > 0 && (
         <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
         >
          <div className="flex items-center justify-center gap-2 mb-4">
           <Search className="text-blue-500" size={16} />
           <p className="text-sm font-semibold text-blue-700">
            {filteredCategories.length} {t('professionals.categoryResults')} found
           </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
           {filteredCategories.slice(0, 8).map((category, index) => (
            <motion.div
             key={category.value}
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: index * 0.05 }}
            >
             <Chip
              variant="flat"
              color="primary"
              className="cursor-pointer hover:bg-blue-200 transition-all duration-300 bg-blue-100 text-blue-800 border border-blue-200 hover:border-blue-400 hover:scale-105 font-medium shadow-sm hover:shadow-md"
              onClick={() => {
               handleFilterChange("category", category.value);
               handleFilterChange("search", "");
              }}
             >
              {category.label}
             </Chip>
            </motion.div>
           ))}
           {filteredCategories.length > 8 && (
            <Chip 
             variant="flat" 
             color="default"
             className="bg-gray-100 text-gray-600 font-medium"
            >
             +{filteredCategories.length - 8} more
            </Chip>
           )}
          </div>
         </motion.div>
        )}
       </div>
      </NextUICard>
     </motion.div>

     {/* Enhanced Filters and Sorting */}
     <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mb-10"
     >
      <div className="bg-white/80 rounded-2xl p-6 border border-gray-200 shadow-lg">
       <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex items-center gap-4">
         <div className="p-2 bg-blue-100 rounded-lg">
          <SlidersHorizontal size={20} className="text-blue-600" />
         </div>
         <div>
          <span className="text-lg font-bold text-gray-900">{t('professionals.filterBy')}</span>
          <p className="text-sm text-gray-500">{t('professionals.refineSearch')}</p>
         </div>
        </div>
        
        {/* Mobile Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
         <Sheet>
          <SheetTrigger asChild>
           <button 
            className="lg:hidden flex items-center justify-center gap-2 flex-1 h-12 px-4 py-2 bg-white border-2 border-gray-200 hover:border-blue-400 transition-colors rounded-lg font-medium text-gray-700 hover:text-blue-600"
            onClick={() => console.log('Filter button clicked!')}
           >
            <Filter size={16} />
            Filters {hasActiveFilters && (
             <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {getActiveFilters().length}
             </span>
            )}
           </button>
          </SheetTrigger>
          <SheetContent side="right" className="z-50 !bg-white w-[400px] sm:w-[540px] border-l border-gray-200">
           <SheetHeader>
            <SheetTitle>Filter Professionals</SheetTitle>
           </SheetHeader>
           <div className="py-6 space-y-6">
            <FilterControls 
             filters={filters}
             onFilterChange={handleFilterChange}
             categorySelectItems={categorySelectItems}
             t={t}
            />
           </div>
          </SheetContent>
         </Sheet>
         
         {/* Enhanced Desktop Filters */}
         <div className="hidden lg:flex items-center gap-4">
          <Select
           placeholder={t('professionals.allCategories')}
           selectedKeys={[filters.category]}
           onSelectionChange={(keys) => handleFilterChange("category", Array.from(keys)[0] as string || "all")}
           className="min-w-[220px]"
           size="lg"
           variant="bordered"
           aria-label="Filter by category"
           classNames={{
            base: "bg-white",
            trigger: "bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-12",
            value: "text-gray-900 font-medium",
            label: "text-gray-700"
           }}
           startContent={<div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
          >
           {categorySelectItems}
          </Select>
          
          <Select
           placeholder={t('professionals.filters.locationPlaceholderDesktop')}
           selectedKeys={filters.location ? [filters.location] : []}
           onSelectionChange={(keys) => handleFilterChange("location", Array.from(keys)[0] as string || "")}
           className="min-w-[220px]"
           size="lg"
           variant="bordered"
           aria-label="Filter by location"
           classNames={{
            base: "bg-white",
            trigger: "bg-white shadow-lg border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-12 data-[hover=true]:bg-white",
            value: "text-gray-900 font-medium text-base",
            label: "text-gray-700",
            innerWrapper: "text-gray-900"
           }}
           renderValue={(items) => {
            return items.map((item) => {
             const location = locationOptions.find(loc => loc.value === item.key);
             return (
              <div key={item.key} className="flex items-center gap-2">
               <span>{location?.emoji}</span>
               <span className="text-gray-900 font-medium">{location?.label}</span>
              </div>
             );
            });
           }}
          >
           {locationOptions.map((location) => (
            <SelectItem key={location.value} >
             {location.emoji} {location.label}
            </SelectItem>
           ))}
          </Select>
          
          <CompactRatingSlider
           value={filters.minRating}
           onChange={(rating) => handleFilterChange("minRating", rating)}
           className="min-w-[160px]"
          />
          
          <SortingPicker
           value={filters.sortBy}
           onChange={(sortBy) => handleFilterChange("sortBy", sortBy)}
           className="min-w-[180px]"
          />
         </div>
        </div>
       </div>
       
       {/* Enhanced Active Filters */}
       {hasActiveFilters && (
        <motion.div
         id="active-filters-section"
         initial={{ opacity: 0, height: 0, y: -10 }}
         animate={{ opacity: 1, height: 'auto', y: 0 }}
         exit={{ opacity: 0, height: 0, y: -10 }}
         transition={{ duration: 0.4, ease: "easeOut" }}
         className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm"
        >
         <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
            <motion.div
             initial={{ rotate: 0 }}
             animate={{ rotate: 360 }}
             transition={{ duration: 0.6, ease: "easeInOut" }}
             className="p-2 bg-blue-100 rounded-lg border border-blue-200 shadow-sm"
            >
             <Filter size={16} className="text-blue-600" />
            </motion.div>
            <div>
             <h4 className="text-base font-bold text-blue-800 leading-none">{t('professionals.filters.activeFilters')}</h4>
             <p className="text-xs text-blue-600 mt-0.5">{getActiveFilters().length === 1 ? t('professionals.filters.filterApplied', { count: getActiveFilters().length }) : t('professionals.filters.filtersApplied', { count: getActiveFilters().length })}</p>
            </div>
           </div>
           <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
           >
            <NextUIButton 
             size="sm" 
             variant="flat" 
             color="danger"
             onClick={clearFilters}
             className="font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 px-4 py-2 shadow-sm hover:shadow-md"
             startContent={
              <motion.div
               whileHover={{ rotate: 90 }}
               transition={{ duration: 0.2 }}
              >
               <X size={14} />
              </motion.div>
             }
            >
             {t('professionals.filters.clearAll')}
            </NextUIButton>
           </motion.div>
          </div>
          
          {/* Filters Grid */}
          <div className="flex flex-wrap gap-2.5 pt-1">
           {getActiveFilters().map((filter, index) => (
            <motion.div
             key={filter.key}
             initial={{ opacity: 0, scale: 0.8, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             transition={{ 
              delay: index * 0.08, 
              duration: 0.3, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100
             }}
             whileHover={{ scale: 1.05, y: -1 }}
             whileTap={{ scale: 0.95 }}
            >
             <ShadcnBadge className="group flex items-center gap-2.5 bg-white text-blue-900 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md cursor-pointer">
              <span className="text-sm leading-none">{filter.label}</span>
              <motion.div
               whileHover={{ scale: 1.3, rotate: 90 }}
               whileTap={{ scale: 0.8 }}
               transition={{ duration: 0.2 }}
               className="flex items-center justify-center w-5 h-5 bg-blue-100 hover:bg-red-100 rounded-full border border-blue-200 hover:border-red-200 transition-all duration-200"
              >
               <X 
                size={12} 
                className="text-blue-600 hover:text-red-600 transition-colors duration-200" 
                onClick={(e) => {
                 e.stopPropagation();
                 handleFilterChange(filter.key, filter.key === 'minRating' ? 0 : filter.key === 'mostActive' ? false : filter.key === 'category' ? 'all' : '');
                }}
               />
              </motion.div>
             </ShadcnBadge>
            </motion.div>
           ))}
          </div>
         </div>
        </motion.div>
       )}
      </div>
     </motion.div>

     {/* Pinterest-style Professionals Grid */}
     {allProfessionals.length > 0 && (
      <motion.div
       id="professionals-results-section"
       initial={{ opacity: 0, y: 30 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.6, delay: 0.2 }}
       className="mb-16"
      >
       <div className="text-center mb-10">
        <motion.div
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
         className="inline-block"
        >
         <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 border border-blue-200 mb-4">
          <span className="text-blue-700 font-semibold text-sm">👥 {t('professionals.recommendedTitle')}</span>
         </div>
        </motion.div>
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
         {filters.category === 'all' ? t('professionals.findPerfect') : `${getCategoryLabelBySlug(filters.category, t)} Specialists`}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
         {t('professionals.discoverTrusted')}
        </p>
        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full inline-block mt-4">
         {allProfessionals.length} {t('professionals.professionalsAvailable')}
        </div>
       </div>
       
       {/* Pinterest-style Masonry Grid */}
       <div className="masonry-grid">
        {allProfessionals.map((professional, index) => (
         <motion.div
          key={professional.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + (index * 0.05) }}
          className="masonry-item"
         >
          <ProfessionalCard professional={professional} featured={professional.featured} />
         </motion.div>
        ))}
       </div>
      </motion.div>
     )}

     {/* Enhanced No Results */}
     {allProfessionals.length === 0 && (
      <motion.div 
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.5 }}
       className="text-center py-20"
      >
       <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 max-w-lg mx-auto">
        <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ duration: 0.5, delay: 0.2 }}
         className="text-8xl mb-6"
        >
         🔍
        </motion.div>
        <motion.h3 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.3 }}
         className="text-2xl font-bold text-gray-800 mb-4"
        >
         No professionals found
        </motion.h3>
        <motion.p 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.4 }}
         className="text-gray-600 mb-6 leading-relaxed"
        >
         {filters.category === 'all' 
          ? 'Try adjusting your search terms or filters to find the perfect professional for your needs.' 
          : t('professionals.noMatchingResults')
         }
        </motion.p>
        <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.5 }}
        >
         <NextUIButton 
          onClick={clearFilters}
          color="primary"
          variant="shadow"
          size="lg"
          className="font-semibold"
          startContent={<X size={18} />}
         >
          {t('professionals.filters.clearAll')}
         </NextUIButton>
        </motion.div>
       </div>
      </motion.div>
     )}
    </div>
   </main>
  </>
 );
}