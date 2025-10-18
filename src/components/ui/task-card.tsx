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

const categoryColors = {
 "home_repair": "primary",
 "delivery_transport": "success", 
 "personal_care": "secondary",
 "personal_assistant": "warning",
 "learning_fitness": "danger",
 "other": "default"
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
   className="h-full"
   shadow="sm"
   radius="lg"
   onPress={handleCardPress}
  >
   <CardBody className="p-0">
    <div className="w-full h-48 overflow-hidden">
     <Image
      src={(task as any).imageUrl || getCategoryImage(task.category, task.id)}
      alt={task.title}
      width={400}
      height={192}
      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
     />
    </div>
    
    <div className="p-4 space-y-3">
     <div className="flex justify-between items-start">
      <Chip 
       color={categoryColor}
       size="sm"
       variant="flat"
      >
       {categoryName}
      </Chip>
      <span className="text-xs text-default-500">{timeAgo}</span>
     </div>
     
     <h3 className="text-lg font-semibold text-foreground hover:text-primary line-clamp-2">
      {task.title}
     </h3>
     
     <p className="text-sm text-default-600 line-clamp-3">
      {task.description}
     </p>

     <div className="space-y-2">
      <div className="flex items-center text-sm text-default-600">
       <MapPin size={14} className="mr-2 flex-shrink-0" />
       <span className="truncate">{task.city}{task.neighborhood && `, ${task.neighborhood}`}</span>
      </div>
      <div className="flex items-center text-sm text-default-600">
       <Clock size={14} className="mr-2 flex-shrink-0" />
       <span>{formatDeadline()}</span>
      </div>
      <div className="flex items-center text-sm text-default-600">
       <Wallet size={14} className="mr-2 flex-shrink-0" />
       <span>{formatBudget()}</span>
      </div>
     </div>
    </div>
   </CardBody>

   <CardFooter className="px-4 pb-4 pt-2 border-t border-divider">
    <div className="flex justify-between items-center w-full">
     <div className="flex items-center gap-2">
      <Avatar 
       src={task.customer?.profileImageUrl || ""}
       name={task.customer?.firstName?.[0] || "?"}
       size="sm"
       className="w-6 h-6"
      />
      <div className="flex items-center gap-2">
       <span className="text-sm text-default-600">
        {task.customer?.firstName ? 
         `${task.customer.firstName} ${task.customer.lastName?.[0] || ""}.` : 
         t('taskCard.anonymous')
        }
       </span>
       {task.customer?.averageRating && Number(task.customer.averageRating) > 0 && (
        <div className="flex items-center">
         <Star size={12} className="text-warning fill-current" />
         <span className="text-xs text-default-600 ml-1">
          {Number(task.customer.averageRating).toFixed(1)}
         </span>
        </div>
       )}
      </div>
     </div>
     
     {showApplyButton && onApply && (
      <Button
       color="primary"
       variant="light"
       size="sm"
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