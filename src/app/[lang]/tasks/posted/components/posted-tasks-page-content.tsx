'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip, Tabs, Tab } from '@nextui-org/react'
import { FileText, Users, Calendar, DollarSign, MapPin, Plus } from 'lucide-react'

interface PostedTasksPageContentProps {
  lang: string
}

type TaskStatus = 'all' | 'open' | 'in_progress' | 'completed' | 'cancelled'

interface PostedTask {
  id: string
  title: string
  description: string
  category: string
  budget: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applicationsCount: number
  acceptedApplication?: {
    professionalId: string
    professionalName: string
  }
  location: {
    city: string
    neighborhood: string
  }
  createdAt: Date
  deadline?: Date
}

// Mock data for development
const mockPostedTasks: PostedTask[] = [
  {
    id: '1',
    title: 'Electrical outlet installation in living room',
    description: 'Need to install 3 additional power outlets in the living room',
    category: 'Electrical Work',
    budget: 150,
    status: 'open',
    applicationsCount: 5,
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets'
    },
    createdAt: new Date('2024-10-15'),
    deadline: new Date('2024-10-25')
  },
  {
    id: '2',
    title: 'Weekly apartment cleaning',
    description: 'Looking for regular cleaning service every Tuesday',
    category: 'Cleaning',
    budget: 80,
    status: 'in_progress',
    applicationsCount: 8,
    acceptedApplication: {
      professionalId: 'prof-1',
      professionalName: 'Maria Petrova'
    },
    location: {
      city: 'Sofia',
      neighborhood: 'Center'
    },
    createdAt: new Date('2024-10-10'),
  },
  {
    id: '3',
    title: 'Plumbing repair - leaking sink',
    description: 'Kitchen sink is leaking, needs urgent repair',
    category: 'Plumbing',
    budget: 100,
    status: 'completed',
    applicationsCount: 3,
    acceptedApplication: {
      professionalId: 'prof-2',
      professionalName: 'Ivan Georgiev'
    },
    location: {
      city: 'Sofia',
      neighborhood: 'Mladost'
    },
    createdAt: new Date('2024-10-05'),
  }
]

export function PostedTasksPageContent({ lang }: PostedTasksPageContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('all')

  const filteredTasks = mockPostedTasks.filter(task => {
    if (selectedStatus === 'all') return true
    return task.status === selectedStatus
  })

  const getStatusColor = (status: PostedTask['status']) => {
    switch (status) {
      case 'open':
        return 'primary'
      case 'in_progress':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: PostedTask['status']) => {
    switch (status) {
      case 'open':
        return t('postedTasks.filter.open')
      case 'in_progress':
        return t('postedTasks.filter.inProgress')
      case 'completed':
        return t('postedTasks.filter.completed')
      case 'cancelled':
        return t('postedTasks.filter.cancelled')
      default:
        return status
    }
  }

  const getTaskCountByStatus = (status: TaskStatus) => {
    if (status === 'all') return mockPostedTasks.length
    return mockPostedTasks.filter(task => task.status === status).length
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
                {t('postedTasks.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('postedTasks.subtitle')}</p>
            </div>
            <Button
              color="primary"
              size="lg"
              startContent={<Plus className="w-5 h-5" />}
              onPress={() => router.push(`/${lang}/create-task`)}
              className="shadow-lg"
            >
              {t('postedTasks.createTask')}
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6 shadow-xl border border-white/20 bg-white/95">
          <CardBody className="p-4">
            <Tabs
              selectedKey={selectedStatus}
              onSelectionChange={(key) => setSelectedStatus(key as TaskStatus)}
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
                    <span>{t('postedTasks.filter.all')}</span>
                    <Chip size="sm" variant="flat">{getTaskCountByStatus('all')}</Chip>
                  </div>
                }
              />
              <Tab
                key="open"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.open')}</span>
                    <Chip size="sm" variant="flat" color="primary">{getTaskCountByStatus('open')}</Chip>
                  </div>
                }
              />
              <Tab
                key="in_progress"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.inProgress')}</span>
                    <Chip size="sm" variant="flat" color="warning">{getTaskCountByStatus('in_progress')}</Chip>
                  </div>
                }
              />
              <Tab
                key="completed"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.completed')}</span>
                    <Chip size="sm" variant="flat" color="success">{getTaskCountByStatus('completed')}</Chip>
                  </div>
                }
              />
              <Tab
                key="cancelled"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('postedTasks.filter.cancelled')}</span>
                    <Chip size="sm" variant="flat" color="danger">{getTaskCountByStatus('cancelled')}</Chip>
                  </div>
                }
              />
            </Tabs>
          </CardBody>
        </Card>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('postedTasks.empty.title')}
              </h3>
              <p className="text-gray-500 mb-6">{t('postedTasks.empty.message')}</p>
              <Button
                color="primary"
                size="lg"
                startContent={<Plus className="w-5 h-5" />}
                onPress={() => router.push(`/${lang}/create-task`)}
              >
                {t('postedTasks.empty.createButton')}
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                isPressable
                onPress={() => router.push(`/${lang}/tasks/${task.id}`)}
                className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <Chip
                          color={getStatusColor(task.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(task.status)}
                        </Chip>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">{task.budget} BGN</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{task.location.city}, {task.location.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{task.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-primary">
                        {t('postedTasks.applicationsCount', { count: task.applicationsCount })}
                      </span>
                    </div>
                  </div>

                  {task.acceptedApplication && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">{t('postedTasks.acceptedProfessional')}:</span>{' '}
                        {task.acceptedApplication.professionalName}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => router.push(`/${lang}/tasks/${task.id}`)}
                    >
                      {t('postedTasks.viewDetails')}
                    </Button>
                    {task.applicationsCount > 0 && (
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={() => router.push(`/${lang}/tasks/${task.id}#applications`)}
                      >
                        {t('postedTasks.viewApplications')} ({task.applicationsCount})
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
