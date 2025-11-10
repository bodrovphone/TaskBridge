'use client'

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTaskFilters } from "@/app/[lang]/browse-tasks/hooks/use-task-filters";
import { FilterBar } from "@/app/[lang]/browse-tasks/components/filter-bar";
import { FiltersModal } from "@/app/[lang]/browse-tasks/components/filters-modal";
import { ActiveFilters } from "@/app/[lang]/browse-tasks/components/active-filters";
import { BrowseTasksHeroSection, SearchFiltersSection, ResultsSection } from "./sections";
import { useAuth } from "@/features/auth";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

interface PaginatedTasksResponse {
 tasks: any[];
 pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
 };
}

export default function BrowseTasksPage() {
 const { filters, updateFilter, resetFilters, buildApiQuery, activeFilterCount } = useTaskFilters();
 const { user } = useAuth();
 const router = useRouter();
 const { i18n } = useTranslation();

 const [authSlideOverOpen, setAuthSlideOverOpen] = useState(false);
 const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

 // Check if any filters are active (excluding sort and page)
 const hasActiveFilters = activeFilterCount > 0;

 // Always fetch featured tasks (used as fallback when filters return no results)
 const { data: featuredData } = useQuery<PaginatedTasksResponse>({
  queryKey: ['featured-tasks'],
  queryFn: async () => {
   const response = await fetch('/api/tasks?featured=true');
   if (!response.ok) throw new Error('Failed to fetch featured tasks');
   return response.json();
  },
  // Always enabled - featured tasks are shown in two scenarios:
  // 1. No filters applied (primary featured section)
  // 2. Filters applied but no results (fallback/suggestion)
 });

 // Fetch filtered tasks with infinite scroll
 const {
  data,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch
 } = useInfiniteQuery<PaginatedTasksResponse>({
  queryKey: ['browse-tasks', buildApiQuery()],
  queryFn: async ({ pageParam = 1 }) => {
   // Build query with current page
   const params = new URLSearchParams(buildApiQuery());
   params.set('page', String(pageParam));

   const response = await fetch(`/api/tasks?${params.toString()}`);
   if (!response.ok) throw new Error('Failed to fetch tasks');
   return response.json();
  },
  getNextPageParam: (lastPage) => {
   // Return next page number if hasNext is true, otherwise undefined
   return lastPage.pagination.hasNext
     ? lastPage.pagination.page + 1
     : undefined;
  },
  initialPageParam: 1,
 });

 // Flatten all pages into a single array of tasks
 const tasks = data?.pages.flatMap(page => page.tasks) || [];
 const pagination = data?.pages[data.pages.length - 1]?.pagination;

 // Get featured tasks (20 high-quality tasks with diversity)
 // Used in two scenarios:
 // 1. No filters: Primary featured section
 // 2. Filters with no results: Fallback suggestions
 const featuredTasks = featuredData?.tasks || [];

 const handleApplyToTask = (taskId: string) => {
  if (!user) {
   // User not authenticated - show auth slideover
   setSelectedTaskId(taskId);
   setAuthSlideOverOpen(true);
  } else {
   // User authenticated - navigate to task detail page where they can apply
   router.push(`/${i18n.language}/tasks/${taskId}`);
  }
 };

 const handleRetry = () => {
  refetch();
 };

 // Handle redirect after successful authentication
 useEffect(() => {
  if (user && selectedTaskId && !authSlideOverOpen) {
   // User just logged in and we have a pending task to redirect to
   router.push(`/${i18n.language}/tasks/${selectedTaskId}`);
   setSelectedTaskId(null); // Clear the selected task
  }
 }, [user, selectedTaskId, authSlideOverOpen, router, i18n.language]);

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
   <BrowseTasksHeroSection />

   <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    {/* Search Section */}
    <SearchFiltersSection
     tasksCount={pagination?.total || tasks.length}
     isLoading={isLoading}
    />

    {/* Active Filters Display */}
    <ActiveFilters />

    {/* Filters - Desktop (hidden on mobile) */}
    <div className="hidden md:block mb-6">
     <FilterBar />
    </div>

    {/* Filters - Mobile (hidden on desktop) */}
    <div className="md:hidden mb-6 flex justify-end">
     <FiltersModal />
    </div>

    {/* Results */}
    <ResultsSection
     tasks={tasks}
     isLoading={isLoading}
     error={error}
     recommendedTasks={featuredTasks}
     onClearFilters={resetFilters}
     onApplyToTask={handleApplyToTask}
     onRetry={handleRetry}
     hasActiveFilters={hasActiveFilters}
     hasNextPage={hasNextPage}
     isFetchingNextPage={isFetchingNextPage}
     onLoadMore={fetchNextPage}
    />
   </main>

   {/* Auth Slide Over */}
   <AuthSlideOver
    isOpen={authSlideOverOpen}
    onClose={() => setAuthSlideOverOpen(false)}
    action="apply"
   />
  </div>
 );
}