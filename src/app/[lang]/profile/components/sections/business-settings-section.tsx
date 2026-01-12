'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardBody, CardHeader, Button, Divider, Input, Chip } from '@heroui/react'
import { useTranslations } from 'next-intl'
import { Settings, Banknote, Clock, Edit } from 'lucide-react'
import { FormActionButtons } from '../shared/form-action-buttons'
import { useAutoSave } from '@/hooks/use-auto-save'
import { toast } from '@/hooks/use-toast'

interface BusinessSettingsSectionProps {
  paymentMethods: string[]
  weekdayHours: { start: string; end: string }
  weekendHours: { start: string; end: string }
  onSave: (data: {
    paymentMethods: string[]
    weekdayHours: { start: string; end: string }
    weekendHours: { start: string; end: string }
  }) => void
}

const paymentMethodOptions = ['cash', 'card', 'bank_transfer', 'mobile_payment']

export function BusinessSettingsSection({
  paymentMethods,
  weekdayHours,
  weekendHours,
  onSave
}: BusinessSettingsSectionProps) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [currentPaymentMethods, setCurrentPaymentMethods] = useState(paymentMethods)
  const [currentWeekdayHours, setCurrentWeekdayHours] = useState(weekdayHours)
  const [currentWeekendHours, setCurrentWeekendHours] = useState(weekendHours)

  // Memoize data for auto-save
  const formData = useMemo(() => ({
    paymentMethods: currentPaymentMethods,
    weekdayHours: currentWeekdayHours,
    weekendHours: currentWeekendHours
  }), [currentPaymentMethods, currentWeekdayHours, currentWeekendHours])

  // Auto-save callback
  const handleAutoSave = useCallback(async (data: typeof formData) => {
    try {
      onSave(data)
    } catch (error) {
      console.error('[BusinessSettingsSection] Auto-save failed:', error)
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

  const handlePaymentMethodToggle = (method: string, checked: boolean) => {
    if (checked) {
      setCurrentPaymentMethods(prev => [...prev, method])
    } else {
      setCurrentPaymentMethods(prev => prev.filter(m => m !== method))
    }
  }

  const handleSave = () => {
    onSave({
      paymentMethods: currentPaymentMethods,
      weekdayHours: currentWeekdayHours,
      weekendHours: currentWeekendHours
    })
    setIsEditing(false)
  }

  const handleStartEditing = () => {
    setCurrentPaymentMethods(paymentMethods)
    setCurrentWeekdayHours(weekdayHours)
    setCurrentWeekendHours(weekendHours)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setCurrentPaymentMethods(paymentMethods)
    setCurrentWeekdayHours(weekdayHours)
    setCurrentWeekendHours(weekendHours)
    setIsEditing(false)
  }

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-100">
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.businessSettings')}</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 px-4 md:px-6">
        {!isEditing ? (
          // View Mode
          <div className="space-y-4">
            {/* Payment Methods */}
            <div className="p-3 rounded-xl bg-gray-50/50">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                {t('profile.professional.acceptedPaymentMethods')}
              </p>
              {currentPaymentMethods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentPaymentMethods.map(method => (
                    <Chip key={method} variant="flat" color="success" className="shadow-sm">
                      {t(`profile.professional.paymentMethods.${method}`)}
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
                {t('profile.professional.businessHoursLabel')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t('profile.professional.businessHours.weekdays')}: {weekdayHours.start}-{weekdayHours.end}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-100">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {t('profile.professional.businessHours.weekend')}: {weekendHours.start}-{weekendHours.end}
                  </span>
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
                {paymentMethodOptions.map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentPaymentMethods.includes(method)}
                      onChange={(e) => handlePaymentMethodToggle(method, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{t(`profile.professional.paymentMethods.${method}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-4">
              <label className="block text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('profile.professional.businessHoursLabel')}
              </label>

              {/* Weekday Hours */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 font-medium">{t('profile.professional.weekdaysLabel')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="time"
                    label={t('profile.professional.startTime')}
                    value={currentWeekdayHours.start}
                    onValueChange={(value) => setCurrentWeekdayHours(prev => ({ ...prev, start: value }))}
                    size="sm"
                  />
                  <Input
                    type="time"
                    label={t('profile.professional.endTime')}
                    value={currentWeekdayHours.end}
                    onValueChange={(value) => setCurrentWeekdayHours(prev => ({ ...prev, end: value }))}
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
                    value={currentWeekendHours.start}
                    onValueChange={(value) => setCurrentWeekendHours(prev => ({ ...prev, start: value }))}
                    size="sm"
                  />
                  <Input
                    type="time"
                    label={t('profile.professional.endTime')}
                    value={currentWeekendHours.end}
                    onValueChange={(value) => setCurrentWeekendHours(prev => ({ ...prev, end: value }))}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
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
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
