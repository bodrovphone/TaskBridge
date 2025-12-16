'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody, CardHeader, Spinner } from '@nextui-org/react'
import {
  BarChart3,
  Star,
  Calendar,
  CheckCircle,
  Briefcase,
  FileText,
  MessageSquare,
  Banknote,
  Clock
} from 'lucide-react'
import type { UserProfile } from '@/server/domain/user/user.types'
import type { CustomerStats, ProfessionalStats } from '@/app/api/profile/stats/route'

interface StatisticsSectionProps {
  userRole: 'customer' | 'professional'
  profile: UserProfile
}

export function StatisticsSection({ userRole, profile }: StatisticsSectionProps) {
  const { t } = useTranslation()
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null)
  const [professionalStats, setProfessionalStats] = useState<ProfessionalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch stats on mount
  useEffect(() => {
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
  }, [])

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} €`

  if (userRole === 'customer') {
    return (
      <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100 flex-shrink-0">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.statistics.title')}</h3>
              <p className="text-xs text-gray-500 hidden sm:block">{t('profile.statistics.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-4 md:px-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : customerStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                  <div className="flex justify-center mb-2">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-primary">{customerStats.tasksPosted}</p>
                  <p className="text-xs md:text-sm text-gray-600">{t('profile.statistics.customer.tasksPosted')}</p>
                </div>

                <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
                  <div className="flex justify-center mb-2">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-success" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-success">{customerStats.totalApplicationsReceived}</p>
                  <p className="text-xs md:text-sm text-gray-600">{t('profile.statistics.customer.applicationsReceived')}</p>
                </div>

                <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
                  <div className="flex justify-center mb-2">
                    <Star className="w-5 h-5 md:w-6 md:h-6 text-warning" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-warning">{customerStats.reviewsGiven}</p>
                  <p className="text-xs md:text-sm text-gray-600">{t('profile.statistics.customer.reviewsGiven')}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
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
            </div>
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
  }

  // Professional stats
  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100 flex-shrink-0">
            <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.statistics.professional.business')}</h3>
            <p className="text-xs text-gray-500 hidden sm:block">{t('profile.statistics.description')}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 md:px-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : professionalStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-primary">{professionalStats.completedJobs}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('profile.professional.completedJobs')}</p>
              </div>

              <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-100/50">
                <div className="flex justify-center mb-2">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-orange-500">{professionalStats.activeJobs}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('profile.statistics.professional.activeJobs')}</p>
              </div>

              <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
                <div className="flex justify-center mb-2">
                  <Banknote className="w-5 h-5 md:w-6 md:h-6 text-success" />
                </div>
                <p className="text-xl md:text-2xl font-bold text-success">{formatCurrency(professionalStats.totalEarnings)}</p>
                <p className="text-xs md:text-sm text-gray-600">{t('profile.professional.totalEarnings')}</p>
              </div>

              <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
                <div className="flex justify-center mb-2">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-warning" />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xl md:text-2xl font-bold text-warning">
                    {professionalStats.averageRating ? professionalStats.averageRating.toFixed(1) : '-'}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  {professionalStats.reviewsReceived} {t('profile.reviews')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
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
          </div>
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
}
