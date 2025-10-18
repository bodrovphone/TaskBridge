'use client'

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
 Chip
} from '@nextui-org/react'
import {
 BarChart3,
 Star,
 Calendar,
 TrendingUp,
 DollarSign,
 Eye,
 CheckCircle,
 Clock,
 Award,
 Target,
 Users,
 Briefcase
} from 'lucide-react'

interface StatisticsModalProps {
 isOpen: boolean
 onClose: () => void
 userRole: 'customer' | 'professional' | 'both'
}

interface CustomerStats {
 tasksPosted: number
 tasksCompleted: number
 averageRating: number
 totalSpent: number
 memberSince: string
 successRate: number
 responseRate: number
}

interface ProfessionalStats {
 completedJobs: number
 totalEarnings: number
 averageRating: number
 reviewCount: number
 responseTime: string
 profileViews: number
 successRate: number
 repeatClients: number
 monthlyEarnings: number
 completionRate: number
}

export function StatisticsModal({ isOpen, onClose, userRole }: StatisticsModalProps) {
 const { t } = useTranslation()

 // Mock customer statistics
 const customerStats: CustomerStats = {
  tasksPosted: 12,
  tasksCompleted: 8,
  averageRating: 4.8,
  totalSpent: 2450,
  memberSince: '2023-01-15',
  successRate: 92,
  responseRate: 88
 }

 // Mock professional statistics
 const professionalStats: ProfessionalStats = {
  completedJobs: 24,
  totalEarnings: 3200,
  averageRating: 4.9,
  reviewCount: 18,
  responseTime: '2 hours',
  profileViews: 156,
  successRate: 98,
  repeatClients: 12,
  monthlyEarnings: 850,
  completionRate: 96
 }

 const formatCurrency = (amount: number) => `€${amount}`
 const formatPercentage = (value: number) => `${value}%`

 const renderCustomerStats = () => (
  <div className="space-y-6">
   {/* Overview Stats */}
   <Card>
    <CardHeader>
     <div className="flex items-center gap-3">
      <Users className="w-5 h-5 text-primary" />
      <h3 className="font-semibold">{t('profile.statistics.customer.overview')}</h3>
     </div>
    </CardHeader>
    <CardBody>
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
       <p className="text-2xl font-bold text-primary">{customerStats.tasksPosted}</p>
       <p className="text-sm text-gray-600">{t('profile.customer.tasksPosted')}</p>
      </div>

      <div className="text-center">
       <p className="text-2xl font-bold text-success">{customerStats.tasksCompleted}</p>
       <p className="text-sm text-gray-600">{t('profile.customer.tasksCompleted')}</p>
      </div>

      <div className="text-center">
       <div className="flex items-center justify-center gap-1">
        <p className="text-2xl font-bold text-warning">{customerStats.averageRating}</p>
        <Star className="w-5 h-5 text-warning fill-current" />
       </div>
       <p className="text-sm text-gray-600">{t('profile.customer.averageRating')}</p>
      </div>

      <div className="text-center">
       <p className="text-2xl font-bold text-secondary">{formatCurrency(customerStats.totalSpent)}</p>
       <p className="text-sm text-gray-600">{t('profile.customer.totalSpent')}</p>
      </div>
     </div>
    </CardBody>
   </Card>

   {/* Performance Metrics */}
   <Card>
    <CardHeader>
     <div className="flex items-center gap-3">
      <TrendingUp className="w-5 h-5 text-success" />
      <h3 className="font-semibold">{t('profile.statistics.customer.performance')}</h3>
     </div>
    </CardHeader>
    <CardBody>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-success/10">
        <Target className="w-5 h-5 text-success" />
       </div>
       <div>
        <p className="font-medium">{formatPercentage(customerStats.successRate)}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.customer.successRate')}</p>
       </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-primary/10">
        <Clock className="w-5 h-5 text-primary" />
       </div>
       <div>
        <p className="font-medium">{formatPercentage(customerStats.responseRate)}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.customer.responseRate')}</p>
       </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-secondary/10">
        <Calendar className="w-5 h-5 text-secondary" />
       </div>
       <div>
        <p className="font-medium">{new Date(customerStats.memberSince).getFullYear()}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.memberSince')}</p>
       </div>
      </div>
     </div>
    </CardBody>
   </Card>
  </div>
 )

 const renderProfessionalStats = () => (
  <div className="space-y-6">
   {/* Business Overview */}
   <Card>
    <CardHeader>
     <div className="flex items-center gap-3">
      <Briefcase className="w-5 h-5 text-primary" />
      <h3 className="font-semibold">{t('profile.statistics.professional.business')}</h3>
     </div>
    </CardHeader>
    <CardBody>
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
       <p className="text-2xl font-bold text-primary">{professionalStats.completedJobs}</p>
       <p className="text-sm text-gray-600">{t('profile.professional.completedJobs')}</p>
      </div>

      <div className="text-center">
       <div className="flex items-center justify-center gap-1">
        <p className="text-2xl font-bold text-warning">{professionalStats.averageRating}</p>
        <Star className="w-5 h-5 text-warning fill-current" />
       </div>
       <p className="text-sm text-gray-600">{professionalStats.reviewCount} {t('profile.reviews')}</p>
      </div>

      <div className="text-center">
       <p className="text-2xl font-bold text-success">{formatCurrency(professionalStats.totalEarnings)}</p>
       <p className="text-sm text-gray-600">{t('profile.professional.totalEarnings')}</p>
      </div>

      <div className="text-center">
       <p className="text-2xl font-bold text-secondary">{professionalStats.responseTime}</p>
       <p className="text-sm text-gray-600">{t('profile.professional.responseTime')}</p>
      </div>
     </div>
    </CardBody>
   </Card>

   {/* Performance Metrics */}
   <Card>
    <CardHeader>
     <div className="flex items-center gap-3">
      <Award className="w-5 h-5 text-warning" />
      <h3 className="font-semibold">{t('profile.statistics.professional.performance')}</h3>
     </div>
    </CardHeader>
    <CardBody>
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-success/10">
        <CheckCircle className="w-5 h-5 text-success" />
       </div>
       <div>
        <p className="font-medium">{formatPercentage(professionalStats.completionRate)}</p>
        <p className="text-sm text-gray-600">{t('profile.professional.completionRate')}</p>
       </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-primary/10">
        <Eye className="w-5 h-5 text-primary" />
       </div>
       <div>
        <p className="font-medium">{professionalStats.profileViews}</p>
        <p className="text-sm text-gray-600">{t('profile.professional.profileViews')}</p>
       </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-warning/10">
        <Users className="w-5 h-5 text-warning" />
       </div>
       <div>
        <p className="font-medium">{professionalStats.repeatClients}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.professional.repeatClients')}</p>
       </div>
      </div>

      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-secondary/10">
        <DollarSign className="w-5 h-5 text-secondary" />
       </div>
       <div>
        <p className="font-medium">{formatCurrency(professionalStats.monthlyEarnings)}</p>
        <p className="text-sm text-gray-600">{t('profile.statistics.professional.monthlyEarnings')}</p>
       </div>
      </div>
     </div>
    </CardBody>
   </Card>
  </div>
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