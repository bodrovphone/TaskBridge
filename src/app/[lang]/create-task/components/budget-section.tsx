'use client'

import { useTranslation } from 'react-i18next'
import { Input, RadioGroup, Radio, Chip } from '@nextui-org/react'
import { Wallet, Info } from 'lucide-react'

interface BudgetSectionProps {
 form: any
 budgetType: 'fixed' | 'range' | undefined
 // eslint-disable-next-line no-unused-vars
 onBudgetTypeChange: (type: 'fixed' | 'range') => void
}

export function BudgetSection({ form, budgetType, onBudgetTypeChange }: BudgetSectionProps) {
 const { t } = useTranslation()

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
   <form.Field name="budgetType">
    {(field: any) => (
     <RadioGroup
      value={field.state.value || 'range'}
      onValueChange={(value: any) => {
       field.handleChange(value as 'fixed' | 'range')
       onBudgetTypeChange(value as 'fixed' | 'range')
      }}
      orientation="horizontal"
     >
      <Radio value="fixed">
       {t('createTask.budget.typeFixed', 'Fixed Price')}
      </Radio>
      <Radio value="range">
       {t('createTask.budget.typeRange', 'Price Range')}
      </Radio>
     </RadioGroup>
    )}
   </form.Field>

   {/* Budget Input(s) */}
   {budgetType === 'fixed' ? (
    <form.Field
     name="budgetMax"
     validators={{
      onChange: ({ value }: any) => {
       if (value !== undefined && value !== null && value <= 0) {
        return t('createTask.budget.mustBePositive', 'Budget must be positive')
       }
      }
     }}
    >
     {(field: any) => (
      <Input
       type="number"
       label={t('createTask.budget.fixedLabel', 'Your Budget')}
       placeholder="100"
       value={field.state.value?.toString() || ''}
       onValueChange={(val: string) => field.handleChange(val === '' ? undefined : Number(val))}
       startContent={<Wallet className="w-4 h-4 text-gray-400" />}
       endContent={<span className="text-gray-400">лв</span>}
       isInvalid={field.state.meta.errors.length > 0}
       errorMessage={field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
       classNames={{
        input: 'text-base',
       }}
      />
     )}
    </form.Field>
   ) : (
    <div className="grid grid-cols-2 gap-4">
     <form.Field
      name="budgetMin"
      validators={{
       onChange: ({ value }: any) => {
        if (value !== undefined && value !== null && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
       }
      }}
     >
      {(field: any) => (
       <Input
        type="number"
        label={t('createTask.budget.minLabel', 'Minimum')}
        placeholder="50"
        value={field.state.value?.toString() || ''}
        onValueChange={(val: string) => field.handleChange(val === '' ? undefined : Number(val))}
        startContent={<Wallet className="w-4 h-4 text-gray-400" />}
        endContent={<span className="text-gray-400">лв</span>}
        isInvalid={field.state.meta.errors.length > 0}
        errorMessage={field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
        classNames={{
         input: 'text-base',
        }}
       />
      )}
     </form.Field>
     <form.Field
      name="budgetMax"
      validators={{
       onChange: ({ value }: any) => {
        if (value !== undefined && value !== null && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
       }
      }}
     >
      {(field: any) => (
       <Input
        type="number"
        label={t('createTask.budget.maxLabel', 'Maximum')}
        placeholder="100"
        value={field.state.value?.toString() || ''}
        onValueChange={(val: string) => field.handleChange(val === '' ? undefined : Number(val))}
        startContent={<Wallet className="w-4 h-4 text-gray-400" />}
        endContent={<span className="text-gray-400">лв</span>}
        isInvalid={field.state.meta.errors.length > 0}
        errorMessage={field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
        classNames={{
         input: 'text-base',
        }}
       />
      )}
     </form.Field>
    </div>
   )}

   {/* Optional "Not Sure" Chip */}
   <Chip
    variant="flat"
    color="default"
    size="sm"
    className="cursor-pointer"
    onClick={() => {
     form.setFieldValue('budgetMin', undefined)
     form.setFieldValue('budgetMax', undefined)
    }}
   >
    {t('createTask.budget.notSure', "I'm not sure about the budget")}
   </Chip>
  </div>
 )
}
