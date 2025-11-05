'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip, Tabs, Tab, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Textarea } from '@nextui-org/react'
import { Send, Calendar, Banknote, MapPin, User, X, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth'
import ApplicationDetailView from '@/features/applications/components/application-detail-view'
import type { MyApplication as MyApplicationType } from '@/features/applications/lib/types'
import { getCityLabelBySlug } from '@/features/cities'

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
  const { user } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('pending')
  const [applications, setApplications] = useState<MyApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawDialog, setWithdrawDialog] = useState<{
    isOpen: boolean
    applicationId: string | null
    taskTitle: string | null
  }>({
    isOpen: false,
    applicationId: null,
    taskTitle: null
  })
  const [withdrawReason, setWithdrawReason] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Detail modal state
  const [selectedDetailApplication, setSelectedDetailApplication] = useState<MyApplicationType | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Helper function to convert hours to user-friendly timeline text
  const formatTimeline = (hours: number | null | undefined): string => {
    if (!hours) return t('application.timelineFlexible')

    if (hours <= 24) return t('application.timelineToday')
    if (hours <= 72) return t('application.timeline3days')
    if (hours <= 168) return t('application.timelineWeek')

    // For custom durations, show hours with unit
    return `${hours}${t('application.hoursShort')}`
  }

  // Fetch applications from API
  useEffect(() => {
    if (!user) return

    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const statusParam = selectedStatus === 'all' ? '' : `?status=${selectedStatus}`
        const response = await fetch(`/api/applications${statusParam}`)

        if (response.ok) {
          const data = await response.json()

          // Map API data to component format
          const mapped = data.applications.map((app: any) => ({
            id: app.id,
            taskId: app.task.id,
            taskTitle: app.task.title,
            taskDescription: app.task.description,
            customerName: app.task.customer?.full_name || 'Unknown',
            customerAvatar: app.task.customer?.avatar_url,
            proposedPrice: app.proposed_price_bgn,
            timeline: formatTimeline(app.estimated_duration_hours),
            message: app.message,
            status: app.status,
            submittedAt: new Date(app.created_at),
            task: {
              budget: app.task.budget_max_bgn || 0,
              category: app.task.category,
              location: {
                city: app.task.city || '',
                neighborhood: app.task.neighborhood || ''
              }
            }
          }))
          setApplications(mapped)
        }
      } catch (error) {
        console.error('[Applications] Error fetching:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [user, selectedStatus])

  // @todo FEATURE: Remove mock applications once all sub-features are implemented (accept/reject/message actions)
  const mockApplications = getMockApplications(t)

  const filteredApplications = applications

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
    if (status === 'all') return applications.length
    return applications.filter(app => app.status === status).length
  }

  const handleWithdrawApplication = (appId: string, taskTitle: string) => {
    setWithdrawDialog({
      isOpen: true,
      applicationId: appId,
      taskTitle
    })
  }

  // Mapper function to convert API response to ApplicationDetailView format
  const mapToDetailFormat = (app: MyApplication): MyApplicationType => {
    return {
      id: app.id,
      taskId: app.taskId,
      task: {
        id: app.taskId,
        title: app.taskTitle,
        description: app.taskDescription,
        category: app.task.category,
        budget: {
          min: app.task.budget * 0.8, // Estimate min as 80% of max
          max: app.task.budget,
          type: 'fixed' as const
        },
        location: {
          city: app.task.location.city,
          neighborhood: app.task.location.neighborhood
        },
        status: 'open' as const
      },
      customer: {
        id: 'customer-id', // TODO: Get from API
        name: app.customerName,
        avatar: app.customerAvatar,
        rating: undefined,
        reviewsCount: undefined
      },
      myProposal: {
        price: app.proposedPrice,
        currency: 'BGN',
        timeline: app.timeline,
        message: app.message
      },
      status: app.status,
      appliedAt: app.submittedAt,
      respondedAt: undefined // TODO: Get from API
    }
  }

  const handleViewDetails = (application: MyApplication) => {
    const mapped = mapToDetailFormat(application)
    setSelectedDetailApplication(mapped)
    setIsDetailModalOpen(true)
  }

  const confirmWithdraw = async () => {
    if (!withdrawDialog.applicationId) return

    setIsWithdrawing(true)
    try {
      const response = await fetch(`/api/applications/${withdrawDialog.applicationId}/withdraw`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: withdrawReason || undefined
        })
      })

      if (response.ok) {
        // Update applications list
        setApplications(prev => prev.map(app =>
          app.id === withdrawDialog.applicationId
            ? { ...app, status: 'withdrawn' as const }
            : app
        ))
        // Close dialog
        setWithdrawDialog({ isOpen: false, applicationId: null, taskTitle: null })
        setWithdrawReason('')
      } else {
        const error = await response.json()
        alert(error.error || t('myApplications.withdrawError', 'Failed to withdraw application'))
      }
    } catch (error) {
      console.error('[Applications] Error withdrawing:', error)
      alert(t('myApplications.withdrawError', 'Failed to withdraw application'))
    } finally {
      setIsWithdrawing(false)
    }
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
              <Tab
                key="all"
                title={
                  <div className="flex items-center gap-2">
                    <span>{t('myApplications.filter.all')}</span>
                    <Chip size="sm" variant="flat">{getApplicationCountByStatus('all')}</Chip>
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
          <div className="space-y-6">
            {/* Real applications from API */}
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card
                  key={application.id}
                  className="shadow-lg border-2 border-orange-200 bg-orange-50/50 hover:shadow-xl transition-shadow"
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
                      <span>{getCityLabelBySlug(application.task.location.city, t)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{t('myApplications.submitted')}: {application.submittedAt.toLocaleDateString(lang)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center gap-2 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="bordered"
                        color="primary"
                        onPress={() => handleViewDetails(application)}
                      >
                        {t('myApplications.viewDetails', 'View Details')}
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="success"
                        onPress={() => router.push(`/${lang}/tasks/${application.taskId}`)}
                      >
                        {t('myApplications.viewTask')}
                      </Button>
                    </div>
                    {application.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        startContent={<X className="w-4 h-4" />}
                        onPress={() => handleWithdrawApplication(application.id, application.taskTitle)}
                      >
                        {t('myApplications.withdraw')}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
            </div>

            {/* @todo FEATURE: Mock applications for UI reference - remove once accept/reject/message actions are implemented */}
            {mockApplications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    Mock Applications (For UI Reference)
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>

                {mockApplications.map((application) => (
                  <Card
                    key={application.id}
                    className="shadow-lg border-2 border-orange-200 bg-orange-50/50 hover:shadow-xl transition-shadow"
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
                        <p className="text-sm text-blue-900 italic">&quot;{application.message}&quot;</p>
                      </div>

                      {/* Task Info */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{t('myApplications.taskBudget')}:</span>
                          <span className="font-semibold">{application.task.budget} BGN</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{getCityLabelBySlug(application.task.location.city, t)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{t('myApplications.submitted')}: {application.submittedAt.toLocaleDateString(lang)}</span>
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
                            onPress={() => console.log('Mock withdraw:', application.id)}
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
        )}
      </div>

      {/* Withdraw Application Dialog */}
      <Modal
        isOpen={withdrawDialog.isOpen}
        onClose={() => {
          setWithdrawDialog({ isOpen: false, applicationId: null, taskTitle: null })
          setWithdrawReason('')
        }}
        size="lg"
        placement="center"
        classNames={{
          base: "bg-white",
          backdrop: "bg-black/80",
          wrapper: "items-center"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b">
            <div className="flex items-center gap-2 text-danger">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-xl font-bold">{t('myApplications.withdrawDialog.title')}</h3>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                {t('myApplications.withdrawDialog.description', {
                  taskTitle: withdrawDialog.taskTitle || ''
                })}
              </p>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('myApplications.withdrawDialog.reason')}
                </label>
                <Select
                  placeholder={t('myApplications.withdrawDialog.selectReason', 'Select a reason (optional)')}
                  selectedKeys={withdrawReason ? [withdrawReason] : []}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  classNames={{
                    trigger: "bg-white border-gray-300"
                  }}
                >
                  <SelectItem key="unavailable" value="unavailable">
                    {t('myApplications.withdrawDialog.reasonUnavailable')}
                  </SelectItem>
                  <SelectItem key="found-work" value="found-work">
                    {t('myApplications.withdrawDialog.reasonFoundWork')}
                  </SelectItem>
                  <SelectItem key="changed" value="changed">
                    {t('myApplications.withdrawDialog.reasonChanged')}
                  </SelectItem>
                  <SelectItem key="price" value="price">
                    {t('myApplications.withdrawDialog.reasonPrice')}
                  </SelectItem>
                  <SelectItem key="other" value="other">
                    {t('myApplications.withdrawDialog.reasonOther')}
                  </SelectItem>
                </Select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  {t('myApplications.withdrawDialog.warning', 'Once withdrawn, you cannot reapply to this task.')}
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button
              variant="light"
              onPress={() => {
                setWithdrawDialog({ isOpen: false, applicationId: null, taskTitle: null })
                setWithdrawReason('')
              }}
              isDisabled={isWithdrawing}
            >
              {t('myApplications.withdrawDialog.cancel')}
            </Button>
            <Button
              color="danger"
              onPress={confirmWithdraw}
              isLoading={isWithdrawing}
              startContent={!isWithdrawing && <X className="w-4 h-4" />}
            >
              {t('myApplications.withdrawDialog.confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Application Detail Modal */}
      <ApplicationDetailView
        application={selectedDetailApplication}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDetailApplication(null)
        }}
        onWithdraw={(app) => {
          handleWithdrawApplication(app.id, app.task.title)
          setIsDetailModalOpen(false)
        }}
        onViewTask={(app) => {
          router.push(`/${lang}/tasks/${app.taskId}`)
        }}
      />
    </div>
  )
}
