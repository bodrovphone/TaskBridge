'use client'

import { Avatar, Button as NextUIButton, Chip } from "@nextui-org/react";
import { Star, CheckCircle, X } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Application {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    completedTasks: number;
    specializations: string[];
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
}

export default function ApplicationsSection({ 
  applications, 
  onAcceptApplication, 
  onRejectApplication 
}: ApplicationsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 mt-4">
      {applications.map((application) => (
        <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
          {/* User Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar 
                src={application.user.avatar}
                name={application.user.name}
                className="w-12 h-12"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{application.user.name}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{application.user.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{application.user.completedTasks} {t('taskDetail.completedTasks')}</span>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-500">{application.timestamp}</span>
          </div>

          {/* Specializations */}
          <div className="flex gap-2 mb-3">
            {application.user.specializations.map((spec, index) => (
              <Chip key={index} size="sm" variant="flat" color="primary">
                {spec}
              </Chip>
            ))}
          </div>

          {/* Proposal */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {application.proposal}
          </p>

          {/* Price & Timeline */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-500">{t('taskDetail.price')}:</span>
                <span className="ml-2 font-semibold text-green-600">{application.price}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">{t('taskDetail.timeline')}:</span>
                <span className="ml-2 font-medium text-gray-900">{application.timeline}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {application.status === "pending" && (
            <div className="flex gap-3">
              <NextUIButton
                color="success"
                variant="solid"
                size="sm"
                startContent={<CheckCircle size={16} />}
                onClick={() => onAcceptApplication(application.id)}
              >
                {t('taskDetail.accept')}
              </NextUIButton>
              <NextUIButton
                color="danger"
                variant="bordered"
                size="sm"
                startContent={<X size={16} />}
                onClick={() => onRejectApplication(application.id)}
              >
                {t('taskDetail.reject')}
              </NextUIButton>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}