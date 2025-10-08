'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react'
import { X, Plus, Briefcase } from 'lucide-react'
import { SkillsSelector } from './skills-selector'

interface ProfessionalSetupFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ProfessionalFormData {
  title: string
  description: string
  hourlyRate: number
  availability: string
  skills: string[]
  experience: string
  portfolio: string
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

export function ProfessionalSetupForm({ isOpen, onClose, onSuccess }: ProfessionalSetupFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      hourlyRate: 0,
      availability: 'available',
      skills: [],
      experience: 'intermediate',
      portfolio: ''
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Professional profile data:', value)

      setIsSubmitting(false)
      onSuccess()
      onClose()
    }
  })

  const handleSkillsChange = (skills: string[]) => {
    form.setFieldValue('skills' as any, skills)
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t('profile.professional.setupTitle')}</h2>
                <p className="text-sm text-gray-600 font-normal">
                  {t('profile.professional.setupFormDescription')}
                </p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* Professional Title */}
              <form.Field
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
                  <div>
                    <Input
                      label={t('profile.professional.title')}
                      placeholder={t('profile.professional.form.titlePlaceholder')}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      isRequired
                      isInvalid={!!field.state.meta.errors.length}
                      errorMessage={field.state.meta.errors[0]}
                    />
                  </div>
                )}
              </form.Field>

              {/* Description */}
              <form.Field
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
                  <div>
                    <Textarea
                      label={t('profile.professional.description')}
                      placeholder={t('profile.professional.form.descriptionPlaceholder')}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      isRequired
                      minRows={3}
                      maxRows={6}
                      isInvalid={!!field.state.meta.errors.length}
                      errorMessage={field.state.meta.errors[0]}
                    />
                  </div>
                )}
              </form.Field>

              {/* Rate and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
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
                    <div>
                      <Input
                        type="number"
                        label={t('profile.professional.hourlyRate')}
                        placeholder="45"
                        value={field.state.value?.toString() || ''}
                        onValueChange={(value) => field.handleChange(Number(value))}
                        isRequired
                        startContent={<span className="text-gray-500">€</span>}
                        endContent={<span className="text-gray-500">/hour</span>}
                        isInvalid={!!field.state.meta.errors.length}
                        errorMessage={field.state.meta.errors[0]}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="experience">
                  {(field) => (
                    <div>
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
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Availability */}
              <form.Field name="availability">
                {(field) => (
                  <div>
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
                  </div>
                )}
              </form.Field>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('profile.professional.skills')} *
                </label>
                <SkillsSelector
                  selectedSkills={form.state.values.skills as string[]}
                  onChange={handleSkillsChange}
                />
                {(form.state.values.skills as string[]).length === 0 && (
                  <p className="text-tiny text-danger mt-1">
                    {t('profile.professional.form.validation.skillsRequired')}
                  </p>
                )}
              </div>

              {/* Portfolio URL (Optional) */}
              <form.Field name="portfolio">
                {(field) => (
                  <div>
                    <Input
                      type="url"
                      label={t('profile.professional.form.portfolio')}
                      placeholder="https://myportfolio.com"
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      description={t('profile.professional.form.portfolioDescription')}
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="bordered"
              onPress={handleClose}
              isDisabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
            >
              {isSubmitting ? t('profile.professional.form.submitting') : t('profile.professional.form.createProfile')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}