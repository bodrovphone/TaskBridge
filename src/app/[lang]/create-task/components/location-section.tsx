'use client'

import { useTranslation } from 'react-i18next'
import { Input, Select, SelectItem } from '@nextui-org/react'
import { Lock, MapPin } from 'lucide-react'
import { BULGARIAN_CITIES } from '../lib/validation'

interface LocationSectionProps {
 form: any
}

export function LocationSection({ form }: LocationSectionProps) {
 const { t } = useTranslation()

 return (
  <div className="space-y-6">
   {/* Section Header */}
   <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
     {t('createTask.location.title', 'Where will the task be performed?')}
    </h2>
    <p className="text-gray-600">
     {t('createTask.location.subtitle', 'Location helps professionals understand if they can reach you')}
    </p>
   </div>

   {/* City Selection */}
   <form.Field name="city">
    {(field: any) => (
     <Select
      label={t('createTask.location.cityLabel', 'City')}
      placeholder={t('createTask.location.cityPlaceholder', 'Select your city')}
      isInvalid={field.state.meta.errors.length > 0}
      errorMessage={field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
      selectedKeys={field.state.value ? [field.state.value] : []}
      onSelectionChange={(keys) => {
       const selectedCity = Array.from(keys)[0] as string
       field.handleChange(selectedCity)
      }}
      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
      isRequired
      classNames={{
       trigger: 'h-12',
      }}
     >
      {BULGARIAN_CITIES.map((cityName) => (
       <SelectItem key={cityName} value={cityName}>
        {cityName}
       </SelectItem>
      ))}
     </Select>
    )}
   </form.Field>

   {/* Neighborhood */}
   <form.Field name="neighborhood">
    {(field: any) => (
     <Input
      label={t('createTask.location.neighborhoodLabel', 'Neighborhood/District')}
      placeholder={t('createTask.location.neighborhoodPlaceholder', 'e.g., Лозенец, Витоша, Център')}
      description={t('createTask.location.neighborhoodHelp', 'Helps professionals determine if they can reach you')}
      value={field.state.value || ''}
      onValueChange={field.handleChange}
      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
      classNames={{
       input: 'text-base',
      }}
     />
    )}
   </form.Field>

   {/* Exact Address */}
   <form.Field name="exactAddress">
    {(field: any) => (
     <Input
      label={t('createTask.location.addressLabel', 'Full Address (Optional)')}
      placeholder={t('createTask.location.addressPlaceholder', 'Street, building number, entrance, floor, apartment')}
      description={
       <span className="flex items-center gap-1 text-warning">
        <Lock className="w-3 h-3" />
        {t('createTask.location.addressSecurity', 'Address will only be shown to the professional you hire')}
       </span>
      }
      value={field.state.value || ''}
      onValueChange={field.handleChange}
      startContent={<Lock className="w-4 h-4 text-gray-400" />}
      classNames={{
       input: 'text-base',
      }}
     />
    )}
   </form.Field>
  </div>
 )
}
