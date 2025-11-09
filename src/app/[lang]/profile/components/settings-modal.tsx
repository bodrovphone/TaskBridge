'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
 Modal,
 ModalContent,
 ModalHeader,
 ModalBody,
 ModalFooter,
 Button,
 Card,
 CardBody,
 Switch,
 Divider
} from '@nextui-org/react'
import {
 Settings,
 Shield,
 Trash2
} from 'lucide-react'
import { TelegramConnection } from './telegram-connection'

interface SettingsModalProps {
 isOpen: boolean
 onClose: () => void
 userId: string // Required - real user ID from auth
 telegramConnected?: boolean
 telegramUsername?: string | null
 telegramFirstName?: string | null
 onTelegramConnectionChange?: () => void // Callback when Telegram connection state changes
}

export function SettingsModal({
 isOpen,
 onClose,
 userId, // Required - must be passed from parent
 telegramConnected = false,
 telegramUsername = null,
 telegramFirstName = null,
 onTelegramConnectionChange
}: SettingsModalProps) {
 const { t } = useTranslation()

 return (
  <Modal
   isOpen={isOpen}
   onClose={onClose}
   size="2xl"
   scrollBehavior="inside"
   classNames={{
     base: "max-h-[95vh] md:max-h-[90vh]",
     body: "max-h-[calc(95vh-8rem)] md:max-h-[calc(90vh-8rem)]"
   }}
  >
   <ModalContent>
    <ModalHeader className="flex flex-col gap-1">
     <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gray-100">
       <Settings className="w-5 h-5 text-gray-600" />
      </div>
      <div>
       <h2 className="text-xl font-semibold">{t('profile.settings')}</h2>
       <p className="text-sm text-gray-600 font-normal">
        {t('profile.settings.description')}
       </p>
      </div>
     </div>
    </ModalHeader>

    <ModalBody>
     <div className="space-y-6">
      {/* Telegram Connection */}
      <TelegramConnection
       userId={userId}
       telegramConnected={telegramConnected}
       telegramUsername={telegramUsername}
       telegramFirstName={telegramFirstName}
       onConnectionChange={onTelegramConnectionChange}
      />

      {/* Privacy */}
      <Card>
       <CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
         <Shield className="w-5 h-5 text-gray-600" />
         <h3 className="font-semibold">{t('profile.settings.privacy')}</h3>
        </div>

        <div className="space-y-3">
         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.profileVisibility')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.profileVisibilityDesc')}
           </p>
          </div>
          <Switch defaultSelected />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.showContactInfo')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.showContactInfoDesc')}
           </p>
          </div>
          <Switch defaultSelected />
         </div>
        </div>
       </CardBody>
      </Card>


      {/* Danger Zone */}
      <Card className="border-danger-200">
       <CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
         <Trash2 className="w-5 h-5 text-danger" />
         <h3 className="font-semibold text-danger">{t('profile.settings.dangerZone')}</h3>
        </div>

        <div className="space-y-3">
         <Button
          variant="bordered"
          color="danger"
          size="sm"
          className="justify-start"
          onPress={() => {
           // TODO: Implement account deletion flow
           alert(t('profile.settings.deleteAccountConfirm'))
          }}
         >
          {t('profile.settings.deleteAccount')}
         </Button>
         <p className="text-sm text-gray-600">
          {t('profile.settings.deleteAccountDesc')}
         </p>
        </div>
       </CardBody>
      </Card>
     </div>
    </ModalBody>

    <ModalFooter>
     <Button
      variant="bordered"
      onPress={onClose}
     >
      {t('cancel')}
     </Button>
     <Button
      color="primary"
      onPress={() => {
       // TODO: Implement save functionality
       onClose()
      }}
     >
      {t('save')}
     </Button>
    </ModalFooter>
   </ModalContent>
  </Modal>
 )
}