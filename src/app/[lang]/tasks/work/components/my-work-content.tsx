'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Button, Avatar, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Image } from '@heroui/react'
import { Briefcase, Calendar, Mail, MapPin, User, Banknote, Send, AlertCircle, LogOut, CheckCircle, MessageCircle, ClipboardList, Search } from 'lucide-react'
import { MarkCompletedDialog } from '@/components/tasks/mark-completed-dialog'
import { PhoneContactActions } from '@/components/ui/phone-contact-actions'
import { ProfessionalWithdrawDialog } from '@/components/tasks/professional-withdraw-dialog'
import { AuthRequiredBanner } from '@/components/common/auth-required-banner'
import { useAuth } from '@/features/auth'
import { getCityLabelBySlug } from '@/features/cities'
import { useWorkTasks, type WorkTask } from '../hooks/use-work-tasks'

interface MyWorkContentProps {
  lang: string
}

// Helper to detect if a string looks like a phone number
const isPhoneNumber = (text: string): boolean => {
  // Clean the text and check if it looks like a phone number
  const cleaned = text.replace(/[\s\-\(\)\.]/g, '')
  // Match patterns: starts with + or 0, 8-15 digits total
  return /^[\+]?[0-9]{8,15}$/.test(cleaned)
}

// Helper to detect if a string is a Telegram username
const isTelegramUsername = (text: string): boolean => {
  // Telegram usernames start with @ and are 5-32 characters (letters, numbers, underscores)
  return /^@[a-zA-Z0-9_]{4,31}$/.test(text.trim())
}

// Get Telegram username without @ for URL
const getTelegramUsername = (text: string): string => {
  return text.trim().replace(/^@/, '')
}

// Clean phone number for tel: href
const cleanPhoneForHref = (phone: string): string => {
  return phone.replace(/[\s\-\(\)\.]/g, '')
}

type WorkFilter = 'in_progress' | 'completed'

