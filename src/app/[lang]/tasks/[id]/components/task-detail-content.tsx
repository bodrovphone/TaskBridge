'use client'

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Clock, Wallet, CheckCircle, AlertCircle, Archive, Sparkles } from "lucide-react";
import { Card as NextUICard, CardBody, Chip, Tooltip } from "@nextui-org/react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/features/auth";
import TaskGallery from "./task-gallery";
import TaskActions from "./task-actions";
import PrivacyToggle from "./privacy-toggle";
import TaskActivity from "./task-activity";
import { getUserApplication } from "@/components/tasks/mock-submit";
import TaskCard from "@/components/ui/task-card";
import { getCategoryName } from '@/lib/utils/category';

interface TaskDetailContentProps {
 task: any;
 similarTasks: any[];
 applicationsCount?: number;
 lang: string;
}

// @note: getCategoryName moved to @/lib/utils/category for reusability - see line 15 for import

function formatBudget(task: any, t: any) {
 // Support both camelCase (mock) and snake_case (database) field names
 const budgetType = task.budgetType || task.budget_type;
 const budgetMin = task.budgetMin || task.budget_min_bgn;
 const budgetMax = task.budgetMax || task.budget_max_bgn;

 if (budgetType === "unclear") {
  return t('taskCard.budget.unclear');
 } else if (budgetType === "fixed" && budgetMax) {
  return `${budgetMax} лв`;
 } else if (budgetMin && budgetMax) {
  return `${budgetMin}-${budgetMax} лв`;
 } else if (budgetMin) {
  return `${t('taskCard.budget.from')} ${budgetMin} лв`;
 } else if (budgetMax) {
  return `${t('taskCard.budget.to')} ${budgetMax} лв`;
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

/**
 * Calculate urgency text from deadline and is_urgent flag
 * Database doesn't store urgency directly, so we reverse-engineer it
 */
function getUrgencyText(task: any, t: any) {
 // Check if task has urgency field (mock data)
 if (task.urgency) {
  switch (task.urgency) {
   case 'same_day': return t('taskDetail.urgency.same_day');
   case 'within_week': return t('taskDetail.urgency.within_week');
   case 'flexible': return t('taskDetail.urgency.flexible');
   default: return t('taskDetail.urgency.default');
  }
 }

 // Reverse-engineer urgency from deadline (real database data)
 if (task.is_urgent || task.isUrgent) {
  return t('taskDetail.urgency.same_day');
 }

 if (task.deadline) {
  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
   return t('taskDetail.urgency.within_week');
  }
 }

 return t('taskDetail.urgency.flexible');
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
 const { user } = useAuth();

 // Get application ID from query params (for auto-opening application detail dialog)
 const applicationId = searchParams.get('application');

 // Client-side ownership check (important for ISR caching)
 // This ensures each user gets correct visibility regardless of cached pages
 const isOwner = user?.id === task.customer_id;

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
      <TaskGallery
       images={task.images}
       title={task.title}
       category={task.category}
       subcategory={task.subcategory}
      />

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
           {getCategoryName(t, task.category, task.subcategory)}
          </Chip>
          <Chip
           color={getUrgencyColor(task.urgency || (task.is_urgent ? 'same_day' : task.deadline ? 'within_week' : 'flexible')) as any}
           variant="flat"
           size="sm"
          >
           {getUrgencyText(task, t)}
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

      {/* Task Activity - Questions and Applications (Author Only)
        Only visible to task authors to manage applications and answer questions.
        Professionals can view their own applications at /tasks/applications
      */}
      {isOwner && (
        <TaskActivity taskId={task.id} initialApplicationId={applicationId || undefined} />
      )}
     </div>

     {/* Sidebar */}
     <div className="space-y-6">
      {/* Customer Profile - Server Rendered with Client Privacy Toggle */}
      <NextUICard className="bg-white/95 shadow-lg">
       <CardBody className="p-6">
        <PrivacyToggle customer={task.customer}>
         <></>
        </PrivacyToggle>
       </CardBody>
      </NextUICard>

      {/* Action Buttons - Client Component */}
      <TaskActions task={task} />

      {/* Similar Tasks - Server Rendered (only show if tasks exist) */}
      {similarTasks && similarTasks.length > 0 && (
        <NextUICard className="bg-white/95 shadow-lg">
         <CardBody className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
           {t('taskDetail.similarTasks')}
          </h3>
          <div className="space-y-4">
           {similarTasks.map((similarTask) => (
            <TaskCard
             key={similarTask.id}
             task={similarTask}
             showApplyButton={false}
            />
           ))}
          </div>
         </CardBody>
        </NextUICard>
      )}
     </div>
    </div>
   </div>
  </div>
 );
}