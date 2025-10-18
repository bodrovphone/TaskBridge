'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Clock, Wallet, Star, CheckCircle, AlertCircle, Archive, Sparkles } from "lucide-react";
import { Card as NextUICard, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import TaskGallery from "./task-gallery";
import TaskActions from "./task-actions";
import PrivacyToggle from "./privacy-toggle";
import TaskActivity from "./task-activity";
import { getUserApplication } from "@/components/tasks/mock-submit";

interface TaskDetailContentProps {
 task: any;
 similarTasks: any[];
 lang: string;
}

const TASK_CATEGORIES = {
 "home_repair": "taskCard.category.home_repair",
 "delivery_transport": "taskCard.category.delivery_transport", 
 "personal_care": "taskCard.category.personal_care",
 "personal_assistant": "taskCard.category.personal_assistant",
 "learning_fitness": "taskCard.category.learning_fitness",
 "other": "taskCard.category.other"
} as const;

function formatBudget(task: any, t: any) {
 if (task.budgetType === "fixed" && task.budgetMax) {
  return `${task.budgetMax} лв`;
 } else if (task.budgetMin && task.budgetMax) {
  return `${task.budgetMin}-${task.budgetMax} лв`;
 } else if (task.budgetMin) {
  return `${t('taskCard.budget.from')} ${task.budgetMin} лв`;
 } else if (task.budgetMax) {
  return `${t('taskCard.budget.to')} ${task.budgetMax} лв`;
 }
 return t('taskDetail.negotiable');
}

function formatDeadline(deadline: string | undefined, t: any) {
 if (!deadline) return t('taskDetail.flexible');
 const deadlineDate = new Date(deadline);
 const now = new Date();
 const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
 
 if (diffDays === 0) return t('taskDetail.today');
 if (diffDays === 1) return t('taskDetail.tomorrow');
 if (diffDays <= 7) return `${diffDays} ${t('taskDetail.days')}`;
 return deadlineDate.toLocaleDateString();
}

function getUrgencyColor(urgency: string) {
 switch (urgency) {
  case 'same_day': return 'danger';
  case 'within_week': return 'warning';
  case 'flexible': return 'success';
  default: return 'default';
 }
}

function getUrgencyText(urgency: string, t: any) {
 switch (urgency) {
  case 'same_day': return t('taskDetail.urgency.same_day');
  case 'within_week': return t('taskDetail.urgency.within_week');
  case 'flexible': return t('taskDetail.urgency.flexible');
  default: return t('taskDetail.urgency.default');
 }
}

function getTaskStatus(taskId: string, taskStatus?: string) {
 // Check if user has applied
 const userApplication = getUserApplication(taskId, 'mock-user-id');

 // If task is completed or archived
 if (taskStatus === 'completed') {
  return {
   key: 'done',
   icon: CheckCircle,
   color: 'success',
   bgColor: 'bg-green-100',
   iconColor: 'text-green-600'
  };
 }
 if (taskStatus === 'archived') {
  return {
   key: 'archived',
   icon: Archive,
   color: 'default',
   bgColor: 'bg-gray-100',
   iconColor: 'text-gray-600'
  };
 }

 // If user has applied
 if (userApplication?.status) {
  return {
   key: 'applied',
   icon: AlertCircle,
   color: 'primary',
   bgColor: 'bg-blue-100',
   iconColor: 'text-blue-600',
   showTooltip: true
  };
 }

 // Default: vacant/pending
 return {
  key: 'vacant',
  icon: Sparkles,
  color: 'warning',
  bgColor: 'bg-orange-100',
  iconColor: 'text-orange-600'
 };
}

export default function TaskDetailContent({ task, similarTasks, lang }: TaskDetailContentProps) {
 const { t } = useTranslation();
 const searchParams = useSearchParams();

 // Get application ID from query params (for auto-opening application detail dialog)
 const applicationId = searchParams.get('application');

 // Server-side time calculation for initial render
 const timeAgo = `${t('taskDetail.timeAgo')} 2 часа`; // TODO: Implement proper server-side time calculation

 return (
  <div 
   className="min-h-screen relative"
   style={{
    backgroundImage: 'url(/images/cardboard.png)',
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto'
   }}
  >
   {/* Background overlay */}
   <div className="absolute inset-0 bg-white/30 "></div>
   
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
    {/* Back Navigation */}
    <div className="mb-6">
     <Link 
      href={`/${lang}/browse-tasks`}
      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
     >
      <ChevronLeft size={20} className="mr-1" />
      {t('taskDetail.backToTasks')}
     </Link>
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
     {/* Main Content */}
     <div className="lg:col-span-2 space-y-6">
      {/* Photo Gallery - Client Component */}
      <TaskGallery photos={task.photos} title={task.title} />

      {/* Task Details - Server Rendered */}
      <NextUICard className="bg-white/95 shadow-lg">
       <CardBody className="p-6">
        <div className="space-y-4">
         <div className="flex flex-wrap items-center gap-3">
          <Chip
           color="secondary"
           variant="solid"
           size="md"
           className="font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600"
          >
           {t(TASK_CATEGORIES[task.category as keyof typeof TASK_CATEGORIES] || task.category)}
          </Chip>
          <Chip
           color={getUrgencyColor(task.urgency) as any}
           variant="flat"
           size="sm"
          >
           {getUrgencyText(task.urgency, t)}
          </Chip>
          <span className="text-sm text-gray-500 ml-auto">{timeAgo}</span>
         </div>

         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {task.title}
         </h1>

         <p className="text-gray-700 text-lg leading-relaxed">
          {task.description}
         </p>

         {task.requirements && (
          <div>
           <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('taskDetail.requirements')}
           </h3>
           <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans">
             {task.requirements}
            </pre>
           </div>
          </div>
         )}
        </div>
       </CardBody>
      </NextUICard>

      {/* Key Information - Server Rendered */}
      <NextUICard className="bg-white/95 shadow-lg">
       <CardBody className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
         {t('taskDetail.keyInformation')}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
         <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
           <Wallet className="text-blue-600" size={20} />
          </div>
          <div>
           <p className="text-sm text-gray-600">{t('task.budget')}</p>
           <p className="font-semibold text-gray-900">{formatBudget(task, t)}</p>
          </div>
         </div>

         <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
           <MapPin className="text-green-600" size={20} />
          </div>
          <div>
           <p className="text-sm text-gray-600">{t('task.location')}</p>
           <p className="font-semibold text-gray-900">
            {task.city}, {task.neighborhood}
           </p>
          </div>
         </div>

         <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
           <Clock className="text-orange-600" size={20} />
          </div>
          <div>
           <p className="text-sm text-gray-600">{t('task.deadline')}</p>
           <p className="font-semibold text-gray-900">{formatDeadline(task.deadline, t)}</p>
          </div>
         </div>

         <div className="flex items-center gap-3">
          {(() => {
           const status = getTaskStatus(task.id, task.status);
           const StatusIcon = status.icon;
           const statusContent = (
            <>
             <div className={`flex items-center justify-center w-10 h-10 ${status.bgColor} rounded-lg`}>
              <StatusIcon className={status.iconColor} size={20} />
             </div>
             <div>
              <p className="text-sm text-gray-600">{t('taskDetail.status')}</p>
              <Chip
               color={status.color as any}
               variant="flat"
               size="sm"
               className="font-semibold"
              >
               {t(`taskDetail.statusTypes.${status.key}`)}
              </Chip>
             </div>
            </>
           );

           // Wrap in tooltip for "applied" status
           if (status.showTooltip) {
            return (
             <Tooltip
              content={t('taskDetail.appliedTooltip')}
              placement="top"
              color="primary"
             >
              {statusContent}
             </Tooltip>
            );
           }

           return statusContent;
          })()}
         </div>
        </div>
       </CardBody>
      </NextUICard>

      {/* Task Activity - Questions and Applications
        TODO: This component should only be visible to task authors (task creators/givers)
        to manage applications and answer questions. For now, showing for all users for testing.
      */}
      <TaskActivity taskId={task.id} initialApplicationId={applicationId || undefined} />
     </div>

     {/* Sidebar */}
     <div className="space-y-6">
      {/* Customer Profile - Server Rendered with Client Privacy Toggle */}
      <NextUICard className="bg-white/95 shadow-lg">
       <CardBody className="p-6">
        <PrivacyToggle customer={task.customer}>
         <div className="flex items-center">
          <Star className="text-yellow-500 fill-current" size={14} />
          <span className="ml-1">
           {task.customer.averageRating} ({task.customer.totalReviews} отзива)
          </span>
         </div>
        </PrivacyToggle>
       </CardBody>
      </NextUICard>

      {/* Action Buttons - Client Component */}
      <TaskActions task={task} />

      {/* Similar Tasks - Server Rendered */}
      <NextUICard className="bg-white/95 shadow-lg">
       <CardBody className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
         {t('taskDetail.similarTasks')}
        </h3>
        <div className="space-y-4">
         {similarTasks.map((similarTask) => (
          <Link
           key={similarTask.id}
           href={`/${lang}/tasks/${similarTask.id}`}
           className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
           <h4 className="font-medium text-gray-900 line-clamp-2">
            {similarTask.title}
           </h4>
           <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>{similarTask.city}</span>
            <span>{formatBudget(similarTask, t)}</span>
           </div>
          </Link>
         ))}
        </div>
       </CardBody>
      </NextUICard>
     </div>
    </div>
   </div>
  </div>
 );
}