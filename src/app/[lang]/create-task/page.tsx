'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardBody, Chip } from '@nextui-org/react'
import { CheckCircle, Clock, Shield, Users } from 'lucide-react'
import { CreateTaskForm } from './components/create-task-form'

export default function CreateTaskPage() {
 const { t } = useTranslation()

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
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
   <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Hero Section */}
    <div className="text-center mb-12">
     <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
      {t('createTask.title')}
     </h1>
     <p className="text-xl text-gray-600 mb-8">
      {t('createTask.hero.subtitle', 'Describe what you need and let professionals come to you')}
     </p>

     {/* Trust Indicators */}
     <div className="flex flex-wrap justify-center gap-4">
      {trustIndicators.map((indicator, index) => (
       <Chip
        key={index}
        startContent={indicator.icon}
        variant="flat"
        color="success"
        size="lg"
       >
        {indicator.text}
       </Chip>
      ))}
     </div>
    </div>

    {/* Form Card */}
    <Card className="shadow-xl">
     <CardBody className="p-6 sm:p-8 lg:p-12">
      <CreateTaskForm />
     </CardBody>
    </Card>

    {/* Help Text */}
    <p className="text-center text-sm text-gray-500 mt-8">
     {t('createTask.hero.help', 'Need help? Contact our support team')}
    </p>
   </div>
  </div>
 )
}
