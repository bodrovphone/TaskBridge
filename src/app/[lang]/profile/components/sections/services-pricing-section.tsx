'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Divider, Chip } from '@heroui/react'
import { Banknote, Plus, Trash2, Edit } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ServiceItem } from '@/server/domain/user/user.types'
import { FormActionButtons } from '../shared/form-action-buttons'
import { useAutoSave } from '@/hooks/use-auto-save'
import { toast } from '@/hooks/use-toast'

interface ServicesPricingSectionProps {
  services: ServiceItem[]
  onSave: (services: ServiceItem[]) => Promise<void>
  maxServices?: number
}

// Create an empty service template
const createEmptyService = (order: number): ServiceItem => ({
  id: Date.now().toString() + '-' + order,
  name: '',
  price: '',
  order
})

export function ServicesPricingSection({
  services,
  onSave,
  maxServices = 10
}: ServicesPricingSectionProps) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [localServices, setLocalServices] = useState<ServiceItem[]>(services)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state when props change (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalServices(services)
    }
  }, [services, isEditing])

  // Memoize data for auto-save (filter out empty services)
  const formData = useMemo(() => ({
    services: localServices.filter(s => s.name.trim() !== '')
  }), [localServices])

  // Auto-save callback
  const handleAutoSave = useCallback(async (data: typeof formData) => {
    try {
      await onSave(data.services)
    } catch (error) {
      console.error('[ServicesPricingSection] Auto-save failed:', error)
    }
  }, [onSave])

  // Auto-save when editing (5 second debounce)
  useAutoSave({
    data: formData,
    onSave: handleAutoSave,
    delay: 5000,
    enabled: isEditing,
    onSuccess: () => {
      toast({
        description: t('profile.autoSave.saved'),
        variant: 'default',
        duration: 2000
      })
    },
    onError: () => {
      toast({
        description: t('profile.autoSave.error'),
        variant: 'destructive',
        duration: 3000
      })
    }
  })

  // When entering edit mode with no services, add one empty service
  const handleStartEditing = useCallback(() => {
    if (services.length === 0) {
      setLocalServices([createEmptyService(0)])
    }
    setIsEditing(true)
  }, [services.length])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Filter out empty services before saving
      const validServices = localServices.filter(s => s.name.trim() !== '')
      await onSave(validServices)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save services:', error)
    } finally {
      setIsSaving(false)
    }
  }, [localServices, onSave])

  const handleCancel = () => {
    setLocalServices(services)
    setIsEditing(false)
  }

  const addService = () => {
    if (localServices.length >= maxServices) return
    setLocalServices([...localServices, createEmptyService(localServices.length)])
  }

  const removeService = (id: string) => {
    const updated = localServices
      .filter(s => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx }))
    setLocalServices(updated)
  }

  const updateService = (id: string, field: keyof ServiceItem, value: string) => {
    setLocalServices(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    )
  }

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-100 flex-shrink-0">
            <Banknote className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              {t('profile.services.title')}
            </h3>
            <p className="text-xs text-gray-500 hidden sm:block">
              {t('profile.services.description')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 md:px-6 space-y-4">
        {!isEditing ? (
          // View Mode
          <>
            {services.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Banknote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  {t('profile.services.empty')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('profile.services.emptyHint')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    </div>
                    <Chip
                      size="sm"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-semibold ml-3 flex-shrink-0"
                      startContent={<Banknote className="w-3 h-3" />}
                    >
                      {service.price}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Edit Mode - Cleaner, higher contrast design
          <>
            {/* Services List */}
            <div className="space-y-6">
              {localServices.map((service, index) => (
                <div key={service.id} className="relative">
                  {/* Service number badge */}
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                    {index + 1}
                  </div>

                  {/* Delete button - top right */}
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    onPress={() => removeService(service.id)}
                    className="absolute -right-2 -top-2 z-10 min-w-6 w-6 h-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>

                  {/* Service fields - clean layout without extra borders */}
                  <div className="pt-2 space-y-3">
                    {/* Service Name & Price Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        size="md"
                        variant="bordered"
                        label={t('profile.services.serviceName')}
                        placeholder={t('profile.services.serviceNamePlaceholder')}
                        value={service.name}
                        onValueChange={(value) => updateService(service.id, 'name', value)}
                        maxLength={50}
                        classNames={{
                          inputWrapper: 'border-2 border-gray-300 hover:border-gray-400 focus-within:border-blue-500 bg-white',
                          label: 'text-gray-700 font-medium',
                          input: 'text-gray-900'
                        }}
                        className="sm:col-span-2"
                      />
                      <Input
                        size="md"
                        variant="bordered"
                        label={t('profile.services.price')}
                        placeholder={t('profile.services.pricePlaceholder')}
                        value={service.price}
                        onValueChange={(value) => updateService(service.id, 'price', value)}
                        maxLength={30}
                        classNames={{
                          inputWrapper: 'border-2 border-gray-300 hover:border-gray-400 focus-within:border-blue-500 bg-white',
                          label: 'text-gray-700 font-medium',
                          input: 'text-gray-900'
                        }}
                      />
                    </div>
                  </div>

                  {/* Divider between services */}
                  {index < localServices.length - 1 && (
                    <Divider className="mt-6" />
                  )}
                </div>
              ))}
            </div>

            {/* Add Service Button */}
            {localServices.length < maxServices && (
              <Button
                color="default"
                variant="bordered"
                startContent={<Plus className="w-4 h-4" />}
                onPress={addService}
                className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                size="lg"
              >
                {t('profile.services.addService')}
              </Button>
            )}

            {/* Helper text */}
            <p className="text-xs text-gray-500 text-center">
              {t('profile.services.helperText', { max: maxServices })}
            </p>
          </>
        )}

        <Divider />

        <div className="flex justify-end gap-2">
          {!isEditing ? (
            <Button
              size="sm"
              startContent={<Edit className="w-4 h-4 text-white" />}
              onPress={handleStartEditing}
              className="hover:scale-105 transition-transform shadow-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800"
            >
              {t('common.edit')}
            </Button>
          ) : (
            <FormActionButtons
              onCancel={handleCancel}
              onSave={handleSave}
              isLoading={isSaving}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
