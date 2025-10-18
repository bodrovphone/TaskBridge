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
 Bell,
 Shield,
 Trash2
} from 'lucide-react'

interface NotificationSettings {
 emailNotifications: boolean
 taskUpdates: boolean
 marketingEmails: boolean
 smsNotifications: boolean
 pushNotifications: boolean
 weeklyDigest: boolean
}

interface SettingsModalProps {
 isOpen: boolean
 onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
 const { t } = useTranslation()

 // Comprehensive notification settings state
 const [notifications, setNotifications] = useState<NotificationSettings>({
  emailNotifications: true,
  taskUpdates: true,
  marketingEmails: false,
  smsNotifications: false,
  pushNotifications: true,
  weeklyDigest: false
 })

 const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
  setNotifications(prev => ({
   ...prev,
   [key]: value
  }))
  // Auto-save notification preference
  console.log('Notification setting updated:', { [key]: value })
 }

 return (
  <Modal
   isOpen={isOpen}
   onClose={onClose}
   size="2xl"
   scrollBehavior="inside"
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
      {/* Notifications */}
      <Card>
       <CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
         <Bell className="w-5 h-5 text-gray-600" />
         <h3 className="font-semibold">{t('profile.settings.notifications')}</h3>
        </div>

        <div className="space-y-3">
         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.emailNotifications')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.emailNotificationsDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.emailNotifications}
           onValueChange={(checked) => handleNotificationChange('emailNotifications', checked)}
          />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.taskUpdates')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.taskUpdatesDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.taskUpdates}
           onValueChange={(checked) => handleNotificationChange('taskUpdates', checked)}
          />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.customer.smsNotifications')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.customer.smsNotificationsDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.smsNotifications}
           onValueChange={(checked) => handleNotificationChange('smsNotifications', checked)}
          />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.pushNotifications')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.pushNotificationsDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.pushNotifications}
           onValueChange={(checked) => handleNotificationChange('pushNotifications', checked)}
          />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.weeklyDigest')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.weeklyDigestDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.weeklyDigest}
           onValueChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
          />
         </div>

         <Divider />

         <div className="flex justify-between items-center">
          <div>
           <p className="font-medium">{t('profile.settings.marketingEmails')}</p>
           <p className="text-sm text-gray-600">
            {t('profile.settings.marketingEmailsDesc')}
           </p>
          </div>
          <Switch
           isSelected={notifications.marketingEmails}
           onValueChange={(checked) => handleNotificationChange('marketingEmails', checked)}
          />
         </div>
        </div>
       </CardBody>
      </Card>

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