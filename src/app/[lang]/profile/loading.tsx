'use client'

import { Spinner, Card, Skeleton } from '@nextui-org/react'
import { useTranslations } from 'next-intl'

export default function ProfileLoading() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header Skeleton */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
        </Card>

        {/* Loading Spinner */}
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600 text-sm">{t('profile.loading')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
