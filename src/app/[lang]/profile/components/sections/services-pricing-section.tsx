'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Divider, Chip } from '@nextui-org/react'
import { Banknote, Plus, Trash2, GripVertical, Edit } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ServiceItem } from '@/server/domain/user/user.types'
import { FormActionButtons } from '../shared/form-action-buttons'

interface ServicesPricingSectionProps {
  services: ServiceItem[]
  onSave: (services: ServiceItem[]) => Promise<void>
  maxServices?: number
}

export function ServicesPricingSection({
  services,
  onSave,
  maxServices = 10
}: ServicesPricingSectionProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [localServices, setLocalServices] = useState<ServiceItem[]>(services)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state when props change (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalServices(services)
    }
  }, [services, isEditing])

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

    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: '',
      price: '',
      description: '',
      order: localServices.length
    }
    setLocalServices([...localServices, newService])
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
              {t('profile.services.title', 'Services & Pricing')}
            </h3>
            <p className="text-xs text-gray-500 hidden sm:block">
              {t('profile.services.description', 'List your services with pricing')}
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
                  {t('profile.services.empty', 'No services added yet')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('profile.services.emptyHint', 'Add your services to let clients know what you offer')}
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
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
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
          // Edit Mode
          <>
            {/* Services List */}
            {localServices.length > 0 && (
              <div className="space-y-4">
                {localServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-gray-300 mt-2">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* Service Name & Price Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            size="sm"
                            label={t('profile.services.serviceName', 'Service name')}
                            placeholder={t('profile.services.serviceNamePlaceholder', 'e.g., Plumbing repair')}
                            value={service.name}
                            onValueChange={(value) => updateService(service.id, 'name', value)}
                            maxLength={50}
                            classNames={{
                              inputWrapper: 'bg-white'
                            }}
                          />
                          <Input
                            size="sm"
                            label={t('profile.services.price', 'Price')}
                            placeholder={t('profile.services.pricePlaceholder', 'e.g., 50 лв/час')}
                            value={service.price}
                            onValueChange={(value) => updateService(service.id, 'price', value)}
                            maxLength={30}
                            classNames={{
                              inputWrapper: 'bg-white'
                            }}
                          />
                        </div>
                        {/* Description */}
                        <Input
                          size="sm"
                          label={t('profile.services.descriptionLabel', 'Description (optional)')}
                          placeholder={t('profile.services.descriptionPlaceholder', 'Brief description of this service')}
                          value={service.description}
                          onValueChange={(value) => updateService(service.id, 'description', value)}
                          maxLength={100}
                          classNames={{
                            inputWrapper: 'bg-white'
                          }}
                        />
                      </div>
                      {/* Delete Button */}
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        isIconOnly
                        onPress={() => removeService(service.id)}
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Service Button - Always visible in edit mode */}
            {localServices.length < maxServices && (
              <div className={localServices.length === 0 ? "py-4" : ""}>
                {localServices.length === 0 && (
                  <div className="text-center mb-4">
                    <Banknote className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      {t('profile.services.empty', 'No services added yet')}
                    </p>
                  </div>
                )}
                <Button
                  color="primary"
                  variant="solid"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={addService}
                  className="w-full"
                  size="lg"
                >
                  {t('profile.services.addService', 'Add Service')}
                </Button>
              </div>
            )}

            {/* Helper text */}
            <p className="text-xs text-gray-500 text-center">
              {t('profile.services.helperText', 'Add up to {{max}} services. Changes are saved automatically.', { max: maxServices })}
            </p>
          </>
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
              {t('common.edit', 'Edit')}
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