export function MyWorkContent({ lang }: MyWorkContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState<WorkFilter>('in_progress')
  const [isMarkCompletedDialogOpen, setIsMarkCompletedDialogOpen] = useState(false)
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState<WorkTask | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [selectedTaskForWithdrawal, setSelectedTaskForWithdrawal] = useState<WorkTask | null>(null)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawalSuccessModalOpen, setWithdrawalSuccessModalOpen] = useState(false)
  const [withdrawalErrorModalOpen, setWithdrawalErrorModalOpen] = useState(false)
  const [withdrawalErrorMessage, setWithdrawalErrorMessage] = useState('')

  // @todo INTEGRATION: Fetch from user's professional profile/stats
  const withdrawalsThisMonth = 0 // Mock data
  const maxWithdrawalsPerMonth = 2 // As per PRD

  // Fetch accepted applications from API (only if authenticated)
  const { tasks: workTasks, isLoading, error, refetch, markComplete, withdraw, isMarkingComplete: isMutatingComplete, isWithdrawing: isMutatingWithdraw } = useWorkTasks()

  // Show auth banner for non-authenticated users
  if (!authLoading && !user) {
    return (
      <div
        className="min-h-screen relative"
        style={{
          backgroundImage: 'url(/images/cardboard.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/50"></div>
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              {t('myWork.title')}
            </h1>
            <p className="text-gray-600 mt-1">{t('myWork.subtitle')}</p>
          </div>
          <AuthRequiredBanner
            title={t('myWork.auth.title')}
            description={t('myWork.auth.description')}
            hint={t('myWork.auth.hint')}
          />
        </div>
      </div>
    )
  }

  const filteredTasks = workTasks.filter(task => {
    switch (selectedFilter) {
      case 'in_progress':
        return task.task.status === 'in_progress'
      case 'completed':
        return task.task.status === 'completed'
      default:
        return true
    }
  })

  const getTaskCountByFilter = (filter: WorkFilter) => {
    return workTasks.filter(task => {
      switch (filter) {
        case 'in_progress':
          return task.task.status === 'in_progress'
        case 'completed':
          return task.task.status === 'completed'
        default:
          return false
      }
    }).length
  }

  const getDaysStarted = (startDate?: Date) => {
    if (!startDate) return 0
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleMarkAsCompleteClick = (task: WorkTask) => {
    setSelectedTaskForCompletion(task)
    setIsMarkCompletedDialogOpen(true)
  }

  const handleMarkCompletedConfirm = async (data: any) => {
    if (!selectedTaskForCompletion) return

    setIsMarkingComplete(true)
    try {
      await markComplete({
        taskId: selectedTaskForCompletion.taskId,
        data: {
          completionNotes: data.notes,
          completionPhotos: data.completionPhotos?.map((file: File) => file.name) // @todo: Upload photos to Supabase Storage first
        }
      })

      // Success! Close dialog (refetch handled automatically by TanStack Query)
      setIsMarkCompletedDialogOpen(false)
      setSelectedTaskForCompletion(null)
    } catch (error: any) {
      console.error('Error marking task complete:', error)
      // Map error codes to localized messages
      let errorMessage = t('common.errorGeneric')
      if (error.code === 'TASK_ALREADY_COMPLETED') {
        errorMessage = t('taskCompletion.error.alreadyCompleted')
      } else if (error.code === 'TASK_INVALID_STATUS') {
        errorMessage = t('taskCompletion.error.invalidStatus')
      } else if (error.message) {
        errorMessage = error.message
      }
      alert(errorMessage)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const handleWithdrawClick = (task: WorkTask) => {
    setSelectedTaskForWithdrawal(task)
    setIsWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = async (reason?: string) => {
    if (!selectedTaskForWithdrawal) return

    setIsWithdrawing(true)
    try {
      await withdraw({
        taskId: selectedTaskForWithdrawal.taskId,
        reason
      })

      // Success! Close dialog (refetch handled automatically by TanStack Query)
      setIsWithdrawDialogOpen(false)
      setSelectedTaskForWithdrawal(null)

      // Show success modal
      setWithdrawalSuccessModalOpen(true)
    } catch (error: any) {
      console.error('Error withdrawing from task:', error)
      setWithdrawalErrorMessage(error.message || t('professionalWithdraw.error'))
      setWithdrawalErrorModalOpen(true)
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Convert filter key to translation key format
  const getEmptyStateKey = (filter: WorkFilter) => {
    switch (filter) {
      case 'in_progress':
        return 'inProgress'
      case 'completed':
        return 'completed'
      default:
        return 'inProgress'
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.webp)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Layered overlays */}
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
                {t('myWork.title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('myWork.subtitle')}</p>
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
                onPress={() => router.push(`/${lang}/tasks/applications`)}
                startContent={<ClipboardList className="w-5 h-5" />}
                className="bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 flex-1 sm:flex-none"
              >
                {t('nav.myApplications')}
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => setSelectedFilter('in_progress')}
            className={`
              flex items-center justify-center gap-2 py-3 px-3 sm:py-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${selectedFilter === 'in_progress'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">{t('myWork.filter.inProgress')}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold flex-shrink-0
              ${selectedFilter === 'in_progress'
                ? 'bg-white/20 text-white'
                : 'bg-blue-100 text-blue-600'
              }
            `}>
              {getTaskCountByFilter('in_progress')}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('completed')}
            className={`
              flex items-center justify-center gap-2 py-3 px-3 sm:py-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200
              ${selectedFilter === 'completed'
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }
            `}
          >
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="truncate">{t('myWork.filter.completed')}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold flex-shrink-0
              ${selectedFilter === 'completed'
                ? 'bg-white/20 text-white'
                : 'bg-green-100 text-green-600'
              }
            `}>
              {getTaskCountByFilter('completed')}
            </span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">{t('myWork.loading')}</p>
            </CardBody>
          </Card>
        ) : error ? (
          /* Error State */
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('myWork.error.title')}
              </h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <Button
                color="primary"
                size="lg"
                onPress={() => window.location.reload()}
              >
                {t('common.retry')}
              </Button>
            </CardBody>
          </Card>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <Card className="shadow-xl border border-white/20 bg-white/95">
            <CardBody className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t(`myWork.empty.${getEmptyStateKey(selectedFilter)}.title`)}
              </h3>
              <p className="text-gray-500 mb-6">{t(`myWork.empty.${getEmptyStateKey(selectedFilter)}.message`)}</p>
              {selectedFilter === 'in_progress' && (
                <Button
                  size="lg"
                  variant="flat"
                  onPress={() => router.push(`/${lang}/browse-tasks`)}
                  startContent={<Search className="w-5 h-5" />}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                >
                  {t('nav.browseTasks')}
                </Button>
              )}
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="shadow-lg border border-white/20 bg-white/95 hover:shadow-xl transition-shadow h-full flex flex-col"
              >
                {/* Task Image */}
                {task.taskImages && task.taskImages.length > 0 && (
                  <div className="relative w-full h-52 overflow-hidden rounded-t-xl">
                    <Image
                      src={task.taskImages[0]}
                      alt={task.taskTitle}
                      classNames={{
                        wrapper: "w-full h-full !max-w-full",
                        img: "w-full h-full object-cover"
                      }}
                      radius="none"
                    />
                    {task.taskImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        +{task.taskImages.length - 1}
                      </div>
                    )}
                  </div>
                )}
                <CardBody className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar
                        name={task.customer.name}
                        src={task.customer.avatar}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {task.taskTitle}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {task.taskDescription}
                        </p>

                        {/* Task Progress Info */}
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Banknote className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">{task.agreedPrice} €</span>
                          </div>
                          {task.startDate && selectedFilter === 'in_progress' && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Calendar className="w-4 h-4" />
                              <span>{t('myWork.startedDaysAgo', { days: getDaysStarted(task.startDate) })}</span>
                            </div>
                          )}
                          {task.task.deadline && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-orange-600" />
                              <span className="font-medium">{t('myWork.taskDeadline')}: {task.task.deadline.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact Information (Only for accepted work) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      {t('myWork.customerContact')}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{task.customer.name}</span>
                      </div>

                      {/* Display shared contact info (from acceptance) */}
                      {task.sharedContactInfo ? (
                        <>
                          {task.sharedContactInfo.method === 'phone' && task.sharedContactInfo.phone && (
                            <PhoneContactActions
                              phoneNumber={task.sharedContactInfo.phone}
                              iconSize={18}
                            />
                          )}
                          {task.sharedContactInfo.method === 'email' && task.sharedContactInfo.email && (
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                              <Mail className="w-4 h-4 text-blue-600" />
                              <a href={`mailto:${task.sharedContactInfo.email}`} className="hover:underline">
                                {task.sharedContactInfo.email}
                              </a>
                            </div>
                          )}
                          {task.sharedContactInfo.method === 'custom' && task.sharedContactInfo.customContact && (
                            <div className="flex items-start gap-2 text-sm text-blue-800">
                              {isPhoneNumber(task.sharedContactInfo.customContact) ? (
                                <PhoneContactActions
                                  phoneNumber={task.sharedContactInfo.customContact}
                                  iconSize={18}
                                />
                              ) : isTelegramUsername(task.sharedContactInfo.customContact) ? (
                                <a
                                  href={`https://t.me/${getTelegramUsername(task.sharedContactInfo.customContact)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 hover:underline"
                                >
                                  <img
                                    src="/icons/telegram-logo.svg"
                                    alt="Telegram"
                                    className="w-4 h-4 flex-shrink-0"
                                  />
                                  <span>{task.sharedContactInfo.customContact}</span>
                                </a>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span className="break-words">{task.sharedContactInfo.customContact}</span>
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        // Fallback to customer's default contact info (for old applications before this feature)
                        <>
                          {task.customer.phone && (
                            <PhoneContactActions
                              phoneNumber={task.customer.phone}
                              iconSize={18}
                            />
                          )}
                          {task.customer.email && (
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                              <Mail className="w-4 h-4 text-blue-600" />
                              <a href={`mailto:${task.customer.email}`} className="hover:underline">
                                {task.customer.email}
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customer Message (from acceptance) */}
                  {task.sharedContactInfo?.message && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        {t('myWork.customerMessage')}
                      </h4>
                      <p className="text-sm text-amber-800 italic break-words">
                        "{task.sharedContactInfo.message}"
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{getCityLabelBySlug(task.task.location.city, t)}, {task.task.location.neighborhood}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-gray-200 mt-auto">
                    <Button
                      size="sm"
                      variant="bordered"
                      color="primary"
                      onPress={() => router.push(`/${lang}/tasks/${task.taskId}`)}
                      className="w-full md:w-auto"
                    >
                      {t('myApplications.viewTask')}
                    </Button>
                    {selectedFilter === 'in_progress' && task.task.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          color="success"
                          variant="bordered"
                          onPress={() => handleMarkAsCompleteClick(task)}
                          className="w-full md:flex-1"
                        >
                          {t('myApplications.markCompleted')}
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          color="warning"
                          startContent={<LogOut className="w-4 h-4" />}
                          onPress={() => handleWithdrawClick(task)}
                          className="w-full md:flex-1"
                        >
                          {t('myWork.withdrawFromTask')}
                        </Button>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mark Completed Dialog */}
      {selectedTaskForCompletion && (
        <MarkCompletedDialog
          isOpen={isMarkCompletedDialogOpen}
          onClose={() => {
            setIsMarkCompletedDialogOpen(false)
            setSelectedTaskForCompletion(null)
          }}
          onConfirm={handleMarkCompletedConfirm}
          taskTitle={selectedTaskForCompletion.taskTitle}
          customerName={selectedTaskForCompletion.customer.name}
          payment={`${selectedTaskForCompletion.agreedPrice} €`}
          isLoading={isMarkingComplete}
        />
      )}

      {/* Professional Withdraw Dialog */}
      {selectedTaskForWithdrawal && (
        <ProfessionalWithdrawDialog
          isOpen={isWithdrawDialogOpen}
          onClose={() => {
            setIsWithdrawDialogOpen(false)
            setSelectedTaskForWithdrawal(null)
          }}
          onConfirm={handleWithdrawConfirm}
          taskTitle={selectedTaskForWithdrawal.taskTitle}
          customerName={selectedTaskForWithdrawal.customer.name}
          withdrawalsThisMonth={withdrawalsThisMonth}
          maxWithdrawalsPerMonth={maxWithdrawalsPerMonth}
          taskBudget={selectedTaskForWithdrawal.agreedPrice}
          acceptedDate={selectedTaskForWithdrawal.acceptedAt || new Date()}
        />
      )}

      {/* Withdrawal Success Modal */}
      <Modal
        isOpen={withdrawalSuccessModalOpen}
        onClose={() => setWithdrawalSuccessModalOpen(false)}
        size="sm"
        classNames={{
          base: "mx-4",
          wrapper: "items-end sm:items-center"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center text-success">
            <CheckCircle className="w-5 h-5" />
            {t('professionalWithdraw.successTitle')}
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              {t('professionalWithdraw.success')}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="success"
              onPress={() => setWithdrawalSuccessModalOpen(false)}
            >
              {t('common.ok')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Withdrawal Error Modal */}
      <Modal
        isOpen={withdrawalErrorModalOpen}
        onClose={() => setWithdrawalErrorModalOpen(false)}
        size="sm"
        classNames={{
          base: "mx-4",
          wrapper: "items-end sm:items-center"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center text-danger">
            <AlertCircle className="w-5 h-5" />
            {t('professionalWithdraw.errorTitle')}
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600">
              {withdrawalErrorMessage}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={() => setWithdrawalErrorModalOpen(false)}
            >
              {t('common.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
