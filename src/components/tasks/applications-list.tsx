'use client'

import { useState, useMemo } from 'react'
import { Application, SortOption } from '@/types/applications'
import ApplicationCard from './application-card'
import { Select, SelectItem } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'

interface ApplicationsListProps {
  applications: Application[]
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewDetails: (id: string) => void
}

export default function ApplicationsList({
  applications,
  onAccept,
  onReject,
  onViewDetails
}: ApplicationsListProps) {
  const { t } = useTranslation()

  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Sort applications
  const sortedApplications = useMemo(() => {
    let result = [...applications]

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case 'price-low':
        result.sort((a, b) => a.proposedPrice - b.proposedPrice)
        break
      case 'price-high':
        result.sort((a, b) => b.proposedPrice - a.proposedPrice)
        break
      case 'rating':
        result.sort((a, b) => b.professional.rating - a.professional.rating)
        break
      case 'experience':
        result.sort((a, b) =>
          (b.professional.yearsOfExperience || 0) - (a.professional.yearsOfExperience || 0)
        )
        break
    }

    return result
  }, [applications, sortBy])

  const sortOptions = [
    { value: 'newest', label: t('applications.sortNewest', 'Newest First') },
    { value: 'price-low', label: t('applications.sortPriceLow', 'Price: Low to High') },
    { value: 'price-high', label: t('applications.sortPriceHigh', 'Price: High to Low') },
    { value: 'rating', label: t('applications.sortRating', 'Highest Rated') },
    { value: 'experience', label: t('applications.sortExperience', 'Most Experience') }
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header with Title and Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('applications.title', 'Applications')}
          </h2>
          <p className="text-gray-600 mt-1">
            {sortedApplications.length} {t('applications.count', 'applications')}
          </p>
        </div>

        {/* Sort Dropdown - Only show when there are applications */}
        {sortedApplications.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px]">
            <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <Select
              size="sm"
              label={t('applications.sortBy', 'Sort by')}
              selectedKeys={[sortBy]}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 sm:max-w-xs"
            >
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Applications Grid */}
      {sortedApplications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAccept={onAccept}
              onReject={onReject}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('applications.emptyState.title', 'No applications yet')}
          </h3>
          <p className="text-gray-600">
            {t('applications.emptyState.message', 'Your task is live! Professionals will start applying soon.')}
          </p>
        </div>
      )}
    </div>
  )
}
