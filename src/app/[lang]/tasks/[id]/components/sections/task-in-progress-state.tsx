'use client'

import { Card, CardBody, Avatar } from "@nextui-org/react";
import { CheckCircle, Star } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Application } from '@/types/applications';
import { getCityLabelBySlug } from '@/features/cities';

interface TaskInProgressStateProps {
  acceptedApplication: Application;
}

export default function TaskInProgressState({ acceptedApplication }: TaskInProgressStateProps) {
  const { t } = useTranslation();

  const { professional } = acceptedApplication;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t('taskInProgress.title', 'Task In Progress!')}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('taskInProgress.description', 'You have accepted an application. Your task is now in progress with a professional.')}
        </p>
      </div>

      {/* Professional Card */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardBody className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={professional.avatar || ''}
              name={professional.name}
              className="w-16 h-16"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {t('taskInProgress.workingWith', 'Working with')} {professional.name}
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{professional.rating}</span>
                </div>
                {professional.completedTasks > 0 && (
                  <>
                    <span>•</span>
                    <span>{professional.completedTasks} {t('taskDetail.completedTasks')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-2 text-sm">
            {professional.skills?.[0] && (
              <div className="text-gray-700">
                <span className="font-medium">{t('taskInProgress.specialization', 'Specialization')}:</span> {t(professional.skills[0])}
              </div>
            )}
            {professional.city && (
              <div className="text-gray-700">
                <span className="font-medium">{t('taskInProgress.location', 'Location')}:</span> {getCityLabelBySlug(professional.city, t)}
              </div>
            )}
            <div className="text-gray-700">
              <span className="font-medium">{t('taskInProgress.agreedPrice', 'Agreed Price')}:</span> {acceptedApplication.proposedPrice} {acceptedApplication.currency}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          {t('taskInProgress.infoMessage', 'All other applications have been automatically rejected. You can track the progress of your task and communicate with the professional through your task management page.')}
        </p>
      </div>
    </div>
  );
}
