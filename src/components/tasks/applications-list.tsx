'use client'

import { useState, useMemo } from 'react'
import { Application, ApplicationFilters, SortOption, ApplicationStatus } from '@/types/applications'
import ApplicationCard from './application-card'
import { Select, SelectItem, Chip } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { Filter, ArrowUpDown } from 'lucide-react'

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

  const [filters, setFilters] = useState<ApplicationFilters>({
    status: 'all',
    sortBy: 'newest'
  })

  // Filter and sort applications
  const filteredAndSortedApplications = useMemo(() => {
    let result = [...applications]

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(app => app.status === filters.status)
    }

    // Apply sorting
    switch (filters.sortBy) {
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
  }, [applications, filters])

  // Calculate stats
  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }), [applications])

  const sortOptions = [
    { value: 'newest', label: t('applications.sortNewest', 'Newest First') },
    { value: 'price-low', label: t('applications.sortPriceLow', 'Price: Low to High') },
    { value: 'price-high', label: t('applications.sortPriceHigh', 'Price: High to Low') },
    { value: 'rating', label: t('applications.sortRating', 'Highest Rated') },
    { value: 'experience', label: t('applications.sortExperience', 'Most Experience') }
  ]

  const statusFilters: Array<{ value: ApplicationStatus | 'all', label: string, count: number }> = [
    { value: 'all', label: t('applications.filterAll', 'All'), count: stats.total },
    { value: 'pending', label: t('applications.filterPending', 'Pending'), count: stats.pending },
    { value: 'accepted', label: t('applications.filterAccepted', 'Accepted'), count: stats.accepted },
    { value: 'rejected', label: t('applications.filterRejected', 'Rejected'), count: stats.rejected }
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header with Title and Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('applications.title', 'Applications')}
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedApplications.length} {t('applications.count', 'applications')}
          </p>
        </div>
      </div>

      {/* Controls: Sort & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-500" />
          {statusFilters.map(filter => (
            <Chip
              key={filter.value}
              variant={filters.status === filter.value ? 'solid' : 'flat'}
              color={filters.status === filter.value ? 'primary' : 'default'}
              className="cursor-pointer"
              onClick={() => setFilters(prev => ({ ...prev, status: filter.value }))}
            >
              {filter.label} ({filter.count})
            </Chip>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          <Select
            size="sm"
            label={t('applications.sortBy', 'Sort by')}
            selectedKeys={[filters.sortBy]}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
            className="max-w-xs"
          >
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredAndSortedApplications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedApplications.map(application => (
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
            {filters.status === 'all'
              ? t('applications.emptyState.title', 'No applications yet')
              : `No ${filters.status} applications`
            }
          </h3>
          <p className="text-gray-600">
            {filters.status === 'all'
              ? t('applications.emptyState.message', 'Your task is live! Professionals will start applying soon.')
              : `Try adjusting your filters to see more applications.`
            }
          </p>
        </div>
      )}
    </div>
  )
}
