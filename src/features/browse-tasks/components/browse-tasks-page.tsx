'use client'

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTasks } from "@/lib/mock-data";
import { useTaskFilters } from "@/app/[lang]/browse-tasks/hooks/use-task-filters";
import { FilterBar } from "@/app/[lang]/browse-tasks/components/filter-bar";
import { FiltersModal } from "@/app/[lang]/browse-tasks/components/filters-modal";
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
 const { filters, updateFilter, resetFilters, buildApiQuery } = useTaskFilters();
 const { user } = useAuth();
 const router = useRouter();
 const { i18n } = useTranslation();

 const [authSlideOverOpen, setAuthSlideOverOpen] = useState(false);
 const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

 // Get recommended tasks from mock data (first 6 tasks)
 const recommendedTasks = mockTasks.slice(0, 6);

 // Fetch tasks from API
 const { data, isLoading, error, refetch } = useQuery<PaginatedTasksResponse>({
  queryKey: ['browse-tasks', buildApiQuery()],
  queryFn: async () => {
   const response = await fetch(`/api/tasks?${buildApiQuery()}`);
   if (!response.ok) throw new Error('Failed to fetch tasks');
   return response.json();
  },
 });

 const tasks = data?.tasks || [];
 const pagination = data?.pagination;

 const handleFilterChange = (key: string, value: string) => {
  if (key === 'search') {
   // Use skipUrlUpdate to enable debouncing
   updateFilter('search', value, true);
  }
 };

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

 const handleSetCurrentPage = (page: number) => {
  updateFilter('page', page + 1); // Convert 0-based to 1-based
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
     filters={{
      search: filters.search || '',
      category: filters.category || '',
      city: filters.city || '',
      budgetMin: filters.budgetMin?.toString() || '',
      budgetMax: filters.budgetMax?.toString() || '',
      deadline: '',
      status: 'open',
      sortBy: filters.sortBy || 'newest'
     }}
     onFilterChange={handleFilterChange}
     tasksCount={pagination?.total || tasks.length}
     isLoading={isLoading}
    />

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
     recommendedTasks={recommendedTasks}
     currentPage={(pagination?.page || 1) - 1} // Convert 1-based to 0-based
     pageSize={pagination?.limit || 20}
     onSetCurrentPage={handleSetCurrentPage}
     onClearFilters={resetFilters}
     onApplyToTask={handleApplyToTask}
     onRetry={handleRetry}
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