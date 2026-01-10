'use client'

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTaskFilters } from "@/app/[lang]/browse-tasks/hooks/use-task-filters";
import { FilterBar } from "@/app/[lang]/browse-tasks/components/filter-bar";
import { FiltersModal } from "@/app/[lang]/browse-tasks/components/filters-modal";
import { ActiveFilters } from "@/app/[lang]/browse-tasks/components/active-filters";
import { SearchFiltersSection, ResultsSection } from "./sections";
import { useAuth } from "@/features/auth";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import { useRouter, useParams } from "next/navigation";
import type { Task } from '@/server/tasks/task.types';

interface PaginatedTasksResponse {
 tasks: Task[];
 pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
 };
}

interface BrowseTasksPageProps {
 /** Initial featured tasks from SSR - provides instant content for SEO */
 initialFeaturedTasks?: Task[];
}

export default function BrowseTasksPage({ initialFeaturedTasks = [] }: BrowseTasksPageProps) {
 const { filters, updateFilter, resetFilters, buildApiQuery, activeFilterCount } = useTaskFilters();
 const { user } = useAuth();
 const router = useRouter();
 const params = useParams();
 const currentLocale = (params?.lang as string) || 'bg';

 const [authSlideOverOpen, setAuthSlideOverOpen] = useState(false);
 const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

 // Check if any filters are active (excluding sort and page)
 const hasActiveFilters = activeFilterCount > 0;

 // Always fetch featured tasks (used as fallback when filters return no results)
 // Uses SSR initial data for instant hydration - improves SEO and initial load
 const { data: featuredData, error: featuredError } = useQuery<PaginatedTasksResponse>({
  queryKey: ['featured-tasks'],
  queryFn: async () => {
   try {
    const response = await fetch('/api/tasks?featured=true');
    if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     console.error('Featured tasks API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
     });
     throw new Error(errorData.error || 'Failed to fetch featured tasks');
    }
    return response.json();
   } catch (error) {
    console.error('Error fetching featured tasks:', error);
    throw error;
   }
  },
  // SSR hydration: Use server-fetched data as initial data
  // This means the page renders with content immediately (no loading state)
  initialData: initialFeaturedTasks.length > 0
   ? { tasks: initialFeaturedTasks, pagination: { page: 1, limit: 20, total: initialFeaturedTasks.length, totalPages: 1, hasNext: false, hasPrevious: false } }
   : undefined,
  // Stale time matches ISR revalidation (1 hour) - don't refetch if data is fresh
  staleTime: 60 * 60 * 1000, // 1 hour
  // Always enabled - featured tasks are shown in two scenarios:
  // 1. No filters applied (primary featured section)
  // 2. Filters applied but no results (fallback/suggestion)
  retry: 2, // Retry failed requests twice
  retryDelay: 1000, // Wait 1 second between retries
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
   try {
    // Build query with current page
    const params = new URLSearchParams(buildApiQuery());
    params.set('page', String(pageParam));

    const url = `/api/tasks?${params.toString()}`;
    console.log('[BrowseTasksPage] Fetching tasks:', url);

    const response = await fetch(url);
    if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     console.error('[BrowseTasksPage] Tasks API error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
      url
     });
     throw new Error(errorData.error || 'Failed to fetch tasks');
    }
    return response.json();
   } catch (error) {
    console.error('[BrowseTasksPage] Error fetching tasks:', error);
    throw error;
   }
  },
  getNextPageParam: (lastPage) => {
   // Return next page number if hasNext is true, otherwise undefined
   return lastPage.pagination.hasNext
     ? lastPage.pagination.page + 1
     : undefined;
  },
  initialPageParam: 1,
  retry: 2, // Retry failed requests twice
  retryDelay: 1000, // Wait 1 second between retries
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
   router.push(`/${currentLocale}/tasks/${taskId}`);
  }
 };

 const handleRetry = () => {
  refetch();
 };

 // Handle redirect after successful authentication
 useEffect(() => {
  if (user && selectedTaskId && !authSlideOverOpen) {
   // User just logged in and we have a pending task to redirect to
   router.push(`/${currentLocale}/tasks/${selectedTaskId}`);
   setSelectedTaskId(null); // Clear the selected task
  }
 }, [user, selectedTaskId, authSlideOverOpen, router, currentLocale]);

 // Log featured tasks errors
 useEffect(() => {
  if (featuredError) {
   console.error('[BrowseTasksPage] Featured tasks error:', featuredError);
  }
 }, [featuredError]);

 // Hero is now server-rendered in page.tsx for instant LCP
 return (
  <>
   {/* min-h-[600px] prevents CLS by reserving space even while tasks load */}
   <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 min-h-[600px]">
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
  </>
 );
}