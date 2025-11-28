'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
 Modal,
 ModalContent,
 ModalHeader,
 ModalBody,
 ModalFooter,
 Button,
 Card,
 CardBody,
 CardHeader,
 Divider,
 Spinner
} from '@nextui-org/react'
import {
 BarChart3,
 Star,
 Calendar,
 CheckCircle,
 Users,
 Briefcase,
 FileText,
 MessageSquare,
 Banknote,
 Clock
} from 'lucide-react'
import type { UserProfile } from '@/server/domain/user/user.types'
import type { CustomerStats, ProfessionalStats } from '@/app/api/profile/stats/route'

interface StatisticsModalProps {
 isOpen: boolean
 onClose: () => void
 userRole: 'customer' | 'professional' | 'both'
 profile: UserProfile
}

export function StatisticsModal({ isOpen, onClose, userRole, profile }: StatisticsModalProps) {
 const { t } = useTranslation()
 const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
 const [professionalStats, setProfessionalStats] = useState<ProfessionalStats | null>(null)
 const [isLoading, setIsLoading] = useState(false)

 // Fetch stats when modal opens
 useEffect(() => {
  if (isOpen) {
   setIsLoading(true)
   fetch('/api/profile/stats')
    .then(res => res.json())
    .then(data => {
     if (data.customerStats) {
      setCustomerStats(data.customerStats)
     }
     if (data.professionalStats) {
      setProfessionalStats(data.professionalStats)
     }
    })
    .catch(err => console.error('Failed to fetch stats:', err))
    .finally(() => setIsLoading(false))
  }
 }, [isOpen])

 const formatCurrency = (amount: number) => `${amount.toLocaleString()} лв.`

 const renderCustomerStats = () => (
  <Card>
   <CardHeader>
    <div className="flex items-center gap-3">
     <Users className="w-5 h-5 text-primary" />
     <h3 className="font-semibold">{t('profile.statistics.customer.overview')}</h3>
    </div>
   </CardHeader>
   <CardBody>
    {isLoading ? (
     <div className="flex justify-center py-8">
      <Spinner size="lg" />
     </div>
    ) : customerStats ? (
     <>
      <div className="grid grid-cols-3 gap-4 mb-6">
       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="flex justify-center mb-2">
         <FileText className="w-6 h-6 text-primary" />
        </div>
        <p className="text-2xl font-bold text-primary">{customerStats.tasksPosted}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.customer.tasksPosted')}</p>
       </div>

       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
        <div className="flex justify-center mb-2">
         <MessageSquare className="w-6 h-6 text-success" />
        </div>
        <p className="text-2xl font-bold text-success">{customerStats.totalApplicationsReceived}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.customer.applicationsReceived')}</p>
       </div>

       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
        <div className="flex justify-center mb-2">
         <Star className="w-6 h-6 text-warning" />
        </div>
        <p className="text-2xl font-bold text-warning">{customerStats.reviewsGiven}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.customer.reviewsGiven')}</p>
       </div>
      </div>

      <Divider className="my-4" />

      <div className="flex items-center justify-center gap-3">
       <div className="p-2 rounded-lg bg-secondary/10">
        <Calendar className="w-5 h-5 text-secondary" />
       </div>
       <div>
        <p className="font-medium">
         {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">{t('profile.statistics.memberSince')}</p>
       </div>
      </div>
     </>
    ) : (
     <div className="flex items-center justify-center gap-3 py-4">
      <div className="p-2 rounded-lg bg-secondary/10">
       <Calendar className="w-5 h-5 text-secondary" />
      </div>
      <div>
       <p className="font-medium">
        {new Date(profile.createdAt).toLocaleDateString()}
       </p>
       <p className="text-sm text-gray-600">{t('profile.statistics.memberSince')}</p>
      </div>
     </div>
    )}
   </CardBody>
  </Card>
 )

 const renderProfessionalStats = () => (
  <Card>
   <CardHeader>
    <div className="flex items-center gap-3">
     <Briefcase className="w-5 h-5 text-primary" />
     <h3 className="font-semibold">{t('profile.statistics.professional.business')}</h3>
    </div>
   </CardHeader>
   <CardBody>
    {isLoading ? (
     <div className="flex justify-center py-8">
      <Spinner size="lg" />
     </div>
    ) : professionalStats ? (
     <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
        <div className="flex justify-center mb-2">
         <CheckCircle className="w-6 h-6 text-primary" />
        </div>
        <p className="text-2xl font-bold text-primary">{professionalStats.completedJobs}</p>
        <p className="text-sm text-gray-600">{t('profile.professional.completedJobs')}</p>
       </div>

       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100/50">
        <div className="flex justify-center mb-2">
         <Clock className="w-6 h-6 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-orange-500">{professionalStats.activeJobs}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.professional.activeJobs')}</p>
       </div>

       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
        <div className="flex justify-center mb-2">
         <Banknote className="w-6 h-6 text-success" />
        </div>
        <p className="text-2xl font-bold text-success">{formatCurrency(professionalStats.totalEarnings)}</p>
        <p className="text-sm text-gray-600">{t('profile.professional.totalEarnings')}</p>
       </div>

       <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
        <div className="flex justify-center mb-2">
         <Star className="w-6 h-6 text-warning" />
        </div>
        <div className="flex items-center justify-center gap-1">
         <p className="text-2xl font-bold text-warning">
          {professionalStats.averageRating ? professionalStats.averageRating.toFixed(1) : '-'}
         </p>
        </div>
        <p className="text-sm text-gray-600">
         {professionalStats.reviewsReceived} {t('profile.reviews')}
        </p>
       </div>
      </div>

      <Divider className="my-4" />

      <div className="flex items-center justify-center gap-3">
       <div className="p-2 rounded-lg bg-secondary/10">
        <Calendar className="w-5 h-5 text-secondary" />
       </div>
       <div>
        <p className="font-medium">
         {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600">{t('profile.statistics.memberSince')}</p>
       </div>
      </div>
     </>
    ) : (
     <div className="flex items-center justify-center gap-3 py-4">
      <div className="p-2 rounded-lg bg-secondary/10">
       <Calendar className="w-5 h-5 text-secondary" />
      </div>
      <div>
       <p className="font-medium">
        {new Date(profile.createdAt).toLocaleDateString()}
       </p>
       <p className="text-sm text-gray-600">{t('profile.statistics.memberSince')}</p>
      </div>
     </div>
    )}
   </CardBody>
  </Card>
 )

 return (
  <Modal
   isOpen={isOpen}
   onClose={onClose}
   size="4xl"
   scrollBehavior="inside"
   classNames={{
    base: "max-h-[90vh]",
    body: "py-6",
   }}
  >
   <ModalContent>
    <ModalHeader className="flex flex-col gap-1">
     <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
       <BarChart3 className="w-5 h-5 text-primary" />
      </div>
      <div>
       <h2 className="text-xl font-semibold">{t('profile.statistics.title')}</h2>
       <p className="text-sm text-gray-600 font-normal">
        {t('profile.statistics.description')}
       </p>
      </div>
     </div>
    </ModalHeader>

    <ModalBody>
     {(userRole === 'customer' || userRole === 'both') && (
      <>
       {renderCustomerStats()}
       {userRole === 'both' && <Divider className="my-6" />}
      </>
     )}

     {(userRole === 'professional' || userRole === 'both') && renderProfessionalStats()}
    </ModalBody>

    <ModalFooter>
     <Button
      variant="bordered"
      onPress={onClose}
     >
      {t('close')}
     </Button>
    </ModalFooter>
   </ModalContent>
  </Modal>
 )
}