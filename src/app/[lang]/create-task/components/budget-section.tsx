'use client'

import { useTranslation } from 'react-i18next'
import { Input, RadioGroup, Radio, Chip } from '@nextui-org/react'
import { Wallet, Info } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { CreateTaskFormData } from '../lib/validation'

interface BudgetSectionProps {
  form: UseFormReturn<CreateTaskFormData>
  budgetType: 'fixed' | 'range'
}

export function BudgetSection({ form, budgetType }: BudgetSectionProps) {
  const { t } = useTranslation()
  const { register, setValue, formState: { errors } } = form

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('createTask.budget.title', 'What is your budget?')}
        </h2>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t('createTask.budget.help', 'Fair budgets get 3x more applications')}</p>
        </div>
      </div>

      {/* Budget Type Selection */}
      <RadioGroup
        value={budgetType}
        onValueChange={(value) => setValue('budgetType', value as 'fixed' | 'range')}
        orientation="horizontal"
      >
        <Radio value="fixed">
          {t('createTask.budget.typeFixed', 'Fixed Price')}
        </Radio>
        <Radio value="range">
          {t('createTask.budget.typeRange', 'Price Range')}
        </Radio>
      </RadioGroup>

      {/* Budget Input(s) */}
      {budgetType === 'fixed' ? (
        <Input
          {...register('budgetMax', {
            setValueAs: (v) => v === '' || v === null ? undefined : Number(v)
          })}
          type="number"
          label={t('createTask.budget.fixedLabel', 'Your Budget')}
          placeholder="100"
          startContent={<Wallet className="w-4 h-4 text-gray-400" />}
          endContent={<span className="text-gray-400">лв</span>}
          isInvalid={!!errors.budgetMax}
          errorMessage={errors.budgetMax && t(errors.budgetMax.message as string)}
          classNames={{
            input: 'text-base',
          }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('budgetMin', {
              setValueAs: (v) => v === '' || v === null ? undefined : Number(v)
            })}
            type="number"
            label={t('createTask.budget.minLabel', 'Minimum')}
            placeholder="50"
            startContent={<Wallet className="w-4 h-4 text-gray-400" />}
            endContent={<span className="text-gray-400">лв</span>}
            isInvalid={!!errors.budgetMin}
            errorMessage={errors.budgetMin && t(errors.budgetMin.message as string)}
            classNames={{
              input: 'text-base',
            }}
          />
          <Input
            {...register('budgetMax', {
              setValueAs: (v) => v === '' || v === null ? undefined : Number(v)
            })}
            type="number"
            label={t('createTask.budget.maxLabel', 'Maximum')}
            placeholder="100"
            startContent={<Wallet className="w-4 h-4 text-gray-400" />}
            endContent={<span className="text-gray-400">лв</span>}
            isInvalid={!!errors.budgetMax}
            errorMessage={errors.budgetMax && t(errors.budgetMax.message as string)}
            classNames={{
              input: 'text-base',
            }}
          />
        </div>
      )}

      {/* Optional "Not Sure" Chip */}
      <Chip
        variant="flat"
        color="default"
        size="sm"
        className="cursor-pointer"
        onClick={() => {
          setValue('budgetMin', undefined)
          setValue('budgetMax', undefined)
        }}
      >
        {t('createTask.budget.notSure', "I'm not sure about the budget")}
      </Chip>
    </div>
  )
}
