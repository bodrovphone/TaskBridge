'use client'

import { useTranslation } from 'react-i18next'
import { Chip } from '@nextui-org/react'
import { CheckCircle, Clock, Shield, Users } from 'lucide-react'
import { CreateTaskForm } from './components/create-task-form'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function CreateTaskPage() {
 const { t } = useTranslation()
 const { user, loading } = useAuth()
 const router = useRouter()
 const params = useParams()
 const lang = (params?.lang as string) || 'bg'

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
        <p className="text-gray-600">{t('loading', 'Loading...')}</p>
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
   text: t('createTask.hero.freeToPost', 'Free to post'),
  },
  {
   icon: <Shield className="w-5 h-5" />,
   text: t('createTask.hero.noPayment', 'No payment until work starts'),
  },
  {
   icon: <Clock className="w-5 h-5" />,
   text: t('createTask.hero.avgResponse', 'Average response time: 2 hours'),
  },
  {
   icon: <Users className="w-5 h-5" />,
   text: t('createTask.hero.verifiedPros', '1,500+ verified professionals'),
  },
 ]

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 overflow-x-hidden">
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
    {/* Hero Section */}
    <div className="text-center mb-12">
     <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
      {t('createTask.title')}
     </h1>
     <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
      {t('createTask.hero.subtitle', 'Describe what you need and let professionals come to you')}
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
         base: "max-w-full",
         content: "truncate"
        }}
       >
        {indicator.text}
       </Chip>
      ))}
     </div>
    </div>

    {/* Form - No outer card, each section has its own card */}
    <div className="space-y-6 mb-12">
     <CreateTaskForm />
    </div>
   </div>
  </div>
 )
}
