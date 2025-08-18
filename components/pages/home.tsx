import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch recent tasks
  const { data: recentTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks?limit=6&status=open"],
    enabled: isAuthenticated,
  });

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${(user as any)?.id}/stats`],
    enabled: isAuthenticated && !!(user as any)?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const isProfessional = (user as any)?.userType === "professional";
  const isNewUser = !(user as any)?.userType || (!(user as any)?.city && !(user as any)?.serviceCategories?.length);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добре дошли, {(user as any)?.firstName || "потребител"}!
          </h1>
          <p className="text-gray-600">
            {isProfessional 
              ? "Готови ли сте да работите по нови задачи?" 
              : "Какво можем да ви помогнем днес?"
            }
          </p>
        </div>

        {/* Profile Completion Banner */}
        {isNewUser && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Довършете профила си
                  </h3>
                  <p className="text-gray-600">
                    Добавете информация за града и услугите си, за да получавате подходящи задачи.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/profile">Довърши профила</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Публикувай задача</h3>
                  <p className="text-sm text-gray-600">Създай нова задача</p>
                </div>
              </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/create-task">Създай задача</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Разгледай задачи</h3>
                  <p className="text-sm text-gray-600">Намери работа</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/browse-tasks">Разгледай</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {statsLoading ? "..." : (userStats as any)?.completedTasks || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Завършени задачи</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {statsLoading ? "..." : (userStats as any)?.averageRating?.toFixed(1) || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600">Средна оценка</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t('landing.featured.title')}</CardTitle>
                <CardDescription>
                  {isProfessional 
                    ? t('landing.featured.professionalDesc')
                    : t('landing.featured.customerDesc')
                  }
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/browse-tasks">Виж всички</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            ) : (recentTasks as any[]).length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(recentTasks as any[]).map((task: any) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    showApplyButton={isProfessional}
                    onApply={(taskId) => {
                      // Handle application
                      window.location.href = `/tasks/${taskId}`;
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Няма налични задачи
                </h3>
                <p className="text-gray-600 mb-4">
                  Все още няма публикувани задачи в системата.
                </p>
                <Button asChild>
                  <Link href="/create-task">Публикувай първата задача</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
