'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, DollarSign, Calendar, Clock, SlidersHorizontal, X } from "lucide-react";
import { TASK_CATEGORIES } from "../../shared/schema";

export default function BrowseTasks() {
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

  const hasActiveFilters = filters.search || filters.category || filters.city || filters.budgetMin || filters.budgetMax || filters.deadline || (filters.status !== "open");

  const getActiveFilters = () => {
    const active = [];
    if (filters.search) active.push({ key: 'search', label: `"${filters.search}"`, value: filters.search });
    if (filters.category) active.push({ key: 'category', label: TASK_CATEGORIES[filters.category] || filters.category, value: filters.category });
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
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t('tasks.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('tasks.subtitle')}
          </p>
        </div>

        {/* Main Search Bar */}
        <div className="mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                <Input
                  placeholder={t('tasks.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-16 pr-4 py-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-primary-500 transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('tasks.filters.title')}</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tasks.filters.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('tasks.filters.allCategories')}</SelectItem>
                  {Object.entries(TASK_CATEGORIES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder={t('tasks.filters.location')}
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Budget Min Filter */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder={t('tasks.filters.budgetMin')}
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) => handleFilterChange("budgetMin", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Budget Max Filter */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder={t('tasks.filters.budgetMax')}
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) => handleFilterChange("budgetMax", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Deadline Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder={t('tasks.filters.deadline')}
                  type="date"
                  value={filters.deadline}
                  onChange={(e) => handleFilterChange("deadline", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tasks.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('tasks.filters.all')}</SelectItem>
                  <SelectItem value="open">{t('tasks.filters.open')}</SelectItem>
                  <SelectItem value="in_progress">{t('tasks.filters.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('tasks.filters.completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">{t('tasks.filters.activeFilters')}:</span>
                  {getActiveFilters().map((filter) => (
                    <Badge 
                      key={filter.key} 
                      variant="secondary" 
                      className="bg-primary-100 text-primary-800 hover:bg-primary-200 cursor-pointer"
                      onClick={() => removeFilter(filter.key)}
                    >
                      {filter.label}
                      <X size={12} className="ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X size={16} className="mr-2" />
                    {t('tasks.filters.clearAll')}
                  </Button>
                )}
                <span className="text-sm text-gray-600">
                  {isLoading ? t('loading') : `${tasks.length} ${t('tasks.results')}`}
                </span>
              </div>

              {/* Sort Options */}
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-48">
                  <Clock size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('tasks.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('tasks.sort.oldest')}</SelectItem>
                  <SelectItem value="budget_high">{t('tasks.sort.budgetHigh')}</SelectItem>
                  <SelectItem value="budget_low">{t('tasks.sort.budgetLow')}</SelectItem>
                  <SelectItem value="deadline">{t('tasks.sort.deadline')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Грешка при зареждане
                </h3>
                <p className="text-gray-600">
                  Моля, опитайте отново или свържете се с поддръжката.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task: any) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onApply={handleApplyToTask}
                />
              ))}
            </div>

            {/* Pagination */}
            {tasks.length === pageSize && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Предишна
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={tasks.length < pageSize}
                  >
                    Следваща
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Няма намерени задачи
                </h3>
                <p className="text-gray-600 mb-4">
                  Опитайте да промените филтрите или да търсите по различни критерии.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Изчисти филтрите
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

    </div>
  );
}
