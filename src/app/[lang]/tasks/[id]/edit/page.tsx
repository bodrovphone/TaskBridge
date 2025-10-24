'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Chip } from '@nextui-org/react'
import { useParams } from 'next/navigation'
import { Edit, CheckCircle, Clock, Shield, Users } from 'lucide-react'
import { EditTaskForm } from './components/edit-task-form'

export default function EditTaskPage() {
  const { t } = useTranslation()
  const params = useParams()
  const taskId = params?.id as string

  // Mock task data - In production, this would be fetched from API
  const mockTaskData = {
    id: taskId,
    title: 'Electrical outlet installation in living room',
    description: 'Need to install 3 additional power outlets in the living room. The outlets should be installed at standard height and properly grounded.',
    category: 'electrical', // Should be the subcategory slug
    subcategory: 'electrical',
    city: 'София',
    neighborhood: 'Lozenets',
    exactAddress: '',
    budgetType: 'range' as const,
    budgetMin: 100,
    budgetMax: 200,
    urgency: 'within_week' as const,
    deadline: new Date('2024-10-25'),
    photos: [],
    requirements: 'Professional electrician with valid certification required'
  }

  const trustIndicators = [
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: t('createTask.hero.freeToPost', 'Free to edit'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: t('createTask.hero.noPayment', 'No payment until work starts'),
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: t('createTask.hero.avgResponse', 'Changes saved instantly'),
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: t('createTask.hero.verifiedPros', 'Professionals will see updates'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Hero Section with Edit Banner */}
        <div className="text-center mb-12">
          {/* Editing Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6 flex items-center justify-center gap-3">
            <Edit className="w-6 h-6 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {t('editTask.editingBanner', { title: mockTaskData.title })}
              </p>
              <p className="text-xs text-amber-700">
                {t('editTask.editingSubtext', 'Make changes to improve your task')}
              </p>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t('editTask.title', 'Edit Task')}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('editTask.subtitle', 'Update your task details to attract more professionals')}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-3 max-w-full overflow-x-hidden px-4">
            {trustIndicators.map((indicator, index) => (
              <Chip
                key={index}
                startContent={indicator.icon}
                variant="flat"
                color="success"
                size="lg"
                className="shadow-sm flex-shrink-0 max-w-full"
                classNames={{
                  base: "max-w-full bg-green-100",
                  content: "truncate text-green-800"
                }}
              >
                {indicator.text}
              </Chip>
            ))}
          </div>
        </div>

        {/* Form - No outer card, each section has its own card */}
        <div className="space-y-6 mb-12">
          <EditTaskForm taskData={mockTaskData} />
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500">
          {t('editTask.help', 'Need help? Contact our support team')}
        </p>
      </div>
    </div>
  )
}
