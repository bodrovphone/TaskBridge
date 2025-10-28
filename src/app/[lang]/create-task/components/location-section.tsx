'use client'

import { useTranslation } from 'react-i18next'
import { Input, Select, SelectItem, Card, CardBody } from '@nextui-org/react'
import { Lock, MapPin } from 'lucide-react'
import { BULGARIAN_CITIES } from '../lib/validation'

interface LocationSectionProps {
 form: any
}

export function LocationSection({ form }: LocationSectionProps) {
 const { t } = useTranslation()

 return (
  <Card className="shadow-md border border-gray-100">
   <CardBody className="p-6 md:p-8 space-y-6">
    {/* Section Header */}
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
     <div className="p-2 bg-green-100 rounded-lg">
      <MapPin className="w-6 h-6 text-green-600" />
     </div>
     <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
       {t('createTask.location.title', 'Where will the task be performed?')}
      </h2>
      <p className="text-gray-600">
       {t('createTask.location.subtitle', 'Location helps professionals understand if they can reach you')}
      </p>
     </div>
    </div>

   {/* City Selection */}
   <form.Field
    name="city"
    validators={{
     onBlur: ({ value }: any) => {
      if (!value) {
       return 'createTask.errors.cityRequired'
      }
      return undefined
     }
    }}
   >
    {(field: any) => (
     <div className="space-y-2 max-w-md">
      <label htmlFor="task-city" className="text-sm font-medium text-gray-700">
       {t('createTask.location.cityLabel', 'City')} <span className="text-red-500">*</span>
      </label>
      <Select
       id="task-city"
       placeholder={t('createTask.location.cityPlaceholder', 'Select your city')}
       isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
       selectedKeys={field.state.value ? [field.state.value] : []}
       onSelectionChange={(keys) => {
        const selectedCity = Array.from(keys)[0] as string
        field.handleChange(selectedCity)
        field.handleBlur()
       }}
       onClose={() => {
        field.handleBlur()
       }}
       startContent={<MapPin className="w-4 h-4 text-gray-400" />}
       classNames={{
        trigger: 'h-12',
        popoverContent: 'bg-white shadow-xl border border-gray-200 rounded-lg',
        listbox: 'bg-white',
       }}
      >
       {BULGARIAN_CITIES.map((cityName) => (
        <SelectItem key={cityName} value={cityName}>
         {cityName}
        </SelectItem>
       ))}
      </Select>
     </div>
    )}
   </form.Field>

   {/* Neighborhood */}
   <form.Field name="neighborhood">
    {(field: any) => (
     <div className="space-y-2">
      <label htmlFor="task-neighborhood" className="text-sm font-medium text-gray-700">
       {t('createTask.location.neighborhoodLabel', 'Neighborhood/District')}
      </label>
      <Input
       id="task-neighborhood"
       placeholder={t('createTask.location.neighborhoodPlaceholder', 'e.g., Лозенец, Витоша, Център')}
       description={t('createTask.location.neighborhoodHelp', 'Helps professionals determine if they can reach you')}
       value={field.state.value || ''}
       onValueChange={field.handleChange}
       startContent={<MapPin className="w-4 h-4 text-gray-400" />}
       classNames={{
        input: 'text-base',
       }}
      />
     </div>
    )}
   </form.Field>

   {/* Exact Address */}
   <form.Field name="exactAddress">
    {(field: any) => (
     <div className="space-y-2">
      <label htmlFor="task-address" className="text-sm font-medium text-gray-700">
       {t('createTask.location.addressLabel', 'Full Address (Optional)')}
      </label>
      <Input
       id="task-address"
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
     </div>
    )}
   </form.Field>
   </CardBody>
  </Card>
 )
}
