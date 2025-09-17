'use client'

// @todo REFACTORING: Extract remaining complex filter logic and state management
// - Advanced filter modal/drawer (~50 lines)
// - Filter state hooks and utilities (~30 lines)
// Target: Reduce from 270 lines to ~150 lines

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTasks } from "@/lib/mock-data";
import { BrowseTasksHeroSection, SearchFiltersSection, ResultsSection } from "./sections";

export default function BrowseTasksPage() {
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
  
  // Get recommended tasks from mock data (first 6 tasks)
  const recommendedTasks = mockTasks.slice(0, 6);

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
      <BrowseTasksHeroSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchFiltersSection 
          filters={filters}
          onFilterChange={handleFilterChange}
          tasksCount={(tasks as any[]).length}
          isLoading={isLoading}
        />

        <ResultsSection
          tasks={tasks as any[]}
          isLoading={isLoading}
          error={error}
          recommendedTasks={recommendedTasks}
          currentPage={currentPage}
          pageSize={pageSize}
          onSetCurrentPage={setCurrentPage}
          onClearFilters={clearFilters}
          onApplyToTask={handleApplyToTask}
        />
      </main>
    </div>
  );
}