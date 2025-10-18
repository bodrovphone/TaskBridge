'use client'

import { useState } from 'react'
import ApplicationsList from '@/components/tasks/applications-list'
import ApplicationDetail from '@/components/tasks/application-detail'
import AcceptApplicationDialog from '@/components/tasks/accept-application-dialog'
import RejectApplicationDialog from '@/components/tasks/reject-application-dialog'
import { mockApplications } from '@/lib/mock-data/applications'
import { Application } from '@/types/applications'
import { Card, CardBody } from '@nextui-org/react'

export default function ApplicationsDemoPage() {
  // State for applications (using mock data)
  const [applications, setApplications] = useState<Application[]>(mockApplications)

  // State for modals
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  // Handlers
  const handleViewDetails = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (app) {
      setSelectedApplication(app)
      setIsDetailOpen(true)
    }
  }

  const handleAcceptClick = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (app) {
      setSelectedApplication(app)
      setIsAcceptDialogOpen(true)
    }
  }

  const handleRejectClick = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (app) {
      setSelectedApplication(app)
      setIsRejectDialogOpen(true)
    }
  }

  const handleAcceptConfirm = (id: string) => {
    // Update application status
    setApplications(prev => prev.map(app =>
      app.id === id
        ? { ...app, status: 'accepted' as const, updatedAt: new Date() }
        : app.status === 'pending'
          ? { ...app, status: 'rejected' as const, updatedAt: new Date() }
          : app
    ))
    setIsAcceptDialogOpen(false)
    setIsDetailOpen(false)
    console.log('✅ Application accepted:', id)
  }

  const handleRejectConfirm = (id: string, reason?: string) => {
    // Update application status
    setApplications(prev => prev.map(app =>
      app.id === id
        ? { ...app, status: 'rejected' as const, rejectionReason: reason, updatedAt: new Date() }
        : app
    ))
    setIsRejectDialogOpen(false)
    setIsDetailOpen(false)
    console.log('❌ Application rejected:', id, 'Reason:', reason || 'Not specified')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Header */}
        <Card className="mb-8">
          <CardBody className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Applications Management Demo
            </h1>
            <p className="text-gray-600 mb-4">
              Test all the features: view applications, filter by status, sort by different criteria,
              view details, and accept/reject applications.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Features to Test:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Filter applications by status (All, Pending, Accepted, Rejected)</li>
                <li>✅ Sort by: Newest, Price (Low/High), Rating, Experience</li>
                <li>✅ View detailed application with portfolio gallery</li>
                <li>✅ Accept applications (with agreement checkboxes)</li>
                <li>✅ Reject applications (with optional reason)</li>
                <li>✅ See professional reviews and ratings</li>
              </ul>
            </div>
          </CardBody>
        </Card>

        {/* Applications List */}
        <ApplicationsList
          applications={applications}
          onAccept={handleAcceptClick}
          onReject={handleRejectClick}
          onViewDetails={handleViewDetails}
        />

        {/* Application Detail Modal */}
        <ApplicationDetail
          application={selectedApplication}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onAccept={handleAcceptClick}
          onReject={handleRejectClick}
        />

        {/* Accept Dialog */}
        <AcceptApplicationDialog
          application={selectedApplication}
          isOpen={isAcceptDialogOpen}
          onClose={() => setIsAcceptDialogOpen(false)}
          onConfirm={handleAcceptConfirm}
        />

        {/* Reject Dialog */}
        <RejectApplicationDialog
          application={selectedApplication}
          isOpen={isRejectDialogOpen}
          onClose={() => setIsRejectDialogOpen(false)}
          onConfirm={handleRejectConfirm}
        />

        {/* Console Output Info */}
        <Card className="mt-8">
          <CardBody className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              💻 Console Output
            </h3>
            <p className="text-sm text-gray-600">
              Open your browser's developer console to see accept/reject actions logged.
              Changes are reflected in real-time on the page.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
