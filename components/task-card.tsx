import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Wallet, Star } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { bg, enUS, ru } from "date-fns/locale";
import { useTranslation } from 'react-i18next';
import type { Task } from "@shared/schema";

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
  "home_repair": "bg-blue-100 text-blue-800",
  "delivery_transport": "bg-green-100 text-green-800", 
  "personal_care": "bg-purple-100 text-purple-800",
  "personal_assistant": "bg-orange-100 text-orange-800",
  "learning_fitness": "bg-pink-100 text-pink-800",
  "other": "bg-gray-100 text-gray-800"
};

export default function TaskCard({ task, onApply, showApplyButton = true }: TaskCardProps) {
  const { t, i18n } = useTranslation();
  
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

  const getCategoryImage = (category: string) => {
    const imageMap = {
      'home_repair': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=300&fit=crop&crop=center', // Tools and repair work
      'delivery_transport': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop&crop=center', // Delivery person with packages
      'personal_care': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=center', // Beauty/care services
      'personal_assistant': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center', // Office/administrative work
      'learning_fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center', // Fitness training
      'other': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center' // General services/business
    };
    return imageMap[category as keyof typeof imageMap] || imageMap.other;
  };

  const timeAgo = formatDistanceToNow(new Date(task.createdAt), {
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

  return (
    <Card className="hover:shadow-lg transition-all hover:border-primary-200 cursor-pointer overflow-hidden">
      <div className="w-full h-48 bg-gray-200 overflow-hidden">
        <img 
          src={task.imageUrl || getCategoryImage(task.category)} 
          alt={task.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge className={categoryColor}>
            {categoryName}
          </Badge>
          <span className="text-sm text-gray-500">{timeAgo}</span>
        </div>
        
        <Link href={`/tasks/${task.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
            {task.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{task.city}{task.neighborhood && `, ${task.neighborhood}`}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>{formatDeadline()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Wallet size={16} className="mr-2" />
            <span>{formatBudget()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.customer?.profileImageUrl || ""} />
              <AvatarFallback className="text-xs">
                {task.customer?.firstName?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {task.customer?.firstName ? 
                `${task.customer.firstName} ${task.customer.lastName?.[0] || ""}.` : 
                "Анонимен"
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
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700"
              onClick={(e) => {
                e.preventDefault();
                onApply(task.id);
              }}
            >
              Кандидатствай
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
