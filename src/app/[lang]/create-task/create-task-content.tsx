'use client'

import { useTranslations } from 'next-intl'
import { Chip } from '@heroui/react'
import { CheckCircle, Users } from 'lucide-react'
import { CreateTaskForm } from './components/create-task-form'
import { ReopenBanner } from './components/reopen-banner'
import { useAuth } from '@/features/auth'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

export default function CreateTaskContent() {
 const t = useTranslations()
 const { user, loading } = useAuth()
 const router = useRouter()
 const params = useParams()
 const searchParams = useSearchParams()
 const lang = (params?.lang as string) || 'bg'

 // Reopen task state
 const [isReopening, setIsReopening] = useState(false)
 const [originalTask, setOriginalTask] = useState<any>(null)
 const [taskLoading, setTaskLoading] = useState(false)

 // Invitation state
 const [isInviting, setIsInviting] = useState(false)
 const [invitedProfessional, setInvitedProfessional] = useState<any>(null)

 // Check for reopen query params
 const reopenParam = searchParams.get('reopen')
 const originalTaskId = searchParams.get('originalTaskId')

 // Check for invitation query params
 const inviteProfessionalId = searchParams.get('inviteProfessionalId')
 const inviteProfessionalName = searchParams.get('inviteProfessionalName')

 // Locale is handled by next-intl via URL routing - no manual sync needed

 // Set up invitation state if inviting a professional
 useEffect(() => {
  if (inviteProfessionalId && user) {
    setIsInviting(true)
    setInvitedProfessional({
      id: inviteProfessionalId,
      name: inviteProfessionalName || '',
    })
  }
 }, [inviteProfessionalId, inviteProfessionalName, user])

 // Fetch original task if reopening
 useEffect(() => {
  if (reopenParam === 'true' && originalTaskId && user) {
    setIsReopening(true)
    setTaskLoading(true)

    // Fetch original task data
    fetch(`/api/tasks/${originalTaskId}`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          // API returns { task: {...}, relatedData: {...} }
          const taskData = data.task || data

          // Transform API data to match form's expected format
          // Note: Convert null values to empty strings to avoid Zod validation errors
          // (Zod's .optional() accepts undefined but NOT null)
          const formData = {
            title: taskData.title || '',
            description: taskData.description || '',
            category: taskData.category || '',
            subcategory: taskData.subcategory || '',
            city: taskData.location?.city || taskData.city || '',
            neighborhood: taskData.location?.neighborhood || taskData.neighborhood || '',
            requirements: taskData.requirements || '',
            budgetType: taskData.budgetType || 'unclear',
            budgetMin: taskData.budgetMin || taskData.budget || null,
            budgetMax: taskData.budgetMax || null,
            // Always set to flexible when reopening (avoid past dates)
            urgency: 'flexible',
            deadline: undefined,
            images: taskData.images || taskData.photoUrls || []
          }
          setOriginalTask(formData)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch original task:', error)
      })
      .finally(() => {
        setTaskLoading(false)
      })
  }
 }, [reopenParam, originalTaskId, user])

 // Redirect to home if not authenticated
 useEffect(() => {
  if (!loading && !user) {
    router.push(`/${lang}`)
  }
 }, [user, loading, router, lang])

 // Show loading while checking auth
 if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  )
 }

 // Don't render form if not authenticated
 if (!user) {
  return null
 }

 const trustIndicators = [
  {
   icon: <CheckCircle className="w-5 h-5" />,
   text: t('createTask.hero.freeToPost'),
  },
  {
   icon: <Users className="w-5 h-5" />,
   text: t('createTask.hero.verifiedPros'),
  },
 ]

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-10 overflow-x-hidden">
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
    {/* Hero Section */}
    <div className="text-center mb-4 sm:mb-8">
     <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4 pb-1">
      {t('createTask.pageTitle')}
     </h1>

     {/* Trust Indicators */}
     <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-hidden px-2">
      {trustIndicators.map((indicator, index) => (
       <Chip
        key={index}
        startContent={indicator.icon}
        variant="flat"
        color="success"
        size="md"
        className="shadow-sm flex-shrink-0 max-w-full text-sm"
        classNames={{
         base: "max-w-full",
         content: "truncate"
        }}
       >
        {indicator.text}
       </Chip>
      ))}
     </div>
    </div>

    {/* Reopen Banner */}
    {isReopening && originalTask && originalTask.title && (
      <ReopenBanner originalTaskTitle={originalTask.title} />
    )}

    {/* Form - No outer card, each section has its own card */}
    <div className="space-y-6 mb-12">
     {taskLoading ? (
      <div className="text-center py-12">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
       <p className="text-gray-600">{t('loading')}</p>
      </div>
     ) : (
      <CreateTaskForm
        initialData={isReopening ? originalTask : undefined}
        isReopening={isReopening}
        inviteProfessionalId={isInviting ? invitedProfessional?.id : undefined}
        key={isReopening && originalTask ? 'reopen' : isInviting ? 'invite' : 'create'}
      />
     )}
    </div>
   </div>
  </div>
 )
}
