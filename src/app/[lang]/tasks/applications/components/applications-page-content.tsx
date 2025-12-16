'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Chip, Tabs, Tab, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem } from '@nextui-org/react'
import { Send, Calendar, Banknote, MapPin, User, X, AlertCircle, Briefcase, Search } from 'lucide-react'
import { useApplications, type MyApplication } from '@/hooks/use-applications'
import ApplicationDetailView from '@/features/applications/components/application-detail-view'
import type { MyApplication as MyApplicationType } from '@/features/applications/lib/types'
import { getCityLabelBySlug } from '@/features/cities'

interface ApplicationsPageContentProps {
  lang: string
}

type ApplicationStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export function ApplicationsPageContent({ lang }: ApplicationsPageContentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('pending')

  // Use TanStack Query hook for applications - fetch ALL applications
  const { applications, isLoading, error, withdraw, isWithdrawing } = useApplications('all', t)
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

  // Detail modal state
  const [selectedDetailApplication, setSelectedDetailApplication] = useState<MyApplicationType | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filter applications on frontend based on selected tab
  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus)

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
        currency: 'EUR',
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

    try {
      await withdraw({
        applicationId: withdrawDialog.applicationId,
        reason: withdrawReason || undefined
      })

      // Success! Close dialog (refetch handled automatically by TanStack Query)
      setWithdrawDialog({ isOpen: false, applicationId: null, taskTitle: null })
      setWithdrawReason('')
    } catch (error: any) {
      console.error('[Applications] Error withdrawing:', error)
      alert(error.message || t('myApplications.withdrawError', 'Failed to withdraw application'))
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                {t('myApplications.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('myApplications.subtitle')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="lg"
                variant="flat"
                onPress={() => router.push(`/${lang}/browse-tasks`)}
                startContent={<Search className="w-5 h-5" />}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex-1 sm:flex-none"
              >
                {t('nav.browseTasks')}
              </Button>
              <Button
                size="lg"
                variant="flat"
                onPress={() => router.push(`/${lang}/tasks/work`)}
                startContent={<Briefcase className="w-5 h-5" />}
                className="bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 flex-1 sm:flex-none"
              >
                {t('nav.myWork')}
              </Button>
            </div>
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
                size="lg"
                variant="flat"
                onPress={() => router.push(`/${lang}/browse-tasks`)}
                startContent={<Search className="w-5 h-5" />}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                {t('nav.browseTasks')}
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
                          {application.proposedPrice} €
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
                      <span className="font-semibold">{application.task.budget} €</span>
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="bordered"
                        color="primary"
                        onPress={() => handleViewDetails(application)}
                        className="w-full sm:w-auto"
                      >
                        {t('myApplications.viewDetails', 'View Details')}
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="success"
                        onPress={() => router.push(`/${lang}/tasks/${application.taskId}`)}
                        className="w-full sm:w-auto"
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
                        className="w-full sm:w-auto"
                      >
                        {t('myApplications.withdraw')}
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
            </div>
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
