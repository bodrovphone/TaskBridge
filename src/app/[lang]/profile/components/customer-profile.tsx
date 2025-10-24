'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Chip, Input, Select, SelectItem, RadioGroup, Radio } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { usePathname, useRouter } from 'next/navigation'
import { MapPin, Phone, Mail, Calendar, Star, CheckCircle, Save, X, Edit, User as UserIcon, Shield, Globe, MessageSquare } from 'lucide-react'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'

interface User {
 id: string
 name: string
 email: string
 avatar?: string | null
 isVerified: boolean
 isProfessional: boolean
 completionRate: number
}

interface CustomerProfileProps {
 user: User
}

export function CustomerProfile({ user }: CustomerProfileProps) {
 const { t } = useTranslation()
 const [isEditing, setIsEditing] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const router = useRouter()
 const pathname = usePathname()
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'en'

 // Mock customer data
 const customerData = {
  location: 'Sofia, Bulgaria',
  phone: '+359 88 123 4567',
  memberSince: '2023-01-15',
  tasksPosted: 12,
  tasksCompleted: 8,
  averageRating: 4.8,
  totalSpent: 2450,
  isEmailVerified: true,
  isPhoneVerified: false,
  preferredLanguage: 'en' as 'en' | 'bg' | 'ru',
  preferredContact: 'email' as 'email' | 'phone' | 'sms'
 }

 // Form for personal information editing
 const personalForm = useForm({
  defaultValues: {
   name: user.name,
   email: user.email,
   phone: customerData.phone,
   location: customerData.location,
   preferredLanguage: customerData.preferredLanguage,
   preferredContact: customerData.preferredContact,
  },
  onSubmit: async ({ value }) => {
   setIsLoading(true)

   // Simulate API call
   await new Promise(resolve => setTimeout(resolve, 1500))

   console.log('Saving personal info:', value)
   setIsLoading(false)
   setIsEditing(false)

   // TODO: Update user data in global state/context
  }
 })

 const handleCancel = () => {
  personalForm.reset()
  setIsEditing(false)
 }

 return (
  <div className="space-y-4 md:space-y-6">
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
          <p className="font-semibold text-gray-900 truncate">{user.email}</p>
          {customerData.isEmailVerified && (
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
          <p className="font-semibold text-gray-900">{customerData.phone}</p>
          {customerData.isPhoneVerified ? (
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
         <p className="font-semibold text-gray-900">{customerData.location}</p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-purple-100">
         <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.memberSince')}</p>
         <p className="font-semibold text-gray-900">{new Date(customerData.memberSince).toLocaleDateString()}</p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-indigo-100">
         <Globe className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Language</p>
         <p className="font-semibold text-gray-900">
          {customerData.preferredLanguage === 'en' && 'English'}
          {customerData.preferredLanguage === 'bg' && 'Български'}
          {customerData.preferredLanguage === 'ru' && 'Русский'}
         </p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
        <div className="p-2 rounded-lg bg-pink-100">
         <MessageSquare className="w-5 h-5 text-pink-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Preferred Contact</p>
         <p className="font-semibold text-gray-900 capitalize">{customerData.preferredContact}</p>
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

        {/* Location Field */}
        <personalForm.Field name="location">
         {(field) => (
          <Input
           label={t('profile.location')}
           value={field.state.value}
           onValueChange={field.handleChange}
           startContent={<MapPin className="w-4 h-4 text-gray-500" />}
           placeholder="Sofia, Bulgaria"
          />
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