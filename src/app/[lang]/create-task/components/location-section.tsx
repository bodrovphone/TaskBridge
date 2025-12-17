'use client'

import { useTranslations } from 'next-intl'
import { Input, Card, CardBody } from '@nextui-org/react'
import { MapPin } from 'lucide-react'
import { CityAutocomplete, CityOption } from '@/components/ui/city-autocomplete'

interface LocationSectionProps {
 form: any
}

export function LocationSection({ form }: LocationSectionProps) {
 const t = useTranslations()

 return (
  <Card className="shadow-md border border-gray-100 overflow-visible">
   <CardBody className="p-6 md:p-8 space-y-6 overflow-visible">
    {/* Section Header */}
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
     <div className="p-2 bg-green-100 rounded-lg">
      <MapPin className="w-6 h-6 text-green-600" />
     </div>
     <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
       {t('createTask.location.title')}
      </h2>
      <p className="text-gray-600">
       {t('createTask.location.subtitle')}
      </p>
     </div>
    </div>

   {/* City Selection */}
   <form.Field
    name="city"
    validators={{
     onChange: ({ value }: any) => {
      if (!value) {
       return 'createTask.errors.cityRequired'
      }
      return undefined
     },
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
       {t('createTask.location.cityLabel')} <span className="text-red-500">*</span>
      </label>
      <CityAutocomplete
       value={field.state.value}
       onChange={(city: CityOption | null) => {
        field.handleChange(city?.slug || '')
        field.handleBlur()
       }}
       placeholder={t('createTask.location.cityPlaceholder')}
       isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? t(field.state.meta.errors[0] as string) : undefined}
       showProfileCity={true}
       showLastSearched={true}
       showPopularCities={true}
      />
     </div>
    )}
   </form.Field>

   {/* Neighborhood */}
   <form.Field name="neighborhood">
    {(field: any) => (
     <div className="space-y-2">
      <label htmlFor="task-neighborhood" className="text-sm font-medium text-gray-700">
       {t('createTask.location.neighborhoodLabel')}
      </label>
      <Input
       id="task-neighborhood"
       placeholder={t('createTask.location.neighborhoodPlaceholder')}
       description={t('createTask.location.neighborhoodHelp')}
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

   </CardBody>
  </Card>
 )
}
