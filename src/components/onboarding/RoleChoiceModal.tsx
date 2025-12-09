'use client'

import { Modal, ModalContent, ModalBody, Card, CardBody } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Briefcase } from 'lucide-react'
import { Logo } from '@/components/common/logo'

interface RoleChoiceModalProps {
  isOpen: boolean
  onSelect: (choice: 'customer' | 'professional') => void
}

export function RoleChoiceModal({ isOpen, onSelect }: RoleChoiceModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      size="lg"
      classNames={{
        base: 'max-w-xl',
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

          <div className="p-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {t('onboarding.roleChoice.title')}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {t('onboarding.roleChoice.subtitle')}
            </p>

            {/* Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Option */}
              <Card
                isPressable
                onPress={() => onSelect('customer')}
                className="border-2 border-blue-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all bg-gradient-to-br from-white to-blue-50/50"
              >
                <CardBody className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('onboarding.roleChoice.customer.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('onboarding.roleChoice.customer.description')}
                  </p>
                </CardBody>
              </Card>

              {/* Professional Option */}
              <Card
                isPressable
                onPress={() => onSelect('professional')}
                className="border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 transition-all bg-gradient-to-br from-white to-emerald-50/50"
              >
                <CardBody className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Briefcase className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('onboarding.roleChoice.professional.title')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('onboarding.roleChoice.professional.description')}
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
