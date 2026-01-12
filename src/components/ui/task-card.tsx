'use client'

import { useState } from 'react';
import { MapPin, Clock, Wallet } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { bg, enUS, ru } from "date-fns/locale";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { DEFAULT_LOCALE } from '@/lib/constants/locales';
import {
 Card,
 CardBody,
 CardFooter,
 Button,
 Chip
} from "@heroui/react";
import DefaultTaskImage from "@/components/ui/default-task-image";
import { getCategoryColor, getCategoryName, getCategoryImage } from '@/lib/utils/category';
import { canApplyToTask, getDisabledReason, type TaskStatus } from '@/lib/utils/task-permissions';
import { getCityLabelBySlug } from '@/features/cities';
import { getLocalizedTaskContent } from '@/lib/utils/task-localization';

// Task type definition for TaskCard component
// Supports both camelCase (frontend) and snake_case (database) field names
// Uses `| null` for database fields that can be null
export interface TaskCardData {
 id: string;
 slug?: string | null; // URL-friendly identifier
 title: string;
 description: string;
 category: string;
 subcategory?: string | null;
 city: string;
 neighborhood?: string | null;
 budgetType?: 'fixed' | 'hourly' | 'negotiable' | 'unclear' | 'range';
 budget_type?: 'fixed' | 'hourly' | 'negotiable' | 'unclear' | 'range'; // Database field (snake_case)
 budgetMin?: number | null;
 budget_min_bgn?: number | null; // Database field (snake_case)
 budgetMax?: number | null;
 budget_max_bgn?: number | null; // Database field (snake_case)
 deadline?: Date | string | null;
 createdAt?: Date | string;
 created_at?: Date | string; // Database field (snake_case)
 images?: string[]; // Array of photo URLs (database field)
 status?: TaskStatus; // Task status for permissions
 is_urgent?: boolean; // Database field for urgent tasks
 urgency?: 'same_day' | 'within_week' | 'flexible'; // Urgency type
 // Translation fields
 source_language?: string;
 title_bg?: string | null;
 description_bg?: string | null;
 requirements_bg?: string | null;
 location_notes?: string | null;
}

interface TaskCardProps {
 task: TaskCardData;
 onApply?: (taskId: string) => void;
 showApplyButton?: boolean;
}

// @note: getCategoryColor, getCategoryName, getCategoryImage moved to @/lib/utils/category - see line 19 for import

