'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from '@tanstack/react-form'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from '@nextui-org/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MessageCircle, AlertCircle } from 'lucide-react'
import type { QuestionFormData } from '@/types/questions'
import { submitQuestion } from './mock-questions'

interface AskQuestionDialogProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
  taskAuthorId: string
  currentUserId?: string
  onQuestionSubmitted?: () => void
}

const MIN_LENGTH = 10
const MAX_LENGTH = 500

export default function AskQuestionDialog({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskAuthorId,
  currentUserId,
  onQuestionSubmitted,
}: AskQuestionDialogProps) {
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Check if user is trying to ask question on own task
  const isOwnTask = currentUserId === taskAuthorId

  const form = useForm({
    defaultValues: {
      questionText: '',
    },
    onSubmit: async ({ value }: { value: QuestionFormData }) => {
      setIsSubmitting(true)
      try {
        // Submit question using mock service
        await submitQuestion(taskId, currentUserId || 'mock-user-123', value)

        // Call parent callback if provided to reload questions
        if (onQuestionSubmitted) {
          onQuestionSubmitted()
        }

        // Show success state
        setIsSuccess(true)

        // Auto-close after 2 seconds
        setTimeout(() => {
          handleClose()
        }, 2000)
      } catch (error) {
        console.error('Question submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset()
      setIsSuccess(false)
      onClose()
    }
  }

  // Character count
  const questionLength = form.state.values.questionText?.length || 0
  const questionProgress = (questionLength / MAX_LENGTH) * 100

  // Validation
  const isValidLength = questionLength >= MIN_LENGTH && questionLength <= MAX_LENGTH
  const isFormValid = isValidLength && !isOwnTask

  // Button color based on form state
  const getButtonColor = () => {
    if (isOwnTask) return 'default'
    if (isFormValid) return 'success'
    if (questionLength > 0) return 'warning'
    return 'danger'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      classNames={{
        backdrop: 'bg-gradient-to-t from-zinc-900/80 to-zinc-900/20',
        base: 'border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800',
        header: 'border-b border-gray-200 dark:border-gray-800',
        body: 'py-6',
        footer: 'border-t border-gray-200 dark:border-gray-800',
        closeButton:
          'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 text-2xl font-bold',
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent>
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModalHeader className="flex flex-col gap-3 pt-6 px-6 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('taskDetail.askQuestionDialog.title')}
                    </h2>
                    <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {taskTitle}
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="gap-6 px-6">
                <form
                  id="question-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                  className="space-y-6"
                >
                  {isOwnTask && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        You cannot ask questions on your own task.
                      </p>
                    </motion.div>
                  )}

                  {/* Question Text */}
                  <form.Field
                    name="questionText"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value || value.length < MIN_LENGTH) {
                          return t('taskDetail.askQuestionDialog.minLength', {
                            min: MIN_LENGTH,
                          })
                        }
                        if (value.length > MAX_LENGTH) {
                          return t('taskDetail.askQuestionDialog.maxLength', {
                            max: MAX_LENGTH,
                          })
                        }
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('taskDetail.askQuestionDialog.placeholder')}
                        </label>
                        <Textarea
                          placeholder={t('taskDetail.askQuestionDialog.placeholder')}
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          isInvalid={field.state.meta.errors.length > 0}
                          errorMessage={
                            field.state.meta.errors.length > 0
                              ? String(field.state.meta.errors[0])
                              : undefined
                          }
                          minRows={4}
                          maxRows={10}
                          variant="bordered"
                          classNames={{
                            input: 'text-base',
                          }}
                          description={
                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-xs font-medium transition-colors ${
                                  questionLength > MAX_LENGTH
                                    ? 'text-danger'
                                    : questionLength < MIN_LENGTH
                                      ? 'text-warning'
                                      : 'text-success'
                                }`}
                              >
                                {t('taskDetail.askQuestionDialog.characterCount', {
                                  current: questionLength,
                                  max: MAX_LENGTH,
                                })}
                              </span>
                              {questionLength > 0 && (
                                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${
                                      questionLength > MAX_LENGTH
                                        ? 'bg-danger'
                                        : questionLength < MIN_LENGTH
                                          ? 'bg-warning'
                                          : 'bg-success'
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${Math.min(questionProgress, 100)}%`,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  />
                                </div>
                              )}
                            </div>
                          }
                        />
                        {questionLength === 0 && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Your question will be visible to everyone viewing this task. The task
                              author will be notified and can respond publicly.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </form.Field>
                </form>
              </ModalBody>

              <ModalFooter className="flex flex-col-reverse sm:flex-row gap-3 px-6 py-5">
                <Button
                  color="default"
                  variant="flat"
                  onPress={handleClose}
                  isDisabled={isSubmitting}
                  size="lg"
                  className="font-semibold w-full sm:w-auto py-6"
                >
                  {t('taskDetail.cancel')}
                </Button>
                <Button
                  color={getButtonColor()}
                  type="submit"
                  form="question-form"
                  isLoading={isSubmitting}
                  isDisabled={isOwnTask || !isFormValid}
                  size="lg"
                  variant="bordered"
                  className="font-semibold transition-colors duration-300 w-full sm:w-auto py-6"
                >
                  {isSubmitting
                    ? 'Posting...'
                    : t('taskDetail.askQuestionDialog.submit')}
                </Button>
              </ModalFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Confetti Effect */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 to-green-400 rounded-full"
                    initial={{
                      x: '50%',
                      y: '50%',
                      opacity: 1,
                      scale: 0,
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 100}%`,
                      y: `${50 + (Math.random() - 0.5) * 100}%`,
                      opacity: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      ease: 'easeOut',
                      delay: i * 0.02,
                    }}
                  />
                ))}
              </div>

              <ModalHeader className="flex flex-col items-center gap-4 pt-8 px-6 pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border-4 border-green-200 dark:border-green-800 shadow-lg"
                >
                  <Check className="text-green-600 dark:text-green-400 w-10 h-10 stroke-[3]" />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t('taskDetail.questionPosted')}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    The task author will be notified
                  </p>
                </div>
              </ModalHeader>

              <ModalBody className="py-6 px-6">
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      Your question is now visible to everyone viewing this task. You'll be
                      notified when the author responds.
                    </p>
                  </div>
                </div>
              </ModalBody>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalContent>
    </Modal>
  )
}
