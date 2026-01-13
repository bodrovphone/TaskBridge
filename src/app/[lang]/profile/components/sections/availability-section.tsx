'use client'

import { useState, useMemo, useCallback } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Select, SelectItem, Chip } from '@heroui/react'
import { Clock, MapPinned, Languages, Edit } from 'lucide-react'
import { FormActionButtons } from '../shared/form-action-buttons'
import { useTranslations } from 'next-intl'
import { getCityLabelBySlug } from '@/features/cities'
import { useAutoSave } from '@/hooks/use-auto-save'
import { toast } from '@/hooks/use-toast'

interface AvailabilitySectionProps {
  responseTime: string
  city: string | null
  languages: string[]
  onSave: (data: { responseTime: string }) => Promise<void>
  onLanguageChange: (data: string[]) => void
}

// Response time and language options - will be translated
const responseTimeKeys = ['1h', '2h', '4h', '24h']
const languageCodes = ['bg', 'ru', 'en', 'ua']

export function AvailabilitySection({
  responseTime,
  city,
  languages,
  onSave,
  onLanguageChange
}: AvailabilitySectionProps) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentLanguages, setCurrentLanguages] = useState(languages)
  const [localResponseTime, setLocalResponseTime] = useState(responseTime)

  // Get translated city label
  const cityLabel = useMemo(() => {
    if (!city) return t('profile.professional.notSet')
    return getCityLabelBySlug(city, t)
  }, [city, t])

  // Memoize data for auto-save
  const formData = useMemo(() => ({
    responseTime: localResponseTime,
    languages: currentLanguages
  }), [localResponseTime, currentLanguages])

  // Auto-save callback
  const handleAutoSave = useCallback(async (data: typeof formData) => {
    try {
      await onSave({ responseTime: data.responseTime })
      onLanguageChange(data.languages)
    } catch (error) {
      console.error('[AvailabilitySection] Auto-save failed:', error)
    }
  }, [onSave, onLanguageChange])

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

  const form = useForm({
    defaultValues: { responseTime },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      await onSave(value)
      onLanguageChange(currentLanguages)
      setIsLoading(false)
      setIsEditing(false)
    }
  })

  const handleStartEditing = () => {
    setLocalResponseTime(responseTime)
    setCurrentLanguages(languages)
    setIsEditing(true)
  }

  const handleCancel = () => {
    form.reset()
    setLocalResponseTime(responseTime)
    setCurrentLanguages(languages)
    setIsEditing(false)
  }

  const handleLanguageToggle = (langCode: string, checked: boolean) => {
    if (checked) {
      setCurrentLanguages(prev => [...prev, langCode])
    } else {
      setCurrentLanguages(prev => prev.filter(l => l !== langCode))
    }
  }

  return (
    <Card className="shadow-lg border border-gray-100/50 bg-white/90 hover:shadow-xl transition-shadow">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-100">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.availabilityPreferences')}</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 px-4 md:px-6">
        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.professional.responseTimeLabel')}</p>
                <p className="font-semibold text-gray-900">
                  {t(`profile.professional.responseTime.${responseTime}`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-orange-100">
                <MapPinned className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.professional.serviceLocation')}</p>
                <p className="font-semibold text-gray-900">
                  {city ? cityLabel : t('profile.professional.notSet')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('profile.professional.setInPersonalInfo')}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-purple-100">
                <Languages className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('profile.professional.languagesSpoken')}</p>
                {languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <Chip key={lang} variant="flat" color="secondary" size="md" className="text-sm">
                        {t(`profile.professional.languages.${lang}`)}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">{t('profile.professional.noLanguagesSelected')}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <div className="space-y-4">
              <form.Field name="responseTime">
                {(field) => (
                  <Select
                    label={t('profile.professional.responseTimeLabel')}
                    selectedKeys={[field.state.value]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string
                      field.handleChange(selected)
                      setLocalResponseTime(selected)
                    }}
                    startContent={<Clock className="w-4 h-4 text-gray-500" />}
                  >
                    {responseTimeKeys.map(key => (
                      <SelectItem key={key}>
                        {t(`profile.professional.responseTime.${key}`)}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </form.Field>

              {/* Service Location (Read-only from Personal Information) */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                    <MapPinned className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      {t('profile.professional.serviceLocation')}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {city ? cityLabel : t('profile.professional.notSet')}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {t('profile.professional.editInPersonalInfo')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Languages Checkboxes */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t('profile.professional.languagesSpoken')}
                </label>
                <div className="space-y-2">
                  {languageCodes.map(code => (
                    <label key={code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLanguages.includes(code)}
                        onChange={(e) => handleLanguageToggle(code, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{t(`profile.professional.languages.${code}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
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
              onSave={() => form.handleSubmit()}
              isLoading={isLoading}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
