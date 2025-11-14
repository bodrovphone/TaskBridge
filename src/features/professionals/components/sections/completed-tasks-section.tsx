'use client'

import { Card, CardBody, Chip, Button, Avatar } from "@nextui-org/react";
import { CheckCircle, MapPin, Star, TrendingUp, Award, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useDisclosure } from "@nextui-org/react";
import CompletedTasksDialog from '@/components/common/completed-tasks-dialog';
import { getCityLabelBySlug } from '@/features/cities';
import { getCategoryLabelBySlug } from '@/features/categories';
import { getCategoryColor } from '@/lib/utils/category';

interface CompletedTask {
 id: string;
 title: string;
 categorySlug: string; // Raw slug from API
 citySlug: string; // Raw slug from API
 neighborhood?: string;
 completedDate: string;
 clientRating: number;
 budget: number; // Raw number from API
 durationHours: number; // Raw number from API
 clientName?: string;
 clientAvatar?: string;
 testimonial?: string;
 isVerified?: boolean;
 complexity?: 'Simple' | 'Standard' | 'Complex';
}

interface CompletedTasksSectionProps {
 completedTasks: CompletedTask[];
}

export default function CompletedTasksSection({ completedTasks }: CompletedTasksSectionProps) {
 const { t } = useTranslation();
 const { isOpen, onOpen, onOpenChange } = useDisclosure();

 const renderStars = (rating: number) => {
  return (
   <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
     <Star
      key={star}
      className={`w-4 h-4 ${
       star <= rating
        ? 'fill-yellow-400 text-yellow-400'
        : 'text-gray-300'
      }`}
     />
    ))}
   </div>
  );
 };

 const getComplexityColor = (complexity?: string) => {
  switch (complexity) {
   case 'Simple': return 'success';
   case 'Standard': return 'primary';
   case 'Complex': return 'warning';
   default: return 'default';
  }
 };

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('bg-BG', {
   month: 'short',
   day: 'numeric'
  });
 };

 if (!completedTasks || completedTasks.length === 0) {
  return (
   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-100">
    <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
     <Award className="text-green-600" size={28} />
     {t('professionalDetail.completedTasks.title')}
    </h3>
    <div className="text-center py-12">
     <div className="bg-white/70 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
      <TrendingUp className="text-green-400" size={64} />
     </div>
     <p className="text-gray-700 text-lg mb-2">
      {t('professionalDetail.completedTasks.emptyState')}
     </p>
     <p className="text-sm text-gray-500">
      {t('professionalDetail.completedTasks.emptyStateCTA')}
     </p>
    </div>
   </div>
  );
 }

 // Statistics summary
 const totalTasks = completedTasks.length;

 // Only calculate average from tasks that have been reviewed (rating > 0)
 const reviewedTasks = completedTasks.filter(task => task.clientRating > 0);
 const averageRating = reviewedTasks.length > 0
   ? reviewedTasks.reduce((sum, task) => sum + task.clientRating, 0) / reviewedTasks.length
   : 0;
 const fiveStarTasks = completedTasks.filter(task => task.clientRating === 5).length;

 return (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border border-green-100">
   {/* Header with Statistics */}
   <div className="text-center mb-8">
    <h3 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
     <Award className="text-green-600" size={28} />
     {t('professionalDetail.completedTasks.title')}
    </h3>

    {/* Quick Stats */}
    <div className="flex justify-center gap-6 mb-6">
     <div className="text-center">
      <div className="text-2xl font-bold text-green-600">{totalTasks}</div>
      <div className="text-sm text-gray-600">{t('professionalDetail.completedTasks.stats.tasksCompleted')}</div>
     </div>
     {reviewedTasks.length > 0 && (
      <div className="text-center">
       <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
       <div className="text-sm text-gray-600">{t('professionalDetail.completedTasks.stats.avgRating')}</div>
      </div>
     )}
     {fiveStarTasks > 0 && (
      <div className="text-center">
       <div className="text-2xl font-bold text-purple-600">{Math.round((fiveStarTasks / reviewedTasks.length) * 100)}%</div>
       <div className="text-sm text-gray-600">{t('professionalDetail.completedTasks.stats.fiveStarTasks')}</div>
      </div>
     )}
    </div>
   </div>

   {/* Desktop Timeline View */}
   <div className="hidden md:block relative pr-4">
    <div className="space-y-6 relative pt-10 pb-4">
     {/* Timeline Line with Gaps - positioned relative to content */}
     <div className="absolute left-8 top-10 w-0.5 bg-gradient-to-b from-green-400 to-emerald-300" style={{ height: 'calc(100% - 2.5rem)' }}></div>

     {completedTasks.slice(0, 4).map((task, index) => (
      <div key={task.id} className="relative flex gap-6">
       {/* Timeline Node */}
       <div className="relative z-10 flex-shrink-0">
        {/* Date with background to create gap in timeline */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium whitespace-nowrap bg-gradient-to-br from-green-50 to-emerald-50 px-2 py-1 rounded">
         {formatDate(task.completedDate)}
        </div>
        <div className="w-16 h-16 bg-white rounded-full border-4 border-green-400 flex items-center justify-center shadow-lg">
         <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
       </div>

       {/* Task Card */}
       <div className="flex-1 pb-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/95 ">
         <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
           <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
             <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
               {task.title}
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getCategoryColor(task.categorySlug)} w-fit`}>
                {getCategoryLabelBySlug(task.categorySlug, t)}
               </span>
               {task.isVerified && (
                <Chip
                 size="sm"
                 variant="flat"
                 color="success"
                 startContent={<CheckCircle size={12} />}
                >
                 {t('professionalDetail.verified')}
                </Chip>
               )}
              </div>
             </div>

             <div className="text-right">
              <div className="text-xl font-bold text-green-600">
               {task.budget > 0 ? `${task.budget} ${t('common.currency.bgn', 'лв')}` : t('common.negotiable', 'Договорена')}
              </div>
              {task.durationHours > 0 && (
               <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                {t('taskCompletion.completedIn', 'Завършено за')} {task.durationHours}{t('common.hours.short', 'ч')}
               </div>
              )}
             </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
             <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>
               {getCityLabelBySlug(task.citySlug, t)}{task.neighborhood ? `, ${task.neighborhood}` : ''}
              </span>
             </div>
             <div className="flex flex-col items-end gap-1">
              {task.clientRating > 0 ? (
               <div className="flex items-center gap-2">
                {renderStars(task.clientRating)}
                <span className="font-semibold text-gray-900">{task.clientRating}</span>
               </div>
              ) : (
               <>
                <div className="flex items-center gap-1">
                 {renderStars(0)}
                </div>
                <span className="text-xs text-gray-500 italic">
                 {t('professionalDetail.completedTasks.pendingReview', 'Pending review')}
                </span>
               </>
              )}
             </div>
            </div>

            {task.testimonial && (
             <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
              <p className="text-blue-800 text-sm italic mb-2">"{task.testimonial}"</p>
              <div className="flex items-center gap-2">
               {task.clientAvatar ? (
                <Avatar src={task.clientAvatar} size="sm" />
               ) : (
                <Avatar name={task.clientName} size="sm" />
               )}
               <span className="text-blue-700 font-semibold text-xs">
                - {task.clientName}
               </span>
              </div>
             </div>
            )}
           </div>
          </div>
         </CardBody>
        </Card>
       </div>
      </div>
     ))}
    </div>

    {/* View All Tasks Button - Desktop */}
    {completedTasks.length > 4 && (
     <div className="text-center mt-6">
      <Button
       size="md"
       variant="bordered"
       color="success"
       className="font-medium"
       onPress={onOpen}
      >
       {t('professionalDetail.completedTasks.viewAll', 'View all {{count}} tasks', { count: completedTasks.length })}
      </Button>
     </div>
    )}
   </div>

   {/* Mobile: Simple Grid View */}
   <div className="md:hidden">
    <div className="grid grid-cols-1 gap-4">
     {completedTasks.slice(0, 4).map((task, index) => (
      <Card key={task.id} className="bg-white/95 border-0">
       <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
         <div className="flex-1 min-w-0 mr-3">
          <h4 className="text-base font-bold text-gray-900 mb-2 truncate">
           {task.title}
          </h4>
          <div className="flex items-center flex-wrap gap-2 mb-2">
           <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(task.completedDate)}</span>
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getCategoryColor(task.categorySlug)} w-fit`}>
            {getCategoryLabelBySlug(task.categorySlug, t)}
           </span>
           {task.isVerified && (
            <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle size={10} />} className="text-xs">
             {t('professionalDetail.verified')}
            </Chip>
           )}
          </div>
         </div>
         <div className="text-right flex-shrink-0 ml-2">
          <div className="text-lg font-bold text-green-600 whitespace-nowrap">
           {task.budget > 0 ? `${task.budget} ${t('common.currency.bgn', 'лв')}` : t('common.negotiable', 'Договорена')}
          </div>
         </div>
        </div>

        <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-1 flex-1 min-w-0">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate text-sm text-gray-600">
           {getCityLabelBySlug(task.citySlug, t)}{task.neighborhood ? `, ${task.neighborhood}` : ''}
          </span>
         </div>
         <div className="flex flex-col items-end gap-0.5 ml-2">
          {task.clientRating > 0 ? (
           <div className="flex items-center gap-1">
            {renderStars(task.clientRating)}
            <span className="text-xs text-gray-600 ml-1">{task.clientRating}</span>
           </div>
          ) : (
           <>
            <div className="flex items-center gap-0.5">
             {renderStars(0)}
            </div>
            <span className="text-[10px] text-gray-500 italic whitespace-nowrap">
             {t('professionalDetail.completedTasks.pendingReview', 'Pending review')}
            </span>
           </>
          )}
         </div>
        </div>

        {task.testimonial && (
         <div className="bg-blue-50 p-3 rounded-lg border-l-3 border-blue-400 mt-2">
          <p className="text-blue-800 text-xs italic line-clamp-2">"{task.testimonial}"</p>
          <p className="text-blue-700 text-xs font-medium mt-1">- {task.clientName}</p>
         </div>
        )}
       </CardBody>
      </Card>
     ))}
    </div>

    {/* View All Tasks Button - Mobile */}
    {completedTasks.length > 4 && (
     <div className="text-center mt-4">
      <Button
       size="sm"
       variant="bordered"
       color="success"
       className="font-medium"
       onPress={onOpen}
      >
       {t('professionalDetail.completedTasks.viewAll', 'View all {{count}} tasks', { count: completedTasks.length })}
      </Button>
     </div>
    )}
   </div>

   {/* Completed Tasks Dialog */}
   <CompletedTasksDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    completedTasks={completedTasks}
   />

  </div>
 );
}