function TaskCard({ task, onApply, showApplyButton = true }: TaskCardProps) {
 const t = useTranslations();
 const router = useRouter();
 const pathname = usePathname();
 const [imageError, setImageError] = useState(false);

 // Get locale from URL pathname
 const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;

 const getDateLocale = () => {
  switch (currentLocale) {
   case 'bg': return bg;
   case 'ru': return ru;
   case 'en':
   default: return enUS;
  }
 };

 // Parse timestamp safely - check both camelCase and snake_case
 const timestamp = task.createdAt || task.created_at;
 const createdDate = timestamp ? new Date(timestamp) : new Date();

 // Get simplified time display (same logic as task detail page)
 const getTimeAgo = (): string => {
  const now = new Date();
  const createdDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((today.getTime() - createdDay.getTime()) / (1000 * 60 * 60 * 24));

  // Show exact time for today (e.g., "2 hours ago")
  if (diffDays === 0) {
   return formatDistanceToNow(createdDate, { addSuffix: true, locale: getDateLocale() });
  }
  // Show "this week" for 1-7 days
  if (diffDays <= 7) {
   return t('taskCard.time.thisWeek');
  }
  // Show "this month" for 8-30 days
  if (diffDays <= 30) {
   return t('taskCard.time.thisMonth');
  }
  // Show "some time ago" for older
  return t('taskCard.time.someTimeAgo');
 };

 const timeAgo = getTimeAgo();

 // Use subcategory for color if it exists, otherwise use category
 const displayCategory = task.subcategory || task.category;
 const categoryColor = getCategoryColor(displayCategory);
 const categoryName = getCategoryName(t, task.category, task.subcategory);

 // Get localized content based on user's locale (currentLocale defined above)
 const localizedContent = getLocalizedTaskContent(task as any, currentLocale);

 const formatBudget = () => {
  // Support both camelCase and snake_case from database
  const budgetType = task.budgetType || task.budget_type;
  const budgetMin = task.budgetMin || task.budget_min_bgn;
  const budgetMax = task.budgetMax || task.budget_max_bgn;

  if (budgetType === "unclear") {
   return t('taskCard.budget.unclear');
  } else if (budgetType === "fixed" && budgetMax) {
   return `${budgetMax} €`;
  } else if (budgetMin && budgetMax) {
   return `${budgetMin}-${budgetMax} €`;
  } else if (budgetMin) {
   return `${t('taskCard.budget.from')} ${budgetMin} €`;
  } else if (budgetMax) {
   return `${t('taskCard.budget.to')} ${budgetMax} €`;
  }
  return t('taskCard.budget.negotiable');
 };

 const formatDeadline = () => {
  // Check explicit urgency type first (mock data or form data)
  if (task.urgency === 'same_day') {
   return t('taskDetail.urgency.same_day');
  }
  if (task.urgency === 'within_week') {
   return t('taskDetail.urgency.within_week');
  }
  if (task.urgency === 'flexible') {
   return t('taskCard.deadline.flexible');
  }

  // Derive urgency from database fields (is_urgent + deadline)
  // This matches the logic in task-detail-content.tsx
  if (task.is_urgent) {
   return t('taskDetail.urgency.same_day');
  }

  if (!task.deadline) {
   return t('taskCard.deadline.flexible');
  }

  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Past deadline - show as ASAP
  if (diffDays < 0) return t('taskDetail.asap');

  // Within 7 days = "Within a week"
  if (diffDays <= 7) {
   return t('taskDetail.urgency.within_week');
  }

  // More than 7 days = "Flexible"
  return t('taskCard.deadline.flexible');
 };

 const handleCardPress = () => {
  const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;
  // Use slug for SEO-friendly URLs, fallback to id for legacy tasks
  const identifier = task.slug || task.id;
  router.push(`/${currentLocale}/tasks/${identifier}`);
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
    className="p-0 cursor-pointer flex-1 overflow-hidden min-w-0"
    onClick={handleCardPress}
   >
    {/* Image or Default Gradient */}
    <div className="w-full h-40 overflow-hidden flex-shrink-0">
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

    {/* Content */}
    <div className="p-4 flex flex-col min-w-0">
     {/* Category badge and time */}
     <div className="flex justify-between items-start gap-2 mb-2 min-w-0">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${categoryColor} truncate`}>
       {categoryName}
      </span>
      <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
     </div>

     {/* Title - max 1 line with ellipsis */}
     <h3 className="text-base font-semibold text-gray-900 mb-1 truncate min-w-0">
      {localizedContent.title}
     </h3>

     {/* Description - max 2 lines with ellipsis */}
     <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-w-0">
      {localizedContent.description}
     </p>

     {/* Task details with larger icons */}
     <div className="space-y-1.5 mt-auto">
      <div className="flex items-center text-sm text-gray-600">
       <MapPin size={14} className="mr-2 flex-shrink-0" />
       <span className="truncate">{getCityLabelBySlug(task.city, t)}{task.neighborhood && `, ${task.neighborhood}`}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
       <Clock size={14} className="mr-2 flex-shrink-0" />
       <span>{formatDeadline()}</span>
      </div>
      <div className="flex items-center text-sm text-gray-600">
       <Wallet size={14} className="mr-2 flex-shrink-0" />
       <span>{formatBudget()}</span>
      </div>
     </div>
    </div>
   </CardBody>

   {/* Footer with clear separator */}
   <CardFooter className="px-4 pb-3 pt-3 border-t border-gray-100 flex-shrink-0">
    <div className="flex flex-col min-[590px]:flex-row gap-3 w-full" onClick={(e) => e.stopPropagation()}>
     <Button
      variant="bordered"
      size="md"
      className="flex-1 w-full py-3 text-sm"
      onPress={handleCardPress}
     >
      {t('taskCard.seeDetails')}
     </Button>

     {showApplyButton && onApply && (
      <Button
       color="success"
       variant="solid"
       size="md"
       className="flex-1 w-full py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
       onPress={() => onApply(task.id)}
       isDisabled={!canApply}
       title={applyDisabledReason}
      >
       {t('taskCard.apply')}
      </Button>
     )}
    </div>
   </CardFooter>
  </Card>
 );
}

TaskCard.displayName = 'TaskCard'

export default TaskCard