'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader, Chip, Button } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { useRouter, usePathname } from 'next/navigation'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'
import { Star, CheckCircle } from 'lucide-react'
import { UserProfile, PreferredContact, PreferredLanguage } from '@/server/domain/user/user.types'
import { PersonalInfoSection } from './shared/personal-info-section'

interface CustomerProfileProps {
 profile: UserProfile
 onProfileUpdate: (updates: Partial<UserProfile>) => Promise<void>
 onSettingsOpen?: () => void
}

export function CustomerProfile({ profile, onProfileUpdate, onSettingsOpen }: CustomerProfileProps) {
 const { t } = useTranslation()
 const router = useRouter()
 const pathname = usePathname()
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'bg'

 const handlePersonalInfoSave = async (data: {
  name: string
  phone: string
  location: string
  preferredLanguage: PreferredLanguage
  preferredContact: PreferredContact
 }) => {
  await onProfileUpdate({
    fullName: data.name,
    phoneNumber: data.phone,
    city: data.location,
    preferredLanguage: data.preferredLanguage,
    preferredContact: data.preferredContact,
  })
 }

 return (
  <div className="space-y-4 md:space-y-6">
   {/* Personal Information */}
   <PersonalInfoSection
    profile={profile}
    onSave={handlePersonalInfoSave}
    onSettingsOpen={onSettingsOpen}
   />


   {/* Recent Activity */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-3 md:px-6 py-3 md:py-4">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-100">
       <Star className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.customer.recentActivity')}</h3>
     </div>
    </CardHeader>
    <CardBody className="px-3 md:px-6 py-4 md:py-6">
     <div className="space-y-3">
      {/* Mock recent activities */}
      <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/50 border border-emerald-100/50 hover:shadow-md transition-all">
       <div className="p-2 rounded-lg bg-emerald-100">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
       </div>
       <div className="flex-1">
        <p className="font-semibold text-gray-900">{t('profile.customer.taskCompleted')}</p>
        <p className="text-sm text-gray-600">Apartment Cleaning - €80</p>
       </div>
       <Chip size="sm" variant="flat" color="success" className="shadow-sm">
        {t('profile.completed')}
       </Chip>
      </div>

      <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-primary-50/50 border border-blue-100/50 hover:shadow-md transition-all">
       <div className="p-2 rounded-lg bg-blue-100">
        <CheckCircle className="w-5 h-5 text-primary" />
       </div>
       <div className="flex-1">
        <p className="font-semibold text-gray-900">{t('profile.customer.taskPosted')}</p>
        <p className="text-sm text-gray-600">Website Development - €500</p>
       </div>
       <Chip size="sm" variant="solid" color="primary" className="shadow-sm">
        {t('profile.active')}
       </Chip>
      </div>
     </div>

     <div className="mt-6 text-center">
      <Button
       variant="flat"
       color="primary"
       size="sm"
       onPress={() => router.push(`/${currentLocale}/browse-tasks`)}
       className="hover:scale-105 transition-transform"
      >
       {t('profile.customer.viewAllTasks')}
      </Button>
     </div>
    </CardBody>
   </Card>
  </div>
 )
}