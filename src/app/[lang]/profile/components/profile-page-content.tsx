'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, Card, CardBody, Button, Avatar, Chip } from '@nextui-org/react'
import { User, Briefcase, Settings, Bell, Shield, CreditCard, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { CustomerProfile } from './customer-profile'
import { ProfessionalProfile } from './professional-profile'
import { SettingsModal } from './settings-modal'
import { StatisticsModal } from './statistics-modal'
import { AvatarUpload } from './avatar-upload'

interface ProfilePageContentProps {
 lang: string
}

export function ProfilePageContent({ lang }: ProfilePageContentProps) {
 const { t } = useTranslation()
 const { user } = useAuth()
 const [selectedTab, setSelectedTab] = useState('customer')
 const [isSettingsOpen, setIsSettingsOpen] = useState(false)
 const [isStatisticsOpen, setIsStatisticsOpen] = useState(false)
 const [userAvatar, setUserAvatar] = useState<string | null>(null)

 // Mock user data for development (since authentication is currently disabled)
 const mockUser = {
  id: '1',
  name: 'Alexander Bodrov',
  email: 'alex@example.com',
  avatar: userAvatar,
  isVerified: true,
  isProfessional: false,
  completionRate: 0.5 // 50% profile completion
 }

 const handleAvatarChange = (newAvatar: string) => {
  setUserAvatar(newAvatar)
  // In real implementation, this would also update the global user state
  console.log('Avatar updated:', newAvatar)
 }

 const completionPercentage = Math.round(mockUser.completionRate * 100)

 return (
  <div
   className="min-h-screen relative"
   style={{
    backgroundImage: 'url(/images/cardboard.png)',
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto'
   }}
  >
   {/* Layered overlays for depth */}
   <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-blue-50/50 "></div>

   {/* Decorative background elements */}
   <div className="absolute inset-0 opacity-10 pointer-events-none">
    <div className="absolute top-20 left-10 w-40 h-40 bg-primary-200 rounded-full blur-3xl"></div>
    <div className="absolute bottom-40 right-20 w-56 h-56 bg-secondary-200 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-2xl"></div>
   </div>

   <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
   {/* Profile Header */}
   <div className="mb-8">
    <Card className="shadow-2xl border border-white/20 bg-white/95 hover:shadow-blue-500/10 transition-shadow duration-300">
     <CardBody className="p-4 md:p-8 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-white/10 to-secondary-50/40 pointer-events-none"></div>

      {/* Decorative corner accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary-200 to-blue-300 rounded-full blur-3xl opacity-30"></div>

      <div className="relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
       <AvatarUpload
        currentAvatar={mockUser.avatar}
        userName={mockUser.name}
        onAvatarChange={handleAvatarChange}
        size="lg"
        className=""
       />

       <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
         <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">{mockUser.name}</h1>
         {mockUser.isVerified && (
          <Chip
           color="success"
           variant="flat"
           startContent={<Shield className="w-4 h-4" />}
           size="sm"
           className="shadow-sm"
          >
           {t('profile.verified')}
          </Chip>
         )}
        </div>

        <p className="text-gray-600 mb-4 flex items-center gap-2">
         <Bell className="w-4 h-4 text-gray-400" />
         {mockUser.email}
        </p>

        {/* Profile completion with visual indicator */}
        <div className="flex items-center gap-4 mb-4">
         <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
           <span className="text-sm font-medium text-gray-700">{t('profile.completion')}</span>
           <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {completionPercentage}%
           </span>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
           <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${completionPercentage}%` }}
           ></div>
          </div>
         </div>
        </div>

        <div className="flex flex-wrap gap-2">
         <Button
          size="sm"
          startContent={<BarChart3 className="w-4 h-4 text-white" />}
          onPress={() => setIsStatisticsOpen(true)}
          className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
         >
          {t('profile.statistics')}
         </Button>

         <Button
          size="sm"
          variant="bordered"
          startContent={<Settings className="w-4 h-4" />}
          onPress={() => setIsSettingsOpen(true)}
          className="hover:scale-105 transition-transform border-gray-300 hover:border-primary hover:bg-primary/5"
         >
          {t('profile.settings')}
         </Button>
        </div>
       </div>
      </div>
      </div>
     </CardBody>
    </Card>
   </div>

   {/* Profile Tabs */}
   <div className="mb-6">
    <Card className="shadow-xl border border-white/20 bg-white/95 hover:shadow-2xl transition-shadow duration-300">
     <CardBody className="p-0">
      <Tabs
       selectedKey={selectedTab}
       onSelectionChange={(key) => setSelectedTab(key as string)}
       variant="light"
       classNames={{
        base: "w-full",
        tabList: "gap-2 w-full relative rounded-none p-3 bg-gray-50/50",
        cursor: "bg-white shadow-md rounded-lg",
        tab: "h-11 px-6 data-[hover-unselected=true]:opacity-80",
        tabContent: "group-data-[selected=true]:text-primary group-data-[selected=true]:font-semibold text-gray-500"
       }}
      >
    <Tab
     key="customer"
     title={
      <div className="flex items-center gap-2.5">
       <User className="w-4.5 h-4.5" />
       <span>{t('profile.tabs.customer')}</span>
      </div>
     }
    >
     <div className="p-3 md:p-8">
      <CustomerProfile user={mockUser} />
     </div>
    </Tab>

    <Tab
     key="professional"
     title={
      <div className="flex items-center gap-2.5">
       <Briefcase className="w-4.5 h-4.5" />
       <span>{t('profile.tabs.professional')}</span>
      </div>
     }
    >
     <div className="p-3 md:p-8">
      <ProfessionalProfile user={mockUser} />
     </div>
    </Tab>
   </Tabs>
     </CardBody>
    </Card>
   </div>

   {/* Settings Modal */}
   <SettingsModal
    isOpen={isSettingsOpen}
    onClose={() => setIsSettingsOpen(false)}
   />

   {/* Statistics Modal */}
   <StatisticsModal
    isOpen={isStatisticsOpen}
    onClose={() => setIsStatisticsOpen(false)}
    userRole={mockUser.isProfessional ? 'professional' : 'customer'}
   />
   </div>
  </div>
 )
}