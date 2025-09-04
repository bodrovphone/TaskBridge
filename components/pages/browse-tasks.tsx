'use client'

import { useState, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "@/components/task-card";
import VideoBackground from "@/components/video-background";
import { Button } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input, Card as NextUICard, Button as NextUIButton, Skeleton } from "@nextui-org/react";
import { Search, Filter, MapPin, DollarSign, Calendar, Clock, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { TASK_CATEGORIES } from "../../shared/schema";
import TypingPlaceholder from "@/components/typing-placeholder";
import { mockTasks } from "@/lib/mock-data";

function BrowseTasks() {
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

  // Use shared mock data with proper customer format
  const defaultTasks = mockTasks.map(task => ({
    ...task,
    customerName: `${task.customer.firstName} ${task.customer.lastName}`,
    customerAvatar: task.customer.profileImageUrl || "/api/placeholder/32/32",
    customerRating: parseFloat(task.customer.averageRating || "0"),
    isUrgent: task.urgency === "same_day"
  }));
  
  // Legacy task data (unused now)
  const oldDefaultTasks = [
    {
      id: "1",
      title: "Разходка с кучето",
      description: "Търся надежден човек да разхожда кучето ми два пъти дневно в продължение на една седмица, докато съм в командировка.",
      category: "personal_care",
      budgetMin: 15,
      budgetMax: 20,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Лозенец", 
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 3,
      customerName: "Мария Иванова",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.8,
      isUrgent: false
    },
    {
      id: "2",
      title: "Пренос на мебели",
      description: "Трябва ми помощ за преместване на мебели от Студентски град до Младост. Включва диван, маса, шкафове и кутии.",
      category: "delivery_transport",
      budgetMin: 80,
      budgetMax: 120,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Студентски град",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 7,
      customerName: "Георги Петров",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 5.0,
      isUrgent: true
    },
    {
      id: "3",
      title: "Почистване на апартамент",
      description: "Професионално почистване на двустаен апартамент, включително прозорци и тераса. Площ около 75кв.м.",
      category: "home_repair",
      budgetMin: 60,
      budgetMax: 80,
      budgetType: "fixed",
      city: "Пловдив",
      neighborhood: "Център",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 5,
      customerName: "Елена Димитрова",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.5,
      isUrgent: false
    },
    {
      id: "4",
      title: "Уроци по китара",
      description: "Търся преподавател по китара за начинаещ. Предпочитам индивидуални уроци, 2 пъти седмично.",
      category: "education_fitness",
      budgetMin: 25,
      budgetMax: 40,
      budgetType: "hourly",
      city: "София",
      neighborhood: "Витоша",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 4,
      customerName: "Николай Стоянов",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.9,
      isUrgent: false
    },
    {
      id: "5",
      title: "Монтаж на климатик",
      description: "Нужен ми е майстор за монтаж на нов климатик. Климатикът вече е закупен, трябва само монтаж.",
      category: "home_repair",
      budgetMin: 100,
      budgetMax: 150,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Дружба",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 8,
      customerName: "Стефан Василев",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.7,
      isUrgent: true
    },
    {
      id: "6",
      title: "Детегледачка за уикенда",
      description: "Търся отговорна детегледачка за двама деца (5 и 8 години) за събота и неделя от 14:00 до 20:00.",
      category: "personal_care",
      budgetMin: 20,
      budgetMax: 30,
      budgetType: "hourly",
      city: "Варна",
      neighborhood: "Чайка",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 6,
      customerName: "Десислава Янкова",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 5.0,
      isUrgent: true
    },
    {
      id: "7",
      title: "Ремонт на течаща чешма",
      description: "Спешно търся водопроводчик за ремонт на течаща чешма в кухнята. Капе постоянно и трябва смяна.",
      category: "home_repair",
      budgetMin: 30,
      budgetMax: 50,
      budgetType: "fixed",
      city: "София",
      neighborhood: "Люлин",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 4,
      customerName: "Петър Георгиев",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.6,
      isUrgent: true
    },
    {
      id: "8",
      title: "Административна помощ",
      description: "Нужна ми е помощ с попълване на документи и административни задачи. Около 10 часа работа общо.",
      category: "personal_assistant",
      budgetMin: 15,
      budgetMax: 20,
      budgetType: "hourly",
      city: "София",
      neighborhood: "Център",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 2,
      customerName: "Анна Михайлова",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.8,
      isUrgent: false
    },
    {
      id: "9",
      title: "Пазаруване на хранителни стоки",
      description: "Търся някой, който да пазарува хранителни стоки за мен 2-3 пъти седмично. Плащам почасово + разходи.",
      category: "delivery_transport",
      budgetMin: 10,
      budgetMax: 15,
      budgetType: "hourly",
      city: "София",
      neighborhood: "Изгрев",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      applicationsCount: 5,
      customerName: "Румен Тодоров",
      customerAvatar: "/api/placeholder/32/32",
      customerRating: 4.9,
      isUrgent: false
    }
  ];

  const pageSize = 12;

  // Build query parameters function
  const buildQueryParams = useCallback((pageParam = 0) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.city) params.append("city", filters.city);
    if (filters.budgetMin) params.append("budgetMin", filters.budgetMin);
    if (filters.budgetMax) params.append("budgetMax", filters.budgetMax);
    if (filters.deadline) params.append("deadline", filters.deadline);
    if (filters.status) params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    params.append("limit", pageSize.toString());
    params.append("offset", (pageParam * pageSize).toString());
    return params.toString();
  }, [filters]);

  // Check if any filters are active
  const isSearching = Boolean(
    filters.search || 
    filters.category || 
    filters.city || 
    filters.budgetMin || 
    filters.budgetMax || 
    filters.deadline ||
    filters.status !== "open" || 
    filters.sortBy !== "newest"
  );

  // Use infinite query for API data when searching
  const {
    data: apiData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: apiLoading,
    error: apiError,
  } = useInfiniteQuery({
    queryKey: [`/api/tasks`, filters],
    queryFn: ({ pageParam = 0 }) => {
      const params = buildQueryParams(pageParam);
      return fetch(`/api/tasks?${params}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch tasks');
          return res.json();
        })
        .catch(() => []); // Return empty array on error to prevent crashes
    },
    getNextPageParam: (lastPage, pages) => {
      // If the last page had full pageSize results, there might be more
      if (Array.isArray(lastPage) && lastPage.length === pageSize) {
        return pages.length;
      }
      return undefined;
    },
    enabled: Boolean(isSearching), // Explicitly convert to boolean
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten paginated results
  const apiTasks = apiData?.pages?.flat() || [];

  // Use default tasks when not searching, API data when searching
  const tasks = isSearching ? apiTasks : defaultTasks;
  const isLoading = isSearching ? apiLoading : false;
  const error = isSearching ? apiError : null;

  // Infinite scroll observer
  useEffect(() => {
    if (!isSearching) return;

    const handleScroll = () => {
      // Check if user is near the bottom (within 100px)
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearching]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
  };

  const handleApplyToTask = (taskId: string) => {
    window.location.href = `/tasks/${taskId}`;
  };

  const hasActiveFilters = filters.search || filters.category || filters.city || filters.budgetMin || filters.budgetMax || filters.deadline || (filters.status !== "open");

  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ key: 'search', label: `"${filters.search}"`, value: filters.search });
    if (filters.category) active.push({ key: 'category', label: TASK_CATEGORIES[filters.category as keyof typeof TASK_CATEGORIES] || filters.category, value: filters.category });
    if (filters.city) active.push({ key: 'city', label: filters.city, value: filters.city });
    if (filters.budgetMin || filters.budgetMax) {
      const budgetLabel = filters.budgetMin && filters.budgetMax 
        ? `${filters.budgetMin}-${filters.budgetMax} лв`
        : filters.budgetMin 
        ? `от ${filters.budgetMin} лв`
        : `до ${filters.budgetMax} лв`;
      active.push({ key: 'budget', label: budgetLabel, value: 'budget' });
    }
    if (filters.deadline) active.push({ key: 'deadline', label: `До ${filters.deadline}`, value: filters.deadline });
    if (filters.status !== "open") active.push({ key: 'status', label: getStatusLabel(filters.status), value: filters.status });
    return active;
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'open': return 'Отворени';
      case 'in_progress': return 'В ход';
      case 'completed': return 'Завършени';
      default: return 'Всички';
    }
  };

  const removeFilter = (filterKey: string) => {
    if (filterKey === 'budget') {
      setFilters(prev => ({ ...prev, budgetMin: "", budgetMax: "" }));
    } else {
      const defaultValue = filterKey === 'status' ? 'open' : '';
      setFilters(prev => ({ ...prev, [filterKey]: defaultValue }));
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Subtle overlay to maintain readability */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]"></div>
      
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        {/* Centralized Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12"
        >
          <NextUICard className="bg-white/95 backdrop-blur-md shadow-2xl border-0 max-w-4xl mx-auto">
            <div className="p-8">
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <Input
                    size="lg"
                    placeholder={filters.search ? '' : ' '} // Hide default placeholder when we have typing animation
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
                  {/* Typing placeholder overlay */}
                  {!filters.search && (
                    <div 
                      className="absolute left-16 top-1/2 transform -translate-y-1/2 pointer-events-none text-lg"
                      style={{ zIndex: 1 }}
                    >
                      <TypingPlaceholder />
                    </div>
                  )}
                </div>
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
          <NextUICard className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/20">
            <div className="p-6">
              <div className="mb-4">
                {/* Mobile: Title and button on separate lines */}
                <div className="md:hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <SlidersHorizontal size={20} className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('browseTasks.filters.title')}</h3>
                  </div>
                  <div className="flex justify-start">
                    <NextUIButton 
                      size="sm" 
                      variant="light"
                      className="text-blue-600"
                      startContent={<Filter size={16} />}
                    >
                      {t('browseTasks.filters.advanced')}
                    </NextUIButton>
                  </div>
                </div>
                
                {/* Desktop: Title and button on same line */}
                <div className="hidden md:flex items-center justify-between">
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
              </div>
              
              {/* Quick Filters Row */}
              <div className="space-y-3 md:space-y-0">
                {/* Mobile: Stacked layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{t('browseTasks.filters.quick')}:</span>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('browseTasks.filters.allCategories', { defaultValue: 'Все категории' })}
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('browseTasks.filters.sofia', { defaultValue: 'София' })}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t('browseTasks.filters.budgetUpTo', { defaultValue: 'До 500 лв' })}
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{t('browseTasks.filters.sortBy', { defaultValue: 'Сортировка' })}:</span>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 min-w-0">
                      <option>{t('browseTasks.filters.sort.newest', { defaultValue: 'Новые' })}</option>
                      <option>{t('browseTasks.filters.sort.oldest', { defaultValue: 'Старые' })}</option>
                      <option>{t('browseTasks.filters.sort.highBudget', { defaultValue: 'Высокий бюджет' })}</option>
                      <option>{t('browseTasks.filters.sort.lowBudget', { defaultValue: 'Низкий бюджет' })}</option>
                    </select>
                  </div>
                </div>
                
                {/* Desktop: Single row layout */}
                <div className="hidden md:flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600">{t('browseTasks.filters.quick')}:</span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('browseTasks.filters.allCategories', { defaultValue: 'Все категории' })}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('browseTasks.filters.sofia', { defaultValue: 'София' })}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t('browseTasks.filters.budgetUpTo', { defaultValue: 'До 500 лв' })}
                  </motion.button>
                  
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('browseTasks.filters.sortBy', { defaultValue: 'Сортировка' })}:</span>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                      <option>{t('browseTasks.filters.sort.newest', { defaultValue: 'Новые' })}</option>
                      <option>{t('browseTasks.filters.sort.oldest', { defaultValue: 'Старые' })}</option>
                      <option>{t('browseTasks.filters.sort.highBudget', { defaultValue: 'Высокий бюджет' })}</option>
                      <option>{t('browseTasks.filters.sort.lowBudget', { defaultValue: 'Низкий бюджет' })}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Results Count */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  {isLoading ? t('browseTasks.results.loading') : 
                   !isSearching ? t('browseTasks.results.featuredTasks', { count: tasks.length, defaultValue: `Показано ${tasks.length} популярных задач` }) :
                   t('browseTasks.results.shownTasks', { count: tasks.length, defaultValue: `Найдено ${tasks.length} задач` })}
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
            <NextUICard className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/20">
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
                  <NextUICard className="h-[280px]">
                    <div className="p-6 space-y-4">
                      <Skeleton className="rounded-lg">
                        <div className="h-5 w-3/4 rounded-lg bg-gray-200"></div>
                      </Skeleton>
                      <Skeleton className="rounded-lg">
                        <div className="h-4 w-1/2 rounded-lg bg-gray-200"></div>
                      </Skeleton>
                      <div className="space-y-2 pt-2">
                        <Skeleton className="rounded-lg">
                          <div className="h-3 w-full rounded-lg bg-gray-200"></div>
                        </Skeleton>
                        <Skeleton className="rounded-lg">
                          <div className="h-3 w-5/6 rounded-lg bg-gray-200"></div>
                        </Skeleton>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <Skeleton className="rounded-lg">
                          <div className="h-8 w-20 rounded-lg bg-gray-200"></div>
                        </Skeleton>
                        <Skeleton className="rounded-lg">
                          <div className="h-8 w-24 rounded-lg bg-gray-200"></div>
                        </Skeleton>
                      </div>
                    </div>
                  </NextUICard>
                </motion.div>
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task: any, index: number) => (
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

              {/* Loading more indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={`loading-more-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <NextUICard className="h-[280px]">
                        <div className="p-6 space-y-4">
                          <Skeleton className="rounded-lg">
                            <div className="h-5 w-3/4 rounded-lg bg-gray-200"></div>
                          </Skeleton>
                          <Skeleton className="rounded-lg">
                            <div className="h-4 w-1/2 rounded-lg bg-gray-200"></div>
                          </Skeleton>
                          <div className="space-y-2 pt-2">
                            <Skeleton className="rounded-lg">
                              <div className="h-3 w-full rounded-lg bg-gray-200"></div>
                            </Skeleton>
                            <Skeleton className="rounded-lg">
                              <div className="h-3 w-5/6 rounded-lg bg-gray-200"></div>
                            </Skeleton>
                          </div>
                          <div className="flex justify-between items-center pt-4">
                            <Skeleton className="rounded-lg">
                              <div className="h-8 w-20 rounded-lg bg-gray-200"></div>
                            </Skeleton>
                            <Skeleton className="rounded-lg">
                              <div className="h-8 w-24 rounded-lg bg-gray-200"></div>
                            </Skeleton>
                          </div>
                        </div>
                      </NextUICard>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* End of results indicator */}
              {isSearching && !hasNextPage && tasks.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-8"
                >
                  <p className="text-sm text-gray-500">
                    {t('browseTasks.results.endOfResults', { fallback: 'No more tasks to show' })}
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            <>
              {/* No tasks found message */}
              <NextUICard className="bg-white/95 backdrop-blur-sm shadow-lg border border-white/20 mb-8">
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <Search className="w-10 h-10 text-gray-400 mx-auto mb-3" />
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
                    className="mb-4"
                  >
                    {t('browseTasks.results.noTasks.clearFilters')}
                  </NextUIButton>
                </div>
              </NextUICard>

              {/* Show featured tasks as fallback */}
              <div className="space-y-6 pb-12">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('browseTasks.results.suggestedTasks', { fallback: 'Popular Tasks You Might Like' })}
                  </h3>
                  <p className="text-gray-600">
                    {t('browseTasks.results.suggestedDescription', { fallback: 'Here are some popular tasks from our community' })}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {defaultTasks.map((task: any, index: number) => (
                    <motion.div
                      key={`fallback-${task.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {t('browseTasks.results.featured', { fallback: 'Popular' })}
                          </div>
                        </div>
                        <TaskCard 
                          task={task}
                          onApply={handleApplyToTask}
                          showApplyButton={false}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>

    </div>
  );
}

BrowseTasks.displayName = 'BrowseTasks';

export default BrowseTasks;
