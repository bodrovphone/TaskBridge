'use client'

import { Button } from "@/components/ui/button";
import TaskCard from "@/components/ui/task-card";
import { LocaleLink } from "@/components/common/locale-link";
import { useTranslation } from 'react-i18next';
import { mockTasks } from '@/lib/mock-data';
import { 
  FileText,
  Plus,
  ArrowRight
} from "lucide-react";

export default function FeaturedTasksSection() {
  const { t } = useTranslation();
  
  // Use first 3 tasks from shared mock data for display
  const featuredTasks = mockTasks.slice(0, 3);

  return (
    <section id="browse-tasks" className="py-24 relative overflow-hidden">
      {/* Cardboard background with slate overlay */}
      <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-40 blur-2xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-16 space-y-6 lg:space-y-0">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 text-sm font-semibold">
              <FileText className="mr-2 h-4 w-4" />
              {t('landing.featured.badge')}
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight">{t('landing.featured.title')}</h2>
            <p className="text-xl lg:text-2xl text-slate-600 font-light">{t('landing.featured.subtitle')}</p>
          </div>
          <Button 
            className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
            asChild
          >
            <LocaleLink href="/browse-tasks" className="flex items-center">
              Виж всички задачи
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </LocaleLink>
          </Button>
        </div>

        {featuredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-8 pb-6" style={{ width: 'max-content' }}>
              {featuredTasks.map((task: any, index: number) => (
                <div 
                  key={task.id} 
                  className="flex-shrink-0 w-80 hover:scale-105 transition-transform duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                    <TaskCard 
                      task={task} 
                      showApplyButton={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <FileText className="h-12 w-12 text-slate-400" />
            </div>
            <p className="text-slate-500 text-xl mb-6 font-light">Няма налични задачи в момента.</p>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold" asChild>
              <LocaleLink href="/create-task" className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Публикувай първата задача
              </LocaleLink>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}