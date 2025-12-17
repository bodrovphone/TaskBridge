'use client'

import { ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { useTranslations } from 'next-intl';
import FallbackAvatar from "@/components/ui/fallback-avatar";

interface CustomerInfo {
 // Mock data fields (camelCase)
 firstName?: string;
 lastName?: string;
 profileImageUrl?: string;
 completedTasks?: number;
 memberSince?: string;

 // Database fields (snake_case from API)
 id?: string;
 full_name?: string;
 avatar_url?: string;
 tasks_completed?: number;
 created_at?: string;
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

 // Handle both database (full_name) and mock (firstName/lastName) formats
 let displayName = '';
 let initials = '?';

 if (customer.full_name) {
  // Database format - split full_name
  displayName = customer.full_name;
  const nameParts = customer.full_name.split(' ');
  initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : customer.full_name.substring(0, 2).toUpperCase();
 } else if (customer.firstName || customer.lastName) {
  // Mock format - combine firstName and lastName
  const firstName = customer.firstName || 'Anonymous';
  const lastName = customer.lastName || 'User';
  displayName = `${firstName} ${lastName}`;
  initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
 } else {
  displayName = 'Anonymous User';
 }

 // Handle avatar URL (both formats)
 const avatarUrl = customer.avatar_url || customer.profileImageUrl;

 // Handle completed tasks (both formats)
 const completedTasksCount = customer.tasks_completed ?? customer.completedTasks;

 // Handle member since date (both formats)
 const memberSinceDate = customer.created_at || customer.memberSince;

 return (
  <>
   <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-gray-900">
     {t('taskDetail.client')}
    </h3>
   </div>

   <div className="flex items-center gap-4 mb-4">
    <FallbackAvatar
     src={avatarUrl}
     name={displayName}
     size="lg"
     userId={customer.id}
    />
    <div>
     <h4 className="font-semibold text-gray-900">
      {isOwner
       ? displayName
       : displayName.split(' ').map((part, i) => i === 0 ? part : `${part[0]}.`).join(' ')
      }
     </h4>
     <div className="flex items-center gap-2 text-sm text-gray-600">
      {children}
     </div>
    </div>
   </div>

   <div className="space-y-2 text-sm text-gray-600">
    {completedTasksCount !== undefined && completedTasksCount !== null && (
     <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
       <span className="text-white text-xs">✓</span>
      </span>
      <span>{completedTasksCount} {t('taskDetail.completedTasks')}</span>
     </div>
    )}
    {memberSinceDate && (
     <div className="flex items-center gap-2">
      <span className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
       <span className="text-white text-xs">📅</span>
      </span>
      <span>{t('taskDetail.memberSince')} {new Date(memberSinceDate).toLocaleDateString()}</span>
     </div>
    )}
   </div>
  </>
 );
}