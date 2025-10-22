'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, Card, CardBody, Avatar, Chip, Button } from "@heroui/react";
import { CheckCircle, MapPin, Star, ExternalLink, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '@/components/common/locale-link';

interface CompletedTask {
 id: string;
 title: string;
 category: string;
 completedDate: string;
 clientRating: number;
 budget: string;
 location: string;
 clientName?: string;
 clientAvatar?: string;
 testimonial?: string;
 isVerified?: boolean;
 durationCompleted?: string;
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
 const averageRating = completedTasks.reduce((sum, task) => sum + task.clientRating, 0) / totalTasks;

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
       <div className="text-sm text-gray-600">Total Tasks</div>
      </div>
     </div>
     <div className="text-sm text-gray-600">
      Average rating: {averageRating.toFixed(1)} stars
     </div>
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
            <Chip size="sm" variant="flat" color="secondary">
             {task.category}
            </Chip>
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
            {task.durationCompleted && (
             <Chip
              size="sm"
              variant="flat"
              color="default"
              startContent={<Clock size={12} />}
             >
              {task.durationCompleted}
             </Chip>
            )}
           </div>
          </div>
          <div className="text-right flex-shrink-0">
           <div className="text-xl font-bold text-green-600 mb-2">{task.budget}</div>
           <div className="flex items-center gap-1 justify-end">
            {renderStars(task.clientRating)}
            <span className="text-sm text-gray-600 ml-1">{task.clientRating}</span>
           </div>
          </div>
         </div>

         <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{task.location}</span>
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

         <LocaleLink href={`/tasks/${task.id}`}>
          <Button
           size="sm"
           variant="bordered"
           color="primary"
           endContent={<ExternalLink size={14} />}
           className="font-medium"
          >
           {t('professionalDetail.completedTasks.viewTask')}
          </Button>
         </LocaleLink>
        </CardBody>
       </Card>
      ))}
     </div>
    </ModalBody>
   </ModalContent>
  </Modal>
 );
}