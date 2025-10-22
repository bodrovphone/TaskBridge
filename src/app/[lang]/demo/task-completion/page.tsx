'use client'

import { useState } from 'react'
import { Card, CardBody, Button, Divider } from '@nextui-org/react'
import { TaskStatusBadge, type TaskStatus } from '@/components/tasks/task-status-badge'
import { TaskCompletionButton } from '@/components/tasks/task-completion-button'
import { MarkCompletedDialog } from '@/components/tasks/mark-completed-dialog'
import { ConfirmCompletionDialog, type ConfirmationData } from '@/components/tasks/confirm-completion-dialog'
import { PendingConfirmationBanner } from '@/components/tasks/pending-confirmation-banner'
import { CompletionSuccessView } from '@/components/tasks/completion-success-view'
import { CompletionTimeline } from '@/components/tasks/completion-timeline'

export default function TaskCompletionDemoPage() {
  // Dialog states
  const [showMarkDialog, setShowMarkDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Demo data states
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('in_progress')
  const [userRole, setUserRole] = useState<'customer' | 'professional'>('professional')
  const [professionalMarkedAt, setProfessionalMarkedAt] = useState<Date | undefined>()
  const [customerConfirmedAt, setCustomerConfirmedAt] = useState<Date | undefined>()
  const [completedAt, setCompletedAt] = useState<Date | undefined>()

  const mockStartDate = new Date('2024-01-15T10:00:00')

  const handleMarkComplete = (data: any) => {
    console.log('Professional marked complete:', data)
    setProfessionalMarkedAt(new Date())
    setTaskStatus('pending_customer_confirmation')
    setShowMarkDialog(false)
  }

  const handleConfirmComplete = (data?: ConfirmationData) => {
    console.log('Customer confirmed completion with data:', data)
    setCustomerConfirmedAt(new Date())
    setCompletedAt(new Date())
    setTaskStatus('completed')
    setShowConfirmDialog(false)
  }

  const handleRejectComplete = (data: any) => {
    console.log('Customer rejected completion:', data)
    setProfessionalMarkedAt(undefined)
    setTaskStatus('in_progress')
    setShowConfirmDialog(false)
  }

  const resetDemo = () => {
    setTaskStatus('in_progress')
    setProfessionalMarkedAt(undefined)
    setCustomerConfirmedAt(undefined)
    setCompletedAt(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task Completion UI Demo
          </h1>
          <p className="text-gray-600">
            Interactive demonstration of all task completion components and workflows
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8 shadow-lg">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Demo Controls</h2>

            <div className="space-y-4">
              {/* User Role Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color={userRole === 'professional' ? 'primary' : 'default'}
                    variant={userRole === 'professional' ? 'solid' : 'bordered'}
                    onPress={() => setUserRole('professional')}
                  >
                    Professional
                  </Button>
                  <Button
                    size="sm"
                    color={userRole === 'customer' ? 'primary' : 'default'}
                    variant={userRole === 'customer' ? 'solid' : 'bordered'}
                    onPress={() => setUserRole('customer')}
                  >
                    Customer
                  </Button>
                </div>
              </div>

              {/* Task Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'pending_professional_confirmation', 'pending_customer_confirmation', 'completed', 'cancelled'] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        size="sm"
                        color={taskStatus === status ? 'primary' : 'default'}
                        variant={taskStatus === status ? 'solid' : 'bordered'}
                        onPress={() => setTaskStatus(status)}
                      >
                        {status.replace(/_/g, ' ')}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <Button size="sm" color="warning" variant="flat" onPress={resetDemo}>
                  Reset to In Progress
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Components */}
          <div className="space-y-8">
            {/* Status Badges */}
            <Card className="shadow-lg">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Status Badges
                </h2>
                <div className="flex flex-wrap gap-3">
                  <TaskStatusBadge status="open" />
                  <TaskStatusBadge status="in_progress" />
                  <TaskStatusBadge status="pending_professional_confirmation" />
                  <TaskStatusBadge status="pending_customer_confirmation" />
                  <TaskStatusBadge status="completed" />
                  <TaskStatusBadge status="cancelled" />
                  <TaskStatusBadge status="disputed" />
                </div>
                <Divider className="my-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current Status:</p>
                  <TaskStatusBadge status={taskStatus} size="lg" />
                </div>
              </CardBody>
            </Card>

            {/* Completion Button */}
            <Card className="shadow-lg">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Task Completion Button
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Context-aware button that adapts based on task status and user role
                </p>
                <TaskCompletionButton
                  taskStatus={taskStatus === 'disputed' ? 'in_progress' : taskStatus}
                  userRole={userRole}
                  onPress={() => {
                    if (userRole === 'professional' && taskStatus === 'in_progress') {
                      setShowMarkDialog(true)
                    } else if (userRole === 'customer' && taskStatus === 'pending_customer_confirmation') {
                      setShowConfirmDialog(true)
                    }
                  }}
                />
              </CardBody>
            </Card>

            {/* Pending Confirmation Banner */}
            <Card className="shadow-lg">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Pending Confirmation Banners
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Professional Waiting (Customer needs to confirm):
                    </p>
                    <PendingConfirmationBanner
                      status="pending_customer_confirmation"
                      userRole="professional"
                      otherPartyName="John Doe"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Customer Action Required (click to open dialog):
                    </p>
                    <PendingConfirmationBanner
                      status="pending_customer_confirmation"
                      userRole="customer"
                      otherPartyName="Jane Smith"
                      onConfirm={() => setShowConfirmDialog(true)}
                      onReject={() => console.log('Rejected - would show rejection form')}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Customer Waiting (Professional needs to confirm):
                    </p>
                    <PendingConfirmationBanner
                      status="pending_professional_confirmation"
                      userRole="customer"
                      otherPartyName="Jane Smith"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Professional Action Required (click to open dialog):
                    </p>
                    <PendingConfirmationBanner
                      status="pending_professional_confirmation"
                      userRole="professional"
                      otherPartyName="John Doe"
                      onConfirm={() => setShowMarkDialog(true)}
                      onReject={() => console.log('Rejected - would show rejection form')}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Workflow Visualizations */}
          <div className="space-y-8">
            {/* Timeline */}
            <CompletionTimeline
              startedAt={mockStartDate}
              professionalMarkedAt={professionalMarkedAt}
              customerConfirmedAt={customerConfirmedAt}
              completedAt={completedAt}
            />

            {/* Success View */}
            {taskStatus === 'completed' && (
              <CompletionSuccessView
                professionalName="Jane Smith"
                onLeaveReview={() => console.log('Leave review')}
                onViewDetails={() => console.log('View details')}
              />
            )}

            {/* Workflow Simulation */}
            <Card className="shadow-lg">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Workflow Simulation
                </h2>
                <div className="space-y-3">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-full"
                    onPress={() => setShowMarkDialog(true)}
                  >
                    Open Professional Dialog
                  </Button>
                  <Button
                    size="sm"
                    color="success"
                    variant="flat"
                    className="w-full"
                    onPress={() => setShowConfirmDialog(true)}
                  >
                    Open Customer Dialog
                  </Button>
                </div>

                <Divider className="my-4" />

                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900">Workflow Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Task is "In Progress"</li>
                    <li>Professional marks as completed</li>
                    <li>Status: "Pending Customer Confirmation"</li>
                    <li>Customer confirms or rejects</li>
                    <li>If confirmed: Task "Completed"</li>
                    <li>If rejected: Back to "In Progress"</li>
                  </ol>
                </div>
              </CardBody>
            </Card>

            {/* Component States Info */}
            <Card className="shadow-lg bg-blue-50 border-2 border-blue-200">
              <CardBody className="p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-3">
                  Current State
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">User Role:</span>
                    <span className="text-blue-900 font-semibold">{userRole}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Task Status:</span>
                    <span className="text-blue-900 font-semibold">{taskStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Pro Marked:</span>
                    <span className="text-blue-900 font-semibold">
                      {professionalMarkedAt ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Customer Confirmed:</span>
                    <span className="text-blue-900 font-semibold">
                      {customerConfirmedAt ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <MarkCompletedDialog
          isOpen={showMarkDialog}
          onClose={() => setShowMarkDialog(false)}
          onConfirm={handleMarkComplete}
          taskTitle="Fix kitchen sink plumbing"
          customerName="John Doe"
          payment="150 BGN"
        />

        <ConfirmCompletionDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmComplete}
          onReject={handleRejectComplete}
          professionalName="Jane Smith"
          taskTitle="Fix kitchen sink plumbing"
        />
      </div>
    </div>
  )
}
