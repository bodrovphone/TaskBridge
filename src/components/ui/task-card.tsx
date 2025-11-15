'use client'

import { useState } from 'react';
import { MapPin, Clock, Wallet } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { bg, enUS, ru } from "date-fns/locale";
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { DEFAULT_LOCALE } from '@/lib/constants/locales';
import {
 Card,
 CardBody,
 CardFooter,
 Button,
 Chip
} from "@nextui-org/react";
import DefaultTaskImage from "@/components/ui/default-task-image";
import { getCategoryColor, getCategoryName, getCategoryImage } from '@/lib/utils/category';
import { canApplyToTask, getDisabledReason, type TaskStatus } from '@/lib/utils/task-permissions';
import { getCityLabelBySlug } from '@/features/cities';

// Task type definition (to be moved to global types later)
interface Task {
 id: string;
 title: string;
 description: string;
 category: string;
 subcategory?: string | null;
 city: string;
 neighborhood?: string;
 budgetType?: 'fixed' | 'hourly' | 'negotiable' | 'unclear';
 budget_type?: 'fixed' | 'hourly' | 'negotiable' | 'unclear'; // Database field (snake_case)
 budgetMin?: number;
 budget_min_bgn?: number; // Database field (snake_case)
 budgetMax?: number;
 budget_max_bgn?: number; // Database field (snake_case)
 deadline?: Date | string;
 createdAt?: Date | string;
 created_at?: Date | string; // Database field (snake_case)
 images?: string[]; // Array of photo URLs (database field)
 status?: TaskStatus; // Task status for permissions
}

interface TaskCardProps {
 task: Task;
 onApply?: (taskId: string) => void;
 showApplyButton?: boolean;
}

// @note: getCategoryColor, getCategoryName, getCategoryImage moved to @/lib/utils/category - see line 19 for import

function TaskCard({ task, onApply, showApplyButton = true }: TaskCardProps) {
 const { t, i18n } = useTranslation();
 const router = useRouter();
 const pathname = usePathname();
 const [imageError, setImageError] = useState(false);

 const getDateLocale = () => {
  switch (i18n.language) {
   case 'bg': return bg;
   case 'ru': return ru;
   case 'en':
   default: return enUS;
  }
 };

 // Parse timestamp safely - check both camelCase and snake_case
 const timestamp = task.createdAt || task.created_at;
 const createdDate = timestamp ? new Date(timestamp) : new Date();
 const timeAgo = formatDistanceToNow(createdDate, {
  addSuffix: true,
  locale: getDateLocale(),
 });

 // Use subcategory for color if it exists, otherwise use category
 const displayCategory = task.subcategory || task.category;
 const categoryColor = getCategoryColor(displayCategory);
 const categoryName = getCategoryName(t, task.category, task.subcategory);

 const formatBudget = () => {
  // Support both camelCase and snake_case from database
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
  return t('taskCard.budget.negotiable');
 };

 const formatDeadline = () => {
  if (!task.deadline) return t('taskCard.deadline.flexible');
  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Past deadline - show as urgent/ASAP
  if (diffDays < 0) return t('taskDetail.asap', 'ASAP');

  if (diffDays === 0) return t('taskCard.deadline.today');
  if (diffDays === 1) return t('taskCard.deadline.tomorrow');
  if (diffDays <= 7) return `${diffDays} ${t('taskCard.deadline.days')}`;
  return deadline.toLocaleDateString();
 };

 const handleCardPress = () => {
  const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;
  router.push(`/${currentLocale}/tasks/${task.id}`);
 };

 // Check if apply button should be enabled based on task status
 const taskStatus = (task.status || 'open') as TaskStatus;
 const canApply = canApplyToTask(taskStatus);
 const applyDisabledReason = !canApply ? getDisabledReason('apply', taskStatus) : '';

 return (
  <Card
   className="w-full h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary-200"
   shadow="md"
   radius="lg"
  >
   <CardBody
    className="p-0 flex-grow flex flex-col cursor-pointer"
    onClick={handleCardPress}
   >
    {/* Image or Default Gradient */}
    <div className="w-full h-48 overflow-hidden flex-shrink-0">
     {task.images && task.images.length > 0 && !imageError ? (
      <Image
       src={task.images[0]}
       alt={task.title}
       width={400}
       height={192}
       className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
       onError={() => setImageError(true)}
      />
     ) : (task as any).imageUrl && !imageError ? (
      // Backward compatibility with mock data
      <Image
       src={(task as any).imageUrl || getCategoryImage(task.category, task.id)}
       alt={task.title}
       width={400}
       height={192}
       className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
       onError={() => setImageError(true)}
      />
     ) : (
      // Show gradient default when no photos or image failed to load
      <DefaultTaskImage
       category={task.subcategory || task.category}
       className="w-full h-full"
      />
     )}
    </div>

    {/* Content with better spacing */}
    <div className="p-6 flex-grow flex flex-col">
     {/* Category badge and time */}
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${categoryColor} w-fit`}>
       {categoryName}
      </span>
      <span className="text-sm text-gray-500">{timeAgo}</span>
     </div>

     {/* Title with better contrast */}
     <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
      {task.title}
     </h3>

     {/* Description with better contrast */}
     <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
      {task.description}
     </p>

     {/* Task details with larger icons */}
     <div className="space-y-2 mb-4 mt-auto">
      <div className="flex items-center text-sm text-gray-600">
       <MapPin size={16} className="mr-2 flex-shrink-0" />
       <span className="truncate">{getCityLabelBySlug(task.city, t)}{task.neighborhood && `, ${task.neighborhood}`}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
       <Clock size={16} className="mr-2 flex-shrink-0" />
       <span>{formatDeadline()}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
       <Wallet size={16} className="mr-2 flex-shrink-0" />
       <span>{formatBudget()}</span>
      </div>
     </div>
    </div>
   </CardBody>

   {/* Footer with clear separator */}
   <CardFooter className="px-6 pb-4 pt-4 border-t border-gray-100 mt-auto">
    <div className="flex flex-col min-[590px]:flex-row gap-3 w-full" onClick={(e) => e.stopPropagation()}>
     <Button
      variant="bordered"
      size="md"
      className="flex-1 w-full py-3"
      onPress={handleCardPress}
     >
      {t('taskCard.seeDetails', 'See details')}
     </Button>

     {showApplyButton && onApply && (
      <Button
       color="success"
       variant="solid"
       size="md"
       className="flex-1 w-full py-3 font-semibold shadow-md hover:shadow-lg transition-shadow"
       onPress={() => onApply(task.id)}
       isDisabled={!canApply}
       title={applyDisabledReason}
      >
       {t('taskCard.apply', 'Apply')}
      </Button>
     )}
    </div>
   </CardFooter>
  </Card>
 );
}

TaskCard.displayName = 'TaskCard'

export default TaskCard