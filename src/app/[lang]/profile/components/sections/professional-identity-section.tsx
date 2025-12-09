'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Card, CardBody, CardHeader, Button, Divider, Input, Textarea, Select, SelectItem } from '@nextui-org/react'
import { Briefcase, Award, Edit } from 'lucide-react'
import { FormActionButtons } from '../shared/form-action-buttons'
import { useTranslation } from 'react-i18next'

interface ProfessionalIdentitySectionProps {
  title: string
  bio: string
  yearsExperience: string
  onSave: (data: { title: string; bio: string; yearsExperience: string }) => Promise<void>
  /** Section ID for scroll targeting */
  sectionId?: string
  /** Whether this section should be highlighted as incomplete */
  isHighlighted?: boolean
}

const experienceOptions = [
  { key: '0-1', label: '0-1 years' },
  { key: '2-5', label: '2-5 years' },
  { key: '5-10', label: '5-10 years' },
  { key: '10+', label: '10+ years' }
]

export function ProfessionalIdentitySection({
  title,
  bio,
  yearsExperience,
  onSave,
  sectionId,
  isHighlighted = false
}: ProfessionalIdentitySectionProps) {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: { title, bio, yearsExperience },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      await onSave(value)
      setIsLoading(false)
      setIsEditing(false)
    }
  })

  return (
    <Card
      id={sectionId}
      className={`shadow-lg border bg-white/90 hover:shadow-xl transition-all duration-300 ${
        isHighlighted
          ? 'border-amber-300 ring-2 ring-amber-200 ring-offset-2'
          : 'border-gray-100/50'
      }`}
    >
      <CardHeader className={`border-b bg-gradient-to-r px-4 md:px-6 ${
        isHighlighted
          ? 'border-amber-200 from-amber-50/50 to-orange-50/30'
          : 'border-gray-100 from-gray-50/50 to-white'
      }`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100">
            <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900">{t('profile.professional.identitySection')}</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 px-4 md:px-6">
        {!isEditing ? (
          // View Mode
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('profile.professional.title')}</p>
              <p className="text-lg font-semibold text-gray-900">{title}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('profile.professional.bio')}</p>
              <p className="text-gray-700 leading-relaxed">{bio}</p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
              <div className="p-2 rounded-lg bg-purple-100">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.professional.yearsOfExperience')}</p>
                <p className="font-semibold text-gray-900">{yearsExperience}</p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <div className="space-y-4">
              <form.Field name="title">
                {(field) => (
                  <Input
                    label={t('profile.professional.title')}
                    placeholder={t('profile.professional.titlePlaceholder')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    startContent={<Briefcase className="w-4 h-4 text-gray-500" />}
                  />
                )}
              </form.Field>

              <form.Field name="bio">
                {(field) => (
                  <Textarea
                    label={t('profile.professional.bio')}
                    placeholder={t('profile.professional.bioPlaceholder')}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    minRows={4}
                    maxRows={8}
                  />
                )}
              </form.Field>

              <form.Field name="yearsExperience">
                {(field) => (
                  <Select
                    label={t('profile.professional.yearsOfExperience')}
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
              </form.Field>
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
              {t('common.edit', 'Edit')}
            </Button>
          ) : (
            <FormActionButtons
              onCancel={() => { form.reset(); setIsEditing(false) }}
              onSave={() => form.handleSubmit()}
              isLoading={isLoading}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}
