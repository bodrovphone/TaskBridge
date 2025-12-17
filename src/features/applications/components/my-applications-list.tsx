'use client'

import { useState, useMemo } from 'react'
import { MyApplication, SortOption, FilterOption } from '../lib/types'
import MyApplicationCard from './my-application-card'
import { Select, SelectItem, Tabs, Tab, Chip } from '@nextui-org/react'
import { useTranslations } from 'next-intl'
import { PackageOpen, CheckCircle, XCircle, Clock, FileX } from 'lucide-react'

interface MyApplicationsListProps {
  applications: MyApplication[]
  onViewDetails: (application: MyApplication) => void
  onWithdraw?: (application: MyApplication) => void
  onMessageCustomer?: (application: MyApplication) => void
  onViewTask?: (application: MyApplication) => void
  onFindSimilar?: (application: MyApplication) => void
  onDelete?: (application: MyApplication) => void
}

export default function MyApplicationsList({
  applications,
  onViewDetails,
  onWithdraw,
  onMessageCustomer,
  onViewTask,
  onFindSimilar,
  onDelete
}: MyApplicationsListProps) {
  const t = useTranslations()
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Calculate counts for each filter
  const counts = useMemo(() => ({
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    withdrawn: applications.filter(app => app.status === 'withdrawn').length
  }), [applications])

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (selectedFilter === 'all') return applications
    return applications.filter(app => app.status === selectedFilter)
  }, [applications, selectedFilter])

  // Sort applications
  const sortedApplications = useMemo(() => {
    const sorted = [...filteredApplications]

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
      case 'oldest':
        return sorted.sort((a, b) => a.appliedAt.getTime() - b.appliedAt.getTime())
      case 'status':
        // Order: pending -> accepted -> rejected -> withdrawn
        const statusOrder = { pending: 0, accepted: 1, rejected: 2, withdrawn: 3 }
        return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
      case 'taskDate':
        return sorted.sort((a, b) => {
          const aDate = a.task.deadline || a.task.status === 'in_progress' ? new Date(0) : new Date()
          const bDate = b.task.deadline || b.task.status === 'in_progress' ? new Date(0) : new Date()
          return aDate.getTime() - bDate.getTime()
        })
      case 'priceHigh':
        return sorted.sort((a, b) => b.myProposal.price - a.myProposal.price)
      case 'priceLow':
        return sorted.sort((a, b) => a.myProposal.price - b.myProposal.price)
      default:
        return sorted
    }
  }, [filteredApplications, sortBy])

  // Empty state component
  const EmptyState = () => {
    if (selectedFilter === 'all' && applications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {t('myApplications.emptyState.title')}
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            {t('myApplications.emptyState.message')}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('myApplications.emptyState.browse')}
          </button>
        </div>
      )
    }

    if (selectedFilter === 'pending' && counts.pending === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <CheckCircle className="w-16 h-16 text-green-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {t('myApplications.emptyStatePending.title')}
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            {t('myApplications.emptyStatePending.message')}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('myApplications.emptyState.browse')}
          </button>
        </div>
      )
    }

    if (selectedFilter === 'accepted' && counts.accepted === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Clock className="w-16 h-16 text-purple-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {t('myApplications.emptyStateAccepted.title')}
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-4">
            {t('myApplications.emptyStateAccepted.message')}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t('myApplications.emptyState.browse')}
          </button>
        </div>
      )
    }

    if (selectedFilter === 'rejected' && counts.rejected === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <XCircle className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            {t('myApplications.emptyStateRejected.title')}
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            {t('myApplications.emptyStateRejected.message')}
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <XCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {t('myApplications.emptyStateWithdrawn.title')}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {t('myApplications.emptyStateWithdrawn.message')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Count and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('myApplications.title')}</h2>
          <p className="text-gray-600">
            {t('myApplications.count', { count: counts.all })}
          </p>
        </div>

        {/* Sort Dropdown */}
        <Select
          label={t('myApplications.sortBy')}
          selectedKeys={[sortBy]}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="max-w-xs"
          size="sm"
        >
          <SelectItem key="newest" value="newest">
            {t('myApplications.sortNewest')}
          </SelectItem>
          <SelectItem key="oldest" value="oldest">
            {t('myApplications.sortOldest')}
          </SelectItem>
          <SelectItem key="status" value="status">
            {t('myApplications.sortStatus')}
          </SelectItem>
          <SelectItem key="taskDate" value="taskDate">
            {t('myApplications.sortTaskDate')}
          </SelectItem>
          <SelectItem key="priceHigh" value="priceHigh">
            {t('myApplications.sortPriceHigh')}
          </SelectItem>
          <SelectItem key="priceLow" value="priceLow">
            {t('myApplications.sortPriceLow')}
          </SelectItem>
        </Select>
      </div>

      {/* Filter Tabs */}
      <Tabs
        selectedKey={selectedFilter}
        onSelectionChange={(key) => setSelectedFilter(key as FilterOption)}
        variant="underlined"
        classNames={{
          tabList: 'gap-6',
          cursor: 'bg-blue-600',
          tab: 'max-w-fit px-0 h-12',
          tabContent: 'group-data-[selected=true]:text-blue-600'
        }}
      >
        <Tab
          key="all"
          title={
            <div className="flex items-center gap-2">
              <span>{t('myApplications.filterAll')}</span>
              <Chip size="sm" variant="flat">
                {counts.all}
              </Chip>
            </div>
          }
        />
        <Tab
          key="pending"
          title={
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{t('myApplications.filterPending')}</span>
              <Chip size="sm" variant="flat" color="warning">
                {counts.pending}
              </Chip>
            </div>
          }
        />
        <Tab
          key="accepted"
          title={
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{t('myApplications.filterAccepted')}</span>
              <Chip size="sm" variant="flat" color="success">
                {counts.accepted}
              </Chip>
            </div>
          }
        />
        <Tab
          key="rejected"
          title={
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>{t('myApplications.filterRejected')}</span>
              <Chip size="sm" variant="flat" color="danger">
                {counts.rejected}
              </Chip>
            </div>
          }
        />
        <Tab
          key="withdrawn"
          title={
            <div className="flex items-center gap-2">
              <FileX className="w-4 h-4" />
              <span>{t('myApplications.filterWithdrawn')}</span>
              <Chip size="sm" variant="flat" color="default">
                {counts.withdrawn}
              </Chip>
            </div>
          }
        />
      </Tabs>

      {/* Applications Grid */}
      {sortedApplications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedApplications.map((application) => (
            <MyApplicationCard
              key={application.id}
              application={application}
              onViewDetails={onViewDetails}
              onWithdraw={onWithdraw}
              onMessageCustomer={onMessageCustomer}
              onViewTask={onViewTask}
              onFindSimilar={onFindSimilar}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
