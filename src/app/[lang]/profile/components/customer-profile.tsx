'use client'

import { useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Chip, Input, Select, SelectItem, RadioGroup, Radio } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { usePathname, useRouter } from 'next/navigation'
import { MapPin, Phone, Mail, Calendar, Star, CheckCircle, Save, X, Edit, User as UserIcon, Shield, Globe, MessageSquare } from 'lucide-react'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'
import { UserProfile } from '@/server/domain/user/user.types'
import { getCitiesWithLabels } from '@/features/cities'

interface CustomerProfileProps {
 profile: UserProfile
 onProfileUpdate: (updates: Partial<UserProfile>) => Promise<void>
}

export function CustomerProfile({ profile, onProfileUpdate }: CustomerProfileProps) {
 const { t } = useTranslation()
 const [isEditing, setIsEditing] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const router = useRouter()
 const pathname = usePathname()
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'en'

 // Get translated city options
 const cities = useMemo(() => getCitiesWithLabels(t), [t])

 // Form for personal information editing
 const personalForm = useForm({
  defaultValues: {
   name: profile.fullName || '',
   email: profile.email,
   phone: profile.phoneNumber || '',
   location: profile.city || '',
   preferredLanguage: profile.preferredLanguage,
   preferredContact: profile.preferredContact,
  },
  onSubmit: async ({ value }) => {
   setIsLoading(true)
   setError(null)

   try {
     await onProfileUpdate({
       fullName: value.name,
       phoneNumber: value.phone,
       city: value.location,
       preferredLanguage: value.preferredLanguage,
       preferredContact: value.preferredContact,
     })
     setIsEditing(false)
   } catch (err: any) {
     setError(err.message || 'Failed to save profile')
     console.error('Profile update error:', err)
   } finally {
     setIsLoading(false)
   }
  }
 })

 const handleCancel = () => {
  personalForm.reset()
  setIsEditing(false)
  setError(null)
 }

 return (
  <div className="space-y-4 md:space-y-6">
   {/* Error Message */}
   {error && (
    <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
     {error}
    </div>
   )}

   {/* Personal Information */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-3 md:px-6 py-3 md:py-4">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100">
       <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.customer.personalInfo')}</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4 px-3 md:px-6 py-4 md:py-6">
     {!isEditing ? (
      // View Mode
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
         <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.email')}</p>
         <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{profile.email}</p>
          {profile.isEmailVerified && (
           <Chip size="sm" variant="flat" color="success" startContent={<Shield className="w-3 h-3" />} className="flex-shrink-0">
            Verified
           </Chip>
          )}
         </div>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
         <Phone className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.phone')}</p>
         <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900">{profile.phoneNumber || 'Not set'}</p>
          {profile.isPhoneVerified ? (
           <Chip size="sm" variant="flat" color="success" startContent={<Shield className="w-3 h-3" />} className="flex-shrink-0">
            Verified
           </Chip>
          ) : (
           <Chip size="sm" variant="flat" color="warning" className="flex-shrink-0">
            Not Verified
           </Chip>
          )}
         </div>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-orange-100">
         <MapPin className="w-5 h-5 text-orange-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.location')}</p>
         <p className="font-semibold text-gray-900">
          {profile.city
           ? `${cities.find(c => c.slug === profile.city)?.label || profile.city}, ${profile.country}`
           : 'Not set'}
         </p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-purple-100">
         <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.memberSince')}</p>
         <p className="font-semibold text-gray-900">
          {new Date(profile.createdAt).toLocaleDateString()}
         </p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-indigo-100">
         <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Language</p>
         <p className="font-semibold text-gray-900">
          {profile.preferredLanguage === 'en' && 'English'}
          {profile.preferredLanguage === 'bg' && 'Български'}
          {profile.preferredLanguage === 'ru' && 'Русский'}
         </p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-pink-100">
         <MessageSquare className="w-5 h-5 text-pink-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Preferred Contact</p>
         <p className="font-semibold text-gray-900 capitalize">{profile.preferredContact}</p>
        </div>
       </div>
      </div>
     ) : (
      // Edit Mode
      <form
       onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        personalForm.handleSubmit()
       }}
      >
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <personalForm.Field name="name">
         {(field) => (
          <Input
           label={t('profile.form.name')}
           value={field.state.value}
           onValueChange={field.handleChange}
           startContent={<UserIcon className="w-4 h-4 text-gray-500" />}
          />
         )}
        </personalForm.Field>

        {/* Email Field */}
        <personalForm.Field
         name="email"
         validators={{
          onChange: ({ value }) => {
           if (!value) {
            return t('profile.form.validation.emailRequired')
           }
           if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return t('profile.form.validation.emailInvalid')
           }
          }
         }}
        >
         {(field) => (
          <Input
           type="email"
           label={t('profile.email')}
           value={field.state.value}
           onValueChange={field.handleChange}
           isRequired
           isInvalid={!!field.state.meta.errors.length}
           errorMessage={field.state.meta.errors[0]}
           startContent={<Mail className="w-4 h-4 text-gray-500" />}
          />
         )}
        </personalForm.Field>

        {/* Phone Field */}
        <personalForm.Field
         name="phone"
         validators={{
          onChange: ({ value }) => {
           // Only validate format if value is provided
           if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
            return t('profile.form.validation.phoneInvalid')
           }
          }
         }}
        >
         {(field) => (
          <Input
           type="tel"
           label={t('profile.phone')}
           value={field.state.value}
           onValueChange={field.handleChange}
           isInvalid={!!field.state.meta.errors.length}
           errorMessage={field.state.meta.errors[0]}
           startContent={<Phone className="w-4 h-4 text-gray-500" />}
           placeholder="+359 88 123 4567"
          />
         )}
        </personalForm.Field>

        {/* Location Field - City Dropdown */}
        <personalForm.Field name="location">
         {(field) => (
          <Select
           label={t('profile.location')}
           placeholder={t('profile.selectCity', 'Select your city')}
           selectedKeys={field.state.value ? [field.state.value] : []}
           onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string
            field.handleChange(selected || '')
           }}
           startContent={<MapPin className="w-4 h-4 text-gray-500" />}
          >
           {cities.map((city) => (
            <SelectItem key={city.slug} value={city.slug}>
             {city.label}
            </SelectItem>
           ))}
          </Select>
         )}
        </personalForm.Field>

        {/* Language Preference */}
        <personalForm.Field name="preferredLanguage">
         {(field) => (
          <Select
           label="Preferred Language"
           selectedKeys={[field.state.value]}
           onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as 'en' | 'bg' | 'ru'
            field.handleChange(selected as any)
           }}
           startContent={<Globe className="w-4 h-4 text-gray-500" />}
          >
           <SelectItem key="en" value="en">English</SelectItem>
           <SelectItem key="bg" value="bg">Български</SelectItem>
           <SelectItem key="ru" value="ru">Русский</SelectItem>
          </Select>
         )}
        </personalForm.Field>

        {/* Preferred Contact Method */}
        <personalForm.Field name="preferredContact">
         {(field) => (
          <div className="md:col-span-2">
           <label className="block text-sm font-medium mb-3">Preferred Contact Method</label>
           <RadioGroup
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value as any)}
            orientation="horizontal"
            classNames={{
             wrapper: "gap-3"
            }}
           >
            <Radio
             value="email"
             classNames={{
              base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-between flex-row-reverse max-w-fit cursor-pointer rounded-lg gap-3 p-3 border-2 border-gray-300 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
              wrapper: "group-data-[selected=true]:border-primary",
              control: "bg-white border-2 group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary",
              label: "text-sm font-medium"
             }}
            >
             <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
             </div>
            </Radio>
            <Radio
             value="phone"
             classNames={{
              base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-between flex-row-reverse max-w-fit cursor-pointer rounded-lg gap-3 p-3 border-2 border-gray-300 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
              wrapper: "group-data-[selected=true]:border-primary",
              control: "bg-white border-2 group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary",
              label: "text-sm font-medium"
             }}
            >
             <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
             </div>
            </Radio>
            <Radio
             value="sms"
             classNames={{
              base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-between flex-row-reverse max-w-fit cursor-pointer rounded-lg gap-3 p-3 border-2 border-gray-300 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
              wrapper: "group-data-[selected=true]:border-primary",
              control: "bg-white border-2 group-data-[selected=true]:border-primary group-data-[selected=true]:bg-primary",
              label: "text-sm font-medium"
             }}
            >
             <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>SMS</span>
             </div>
            </Radio>
           </RadioGroup>
          </div>
         )}
        </personalForm.Field>
       </div>
      </form>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditing ? (
       <Button
        size="sm"
        startContent={<Edit className="w-4 h-4 text-white" />}
        onPress={() => setIsEditing(true)}
        className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
       >
        {t('profile.editPersonalInfo')}
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={handleCancel}
         isDisabled={isLoading}
        >
         {t('cancel')}
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => personalForm.handleSubmit()}
         isLoading={isLoading}
        >
         {isLoading ? t('profile.form.saving') : t('save')}
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>


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