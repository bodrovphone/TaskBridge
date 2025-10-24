'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Input, Select, SelectItem, RadioGroup, Radio, Chip } from '@nextui-org/react'
import { Clock, CheckCircle, MapPinned, Languages, Edit, Save, X } from 'lucide-react'

interface AvailabilitySectionProps {
  availability: 'available' | 'busy' | 'unavailable'
  responseTime: string
  serviceArea: string[]
  languages: string[]
  onSave: (data: { availability: string; responseTime: string; serviceArea: string[] }) => Promise<void>
  onLanguageChange: (data: string[]) => void
}

const responseTimeOptions = [
  { key: '1h', label: 'Within 1 hour' },
  { key: '2h', label: 'Within 2 hours' },
  { key: '4h', label: 'Within 4 hours' },
  { key: '24h', label: 'Within 24 hours' }
]

const languageOptions = [
  { code: 'bg', label: '🇧🇬 Bulgarian' },
  { code: 'ru', label: '🇷🇺 Russian' },
  { code: 'en', label: '🇬🇧 English' }
]

export function AvailabilitySection({
  availability,
  responseTime,
  serviceArea,
  languages,
  onSave,
  onLanguageChange
}: AvailabilitySectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentLanguages, setCurrentLanguages] = useState(languages)

  const form = useForm({
    defaultValues: { availability, responseTime, serviceArea },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      await onSave(value)
      onLanguageChange(currentLanguages)
      setIsLoading(false)
      setIsEditing(false)
    }
  })

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
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Availability & Preferences</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 px-4 md:px-6">
        {!isEditing ? (
          // View Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{availability}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Response Time</p>
                <p className="font-semibold text-gray-900">{responseTime}</p>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-orange-100">
                <MapPinned className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Service Area</p>
                <p className="font-semibold text-gray-900">{serviceArea.join(', ')}</p>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-purple-100">
                <Languages className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Languages Spoken</p>
                {languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
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
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <div className="space-y-4">
              <form.Field name="availability">
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
              </form.Field>

              <form.Field name="responseTime">
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
              </form.Field>

              <div>
                <label className="block text-sm font-medium mb-2">Service Area</label>
                <p className="text-xs text-gray-500 mb-2">Cities where you offer services</p>
                <Input
                  placeholder="e.g., Sofia, Plovdiv, Varna"
                  startContent={<MapPinned className="w-4 h-4 text-gray-500" />}
                  value={serviceArea.join(', ')}
                />
              </div>

              {/* Languages Checkboxes */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Languages Spoken
                </label>
                <div className="space-y-2">
                  {languageOptions.map(lang => (
                    <label key={lang.code} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLanguages.includes(lang.code)}
                        onChange={(e) => handleLanguageToggle(lang.code, e.target.checked)}
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
          {!isEditing ? (
            <Button
              size="sm"
              startContent={<Edit className="w-4 h-4 text-white" />}
              onPress={() => setIsEditing(true)}
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
                onPress={() => {
                  form.reset()
                  setCurrentLanguages(languages)
                  setIsEditing(false)
                }}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                size="sm"
                startContent={<Save className="w-4 h-4" />}
                onPress={() => form.handleSubmit()}
                isLoading={isLoading}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
