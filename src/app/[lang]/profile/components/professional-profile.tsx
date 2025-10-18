'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Chip, Input, Textarea, Select, SelectItem, RadioGroup, Radio, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react'
import { useTranslation } from 'react-i18next'
import { usePathname, useRouter } from 'next/navigation'
import { extractLocaleFromPathname } from '@/lib/utils/url-locale'
import {
 Briefcase,
 Star,
 Calendar,
 MapPin,
 Award,
 TrendingUp,
 Eye,
 CheckCircle,
 Edit,
 Save,
 X,
 Settings,
 Shield,
 Phone,
 FileText,
 Clock,
 MapPinned,
 Banknote,
 Languages
} from 'lucide-react'
import { ServiceCategoriesSelector } from './service-categories-selector'
import { PortfolioGalleryManager } from './portfolio-gallery-manager'
// Categories are now managed through /features/categories

interface User {
 id: string
 name: string
 email: string
 avatar?: string | null
 isVerified: boolean
 isProfessional: boolean
 completionRate: number
}

interface ProfessionalProfileProps {
 user: User
}

const experienceOptions = [
 { key: '0-1', label: '0-1 years' },
 { key: '2-5', label: '2-5 years' },
 { key: '5-10', label: '5-10 years' },
 { key: '10+', label: '10+ years' }
]

const responseTimeOptions = [
 { key: '1h', label: 'Within 1 hour' },
 { key: '2h', label: 'Within 2 hours' },
 { key: '4h', label: 'Within 4 hours' },
 { key: '24h', label: 'Within 24 hours' }
]

