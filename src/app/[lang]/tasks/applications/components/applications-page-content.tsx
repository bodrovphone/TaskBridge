'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip, Tabs, Tab, Avatar } from '@nextui-org/react'
import { Send, Calendar, Banknote, MapPin, User, X } from 'lucide-react'

interface ApplicationsPageContentProps {
  lang: string
}

type ApplicationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'

interface MyApplication {
  id: string
  taskId: string
  taskTitle: string
  taskDescription: string
  customerName: string
  customerAvatar?: string
  proposedPrice: number
  timeline: string
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  submittedAt: Date
  task: {
    budget: number
    category: string
    location: {
      city: string
      neighborhood: string
    }
  }
}

// Mock data for development - timeline keys reference translation keys
const getMockApplications = (t: (key: string) => string): MyApplication[] => [
  {
    id: 'app-1',
    taskId: 'task-1',
    taskTitle: 'Office relocation assistance needed',
    taskDescription: 'Need help moving office equipment to new location',
    customerName: 'Peter Ivanov',
    customerAvatar: undefined,
    proposedPrice: 250,
    timeline: t('myApplications.mockTimeline.thisWeekend'),
    message: 'I have experience with office relocations and own a van. Can complete this efficiently.',
    status: 'pending',
    submittedAt: new Date('2024-10-18'),
    task: {
      budget: 300,
      category: 'Moving & Transport',
      location: {
        city: 'Sofia',
        neighborhood: 'Business Park'
      }
    }
  },
  {
    id: 'app-2',
    taskId: 'task-2',
    taskTitle: 'Bathroom tile repair',
    taskDescription: 'Several tiles need to be replaced in bathroom',
    customerName: 'Elena Dimitrova',
    customerAvatar: undefined,
    proposedPrice: 180,
    timeline: t('myApplications.mockTimeline.nextWeek'),
    message: 'Professional tiler with 10 years experience. Can provide references.',
    status: 'accepted',
    submittedAt: new Date('2024-10-16'),
    task: {
      budget: 200,
      category: 'Home Repair',
      location: {
        city: 'Sofia',
        neighborhood: 'Lyulin'
      }
    }
  },
  {
    id: 'app-3',
    taskId: 'task-3',
    taskTitle: 'Dog walking - morning shifts',
    taskDescription: 'Need someone to walk my dog every morning',
    customerName: 'Georgi Petrov',
    customerAvatar: undefined,
    proposedPrice: 15,
    timeline: t('myApplications.mockTimeline.startMonday'),
    message: 'Dog lover with experience walking large breeds. Available every morning.',
    status: 'rejected',
    submittedAt: new Date('2024-10-14'),
    task: {
      budget: 20,
      category: 'Pet Care',
      location: {
        city: 'Sofia',
        neighborhood: 'Borisova Gradina'
      }
    }
  }
]

export function ApplicationsPageContent({ lang }: ApplicationsPageContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('all')

  // Get mock applications with localized timelines
  const mockApplications = getMockApplications(t)

  const filteredApplications = mockApplications.filter(app => {
    if (selectedStatus === 'all') return true
    return app.status === selectedStatus
  })

  const getStatusColor = (status: MyApplication['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'accepted':
        return 'success'
      case 'rejected':
        return 'danger'
      case 'withdrawn':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: MyApplication['status']) => {
    switch (status) {
      case 'pending':
        return t('myApplications.status.pending')
      case 'accepted':
        return t('myApplications.status.accepted')
      case 'rejected':
        return t('myApplications.status.rejected')
      case 'withdrawn':
        return t('myApplications.status.withdrawn')
      default:
        return status
    }
  }

  const getApplicationCountByStatus = (status: ApplicationStatus) => {
    if (status === 'all') return getMockApplications(t).length
    return getMockApplications(t).filter(app => app.status === status).length
  }

  const handleWithdrawApplication = (appId: string) => {
    // This would call an API to withdraw the application
    console.log('Withdrawing application:', appId)
    // TODO: Implement withdrawal logic
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Layered overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/50"></div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-56 h-56 bg-secondary-200 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                {t('myApplications.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('myApplications.subtitle')}</p>
            </div>
            <Button
              color="primary"
              size="lg"
              startContent={<Send className="w-5 h-5" />}
              onPress={() => router.push(`/${lang}/browse-tasks`)}
              className="shadow-lg"
            >
              {t('myApplications.browseButton')}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6 shadow-xl border border-white/20 bg-white/95">
          <CardBody className="p-4">
            <Tabs
              selectedKey={selectedStatus}
              onSelectionChange={(key) => setSelectedStatus(key as ApplicationStatus)}
              variant="light"
              classNames={{
                tabList: "gap-2 w-full bg-gray-50/50 p-2 rounded-lg",
                cursor: "bg-white shadow-md",
                tab: "h-10 px-4",
                tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold"
              }}
            >
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.all')}</span>
                    <Chip size="sm" variant="flat">{getApplicationCountByStatus('all')}</Chip>
                  </div>
                }
              />
              <Tab
                key="pending"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.pending')}</span>
                    <Chip size="sm" variant="flat" color="warning">{getApplicationCountByStatus('pending')}</Chip>
                  </div>
                }
              />
              <Tab
                key="accepted"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.accepted')}</span>
                    <Chip size="sm" variant="flat" color="success">{getApplicationCountByStatus('accepted')}</Chip>
                  </div>
                }
              />
              <Tab
                key="rejected"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.rejected')}</span>
                    <Chip size="sm" variant="flat" color="danger">{getApplicationCountByStatus('rejected')}</Chip>
                  </div>
                }
              />
              <Tab
                key="withdrawn"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.withdrawn')}</span>
                    <Chip size="sm" variant="flat">{getApplicationCountByStatus('withdrawn')}</Chip>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('myApplications.empty.title')}
              </h3>
              <p className="text-gray-500 mb-6">{t('myApplications.empty.message')}</p>
              <Button
                color="primary"
                size="lg"
                startContent={<Send className="w-5 h-5" />}
                onPress={() => router.push(`/${lang}/browse-tasks`)}
              >
                {t('myApplications.empty.browseButton')}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.id}
                className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar
                        name={application.customerName}
                        src={application.customerAvatar}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {application.taskTitle}
                          </h3>
                          <Chip
                            color={getStatusColor(application.status)}
                            variant="flat"
                            size="sm"
                          >
                            {getStatusLabel(application.status)}
                          </Chip>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <User className="w-4 h-4 inline mr-1" />
                          {application.customerName}
                        </p>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {application.taskDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      {t('myApplications.yourProposal')}
                    </h4>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-blue-900">
                          {application.proposedPrice} лв
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-800">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{application.timeline}</span>
                      </div>
                    </div>
                    <p className="text-sm text-blue-900 italic">"{application.message}"</p>
                  </div>

                  {/* Task Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">{t('myApplications.taskBudget')}:</span>
                      <span className="font-semibold">{application.task.budget} BGN</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{application.task.location.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{t('myApplications.submitted')}: {application.submittedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center gap-2 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => router.push(`/${lang}/tasks/${application.taskId}`)}
                    >
                      {t('myApplications.viewTask')}
                    </Button>
                    {application.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        startContent={<X className="w-4 h-4" />}
                        onPress={() => handleWithdrawApplication(application.id)}
                      >
                        {t('myApplications.withdraw')}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
