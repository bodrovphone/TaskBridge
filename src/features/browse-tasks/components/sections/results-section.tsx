'use client'

import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { Card as NextUICard, Button as NextUIButton } from "@nextui-org/react";
import { Search, Filter, Sparkles, X, Coffee, RotateCw } from "lucide-react";
import TaskCard from "@/components/ui/task-card";

interface ResultsSectionProps {
 tasks: any[];
 isLoading: boolean;
 error: any;
 recommendedTasks: any[];
 currentPage: number;
 pageSize: number;
 onSetCurrentPage: (page: number) => void;
 onClearFilters: () => void;
 onApplyToTask: (taskId: string) => void;
 onRetry?: () => void;
}

export default function ResultsSection({
 tasks,
 isLoading,
 error,
 recommendedTasks,
 currentPage,
 pageSize,
 onSetCurrentPage,
 onClearFilters,
 onApplyToTask,
 onRetry
}: ResultsSectionProps) {
 const { t } = useTranslation();

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
   ) : tasks.length > 0 ? (
    <div className="space-y-12">
     {/* Main Task Results */}
     <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {tasks.map((task: any, index: number) => (
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

      {/* Pagination */}
      {tasks.length === pageSize && (
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center mt-8"
       >
        <div className="flex space-x-2">
         <NextUIButton
          variant="bordered"
          onClick={() => onSetCurrentPage(Math.max(0, currentPage - 1))}
          isDisabled={currentPage === 0}
         >
          {t('browseTasks.pagination.previous')}
         </NextUIButton>
         <NextUIButton
          variant="bordered"
          onClick={() => onSetCurrentPage(currentPage + 1)}
          isDisabled={tasks.length < pageSize}
         >
          {t('browseTasks.pagination.next')}
         </NextUIButton>
        </div>
       </motion.div>
      )}
     </div>

     {/* Featured Tasks - Always show at bottom */}
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

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <NextUICard className="bg-white shadow-lg">
     <div className="p-12 text-center">
      <motion.div
       initial={{ scale: 0 }}
       animate={{ scale: 1 }}
       transition={{ type: "spring", bounce: 0.4 }}
      >
       <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
       {t('browseTasks.results.noTasks.title')}
      </h3>
      <p className="text-gray-600 mb-4">
       {t('browseTasks.results.noTasks.description')}
      </p>
      <NextUIButton 
       variant="bordered" 
       onClick={onClearFilters}
       startContent={<X size={16} />}
      >
       {t('browseTasks.results.noTasks.clearFilters')}
      </NextUIButton>
     </div>
    </NextUICard>
   )}
  </motion.div>
 );
}