'use client'

import { MapPin, Clock, Wallet, Star } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { bg, enUS, ru } from "date-fns/locale";
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { DEFAULT_LOCALE } from '@/lib/constants/locales';
import type { Task } from "@/database/schema";
import {
 Card,
 CardBody,
 CardFooter,
 Button,
 Chip,
 Avatar
} from "@nextui-org/react";

interface TaskCardProps {
 task: Task & {
  customer?: {
   firstName?: string;
   lastName?: string;
   profileImageUrl?: string;
   averageRating?: string;
   totalReviews?: number;
  };
 };
 onApply?: (taskId: string) => void;
 showApplyButton?: boolean;
}

// Rich badge colors matching the original design
const categoryColors = {
 "home_repair": "bg-blue-100 text-blue-800 border-blue-200",
 "delivery_transport": "bg-green-100 text-green-800 border-green-200",
 "personal_care": "bg-purple-100 text-purple-800 border-purple-200",
 "personal_assistant": "bg-orange-100 text-orange-800 border-orange-200",
 "learning_fitness": "bg-pink-100 text-pink-800 border-pink-200",
 "other": "bg-gray-100 text-gray-800 border-gray-200"
} as const;

function TaskCard({ task, onApply, showApplyButton = true }: TaskCardProps) {
 const { t, i18n } = useTranslation();
 const router = useRouter();
 const pathname = usePathname();
 
 const getCategoryName = (category: string) => {
  const categoryKey = `taskCard.category.${category}`;
  return t(categoryKey, category); // fallback to category if translation not found
 };

 const getDateLocale = () => {
  switch (i18n.language) {
   case 'bg': return bg;
   case 'ru': return ru;
   case 'en': 
   default: return enUS;
  }
 };

 const getCategoryImage = (category: string, taskId?: string) => {
  // Specific images for mock tasks based on task ID and content
  if (taskId === "1") {
   // Dog walking task
   return 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center'; // Person walking dog
  }
  if (taskId === "2") {
   // Balcony repair task
   return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center'; // Home construction/repair
  }
  if (taskId === "3") {
   // Apartment cleaning task
   return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center'; // Professional cleaning
  }
  
  // Default category-based images
  const imageMap = {
   'home_repair': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop&crop=center', // Tools and repair work
   'delivery_transport': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center', // Delivery person with packages
   'personal_care': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop&crop=center', // Dog walking/pet care
   'personal_assistant': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', // Cleaning services
   'learning_fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center', // Fitness training
   'other': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center' // General services/business
  };
  return imageMap[category as keyof typeof imageMap] || imageMap.other;
 };

 const timeAgo = formatDistanceToNow(new Date(task.createdAt || new Date()), {
  addSuffix: true,
  locale: getDateLocale(),
 });

 const categoryColor = categoryColors[task.category as keyof typeof categoryColors] || categoryColors.other;
 const categoryName = getCategoryName(task.category);

 const formatBudget = () => {
  if (task.budgetType === "fixed" && task.budgetMax) {
   return `${task.budgetMax} лв`;
  } else if (task.budgetMin && task.budgetMax) {
   return `${task.budgetMin}-${task.budgetMax} лв`;
  } else if (task.budgetMin) {
   return `${t('taskCard.budget.from')} ${task.budgetMin} лв`;
  } else if (task.budgetMax) {
   return `${t('taskCard.budget.to')} ${task.budgetMax} лв`;
  }
  return t('taskCard.budget.negotiable');
 };

 const formatDeadline = () => {
  if (!task.deadline) return t('taskCard.deadline.flexible');
  const deadline = new Date(task.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t('taskCard.deadline.today');
  if (diffDays === 1) return t('taskCard.deadline.tomorrow'); 
  if (diffDays <= 7) return `${diffDays} ${t('taskCard.deadline.days')}`;
  return deadline.toLocaleDateString();
 };

 const handleCardPress = () => {
  const currentLocale = extractLocaleFromPathname(pathname) || DEFAULT_LOCALE;
  router.push(`/${currentLocale}/tasks/${task.id}`);
 };

 return (
  <Card
   isPressable
   className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary-200 cursor-pointer"
   shadow="md"
   radius="lg"
   onPress={handleCardPress}
  >
   <CardBody className="p-0 flex-grow flex flex-col">
    {/* Image with loading background */}
    <div className="w-full h-48 bg-gray-200 overflow-hidden flex-shrink-0">
     <Image
      src={(task as any).imageUrl || getCategoryImage(task.category, task.id)}
      alt={task.title}
      width={400}
      height={192}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
     />
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
     <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 line-clamp-2 transition-colors">
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
       <span className="truncate">{task.city}{task.neighborhood && `, ${task.neighborhood}`}</span>
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
    <div className="flex justify-between items-center w-full">
     <div className="flex items-center space-x-2">
      <Avatar
       src={task.customer?.profileImageUrl || ""}
       name={task.customer?.firstName?.[0] || "?"}
       size="sm"
       className="w-6 h-6"
      />
      <span className="text-sm text-gray-600">
       {task.customer?.firstName ?
        `${task.customer.firstName} ${task.customer.lastName?.[0] || ""}.` :
        t('taskCard.anonymous')
       }
      </span>
      {task.customer?.averageRating && Number(task.customer.averageRating) > 0 && (
       <div className="flex items-center">
        <Star size={12} className="text-yellow-400 fill-current" />
        <span className="text-xs text-gray-600 ml-1">
         {Number(task.customer.averageRating).toFixed(1)}
        </span>
       </div>
      )}
     </div>

     {showApplyButton && onApply && (
      <Button
       color="success"
       variant="solid"
       size="sm"
       className="font-semibold px-6 shadow-md hover:shadow-lg transition-shadow"
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onApply(task.id);
       }}
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