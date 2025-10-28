'use client'

import { ReactNode } from "react";
import { Lock, User } from "lucide-react";
import { Avatar } from "@nextui-org/react";
import { useAuth } from "@/features/auth";
import { useTranslation } from 'react-i18next';

interface CustomerInfo {
 firstName: string;
 lastName: string;
 profileImageUrl?: string;
 averageRating?: string;
 totalReviews?: number;
 completedTasks?: number;
 memberSince: string;
}

interface PrivacyToggleProps {
 customer: CustomerInfo;
 children: ReactNode;
}

export default function PrivacyToggle({ customer, children }: PrivacyToggleProps) {
 const { user, profile } = useAuth();
 const isAuthenticated = !!user && !!profile;

 // Show full client info only if user is authenticated
 const showClientInfo = isAuthenticated;

 const { t } = useTranslation();
 
 return (
  <>
   <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-gray-900">
     {t('taskDetail.client')}
    </h3>
    {!isAuthenticated && (
     <div className="flex items-center gap-1 text-gray-500 text-sm">
      <Lock size={14} />
      <span>{t('taskDetail.loginForMore')}</span>
     </div>
    )}
   </div>
   
   <div className="flex items-center gap-4 mb-4">
    <div className="relative">
     <Avatar 
      src={showClientInfo ? customer.profileImageUrl : undefined}
      name={showClientInfo ? `${customer.firstName[0]}${customer.lastName[0]}` : "?"}
      className={`w-16 h-16 ${!showClientInfo ? 'opacity-50' : ''}`}
     />
     {!showClientInfo && (
      <div className="absolute inset-0 bg-gray-400/50 rounded-full flex items-center justify-center">
       <User size={24} className="text-white" />
      </div>
     )}
    </div>
    <div>
     <h4 className="font-semibold text-gray-900">
      {showClientInfo ? 
       `${customer.firstName} ${customer.lastName}` : 
       `${customer.firstName} ${customer.lastName[0]}.`
      }
     </h4>
     <div className="flex items-center gap-2 text-sm text-gray-600">
      {children}
     </div>
     {!showClientInfo && (
      <p className="text-xs text-gray-500 mt-1">
       {t('taskDetail.loginMessage')}
      </p>
     )}
    </div>
   </div>

   <div className={`space-y-2 text-sm text-gray-600 transition-opacity duration-300 ${!showClientInfo ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-2">
     <span className="w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">✓</span>
     </span>
     <span>{customer.completedTasks} {t('taskDetail.completedTasks')}</span>
    </div>
    <div className="flex items-center gap-2">
     <span className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">📅</span>
     </span>
     <span>{t('taskDetail.memberSince')} {new Date(customer.memberSince).toLocaleDateString()}</span>
    </div>
   </div>
  </>
 );
}