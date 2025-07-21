import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import Header from "@/components/header";
import Footer from "@/components/footer";
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, MapPin, DollarSign } from "lucide-react";
import { TASK_CATEGORIES } from "@shared/schema";

export default function BrowseTasks() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    sortBy: "newest"
  });

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.city) queryParams.append("city", filters.city);
  if (filters.budgetMin) queryParams.append("budgetMin", filters.budgetMin);
  if (filters.budgetMax) queryParams.append("budgetMax", filters.budgetMax);
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
      sortBy: "newest"
    });
    setCurrentPage(0);
  };

  const handleApplyToTask = (taskId: string) => {
    window.location.href = `/tasks/${taskId}`;
  };

  const hasActiveFilters = filters.category || filters.city || filters.budgetMin || filters.budgetMax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('tasks.title')}
          </h1>
          <p className="text-gray-600">
            Разгледайте налични задачи и кандидатствайте за тези, които ви интересуват
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Търсете по ключови думи..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всички категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Всички категории</SelectItem>
                  {Object.entries(TASK_CATEGORIES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Град"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Budget Filter */}
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Мин. лв"
                    type="number"
                    value={filters.budgetMin}
                    onChange={(e) => handleFilterChange("budgetMin", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative flex-1">
                  <Input
                    placeholder="Макс. лв"
                    type="number"
                    value={filters.budgetMax}
                    onChange={(e) => handleFilterChange("budgetMax", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Изчисти филтрите
                  </Button>
                )}
                <span className="text-sm text-gray-600">
                  {isLoading ? "Зареждане..." : `${tasks.length} задачи`}
                </span>
              </div>

              {/* Sort Options */}
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Най-нови първо</SelectItem>
                  <SelectItem value="oldest">Най-стари първо</SelectItem>
                  <SelectItem value="budget_high">По бюджет (висок)</SelectItem>
                  <SelectItem value="budget_low">По бюджет (нисък)</SelectItem>
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

      <Footer />
    </div>
  );
}
