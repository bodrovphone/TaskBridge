'use client'

import { UserProfile, PreferredContact, PreferredLanguage } from '@/server/domain/user/user.types'
import { PersonalInfoSection } from './shared/personal-info-section'

interface CustomerProfileProps {
 profile: UserProfile
 onProfileUpdate: (updates: Partial<UserProfile>) => Promise<void>
 onSettingsOpen?: () => void
}

export function CustomerProfile({ profile, onProfileUpdate, onSettingsOpen }: CustomerProfileProps) {
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
  </div>
 )
}