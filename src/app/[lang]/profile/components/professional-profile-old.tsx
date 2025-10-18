'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Chip, Badge, Input, Textarea, Select, SelectItem } from '@nextui-org/react'
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
 Plus,
 Eye,
 CheckCircle,
 Edit,
 Save,
 X,
 Settings,
 DollarSign
} from 'lucide-react'
import { SkillsSelector } from './skills-selector'

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

interface ProfessionalFormData {
 title: string
 description: string
 hourlyRate: number
 experience: string
 availability: string
 skills: string[]
 portfolio: string
}

interface BusinessSettings {
 paymentMethod: string
 vatNumber: string
 responseTime: string
 serviceArea: string
}

const availabilityOptions = [
 { key: 'available', label: 'Available' },
 { key: 'busy', label: 'Busy' },
 { key: 'unavailable', label: 'Unavailable' }
]

const experienceOptions = [
 { key: 'beginner', label: '0-1 years' },
 { key: 'intermediate', label: '2-5 years' },
 { key: 'experienced', label: '5-10 years' },
 { key: 'expert', label: '10+ years' }
]

export function ProfessionalProfile({ user }: ProfessionalProfileProps) {
 const { t } = useTranslation()
 const [isEditingInfo, setIsEditingInfo] = useState(false)
 const [isEditingBusiness, setIsEditingBusiness] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [isProfileSetup, setIsProfileSetup] = useState(true) // Start with setup profile for demo
 const router = useRouter()
 const pathname = usePathname()
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'en'

 // Mock professional data
 const [professionalData, setProfessionalData] = useState({
  title: 'Full Stack Developer',
  description: 'Experienced developer specializing in React, Node.js, and TypeScript.',
  hourlyRate: 45,
  experience: 'experienced',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Next.js'],
  availability: 'available',
  portfolio: 'https://myportfolio.dev',
  completedJobs: 24,
  totalEarnings: 3200,
  responseTime: '2 hours',
  rating: 4.9,
  reviewCount: 18,
  profileViews: 156
 })

 // Business settings data
 const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
  paymentMethod: 'Bank Transfer',
  vatNumber: 'BG123456789',
  responseTime: '4 hours',
  serviceArea: 'Sofia, Bulgaria'
 })

 // Professional information form
 const professionalForm = useForm({
  defaultValues: {
   title: professionalData.title,
   description: professionalData.description,
   hourlyRate: professionalData.hourlyRate,
   experience: professionalData.experience,
   availability: professionalData.availability,
   skills: professionalData.skills,
   portfolio: professionalData.portfolio,
  },
  onSubmit: async ({ value }) => {
   setIsLoading(true)

   // Simulate API call
   await new Promise(resolve => setTimeout(resolve, 1500))

   console.log('Saving professional info:', value)
   setProfessionalData(prev => ({ ...prev, ...value }))

   setIsLoading(false)
   setIsEditingInfo(false)
  }
 })

 const handleCancelInfo = () => {
  professionalForm.reset()
  setIsEditingInfo(false)
 }

 // Show setup screen if not configured
 if (!isProfileSetup) {
  return (
   <div className="mt-6">
    <Card>
     <CardBody className="text-center py-12">
      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('profile.professional.setupTitle')}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
       {t('profile.professional.setupDescription')}
      </p>
      <Button
       color="primary"
       size="lg"
       startContent={<Plus className="w-5 h-5" />}
       onPress={() => setIsProfileSetup(true)}
      >
       {t('profile.professional.setupProfile')}
      </Button>
     </CardBody>
    </Card>
   </div>
  )
 }

 return (
  <div className="space-y-6">
   {/* Professional Information */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="flex justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
     <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-100">
       <Briefcase className="w-5 h-5 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{t('profile.professional.info')}</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4">
     {!isEditingInfo ? (
      // View Mode
      <>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
         <p className="text-sm text-gray-600">{t('profile.professional.title')}</p>
         <p className="font-medium text-lg">{professionalData.title}</p>
        </div>

        <div>
         <p className="text-sm text-gray-600">{t('profile.professional.hourlyRate')}</p>
         <p className="font-medium">€{professionalData.hourlyRate}/hour</p>
        </div>

        <div>
         <p className="text-sm text-gray-600">{t('profile.professional.form.experience')}</p>
         <p className="font-medium">
          {t(`profile.professional.form.experienceOptions.${professionalData.experience}`)}
         </p>
        </div>

        <div>
         <p className="text-sm text-gray-600">{t('profile.professional.availability')}</p>
         <Chip
          color={professionalData.availability === 'available' ? 'success' : 'warning'}
          variant="flat"
          size="sm"
         >
          {t(`profile.professional.form.availabilityOptions.${professionalData.availability}`)}
         </Chip>
        </div>
       </div>

       <div>
        <p className="text-sm text-gray-600">{t('profile.professional.description')}</p>
        <p className="mt-1">{professionalData.description}</p>
       </div>

       <div>
        <p className="text-sm text-gray-600 mb-2">{t('profile.professional.skills')}</p>
        <div className="flex flex-wrap gap-2">
         {professionalData.skills.map((skill) => (
          <Chip key={skill} variant="bordered" size="sm">
           {skill}
          </Chip>
         ))}
        </div>
       </div>

       {professionalData.portfolio && (
        <div>
         <p className="text-sm text-gray-600">{t('profile.professional.form.portfolio')}</p>
         <a
          href={professionalData.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
         >
          {professionalData.portfolio}
         </a>
        </div>
       )}
      </>
     ) : (
      // Edit Mode
      <form
       onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        professionalForm.handleSubmit()
       }}
      >
       <div className="space-y-4">
        {/* Title and Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <professionalForm.Field
          name="title"
          validators={{
           onChange: ({ value }) => {
            if (!value || value.length < 3) {
             return t('profile.professional.form.validation.titleRequired')
            }
           }
          }}
         >
          {(field) => (
           <Input
            label={t('profile.professional.title')}
            value={field.state.value}
            onValueChange={field.handleChange}
            isRequired
            isInvalid={!!field.state.meta.errors.length}
            errorMessage={field.state.meta.errors[0]}
            placeholder={t('profile.professional.form.titlePlaceholder')}
           />
          )}
         </professionalForm.Field>

         <professionalForm.Field
          name="hourlyRate"
          validators={{
           onChange: ({ value }) => {
            if (!value || value <= 0) {
             return t('profile.professional.form.validation.rateRequired')
            }
           }
          }}
         >
          {(field) => (
           <Input
            type="number"
            label={t('profile.professional.hourlyRate')}
            value={field.state.value?.toString() || ''}
            onValueChange={(value) => field.handleChange(Number(value))}
            isRequired
            startContent={<span className="text-gray-500">€</span>}
            endContent={<span className="text-gray-500">/hour</span>}
            isInvalid={!!field.state.meta.errors.length}
            errorMessage={field.state.meta.errors[0]}
           />
          )}
         </professionalForm.Field>
        </div>

        {/* Experience and Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <professionalForm.Field name="experience">
          {(field) => (
           <Select
            label={t('profile.professional.form.experience')}
            selectedKeys={[field.state.value]}
            onSelectionChange={(keys) => {
             const selected = Array.from(keys)[0] as string
             field.handleChange(selected)
            }}
           >
            {experienceOptions.map((option) => (
             <SelectItem key={option.key} value={option.key}>
              {t(`profile.professional.form.experienceOptions.${option.key}`)}
             </SelectItem>
            ))}
           </Select>
          )}
         </professionalForm.Field>

         <professionalForm.Field name="availability">
          {(field) => (
           <Select
            label={t('profile.professional.availability')}
            selectedKeys={[field.state.value]}
            onSelectionChange={(keys) => {
             const selected = Array.from(keys)[0] as string
             field.handleChange(selected)
            }}
           >
            {availabilityOptions.map((option) => (
             <SelectItem key={option.key} value={option.key}>
              {t(`profile.professional.form.availabilityOptions.${option.key}`)}
             </SelectItem>
            ))}
           </Select>
          )}
         </professionalForm.Field>
        </div>

        {/* Description */}
        <professionalForm.Field
         name="description"
         validators={{
          onChange: ({ value }) => {
           if (!value || value.length < 20) {
            return t('profile.professional.form.validation.descriptionRequired')
           }
          }
         }}
        >
         {(field) => (
          <Textarea
           label={t('profile.professional.description')}
           value={field.state.value}
           onValueChange={field.handleChange}
           isRequired
           minRows={3}
           maxRows={6}
           isInvalid={!!field.state.meta.errors.length}
           errorMessage={field.state.meta.errors[0]}
           placeholder={t('profile.professional.form.descriptionPlaceholder')}
          />
         )}
        </professionalForm.Field>

        {/* Skills */}
        <professionalForm.Field name="skills">
         {(field) => (
          <div>
           <label className="block text-sm font-medium mb-2">
            {t('profile.professional.skills')} *
           </label>
           <SkillsSelector
            selectedSkills={field.state.value}
            onChange={field.handleChange}
           />
           {field.state.value.length === 0 && (
            <p className="text-tiny text-danger mt-1">
             {t('profile.professional.form.validation.skillsRequired')}
            </p>
           )}
          </div>
         )}
        </professionalForm.Field>

        {/* Portfolio URL */}
        <professionalForm.Field name="portfolio">
         {(field) => (
          <Input
           type="url"
           label={t('profile.professional.form.portfolio')}
           value={field.state.value}
           onValueChange={field.handleChange}
           placeholder="https://myportfolio.com"
           description={t('profile.professional.form.portfolioDescription')}
          />
         )}
        </professionalForm.Field>
       </div>
      </form>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditingInfo ? (
       <Button
        variant="flat"
        color="primary"
        size="sm"
        startContent={<Edit className="w-4 h-4" />}
        onPress={() => setIsEditingInfo(true)}
        className="hover:scale-105 transition-transform shadow-sm"
       >
        {t('profile.edit')}
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={handleCancelInfo}
         isDisabled={isLoading}
        >
         {t('cancel')}
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => professionalForm.handleSubmit()}
         isLoading={isLoading}
        >
         {isLoading ? t('profile.form.saving') : t('save')}
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>

   {/* Business Settings */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="flex justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
     <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-100">
       <Settings className="w-5 h-5 text-purple-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{t('profile.professional.businessSettings')}</h3>
     </div>
    </CardHeader>
    <CardBody className="space-y-4">
     {!isEditingBusiness ? (
      // View Mode
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
        <p className="text-sm text-gray-600">{t('profile.professional.paymentMethod')}</p>
        <p className="font-medium">{businessSettings.paymentMethod}</p>
       </div>

       <div>
        <p className="text-sm text-gray-600">{t('profile.professional.vatNumber')}</p>
        <p className="font-medium">{businessSettings.vatNumber}</p>
       </div>

       <div>
        <p className="text-sm text-gray-600">{t('profile.professional.responseTime')}</p>
        <p className="font-medium">{businessSettings.responseTime}</p>
       </div>

       <div>
        <p className="text-sm text-gray-600">{t('profile.professional.serviceArea')}</p>
        <p className="font-medium">{businessSettings.serviceArea}</p>
       </div>
      </div>
     ) : (
      // Edit Mode
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Input
        label={t('profile.professional.paymentMethod')}
        value={businessSettings.paymentMethod}
        onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, paymentMethod: value }))}
        placeholder="Bank Transfer, PayPal, etc."
       />

       <Input
        label={t('profile.professional.vatNumber')}
        value={businessSettings.vatNumber}
        onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, vatNumber: value }))}
        placeholder="BG123456789"
        description="Optional for registered businesses"
       />

       <Input
        label={t('profile.professional.responseTime')}
        value={businessSettings.responseTime}
        onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, responseTime: value }))}
        placeholder="Within 4 hours"
       />

       <Input
        label={t('profile.professional.serviceArea')}
        value={businessSettings.serviceArea}
        onValueChange={(value) => setBusinessSettings(prev => ({ ...prev, serviceArea: value }))}
        placeholder="Sofia, Bulgaria"
       />
      </div>
     )}

     <Divider />

     <div className="flex justify-end gap-2">
      {!isEditingBusiness ? (
       <Button
        variant="flat"
        color="primary"
        size="sm"
        startContent={<Edit className="w-4 h-4" />}
        onPress={() => setIsEditingBusiness(true)}
        className="hover:scale-105 transition-transform shadow-sm"
       >
        {t('profile.edit')}
       </Button>
      ) : (
       <>
        <Button
         variant="bordered"
         size="sm"
         startContent={<X className="w-4 h-4" />}
         onPress={() => setIsEditingBusiness(false)}
        >
         {t('cancel')}
        </Button>
        <Button
         color="primary"
         size="sm"
         startContent={<Save className="w-4 h-4" />}
         onPress={() => {
          // Auto-save business settings
          console.log('Saving business settings:', businessSettings)
          setIsEditingBusiness(false)
         }}
        >
         {t('save')}
        </Button>
       </>
      )}
     </div>
    </CardBody>
   </Card>


   {/* Recent Work */}
   <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
     <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-100">
       <Award className="w-5 h-5 text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{t('profile.professional.recentWork')}</h3>
     </div>
    </CardHeader>
    <CardBody>
     <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/50 border border-emerald-100/50 hover:shadow-md transition-all">
       <div className="p-2 rounded-lg bg-emerald-100">
        <Award className="w-5 h-5 text-emerald-600" />
       </div>
       <div className="flex-1">
        <p className="font-semibold text-gray-900">E-commerce Website Development</p>
        <p className="text-sm text-gray-600">€850 • Completed 2 days ago</p>
       </div>
       <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
        <Star className="w-4 h-4 text-yellow-600 fill-current" />
        <span className="text-sm font-bold text-yellow-700">5.0</span>
       </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-primary-50/50 border border-blue-100/50 hover:shadow-md transition-all">
       <div className="p-2 rounded-lg bg-blue-100">
        <Briefcase className="w-5 h-5 text-primary" />
       </div>
       <div className="flex-1">
        <p className="font-semibold text-gray-900">Mobile App Development</p>
        <p className="text-sm text-gray-600">€1,200 • In Progress</p>
       </div>
       <Chip size="sm" variant="flat" color="primary" className="shadow-sm">
        {t('profile.active')}
       </Chip>
      </div>
     </div>

     <div className="mt-6 text-center">
      <Button
       variant="flat"
       color="primary"
       size="sm"
       onPress={() => router.push(`/${currentLocale}/professionals`)}
       className="hover:scale-105 transition-transform"
      >
       {t('profile.professional.viewPortfolio')}
      </Button>
     </div>
    </CardBody>
   </Card>
  </div>
 )
}