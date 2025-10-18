'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import {
  MyApplicationsList,
  ApplicationDetailView,
  WithdrawDialog,
  mockMyApplications,
  MyApplication
} from '@/features/applications'
import { Container } from '@nextui-org/react'
import { useRouter } from 'next/navigation'

export default function MyApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string

  const [applications, setApplications] = useState<MyApplication[]>(mockMyApplications)
  const [selectedApplication, setSelectedApplication] = useState<MyApplication | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<MyApplication | null>(null)

  const handleViewDetails = (application: MyApplication) => {
    setSelectedApplication(application)
    setIsDetailOpen(true)
  }

  const handleWithdraw = (application: MyApplication) => {
    setApplicationToWithdraw(application)
    setIsWithdrawDialogOpen(true)
  }

  const handleWithdrawConfirm = (applicationId: string, reason?: string) => {
    // Update application status to withdrawn
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId
          ? { ...app, status: 'withdrawn' as const, respondedAt: new Date() }
          : app
      )
    )
    setIsWithdrawDialogOpen(false)
    setApplicationToWithdraw(null)
    console.log('Application withdrawn:', applicationId, 'Reason:', reason)
  }

  const handleMessageCustomer = (application: MyApplication) => {
    // TODO: Implement messaging system
    console.log('Message customer for application:', application.id)
    alert(`Messaging system coming soon! You would message ${application.customer.name}`)
  }

  const handleViewTask = (application: MyApplication) => {
    // Navigate to task detail page
    router.push(`/${lang}/tasks/${application.taskId}`)
  }

  const handleMarkStarted = (application: MyApplication) => {
    console.log('Mark as started:', application.id)
    alert('Task status updated to "Started"')
  }

  const handleMarkCompleted = (application: MyApplication) => {
    console.log('Mark as completed:', application.id)
    alert('Task marked as completed! Review period opens.')
  }

  const handleReportIssue = (application: MyApplication) => {
    console.log('Report issue:', application.id)
    alert('Issue reporting coming soon!')
  }

  const handleFindSimilar = (application: MyApplication) => {
    // Navigate to browse tasks with category filter
    const category = application.task.category
    router.push(`/${lang}/browse-tasks?category=${category}`)
  }

  const handleDelete = (application: MyApplication) => {
    if (confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      setApplications(prev => prev.filter(app => app.id !== application.id))
      console.log('Application deleted:', application.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MyApplicationsList
          applications={applications}
          onViewDetails={handleViewDetails}
          onWithdraw={handleWithdraw}
          onMessageCustomer={handleMessageCustomer}
          onViewTask={handleViewTask}
          onFindSimilar={handleFindSimilar}
          onDelete={handleDelete}
        />

        {/* Application Detail Modal */}
        <ApplicationDetailView
          application={selectedApplication}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onWithdraw={handleWithdraw}
          onMessageCustomer={handleMessageCustomer}
          onViewTask={handleViewTask}
          onMarkStarted={handleMarkStarted}
          onMarkCompleted={handleMarkCompleted}
          onReportIssue={handleReportIssue}
          onFindSimilar={handleFindSimilar}
          onDelete={handleDelete}
        />

        {/* Withdraw Dialog */}
        <WithdrawDialog
          application={applicationToWithdraw}
          isOpen={isWithdrawDialogOpen}
          onClose={() => setIsWithdrawDialogOpen(false)}
          onConfirm={handleWithdrawConfirm}
        />
      </div>
    </div>
  )
}