export function ProfessionalProfile({ user }: ProfessionalProfileProps) {
 const { t } = useTranslation()
 const [isEditingIdentity, setIsEditingIdentity] = useState(false)
 const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
 const [isEditingAvailability, setIsEditingAvailability] = useState(false)
 const [isEditingBusiness, setIsEditingBusiness] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [tempCategories, setTempCategories] = useState<string[]>([])
 const router = useRouter()
 const pathname = usePathname()
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'en'

 // Mock professional data
 const [professionalData, setProfessionalData] = useState({
  title: 'Professional Cleaning & Home Services',
  bio: 'Experienced home service professional with 5 years of expertise. I specialize in deep cleaning, regular maintenance, and use eco-friendly products with my own equipment.',
  yearsExperience: '5-10',
  serviceCategories: [] as string[], // Empty for new professionals - shows CTA
  availability: 'available' as 'available' | 'busy' | 'unavailable',
  responseTime: '2h',
  serviceArea: ['Sofia', 'Plovdiv'],
  isPhoneVerified: true,
  paymentMethods: ['cash', 'bank_transfer', 'card'],
  languages: ['bg', 'en'],
  weekdayHours: { start: '08:00', end: '18:00' },
  weekendHours: { start: '09:00', end: '14:00' },
  // Portfolio
  portfolio: [
   {
    id: '1',
    title: 'Deep apartment cleaning - 2 bedroom',
    beforeImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    description: 'Complete deep cleaning of a 2-bedroom apartment including kitchen and bathroom.',
    duration: '4 hours',
    tags: ['deep_cleaning', 'house_cleaning']
   }
  ],
  // Statistics (read-only)
  completedTasks: 89,
  averageRating: 4.9,
  totalEarnings: 3200,
  profileViews: 156,
  memberSince: '2023-01-15'
 })

 // Professional Identity Form
 const identityForm = useForm({
  defaultValues: {
   title: professionalData.title,
   bio: professionalData.bio,
   yearsExperience: professionalData.yearsExperience,
  },
  onSubmit: async ({ value }) => {
   setIsLoading(true)
   await new Promise(resolve => setTimeout(resolve, 1500))
   console.log('Saving identity:', value)
   setProfessionalData(prev => ({ ...prev, ...value }))
   setIsLoading(false)
   setIsEditingIdentity(false)
  }
 })

 // Availability Form
 const availabilityForm = useForm({
  defaultValues: {
   availability: professionalData.availability,
   responseTime: professionalData.responseTime,
   serviceArea: professionalData.serviceArea,
  },
  onSubmit: async ({ value }) => {
   setIsLoading(true)
   await new Promise(resolve => setTimeout(resolve, 1500))
   console.log('Saving availability:', value)
   setProfessionalData(prev => ({ ...prev, ...value }))
   setIsLoading(false)
   setIsEditingAvailability(false)
  }
 })

 const openCategoriesModal = () => {
  setTempCategories(professionalData.serviceCategories)
  setIsCategoriesModalOpen(true)
 }

 const saveCategoriesModal = () => {
  setProfessionalData(prev => ({ ...prev, serviceCategories: tempCategories }))
  setIsCategoriesModalOpen(false)
 }

 const cancelCategoriesModal = () => {
  setTempCategories([])
  setIsCategoriesModalOpen(false)
 }

 const handlePortfolioChange = (items: any[]) => {
  setProfessionalData(prev => ({ ...prev, portfolio: items }))
 }

 return (
  <div className="space-y-4 md:space-y-6">
   {/* 1. Professional Identity */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100">
       <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">Professional Identity</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4 px-4 md:px-6">
     {!isEditingIdentity ? (
      // View Mode
      <div className="space-y-4">
       <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Professional Title</p>
        <p className="text-lg font-semibold text-gray-900">{professionalData.title}</p>
       </div>

       <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bio</p>
        <p className="text-gray-700 leading-relaxed">{professionalData.bio}</p>
       </div>

       <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
        <div className="p-2 rounded-lg bg-purple-100">
         <Award className="w-5 h-5 text-purple-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Years of Experience</p>
         <p className="font-semibold text-gray-900">{professionalData.yearsExperience}</p>
        </div>
       </div>
      </div>
     ) : (
      // Edit Mode
      <form onSubmit={(e) => { e.preventDefault(); identityForm.handleSubmit() }}>
       <div className="space-y-4">
        <identityForm.Field name="title">
         {(field) => (
          <Input
           label="Professional Title"
           placeholder="e.g., Professional Cleaning & Home Services"
           value={field.state.value}
           onValueChange={field.handleChange}
           startContent={<Briefcase className="w-4 h-4 text-gray-500" />}
          />
         )}
        </identityForm.Field>

        <identityForm.Field name="bio">
         {(field) => (
          <Textarea
           label="Bio"
           placeholder="Tell customers about your experience, specializations, and approach..."
           value={field.state.value}
           onValueChange={field.handleChange}
           minRows={4}
           maxRows={8}
          />
         )}
        </identityForm.Field>

        <identityForm.Field name="yearsExperience">
         {(field) => (
          <Select
           label="Years of Experience"
           selectedKeys={[field.state.value]}
           onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string
            field.handleChange(selected)
           }}
           startContent={<Award className="w-4 h-4 text-gray-500" />}
          >
           {experienceOptions.map(opt => (
            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
           ))}
          </Select>
         )}
        </identityForm.Field>
       </div>
      </form>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditingIdentity ? (
       <Button
        size="sm"
        startContent={<Edit className="w-4 h-4 text-white" />}
        onPress={() => setIsEditingIdentity(true)}
        className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
       >
        Edit
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={() => { identityForm.reset(); setIsEditingIdentity(false) }}
         isDisabled={isLoading}
        >
         Cancel
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => identityForm.handleSubmit()}
         isLoading={isLoading}
        >
         Save
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>

   {/* 2. Service Categories */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
       <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-100 flex-shrink-0">
        <FileText className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
       </div>
       <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">{t('profile.professional.serviceCategories')}</h3>
      </div>
      {professionalData.serviceCategories.length > 0 && (
       <Button
        size="sm"
        startContent={<Edit className="w-3 h-3 md:w-4 md:h-4 text-white" />}
        onPress={openCategoriesModal}
        className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 flex-shrink-0 text-xs md:text-sm"
       >
        Edit
       </Button>
      )}
     </div>
    </CardHeader>
    <CardBody className="space-y-4 px-4 md:px-6 py-6">
     {professionalData.serviceCategories.length > 0 ? (
      <div className="flex flex-wrap gap-2">
       {professionalData.serviceCategories.map(category => (
        <Chip key={category} variant="flat" color="primary" className="shadow-sm">
         {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Chip>
       ))}
      </div>
     ) : (
      // Empty state - Call to Action
      <div className="text-center py-10 px-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border-2 border-dashed border-blue-200 overflow-hidden">
       <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
         <FileText className="w-8 h-8 text-white" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">{t('profile.professional.addServiceCategories')}</h4>
        <p className="text-sm text-gray-600 max-w-xs mx-auto">
         {t('profile.professional.categoriesHelp')}
        </p>
        <div className="pt-2">
         <Button
          size="lg"
          color="primary"
          onPress={openCategoriesModal}
          className="font-semibold shadow-lg"
         >
          {t('profile.professional.selectCategories')}
         </Button>
        </div>
       </div>
      </div>
     )}
    </CardBody>
   </Card>

   {/* 3. Verification & Trust */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-100">
       <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.verificationTrust')}</h3>
     </div>
    </CardHeader>
    <CardBody className="px-4 md:px-6">
     {/* Phone Verification */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50/50">
      <div className="flex items-center gap-3">
       <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
        <Phone className="w-5 h-5 text-green-600" />
       </div>
       <div>
        <p className="text-sm font-medium">{t('profile.professional.phoneVerification')}</p>
        <p className="text-xs text-gray-500">{t('profile.professional.phoneVerificationRequired')}</p>
       </div>
      </div>
      {professionalData.isPhoneVerified ? (
       <Chip color="success" variant="flat" startContent={<CheckCircle className="w-3 h-3" />} className="self-start sm:self-auto">
        {t('profile.professional.verified')}
       </Chip>
      ) : (
       <Button size="sm" color="primary" variant="flat" className="self-start sm:self-auto">
        {t('profile.professional.verifyPhone')}
       </Button>
      )}
     </div>
    </CardBody>
   </Card>

   {/* 4. Availability & Preferences */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-100">
       <Clock className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">Availability & Preferences</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4 px-4 md:px-6">
     {!isEditingAvailability ? (
      // View Mode
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
        <div className="p-2 rounded-lg bg-green-100">
         <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
         <p className="font-semibold text-gray-900 capitalize">{professionalData.availability}</p>
        </div>
       </div>

       <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
        <div className="p-2 rounded-lg bg-blue-100">
         <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Response Time</p>
         <p className="font-semibold text-gray-900">{professionalData.responseTime}</p>
        </div>
       </div>

       <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
        <div className="p-2 rounded-lg bg-orange-100">
         <MapPinned className="w-5 h-5 text-orange-600" />
        </div>
        <div>
         <p className="text-xs text-gray-500 uppercase tracking-wider">Service Area</p>
         <p className="font-semibold text-gray-900">{professionalData.serviceArea.join(', ')}</p>
        </div>
       </div>

       <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
        <div className="p-2 rounded-lg bg-purple-100">
         <Languages className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
         <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Languages Spoken</p>
         {professionalData.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
           {professionalData.languages.map(lang => (
            <Chip key={lang} variant="flat" color="secondary" size="sm" className="uppercase">
             {lang === 'bg' ? '🇧🇬 Bulgarian' : lang === 'ru' ? '🇷🇺 Russian' : lang === 'en' ? '🇬🇧 English' : lang}
            </Chip>
           ))}
          </div>
         ) : (
          <p className="text-sm text-gray-500 italic">No languages selected</p>
         )}
        </div>
       </div>
      </div>
     ) : (
      // Edit Mode
      <form onSubmit={(e) => { e.preventDefault(); availabilityForm.handleSubmit() }}>
       <div className="space-y-4">
        <availabilityForm.Field name="availability">
         {(field) => (
          <div>
           <label className="block text-sm font-medium mb-2">Current Status</label>
           <RadioGroup
            value={field.state.value}
            onValueChange={(value) => field.handleChange(value as any)}
            orientation="horizontal"
           >
            <Radio value="available" className="capitalize">Available</Radio>
            <Radio value="busy" className="capitalize">Busy</Radio>
            <Radio value="unavailable" className="capitalize">Unavailable</Radio>
           </RadioGroup>
          </div>
         )}
        </availabilityForm.Field>

        <availabilityForm.Field name="responseTime">
         {(field) => (
          <Select
           label="Response Time"
           selectedKeys={[field.state.value]}
           onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string
            field.handleChange(selected)
           }}
           startContent={<Clock className="w-4 h-4 text-gray-500" />}
          >
           {responseTimeOptions.map(opt => (
            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
           ))}
          </Select>
         )}
        </availabilityForm.Field>

        <div>
         <label className="block text-sm font-medium mb-2">Service Area</label>
         <p className="text-xs text-gray-500 mb-2">Cities where you offer services</p>
         <Input
          placeholder="e.g., Sofia, Plovdiv, Varna"
          startContent={<MapPinned className="w-4 h-4 text-gray-500" />}
          value={professionalData.serviceArea.join(', ')}
         />
        </div>

        {/* Languages Checkboxes */}
        <div>
         <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Languages Spoken
         </label>
         <div className="space-y-2">
          {[
           { code: 'bg', label: '🇧🇬 Bulgarian' },
           { code: 'ru', label: '🇷🇺 Russian' },
           { code: 'en', label: '🇬🇧 English' }
          ].map(lang => (
           <label key={lang.code} className="flex items-center gap-2 cursor-pointer">
            <input
             type="checkbox"
             checked={professionalData.languages.includes(lang.code)}
             onChange={(e) => {
              if (e.target.checked) {
               setProfessionalData(prev => ({
                ...prev,
                languages: [...prev.languages, lang.code]
               }))
              } else {
               setProfessionalData(prev => ({
                ...prev,
                languages: prev.languages.filter(l => l !== lang.code)
               }))
              }
             }}
             className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{lang.label}</span>
           </label>
          ))}
         </div>
        </div>
       </div>
      </form>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditingAvailability ? (
       <Button
        size="sm"
        startContent={<Edit className="w-4 h-4 text-white" />}
        onPress={() => setIsEditingAvailability(true)}
        className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
       >
        Edit
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={() => { availabilityForm.reset(); setIsEditingAvailability(false) }}
         isDisabled={isLoading}
        >
         Cancel
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => availabilityForm.handleSubmit()}
         isLoading={isLoading}
        >
         Save
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>

   {/* 5. Business Settings */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-100">
       <Settings className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">Business Settings</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4 px-4 md:px-6">
     {!isEditingBusiness ? (
      // View Mode
      <div className="space-y-4">
       {/* Payment Methods */}
       <div className="p-3 rounded-xl bg-gray-50/50">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
         <Banknote className="w-4 h-4" />
         {t('profile.professional.acceptedPaymentMethods')}
        </p>
        {professionalData.paymentMethods.length > 0 ? (
         <div className="flex flex-wrap gap-2">
          {professionalData.paymentMethods.map(method => (
           <Chip key={method} variant="flat" color="success" className="capitalize shadow-sm">
            {method.replace('_', ' ')}
           </Chip>
          ))}
         </div>
        ) : (
         <p className="text-sm text-gray-500 italic">{t('profile.professional.noPaymentMethods')}</p>
        )}
       </div>

       {/* Business Hours */}
       <div className="p-3 rounded-xl bg-gray-50/50">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
         <Clock className="w-4 h-4" />
         {t('profile.professional.businessHours')}
        </p>
        <div className="space-y-2">
         <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-100">
           <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Mon-Fri: {professionalData.weekdayHours.start}-{professionalData.weekdayHours.end}</span>
         </div>
         <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-orange-100">
           <Clock className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">Sat-Sun: {professionalData.weekendHours.start}-{professionalData.weekendHours.end}</span>
         </div>
        </div>
       </div>
      </div>
     ) : (
      // Edit Mode
      <div className="space-y-4">
       {/* Payment Methods Checkboxes */}
       <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
         <Banknote className="w-4 h-4" />
         {t('profile.professional.acceptedPaymentMethods')}
        </label>
        <div className="space-y-2">
         {['cash', 'card', 'bank_transfer', 'mobile_payment'].map(method => (
          <label key={method} className="flex items-center gap-2 cursor-pointer">
           <input
            type="checkbox"
            checked={professionalData.paymentMethods.includes(method)}
            onChange={(e) => {
             if (e.target.checked) {
              setProfessionalData(prev => ({
               ...prev,
               paymentMethods: [...prev.paymentMethods, method]
              }))
             } else {
              setProfessionalData(prev => ({
               ...prev,
               paymentMethods: prev.paymentMethods.filter(m => m !== method)
              }))
             }
            }}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
           />
           <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
          </label>
         ))}
        </div>
       </div>

       {/* Business Hours */}
       <div className="space-y-4">
        <label className="block text-sm font-medium flex items-center gap-2">
         <Clock className="w-4 h-4" />
         {t('profile.professional.businessHours')}
        </label>

        {/* Weekday Hours */}
        <div className="space-y-2">
         <p className="text-xs text-gray-600 font-medium">{t('profile.professional.weekdaysLabel')}</p>
         <div className="grid grid-cols-2 gap-3">
          <Input
           type="time"
           label={t('profile.professional.startTime')}
           value={professionalData.weekdayHours.start}
           onValueChange={(value) => setProfessionalData(prev => ({
            ...prev,
            weekdayHours: { ...prev.weekdayHours, start: value }
           }))}
           size="sm"
          />
          <Input
           type="time"
           label={t('profile.professional.endTime')}
           value={professionalData.weekdayHours.end}
           onValueChange={(value) => setProfessionalData(prev => ({
            ...prev,
            weekdayHours: { ...prev.weekdayHours, end: value }
           }))}
           size="sm"
          />
         </div>
        </div>

        {/* Weekend Hours */}
        <div className="space-y-2">
         <p className="text-xs text-gray-600 font-medium">{t('profile.professional.weekendLabel')}</p>
         <div className="grid grid-cols-2 gap-3">
          <Input
           type="time"
           label={t('profile.professional.startTime')}
           value={professionalData.weekendHours.start}
           onValueChange={(value) => setProfessionalData(prev => ({
            ...prev,
            weekendHours: { ...prev.weekendHours, start: value }
           }))}
           size="sm"
          />
          <Input
           type="time"
           label={t('profile.professional.endTime')}
           value={professionalData.weekendHours.end}
           onValueChange={(value) => setProfessionalData(prev => ({
            ...prev,
            weekendHours: { ...prev.weekendHours, end: value }
           }))}
           size="sm"
          />
         </div>
        </div>
       </div>
      </div>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditingBusiness ? (
       <Button
        size="sm"
        startContent={<Edit className="w-4 h-4 text-white" />}
        onPress={() => setIsEditingBusiness(true)}
        className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
       >
        Edit
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={() => setIsEditingBusiness(false)}
        >
         Cancel
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => setIsEditingBusiness(false)}
        >
         Save
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>

   {/* 6. Portfolio Gallery */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-100 flex-shrink-0">
       <Award className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
      </div>
      <div className="min-w-0">
       <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.portfolioGallery')}</h3>
       <p className="text-xs text-gray-500 hidden sm:block">{t('profile.professional.portfolioDescription')}</p>
      </div>
     </div>
    </CardHeader>
    <CardBody className="px-4 md:px-6">
     <PortfolioGalleryManager
      items={professionalData.portfolio}
      onChange={handlePortfolioChange}
      maxItems={6}
     />
    </CardBody>
   </Card>

   {/* 7. Statistics (Read-Only) */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
     <div className="flex items-center gap-2 md:gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-100">
       <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">Performance Statistics</h3>
     </div>
    </CardHeader>
    <CardBody className="px-4 md:px-6">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
       <div className="text-3xl font-bold text-primary mb-1">{professionalData.completedTasks}</div>
       <div className="text-sm text-gray-600">Completed Tasks</div>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-100/50">
       <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center justify-center gap-1">
        <Star className="w-6 h-6 fill-current" />
        {professionalData.averageRating}
       </div>
       <div className="text-sm text-gray-600">Average Rating</div>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100/50">
       <div className="text-3xl font-bold text-green-600 mb-1">€{professionalData.totalEarnings.toLocaleString()}</div>
       <div className="text-sm text-gray-600">Total Earned</div>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
       <div className="text-3xl font-bold text-purple-600 mb-1">{professionalData.profileViews}</div>
       <div className="text-sm text-gray-600">Profile Views</div>
      </div>
     </div>

     <Divider className="my-4" />

     <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
       <Calendar className="w-4 h-4" />
       <span>Member since {new Date(professionalData.memberSince).toLocaleDateString()}</span>
      </div>
     </div>
    </CardBody>
   </Card>

   {/* Service Categories Modal */}
   <Modal
    isOpen={isCategoriesModalOpen}
    onClose={cancelCategoriesModal}
    size="2xl"
    scrollBehavior="inside"
   >
    <ModalContent>
     <ModalHeader className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-primary" />
      {t('profile.professional.selectCategories')}
     </ModalHeader>
     <ModalBody>
      <ServiceCategoriesSelector
       selectedCategories={tempCategories}
       onChange={setTempCategories}
      />
     </ModalBody>
     <ModalFooter>
      <Button
       variant="bordered"
       onPress={cancelCategoriesModal}
       startContent={<X className="w-4 h-4" />}
      >
       Cancel
      </Button>
      <Button
       color="primary"
       onPress={saveCategoriesModal}
       startContent={<Save className="w-4 h-4" />}
      >
       Save Categories
      </Button>
     </ModalFooter>
    </ModalContent>
   </Modal>
  </div>
 )
}
