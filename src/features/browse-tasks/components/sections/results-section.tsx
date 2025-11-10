'use client'

import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Card as NextUICard, Button as NextUIButton, Spinner } from "@nextui-org/react";
import { Search, Filter, Sparkles, X, Coffee, RotateCw } from "lucide-react";
import TaskCard from "@/components/ui/task-card";
import { useEffect, useRef } from "react";

interface ResultsSectionProps {
 tasks: any[];
 isLoading: boolean;
 error: any;
 recommendedTasks: any[];
 onClearFilters: () => void;
 onApplyToTask: (taskId: string) => void;
 onRetry?: () => void;
 hasActiveFilters?: boolean;
 hasNextPage?: boolean;
 isFetchingNextPage?: boolean;
 onLoadMore?: () => void;
}

export default function ResultsSection({
 tasks,
 isLoading,
 error,
 recommendedTasks,
 onClearFilters,
 onApplyToTask,
 onRetry,
 hasActiveFilters = false,
 hasNextPage = false,
 isFetchingNextPage = false,
 onLoadMore
}: ResultsSectionProps) {
 const { t } = useTranslation();
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
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ delay: 1.2 }}
  >
   {error ? (
    <div className="space-y-8">
     {/* Friendly Error Message */}
     <NextUICard className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg border-2 border-amber-200">
      <div className="p-8 text-center">
       {/* Coffee cup with steam animation */}
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

       {/* Friendly title */}
       <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {t('browseTasks.results.error.title')}
       </h3>

       {/* Humorous description */}
       <p className="text-gray-700 text-lg mb-2">
        {t('browseTasks.results.error.description')}
       </p>

       {/* Subtext */}
       <p className="text-gray-500 text-sm mb-6">
        {t('browseTasks.results.error.subtext')}
       </p>

       {/* Retry button */}
       {onRetry && (
        <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
        >
         <NextUIButton
          color="warning"
          variant="shadow"
          size="lg"
          onClick={onRetry}
          startContent={<RotateCw size={20} />}
          className="font-semibold"
         >
          {t('browseTasks.results.error.retry')}
         </NextUIButton>
        </motion.div>
       )}
      </div>
     </NextUICard>

     {/* Recommended Tasks Fallback */}
     <div className="pb-12">
      <div className="flex items-center gap-2 mb-6">
       <Sparkles className="text-orange-500" size={24} />
       <h3 className="text-2xl font-bold text-gray-900">
        {t('browseTasks.results.suggestedTasks')}
       </h3>
      </div>
      <p className="text-gray-600 mb-6">
       {t('browseTasks.results.suggestedDescription')}
      </p>
      
      <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
       {recommendedTasks.map((task: any, index: number) => (
        <motion.div
         key={task.id}
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.1 }}
         className="w-full"
        >
         <TaskCard
          task={task}
          onApply={onApplyToTask}
         />
        </motion.div>
       ))}
      </div>
     </div>
    </div>
   ) : isLoading ? (
    <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
     {[1, 2, 3, 4, 5, 6].map((i) => (
      <motion.div
       key={i}
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: i * 0.1 }}
       className="w-full"
      >
       <NextUICard className="animate-pulse">
        <div className="p-6 space-y-4">
         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
         <div className="h-4 bg-gray-200 rounded w-1/2"></div>
         <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
         </div>
        </div>
       </NextUICard>
      </motion.div>
     ))}
    </div>
   ) : !hasActiveFilters && recommendedTasks.length > 0 ? (
    /* NO FILTERS: Show ONLY Featured Tasks */
    <div>
     <div className="flex items-center gap-2 mb-6">
      <Sparkles className="text-blue-500" size={24} />
      <h3 className="text-2xl font-bold text-gray-900">
       {t('browseTasks.results.featuredTasks')}
      </h3>
     </div>
     <p className="text-gray-600 mb-6">
      {t('browseTasks.results.featuredDescription')}
     </p>

     <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendedTasks.map((task: any, index: number) => (
       <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="w-full"
       >
        <TaskCard
         task={task}
         onApply={onApplyToTask}
        />
       </motion.div>
      ))}
     </div>
    </div>
   ) : hasActiveFilters && tasks.length > 0 ? (
    /* FILTERS ACTIVE: Show ONLY Filtered Results with Infinite Scroll */
    <div>
     <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task: any, index: number) => (
       <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 1) }} // Cap delay for smoother loads
        className="w-full"
       >
        <TaskCard
         task={task}
         onApply={onApplyToTask}
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
         <span className="text-gray-600">{t('browseTasks.results.loadingMore', 'Loading more tasks...')}</span>
        </div>
       ) : null}
      </div>
     )}

     {/* End of results message */}
     {!hasNextPage && tasks.length > 0 && (
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="text-center mt-8 py-4 text-gray-500"
      >
       {t('browseTasks.results.allTasksLoaded', "You've reached the end of the list")}
      </motion.div>
     )}
    </div>
   ) : hasActiveFilters && tasks.length === 0 ? (
    /* FILTERS ACTIVE BUT NO RESULTS: Show colorful "no results" + Featured Tasks as fallback */
    <div className="space-y-12">
     <NextUICard className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl border-2 border-purple-200">
      <div className="p-12 text-center">
       {/* Animated Search Icon */}
       <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{
         scale: 1,
         rotate: 0,
        }}
        transition={{
         type: "spring",
         bounce: 0.6,
         duration: 0.8
        }}
        className="mb-6"
       >
        <div className="relative inline-block">
         <motion.div
          animate={{
           rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
           duration: 2,
           repeat: Infinity,
           ease: "easeInOut"
          }}
         >
          <Search className="w-16 h-16 text-purple-500 mx-auto" strokeWidth={2.5} />
         </motion.div>
         {/* Sparkles around the icon */}
         <motion.div
          animate={{
           scale: [1, 1.2, 1],
           opacity: [0.5, 1, 0.5]
          }}
          transition={{
           duration: 1.5,
           repeat: Infinity,
           ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2"
         >
          <Sparkles className="w-6 h-6 text-pink-500" />
         </motion.div>
        </div>
       </motion.div>

       {/* Humorous Title */}
       <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
        {t('browseTasks.results.noTasks.title', 'Oops! No tasks here... yet!')}
       </h3>

       {/* Humorous Description */}
       <p className="text-gray-700 text-lg mb-2 max-w-md mx-auto">
        {t('browseTasks.results.noTasks.description', 'Tasks are coming from users right now! Check back later today and they\'ll be here soon, we promise!')}
       </p>

       {/* Subtext */}
       <p className="text-gray-500 text-sm mb-6">
        {t('browseTasks.results.noTasks.subtext', 'Try adjusting your filters or explore our featured tasks below')}
       </p>

       {/* Clear Filters Button */}
       <NextUIButton
        color="secondary"
        variant="shadow"
        size="lg"
        onClick={onClearFilters}
        startContent={<X size={18} />}
        className="font-semibold"
       >
        {t('browseTasks.results.noTasks.clearFilters', 'Clear Filters')}
       </NextUIButton>
      </div>
     </NextUICard>

     {/* Featured Tasks as Fallback */}
     {recommendedTasks.length > 0 && (
      <div className="border-t border-gray-200 pt-12">
       <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-blue-500" size={24} />
        <h3 className="text-2xl font-bold text-gray-900">
         {t('browseTasks.results.featuredTasks')}
        </h3>
       </div>
       <p className="text-gray-600 mb-6">
        {t('browseTasks.results.featuredDescription')}
       </p>

       <div className="grid grid-cols-1 min-[590px]:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedTasks.map((task: any, index: number) => (
         <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="w-full"
         >
          <TaskCard
           task={task}
           onApply={onApplyToTask}
          />
         </motion.div>
        ))}
       </div>
      </div>
     )}
    </div>
   ) : (
    /* Fallback: Show colorful empty state */
    <NextUICard className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl border-2 border-purple-200">
     <div className="p-12 text-center">
      {/* Animated Search Icon */}
      <motion.div
       initial={{ scale: 0, rotate: -180 }}
       animate={{
        scale: 1,
        rotate: 0,
       }}
       transition={{
        type: "spring",
        bounce: 0.6,
        duration: 0.8
       }}
       className="mb-6"
      >
       <div className="relative inline-block">
        <motion.div
         animate={{
          rotate: [0, -10, 10, -10, 0],
         }}
         transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
         }}
        >
         <Search className="w-16 h-16 text-purple-500 mx-auto" strokeWidth={2.5} />
        </motion.div>
        {/* Sparkles around the icon */}
        <motion.div
         animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
         }}
         transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
         }}
         className="absolute -top-2 -right-2"
        >
         <Sparkles className="w-6 h-6 text-pink-500" />
        </motion.div>
       </div>
      </motion.div>

      {/* Humorous Title */}
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
       {t('browseTasks.results.noTasks.title', 'Oops! No tasks here... yet!')}
      </h3>

      {/* Humorous Description */}
      <p className="text-gray-700 text-lg mb-2 max-w-md mx-auto">
       {t('browseTasks.results.noTasks.description', 'Tasks are coming from users right now! Check back later today and they\'ll be here soon, we promise!')}
      </p>

      {/* Subtext */}
      <p className="text-gray-500 text-sm mb-6">
       {t('browseTasks.results.noTasks.subtext', 'Try adjusting your filters or explore our featured tasks below')}
      </p>

      {/* Clear Filters Button */}
      <NextUIButton
       color="secondary"
       variant="shadow"
       size="lg"
       onClick={onClearFilters}
       startContent={<X size={18} />}
       className="font-semibold"
      >
       {t('browseTasks.results.noTasks.clearFilters', 'Clear Filters')}
      </NextUIButton>
     </div>
    </NextUICard>
   )}
  </motion.div>
 );
}