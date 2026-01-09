'use client'

import { ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { useTranslations } from 'next-intl';
import FallbackAvatar from "@/components/ui/fallback-avatar";

interface CustomerInfo {
 // Database fields (snake_case from API)
 id?: string;
 full_name?: string;
 avatar_url?: string | null;
 tasks_completed?: number;
 created_at?: string;
 preferred_language?: string;
}

interface PrivacyToggleProps {
 customer?: CustomerInfo | null;
 children: ReactNode;
 isOwner?: boolean;
}

export default function PrivacyToggle({ customer, children, isOwner = false }: PrivacyToggleProps) {
 const { user, profile } = useAuth();
 const isAuthenticated = !!user && !!profile;

 const t = useTranslations();

 // Handle missing customer data
 if (!customer) {
  return null;
 }

 // Get display name from full_name
 const displayName = customer.full_name || 'Anonymous User';

 const avatarUrl = customer.avatar_url ?? undefined;
 const completedTasksCount = customer.tasks_completed;
 const memberSinceDate = customer.created_at;

 return (
  <>
   <div className="flex items-center justify-between mb-3 sm:mb-4">
    <h3 className="text-base sm:text-lg font-bold text-gray-900">
     {t('taskDetail.client')}
    </h3>
   </div>

   <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 min-w-0">
    <FallbackAvatar
     src={avatarUrl}
     name={displayName}
     size="lg"
     userId={customer.id}
    />
    <div className="min-w-0">
     <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
      {isOwner
       ? displayName
       : displayName.split(' ').map((part, i) => i === 0 ? part : `${part[0]}.`).join(' ')
      }
     </h4>
     <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
      {children}
     </div>
    </div>
   </div>

   <div className="space-y-2 text-xs sm:text-sm text-gray-600">
    {completedTasksCount !== undefined && completedTasksCount !== null && (
     <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
       <span className="text-white text-xs">✓</span>
      </span>
      <span>{completedTasksCount} {t('taskDetail.completedTasks')}</span>
     </div>
    )}
    {memberSinceDate && (
     <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
       <span className="text-white text-xs">📅</span>
      </span>
      <span>{t('taskDetail.memberSince')} {new Date(memberSinceDate).toLocaleDateString()}</span>
     </div>
    )}
   </div>
  </>
 );
}