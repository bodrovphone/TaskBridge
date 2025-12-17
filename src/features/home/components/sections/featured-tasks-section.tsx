'use client'

import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/ui/task-card";
import { LocaleLink } from "@/components/common/locale-link";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { DEFAULT_LOCALE } from '@/lib/constants/locales';
import {
 FileText,
 Plus,
 ArrowRight
} from "lucide-react";

interface Task {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  budget_min: number
  budget_max: number
  budget_type: string
  city: string
  neighborhood: string
  deadline: string
  urgency: string
  requirements: string
  images: string[] // Database field name
  status: string
  created_at: string
  applications_count?: number
}

interface FeaturedTasksSectionProps {
  tasks: Task[]
}

export default function FeaturedTasksSection({ tasks }: FeaturedTasksSectionProps) {
 const t = useTranslations();
 const router = useRouter();
 const pathname = usePathname();
 const scrollContainerRef = useRef<HTMLDivElement>(null);
 const animationDoneRef = useRef(false);

 // Handle horizontal scroll with mouse wheel
 const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
  if (scrollContainerRef.current) {
   e.preventDefault();
   scrollContainerRef.current.scrollLeft += e.deltaY;
  }
 };

 // Center the scroll position on mount (desktop only - 1024px+)
 // Disabled on mobile/tablet to prevent layout shifts during scroll
 useEffect(() => {
  if (scrollContainerRef.current && tasks.length > 2 && window.innerWidth >= 1024) {
   const container = scrollContainerRef.current;
   // Small delay to ensure DOM is rendered
   requestAnimationFrame(() => {
    // Calculate center position: (total scrollable width - visible width) / 2
    const centerPosition = (container.scrollWidth - container.clientWidth) / 2;
    container.scrollLeft = centerPosition;
   });
  }
 }, [tasks.length]);

 // One-time quick animation when section becomes visible (desktop only - 1024px+)
 // Disabled on mobile/tablet to prevent layout drops during scroll
 useEffect(() => {
  if (tasks.length === 0 || animationDoneRef.current || window.innerWidth < 1024) return;

  const container = scrollContainerRef.current;
  if (!container) return;

  const observer = new IntersectionObserver(
   ([entry]) => {
    if (entry.isIntersecting && !animationDoneRef.current) {
     animationDoneRef.current = true;

     // Quick 1.4s animation: scroll right ~140px then back to center
     const startPos = container.scrollLeft;
     const animationDistance = 140;
     const duration = 1400;
     const startTime = performance.now();

     const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease in-out curve: go right then back
      const easeInOut = progress < 0.5
       ? 2 * progress * progress
       : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Go right in first half, come back in second half
      const offset = progress < 0.5
       ? easeInOut * 2 * animationDistance
       : animationDistance * 2 * (1 - easeInOut);

      container.scrollLeft = startPos + offset;

      if (progress < 1) {
       requestAnimationFrame(animate);
      }
     };

     requestAnimationFrame(animate);
     observer.disconnect();
    }
   },
   { threshold: 0, rootMargin: '0px 0px -10px 0px' }
  );

  observer.observe(container);
  return () => observer.disconnect();
 }, [tasks.length]);

 // Transform database format to TaskCard format
 const featuredTasks = tasks.map(task => ({
  ...task,
  budgetMin: task.budget_min,
  budgetMax: task.budget_max,
  budgetType: task.budget_type as 'fixed' | 'hourly' | 'negotiable' | 'unclear',
  createdAt: task.created_at,
  // Ensure images is always an array (handle null/undefined from database)
  images: Array.isArray(task.images) ? task.images : [],
  // Truncate description to 50 characters for featured cards (handle undefined)
  description: task.description
    ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description)
    : '',
 }));

 const handleApply = (taskId: string) => {
  // Redirect to task detail page with locale
  const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;
  router.push(`/${currentLocale}/tasks/${taskId}`);
 };

 return (
  <section id="browse-tasks" className="py-12 relative overflow-hidden" style={{ contain: 'layout style', minHeight: '700px' }}>
   {/* Cardboard background with slate overlay */}
   <div className="absolute inset-0 bg-slate-50/70 "></div>
   {/* Background Elements */}
   <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-3xl"></div>
   <div className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-40 blur-2xl"></div>
   
   {/* Header - contained */}
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
       {t('landing.featured.viewAll')}
       <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
      </LocaleLink>
     </Button>
    </div>
   </div>

   {/* Cards - full width, edge-to-edge scroll */}
   {featuredTasks.length > 0 ? (
    <div
     ref={scrollContainerRef}
     onWheel={handleWheel}
     className="overflow-x-auto overflow-y-hidden py-8 relative z-10 scrollbar-hide"
     style={{ contain: 'layout style' }}
    >
     <div className="flex gap-8 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content', paddingLeft: 'max(1rem, calc((100vw - 80rem) / 2 + 2rem))' }}>
      {featuredTasks.map((task: any, index: number) => (
       <div
        key={task.id}
        className="flex-shrink-0 w-80 h-[520px] hover:scale-105 transition-transform duration-300"
        style={{
         animationDelay: `${index * 100}ms`,
        }}
       >
        <div className="bg-white/70 rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 h-full">
         <TaskCard
          task={task}
          showApplyButton={true}
          onApply={handleApply}
         />
        </div>
       </div>
      ))}
      {/* Right padding spacer */}
      <div className="flex-shrink-0 w-4 sm:w-6 lg:w-8" />
     </div>
    </div>
   ) : (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
       <FileText className="h-12 w-12 text-slate-400" />
      </div>
      <p className="text-slate-500 text-xl mb-6 font-light">{t('landing.featured.noTasks')}</p>
      <Button
       className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-6 rounded-xl font-semibold text-lg"
       asChild
      >
       <LocaleLink href="/create-task" className="flex items-center gap-2">
        <Plus className="h-5 w-5" />
        {t('landing.featured.postFirstTask')}
       </LocaleLink>
      </Button>
     </div>
    </div>
   )}
  </section>
 );
}