'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, Card, CardBody, Avatar, Chip } from "@nextui-org/react";
import { CheckCircle, MapPin, Star, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';
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

interface CompletedTasksDialogProps {
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 completedTasks: CompletedTask[];
}

export default function CompletedTasksDialog({
 isOpen,
 onOpenChange,
 completedTasks
}: CompletedTasksDialogProps) {
 const { t } = useTranslation();

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

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('bg-BG', {
   month: 'short',
   day: 'numeric'
  });
 };

 const totalTasks = completedTasks.length;

 // Only calculate average from tasks that have been reviewed (rating > 0)
 const reviewedTasks = completedTasks.filter(task => task.clientRating > 0);
 const averageRating = reviewedTasks.length > 0
   ? reviewedTasks.reduce((sum, task) => sum + task.clientRating, 0) / reviewedTasks.length
   : 0;

 return (
  <Modal
   isOpen={isOpen}
   onOpenChange={onOpenChange}
   size="4xl"
   scrollBehavior="inside"
   classNames={{
    base: "bg-white",
    header: "border-b border-gray-200",
    body: "py-6",
    wrapper: "items-center",
   }}
   style={{ height: '70vh' }}
  >
   <ModalContent className="max-h-[70vh]">
    <ModalHeader className="flex flex-col gap-1">
     <div className="flex items-center justify-between w-full pr-8">
      <h2 className="text-2xl font-bold text-gray-900">
       {t('professionalDetail.completedTasks.title')}
      </h2>
      <div className="text-right">
       <div className="text-2xl font-bold text-green-600">{totalTasks}</div>
       <div className="text-sm text-gray-600">{t('professionalDetail.completedTasks.totalTasks', 'Total Tasks')}</div>
      </div>
     </div>
     {reviewedTasks.length > 0 && (
      <div className="text-sm text-gray-600">
       {t('professionalDetail.completedTasks.averageRatingStars', 'Average rating: {{rating}} stars', { rating: averageRating.toFixed(1) })}
      </div>
     )}
    </ModalHeader>
    <ModalBody className="flex-1 overflow-auto">
     <div className="space-y-4 pr-2">
      {completedTasks.map((task) => (
       <Card key={task.id} className="bg-white border border-gray-200">
        <CardBody className="p-4">
         <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
           <h4 className="text-lg font-bold text-gray-900 mb-2">
            {task.title}
           </h4>
           <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="text-sm text-gray-500">{formatDate(task.completedDate)}</span>
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
            {task.durationHours > 0 && (
             <Chip
              size="sm"
              variant="flat"
              color="default"
              startContent={<Clock size={12} />}
             >
              {t('taskCompletion.completedIn', 'Завършено за')} {task.durationHours}{t('common.hours.short', 'ч')}
             </Chip>
            )}
           </div>
          </div>
          <div className="text-right flex-shrink-0">
           <div className="text-xl font-bold text-green-600 mb-2">
            {task.budget > 0 ? `${task.budget} ${t('common.currency.bgn', 'лв')}` : t('common.negotiable', 'Договорена')}
           </div>
           <div className="flex flex-col items-end gap-1">
            {task.clientRating > 0 ? (
             <div className="flex items-center gap-1 justify-end">
              {renderStars(task.clientRating)}
              <span className="text-sm text-gray-600 ml-1">{task.clientRating}</span>
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
         </div>

         <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin size={14} className="mr-1" />
          <span>
           {getCityLabelBySlug(task.citySlug, t)}{task.neighborhood ? `, ${task.neighborhood}` : ''}
          </span>
         </div>

         {task.testimonial && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-3">
           <p className="text-blue-800 text-sm italic mb-2">"{task.testimonial}"</p>
           <div className="flex items-center gap-2">
            {task.clientAvatar ? (
             <Avatar src={task.clientAvatar} size="sm" />
            ) : (
             <Avatar name={task.clientName} size="sm" />
            )}
            <span className="text-blue-700 font-semibold text-sm">
             - {task.clientName}
            </span>
           </div>
          </div>
         )}
        </CardBody>
       </Card>
      ))}
     </div>
    </ModalBody>
   </ModalContent>
  </Modal>
 );
}