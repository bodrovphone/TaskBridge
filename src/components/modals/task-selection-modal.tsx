'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { Briefcase } from 'lucide-react'

interface Task {
  id: string
  title: string
  category: string
  budget?: number
}

interface TaskSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  professionalName: string
  onSelectTask: (taskId: string) => void
  onCreateNewTask: () => void
  isLoading?: boolean
  isLoadingTasks?: boolean
}

export function TaskSelectionModal({
  isOpen,
  onClose,
  tasks,
  professionalName,
  onSelectTask,
  onCreateNewTask,
  isLoading = false,
  isLoadingTasks = false,
}: TaskSelectionModalProps) {
  const { t } = useTranslation()
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')

  const handleSubmit = () => {
    if (selectedTaskId === 'CREATE_NEW') {
      onCreateNewTask()
    } else if (selectedTaskId) {
      onSelectTask(selectedTaskId)
    }
  }

  const selectedTask = tasks.find((task) => task.id === selectedTaskId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      placement="center"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>{t('inviteModal.title', 'Invite Professional to Task')}</span>
              </div>
              <p className="text-sm font-normal text-gray-600">
                {t('inviteModal.subtitle', {
                  defaultValue: 'Select which task to invite {{name}} to',
                  name: professionalName,
                })}
              </p>
            </ModalHeader>
            <ModalBody>
              {isLoadingTasks ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('inviteModal.loadingTasks', 'Loading your tasks...')}</p>
                </div>
              ) : (
                <>
                  <Select
                    label={t('inviteModal.selectLabel', 'Choose a task')}
                    placeholder={t('inviteModal.selectPlaceholder', 'Select your task')}
                    selectedKeys={selectedTaskId ? [selectedTaskId] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      setSelectedTaskId(selected)
                    }}
                    classNames={{
                      trigger: 'min-h-12',
                      value: 'text-left',
                    }}
                    renderValue={(items) => {
                      return items.map((item) => {
                        if (item.key === 'CREATE_NEW') {
                          return (
                            <div key={item.key} className="flex flex-col">
                              <span className="font-medium text-sm text-blue-600">
                                {t('inviteModal.createNewTask', '+ Create New Task')}
                              </span>
                            </div>
                          )
                        }
                        const task = tasks.find((t) => t.id === item.key)
                        if (!task) return null
                        return (
                          <div key={item.key} className="flex flex-col">
                            <span className="font-medium text-sm">{task.title}</span>
                            {task.budget && (
                              <span className="text-xs text-gray-500">{task.budget} BGN</span>
                            )}
                          </div>
                        )
                      })
                    }}
                  >
                    {[
                      <SelectItem
                        key="CREATE_NEW"
                        value="CREATE_NEW"
                        textValue={t('inviteModal.createNewTask', '+ Create New Task')}
                        className="text-blue-600 font-semibold"
                      >
                        <div className="flex items-center gap-2 py-1">
                          <span className="text-blue-600 text-lg">+</span>
                          <span className="font-semibold text-blue-600">
                            {t('inviteModal.createNewTask', 'Create New Task')}
                          </span>
                        </div>
                      </SelectItem>,
                      ...tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id} textValue={task.title}>
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{task.title}</span>
                            {task.budget && (
                              <span className="text-xs text-gray-500">{task.budget} BGN</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ]}
                  </Select>

                  {selectedTask && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{professionalName}</span>{' '}
                        {t(
                          'inviteModal.confirmText',
                          'will receive a notification about this task invitation.'
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="flat"
                color="default"
                onPress={onClose}
                className="font-medium"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isDisabled={!selectedTaskId || isLoadingTasks}
                isLoading={isLoading}
                className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {selectedTaskId === 'CREATE_NEW'
                  ? t('inviteModal.continue', 'Continue')
                  : t('inviteModal.sendInvitation', 'Send Invitation')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
