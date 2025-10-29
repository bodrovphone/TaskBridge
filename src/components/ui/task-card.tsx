'use client'

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

// Task type definition (to be moved to global types later)
interface Task {
 id: string;
 title: string;
 description: string;
 category: string;
 subcategory?: string | null;
 city: string;
 neighborhood?: string;
 budgetType?: 'fixed' | 'hourly' | 'negotiable';
 budget_type?: 'fixed' | 'hourly' | 'negotiable'; // Database field (snake_case)
 budgetMin?: number;
 budget_min_bgn?: number; // Database field (snake_case)
 budgetMax?: number;
 budget_max_bgn?: number; // Database field (snake_case)
 deadline?: Date | string;
 createdAt?: Date | string;
 created_at?: Date | string; // Database field (snake_case)
}

interface TaskCardProps {
 task: Task;
 onApply?: (taskId: string) => void;
 showApplyButton?: boolean;
}

// Map subcategories to main categories, then to colors
const getCategoryColor = (category: string): string => {
 // Subcategory to main category mapping
 const subcategoryToMain: Record<string, string> = {
  // Handyman subcategories
  'plumber': 'handyman',
  'electrician': 'handyman',
  'handyman-service': 'handyman',
  'carpenter': 'handyman',
  'locksmith': 'handyman',

  // Appliance repair subcategories
  'large-appliance-repair': 'appliance-repair',
  'small-appliance-repair': 'appliance-repair',
  'computer-help': 'appliance-repair',
  'digital-tech-repair': 'appliance-repair',
  'phone-repair': 'appliance-repair',

  // Courier services subcategories
  'courier-delivery': 'courier-services',
  'grocery-delivery': 'courier-services',
  'food-delivery': 'courier-services',
  'document-delivery': 'courier-services',

  // Logistics subcategories
  'moving': 'logistics',
  'cargo-transport': 'logistics',
  'furniture-assembly': 'logistics',

  // Cleaning services subcategories
  'house-cleaning': 'cleaning-services',
  'office-cleaning': 'cleaning-services',
  'window-cleaning': 'cleaning-services',
  'carpet-cleaning': 'cleaning-services',

  // Pet services subcategories
  'dog-walking': 'pet-services',
  'pet-sitting': 'pet-services',
  'pet-grooming': 'pet-services',

  // Beauty & health subcategories
  'massage': 'beauty-health',
  'hairdresser': 'beauty-health',
  'manicure': 'beauty-health',
  'makeup': 'beauty-health',

  // Tutoring subcategories
  'language-tutoring': 'tutoring',
  'math-tutoring': 'tutoring',
  'music-lessons': 'tutoring',

  // Add more as needed...
 };

 // Get main category (either directly or via subcategory mapping)
 const mainCategory = subcategoryToMain[category] || category;

 // Main category color mappings
 const mainCategoryColors: Record<string, string> = {
  // Home & Repair Services (Blue)
  'handyman': 'bg-blue-100 text-blue-800 border-blue-200',
  'appliance-repair': 'bg-blue-100 text-blue-800 border-blue-200',
  'finishing-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'furniture-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'construction-work': 'bg-blue-100 text-blue-800 border-blue-200',
  'auto-repair': 'bg-blue-100 text-blue-800 border-blue-200',
  'home_repair': 'bg-blue-100 text-blue-800 border-blue-200', // Legacy

  // Delivery & Logistics (Green)
  'courier-services': 'bg-green-100 text-green-800 border-green-200',
  'logistics': 'bg-green-100 text-green-800 border-green-200',
  'delivery_transport': 'bg-green-100 text-green-800 border-green-200', // Legacy

  // Personal Services (Purple)
  'pet-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'beauty-health': 'bg-purple-100 text-purple-800 border-purple-200',
  'cleaning-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'household-services': 'bg-purple-100 text-purple-800 border-purple-200',
  'personal_care': 'bg-purple-100 text-purple-800 border-purple-200', // Legacy

  // Professional Services (Orange)
  'business-services': 'bg-orange-100 text-orange-800 border-orange-200',
  'event-planning': 'bg-orange-100 text-orange-800 border-orange-200',
  'advertising-distribution': 'bg-orange-100 text-orange-800 border-orange-200',
  'personal_assistant': 'bg-orange-100 text-orange-800 border-orange-200', // Legacy

  // Learning & Creative (Pink)
  'tutoring': 'bg-pink-100 text-pink-800 border-pink-200',
  'trainer-services': 'bg-pink-100 text-pink-800 border-pink-200',
  'photo-video': 'bg-pink-100 text-pink-800 border-pink-200',
  'design': 'bg-pink-100 text-pink-800 border-pink-200',
  'learning_fitness': 'bg-pink-100 text-pink-800 border-pink-200', // Legacy

  // Digital Services (Indigo)
  'web-development': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'digital-marketing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'online-advertising': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'online-work': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'ai-services': 'bg-indigo-100 text-indigo-800 border-indigo-200',

  // Translation Services (Teal)
  'translation-services': 'bg-teal-100 text-teal-800 border-teal-200',

  // Volunteer (Emerald)
  'volunteer-help': 'bg-emerald-100 text-emerald-800 border-emerald-200',
 };

 return mainCategoryColors[mainCategory] || 'bg-gray-100 text-gray-800 border-gray-200';
};

function TaskCard({ task, onApply, showApplyButton = true }: TaskCardProps) {
 const { t, i18n } = useTranslation();
 const router = useRouter();
 const pathname = usePathname();
 
 const getCategoryName = (category: string, subcategory?: string | null) => {
  // If subcategory exists, use it for display
  if (subcategory) {
   // Convert kebab-case to camelCase for translation key
   const camelCase = subcategory.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
   const subcategoryKey = `categories.sub.${camelCase}`;
   const translated = t(subcategoryKey, '');
   // If translation exists, use it; otherwise fall back to formatted subcategory
   if (translated) return translated;
   // Format subcategory as fallback (e.g., "courier-delivery" → "Courier Delivery")
   return subcategory.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
   ).join(' ');
  }

  // Fall back to main category
  const categoryKey = `taskCard.category.${category}`;
  return t(categoryKey, category);
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
 const categoryName = getCategoryName(task.category, task.subcategory);

 const formatBudget = () => {
  // Support both camelCase and snake_case from database
  const budgetType = task.budgetType || task.budget_type;
  const budgetMin = task.budgetMin || task.budget_min_bgn;
  const budgetMax = task.budgetMax || task.budget_max_bgn;

  if (budgetType === "fixed" && budgetMax) {
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
   className="w-full h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-primary-200"
   shadow="md"
   radius="lg"
  >
   <CardBody
    className="p-0 flex-grow flex flex-col cursor-pointer"
    onClick={handleCardPress}
   >
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
    <div className="flex gap-3 w-full">
     <Button
      variant="bordered"
      size="sm"
      className="flex-1"
      onPress={handleCardPress}
     >
      {t('taskCard.seeDetails', 'See details')}
     </Button>

     {showApplyButton && onApply && (
      <Button
       color="success"
       variant="solid"
       size="sm"
       className="flex-1 font-semibold shadow-md hover:shadow-lg transition-shadow"
       onPress={(e) => {
        e?.stopPropagation?.();
        onApply(task.id);
       }}
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