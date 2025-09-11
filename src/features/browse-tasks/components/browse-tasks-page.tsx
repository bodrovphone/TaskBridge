'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import TaskCard from "@/components/ui/task-card";
import VideoBackground from "@/components/ui/video-background";
import { Input, Card as NextUICard, Button as NextUIButton } from "@nextui-org/react";
import { Search, Filter, SlidersHorizontal, X, Sparkles } from "lucide-react";

// Mock categories for now - will be replaced with proper schema import
const TASK_CATEGORIES = {
  'home_repair': 'Home Repair',
  'delivery_transport': 'Delivery & Transport',
  'personal_care': 'Personal Care',
  'personal_assistant': 'Personal Assistant',
  'learning_fitness': 'Learning & Fitness',
  'other': 'Other'
};

export default function BrowseTasksPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    status: "open",
    sortBy: "newest"
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.city) queryParams.append("city", filters.city);
  if (filters.budgetMin) queryParams.append("budgetMin", filters.budgetMin);
  if (filters.budgetMax) queryParams.append("budgetMax", filters.budgetMax);
  if (filters.deadline) queryParams.append("deadline", filters.deadline);
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  queryParams.append("limit", pageSize.toString());
  queryParams.append("offset", (currentPage * pageSize).toString());

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: [`/api/tasks?${queryParams.toString()}`],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      city: "",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      status: "open",
      sortBy: "newest"
    });
    setCurrentPage(0);
  };

  const handleApplyToTask = (taskId: string) => {
    window.location.href = `/tasks/${taskId}`;
  };

  // Filter helper functions (kept for future use)
  // const hasActiveFilters = filters.search || filters.category || filters.city || filters.budgetMin || filters.budgetMax || filters.deadline || (filters.status !== "open");
  // const getActiveFilters = () => { ... }
  // const getStatusLabel = (status: string) => { ... }
  // const removeFilter = (filterKey: string) => { ... }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      
      {/* Hero Section with Video Background */}
      <VideoBackground 
        videoSrc="/assets/hero_video_1.mp4"
        fallbackGradient="from-blue-600 via-blue-700 to-emerald-600"
        overlayOpacity={0.6}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">{t('browseTasks.hero.badge')}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {t('browseTasks.hero.title1')}
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                {t('browseTasks.hero.title2')}
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              {t('browseTasks.hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>
      </VideoBackground>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Centralized Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12"
        >
          <NextUICard className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-4xl mx-auto">
            <div className="p-8">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  size="lg"
                  placeholder={t('browseTasks.search.placeholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  startContent={
                    <motion.div
                      animate={{ rotate: filters.search ? 360 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Search className="text-blue-500" size={24} />
                    </motion.div>
                  }
                  classNames={{
                    base: "max-w-full",
                    mainWrapper: "h-full",
                    input: "text-lg",
                    inputWrapper: "h-16 px-6 bg-white border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500 shadow-lg transition-all duration-300"
                  }}
                />
              </motion.div>
              
              {/* Quick Filter Suggestions */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex flex-wrap gap-3 justify-center"
              >
                <span className="text-sm text-gray-600 mr-2">{t('browseTasks.search.popular')}:</span>
                {['programming', 'design', 'marketing', 'translation', 'photography'].map((tag) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterChange("search", t(`browseTasks.search.tags.${tag}`))}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {t(`browseTasks.search.tags.${tag}`)}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </NextUICard>
        </motion.div>

        {/* Filters Placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <NextUICard className="bg-white shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{t('browseTasks.filters.title')}</h3>
                </div>
                <NextUIButton 
                  size="sm" 
                  variant="light"
                  className="text-blue-600"
                  startContent={<Filter size={16} />}
                >
                  {t('browseTasks.filters.advanced')}
                </NextUIButton>
              </div>
              
              {/* Quick Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-600">{t('browseTasks.filters.quick')}:</span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('browseTasks.filters.allCategories')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('browseTasks.filters.sofia')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('browseTasks.filters.budgetUpTo')}
                </motion.button>
                
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t('browseTasks.filters.sortBy')}:</span>
                  <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <option>{t('browseTasks.filters.sort.newest')}</option>
                    <option>{t('browseTasks.filters.sort.oldest')}</option>
                    <option>{t('browseTasks.filters.sort.highBudget')}</option>
                    <option>{t('browseTasks.filters.sort.lowBudget')}</option>
                  </select>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  {isLoading ? t('browseTasks.results.loading') : t('browseTasks.results.shown', { count: (tasks as any[]).length })}
                </span>
              </div>
            </div>
          </NextUICard>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {error ? (
            <NextUICard className="bg-white shadow-lg">
              <div className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="text-red-500 mb-4"
                >
                  <Filter size={48} className="mx-auto" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('browseTasks.results.error.title')}
                </h3>
                <p className="text-gray-600">
                  {t('browseTasks.results.error.description')}
                </p>
              </div>
            </NextUICard>
          ) : isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
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
          ) : (tasks as any[]).length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(tasks as any[]).map((task: any, index: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TaskCard 
                      task={task}
                      onApply={handleApplyToTask}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {(tasks as any[]).length === pageSize && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center mt-8"
                >
                  <div className="flex space-x-2">
                    <NextUIButton
                      variant="bordered"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      isDisabled={currentPage === 0}
                    >
                      {t('browseTasks.pagination.previous')}
                    </NextUIButton>
                    <NextUIButton
                      variant="bordered"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      isDisabled={(tasks as any[]).length < pageSize}
                    >
                      {t('browseTasks.pagination.next')}
                    </NextUIButton>
                  </div>
                </motion.div>
              )}
            </>
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
                  onClick={clearFilters}
                  startContent={<X size={16} />}
                >
                  {t('browseTasks.results.noTasks.clearFilters')}
                </NextUIButton>
              </div>
            </NextUICard>
          )}
        </motion.div>
      </main>

    </div>
  );
}