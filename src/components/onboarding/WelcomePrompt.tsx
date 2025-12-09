'use client'

import { Modal, ModalContent, ModalBody, Button } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'
import { Logo } from '@/components/common/logo'

interface WelcomePromptProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export function WelcomePrompt({ isOpen, onAccept, onDecline }: WelcomePromptProps) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onDecline}
      placement="center"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: 'max-w-md',
        body: 'p-0',
      }}
    >
      <ModalContent>
        <ModalBody>
          {/* Gradient header with logo */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 rounded-t-xl">
            <div className="flex justify-center">
              <Logo size="md" variant="light" />
            </div>
          </div>

          <div className="p-6 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('onboarding.welcome.title')}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              {t('onboarding.welcome.description')}
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onPress={onAccept}
                className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                {t('onboarding.welcome.acceptButton')}
              </Button>
              <Button
                variant="bordered"
                size="lg"
                onPress={onDecline}
                className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                {t('onboarding.welcome.declineButton')}
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
