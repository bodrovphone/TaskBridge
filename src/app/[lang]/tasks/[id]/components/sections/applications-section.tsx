'use client'

import { Avatar, Button as NextUIButton, Chip, Tooltip } from "@nextui-org/react";
import { Star, CheckCircle, X, Eye } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getTimelineLabel } from '@/lib/utils/timeline';

interface Application {
 id: string;
 user: {
  name: string;
  avatar: string | null;  // Maps to avatar_url from database
  rating: number;
  completedTasks: number;
  skills: string[];  // Maps to service_categories in database
 };
 proposal: string;
 price: string;
 timeline: string;
 timestamp: string;
 status: string;
}

interface ApplicationsSectionProps {
 applications: Application[];
 onAcceptApplication: (id: string) => void;
 onRejectApplication: (id: string) => void;
 onViewDetails: (id: string) => void;
}

export default function ApplicationsSection({
 applications,
 onAcceptApplication,
 onRejectApplication,
 onViewDetails
}: ApplicationsSectionProps) {
 const t = useTranslations();

 return (
  <div className="space-y-4 mt-4">
   {applications.map((application) => (
    <div key={application.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
     {/* User Header */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
      <div className="flex items-center gap-3 min-w-0">
       <Avatar
        src={application.user.avatar || undefined}
        name={application.user.name}
        className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
       />
       <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-gray-900 truncate">{application.user.name}</h4>
        {/* Specialization */}
        {application.user.skills?.[0] && (
         <div className="text-sm text-gray-600 mb-1 truncate">
          {t(application.user.skills[0])}
         </div>
        )}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 flex-wrap">
         {/* Rating with fresh professional tooltip */}
         {application.user.rating === 0 ? (
          <Tooltip
           content={t('applications.freshProfessional')}
           placement="top"
          >
           <div className="flex items-center gap-1 cursor-help">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-gray-300 text-gray-300" />
            <span className="text-gray-500">{t('applications.new')}</span>
           </div>
          </Tooltip>
         ) : (
          <div className="flex items-center gap-1">
           <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
           <span>{application.user.rating}</span>
          </div>
         )}
         {/* Only show completed tasks if > 0 */}
         {application.user.completedTasks > 0 && (
          <>
           <span>•</span>
           <span className="whitespace-nowrap">{application.user.completedTasks} {t('taskDetail.completedTasks')}</span>
          </>
         )}
        </div>
       </div>
      </div>
      <span className="text-xs sm:text-sm text-gray-500 self-start sm:self-auto">{application.timestamp}</span>
     </div>

     {/* Skills/Categories */}
     <div className="flex flex-wrap gap-2 mb-3">
      {application.user.skills?.map((skill, index) => (
       <Chip key={index} size="sm" variant="flat" color="primary" className="text-xs">
        {t(skill)}
       </Chip>
      ))}
     </div>

     {/* Proposal */}
     <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed break-words">
      {application.proposal}
     </p>

     {/* Price & Timeline */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
       <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-500">{t('taskDetail.price')}:</span>
        <span className="font-semibold text-green-600 whitespace-nowrap">{application.price}</span>
       </div>
       <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm text-gray-500">{t('taskDetail.timeline')}:</span>
        <span className="font-medium text-gray-900">{getTimelineLabel(application.timeline, t)}</span>
       </div>
      </div>
     </div>

     {/* Action Buttons */}
     <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {/* Accept button first on mobile */}
      {application.status === "pending" && (
       <NextUIButton
        color="success"
        variant="solid"
        size="sm"
        startContent={<CheckCircle size={14} />}
        onPress={() => onAcceptApplication(application.id)}
        className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-auto"
       >
        {t('taskDetail.accept')}
       </NextUIButton>
      )}

      <NextUIButton
       color="primary"
       variant="bordered"
       size="sm"
       startContent={<Eye size={14} />}
       onPress={() => onViewDetails(application.id)}
       className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-auto"
      >
       {t('applications.viewDetails')}
      </NextUIButton>

      {application.status === "pending" && (
       <NextUIButton
        color="danger"
        variant="bordered"
        size="sm"
        startContent={<X size={14} />}
        onPress={() => onRejectApplication(application.id)}
        className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-auto"
       >
        {t('taskDetail.reject')}
       </NextUIButton>
      )}
     </div>
    </div>
   ))}
  </div>
 );
}