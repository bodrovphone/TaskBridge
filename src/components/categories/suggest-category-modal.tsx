'use client'

import { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea
} from '@nextui-org/react'
import { HelpCircle, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/hooks/use-toast'

interface SuggestCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
}

export function SuggestCategoryModal({
  isOpen,
  onClose,
  isAuthenticated
}: SuggestCategoryModalProps) {
  const { t } = useTranslation()
  const [suggestion, setSuggestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const suggestionLength = suggestion.trim().length
  const canSubmit = suggestionLength >= 10 && suggestionLength <= 500 && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    // Check authentication
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: t('categories.suggestionAuthRequired')
      })
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/category-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion: suggestion.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: 'destructive',
            title: t('categories.suggestionAuthRequired')
          })
        } else {
          toast({
            variant: 'destructive',
            title: t('categories.suggestionError')
          })
        }
        return
      }

      // Success!
      toast({
        variant: 'success',
        title: t('categories.suggestionSuccess')
      })
      setSuggestion('')
      onClose()

    } catch (error) {
      console.error('Error submitting category suggestion:', error)
      toast({
        variant: 'destructive',
        title: t('categories.suggestionError')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSuggestion('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      classNames={{
        wrapper: 'overflow-x-hidden',
        base: 'bg-white max-h-[95vh] md:max-h-[90vh] mx-2 md:mx-auto w-full',
        header: 'border-b border-gray-200',
        body: 'max-h-[calc(95vh-140px)] md:max-h-none overflow-x-hidden',
        footer: 'border-t border-gray-200'
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>{t('categories.suggestCategoryTitle')}</span>
        </ModalHeader>

        <ModalBody className="py-6">
          {/* Help Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              {t('categories.suggestCategoryMessage')}
            </p>
          </div>

          {/* Suggestion Textarea */}
          <Textarea
            label={t('categories.suggestCategoryPlaceholder')}
            placeholder={t('categories.suggestCategoryPlaceholder')}
            value={suggestion}
            onValueChange={setSuggestion}
            minRows={4}
            maxRows={8}
            isDisabled={isSubmitting}
            classNames={{
              input: 'resize-y text-base', // 16px font size prevents iOS zoom
            }}
          />

          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {suggestionLength < 10 && (
                <span className="text-orange-600">
                  {t('categories.suggestionMinLength')}
                </span>
              )}
              {suggestionLength > 500 && (
                <span className="text-red-600">
                  {t('categories.suggestionMaxLength')}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                suggestionLength < 10
                  ? 'text-orange-600'
                  : suggestionLength > 500
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {suggestionLength} / 500
            </span>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            onPress={handleClose}
            isDisabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            color="primary"
            startContent={<Send className="w-4 h-4" />}
            onPress={handleSubmit}
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
          >
            {t('categories.submitSuggestion')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
