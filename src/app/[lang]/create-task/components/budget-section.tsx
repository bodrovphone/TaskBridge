'use client'

import { useTranslation } from 'react-i18next'
import { Input, RadioGroup, Radio, Card, CardBody } from '@nextui-org/react'
import { Wallet, Info } from 'lucide-react'

interface BudgetSectionProps {
 form: any
 budgetType: 'fixed' | 'range' | 'unclear' | undefined
 // eslint-disable-next-line no-unused-vars
 onBudgetTypeChange: (type: 'fixed' | 'range' | 'unclear') => void
}

export function BudgetSection({ form, budgetType, onBudgetTypeChange }: BudgetSectionProps) {
 const { t } = useTranslation()

 const handleBudgetTypeChange = (newType: 'fixed' | 'range' | 'unclear') => {
  // Clear budget field values and errors when switching types
  if (newType === 'unclear') {
   // Clear all budget values when "not sure" is selected
   form.setFieldValue('budgetMin', undefined)
   form.setFieldValue('budgetMax', undefined)
  } else if (newType === 'fixed') {
   // Clear min when switching to fixed
   form.setFieldValue('budgetMin', undefined)
  } else if (newType === 'range') {
   // Ensure both min and max are ready for input
   // Don't clear anything, just switch
  }

  // Call the parent handler
  onBudgetTypeChange(newType)
 }

 return (
  <Card className="shadow-md border border-gray-100">
   <CardBody className="p-6 md:p-8 space-y-6">
    {/* Section Header */}
    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
     <div className="p-2 bg-orange-100 rounded-lg">
      <Wallet className="w-6 h-6 text-orange-600" />
     </div>
     <div className="flex-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
       {t('createTask.budget.title', 'What is your budget?')}
      </h2>
      <div className="flex items-start gap-2 text-sm text-gray-600">
       <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
       <p>{t('createTask.budget.help', 'Fair budgets get 3x more applications')}</p>
      </div>
     </div>
    </div>

   {/* Budget Type Selection */}
   <form.Field name="budgetType">
    {(field: any) => (
     <RadioGroup
      value={field.state.value || 'unclear'}
      onValueChange={(value: any) => {
       field.handleChange(value as 'fixed' | 'range' | 'unclear')
       handleBudgetTypeChange(value as 'fixed' | 'range' | 'unclear')
      }}
      classNames={{
       wrapper: 'flex flex-col gap-3'
      }}
     >
      <Radio
       value="fixed"
       classNames={{
        base: 'inline-flex m-0 bg-white hover:bg-gray-50 items-center justify-between flex-row-reverse w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-gray-200 data-[selected=true]:border-orange-600',
        label: 'text-gray-900 font-medium',
        wrapper: 'group-data-[selected=true]:border-orange-600',
        control: 'bg-orange-600'
       }}
      >
       {t('createTask.budget.typeFixed', 'Fixed Price')}
      </Radio>
      <Radio
       value="range"
       classNames={{
        base: 'inline-flex m-0 bg-white hover:bg-gray-50 items-center justify-between flex-row-reverse w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-gray-200 data-[selected=true]:border-orange-600',
        label: 'text-gray-900 font-medium',
        wrapper: 'group-data-[selected=true]:border-orange-600',
        control: 'bg-orange-600'
       }}
      >
       {t('createTask.budget.typeRange', 'Price Range')}
      </Radio>
      <Radio
       value="unclear"
       classNames={{
        base: 'inline-flex m-0 bg-white hover:bg-gray-50 items-center justify-between flex-row-reverse w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-gray-200 data-[selected=true]:border-orange-600',
        label: 'text-gray-900 font-medium',
        wrapper: 'group-data-[selected=true]:border-orange-600',
        control: 'bg-orange-600'
       }}
      >
       {t('createTask.budget.typeUnclear', "I'm not sure about the budget")}
      </Radio>
     </RadioGroup>
    )}
   </form.Field>

   {/* Budget Input(s) - Only show if budget type is fixed or range */}
   {budgetType === 'fixed' ? (
    <form.Field
     name="budgetMax"
     validators={{
      onChange: ({ value }: any) => {
       // Only validate if user has entered a value
       if (value !== undefined && value !== null && value !== '' && value <= 0) {
        return t('createTask.budget.mustBePositive', 'Budget must be positive')
       }
       return undefined
      },
      onBlur: ({ value }: any) => {
       // Only validate if user has entered a value
       if (value !== undefined && value !== null && value !== '' && value <= 0) {
        return t('createTask.budget.mustBePositive', 'Budget must be positive')
       }
       return undefined
      }
     }}
    >
     {(field: any) => (
      <div className="space-y-2">
       <label htmlFor="budget-fixed" className="text-sm font-medium text-gray-700">
        {t('createTask.budget.fixedLabel', 'Your Budget')}
       </label>
       <Input
        id="budget-fixed"
        type="number"
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
      </div>
     )}
    </form.Field>
   ) : budgetType === 'range' ? (
    <div className="flex flex-col gap-4">
     <form.Field
      name="budgetMin"
      validators={{
       onChange: ({ value }: any) => {
        // Only validate if user has entered a value
        if (value !== undefined && value !== null && value !== '' && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
        return undefined
       },
       onBlur: ({ value }: any) => {
        // Only validate if user has entered a value
        if (value !== undefined && value !== null && value !== '' && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
        return undefined
       }
      }}
     >
      {(field: any) => (
       <div className="space-y-2">
        <label htmlFor="budget-min" className="text-sm font-medium text-gray-700">
         {t('createTask.budget.minLabel', 'Minimum')}
        </label>
        <Input
         id="budget-min"
         type="number"
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
       </div>
      )}
     </form.Field>
     <form.Field
      name="budgetMax"
      validators={{
       onChange: ({ value, fieldApi }: any) => {
        // Only validate if user has entered a value
        if (value !== undefined && value !== null && value !== '' && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
        // Check if max is greater than min when both are provided
        const minValue = fieldApi.form.getFieldValue('budgetMin')
        if (value && minValue && value <= minValue) {
         return 'createTask.errors.budgetInvalid'
        }
        return undefined
       },
       onBlur: ({ value, fieldApi }: any) => {
        // Only validate if user has entered a value
        if (value !== undefined && value !== null && value !== '' && value <= 0) {
         return t('createTask.budget.mustBePositive', 'Budget must be positive')
        }
        // Check if max is greater than min when both are provided
        const minValue = fieldApi.form.getFieldValue('budgetMin')
        if (value && minValue && value <= minValue) {
         return 'createTask.errors.budgetInvalid'
        }
        return undefined
       }
      }}
     >
      {(field: any) => (
       <div className="space-y-2">
        <label htmlFor="budget-max" className="text-sm font-medium text-gray-700">
         {t('createTask.budget.maxLabel', 'Maximum')}
        </label>
        <Input
         id="budget-max"
         type="number"
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
       </div>
      )}
     </form.Field>
    </div>
   ) : null}
   </CardBody>
  </Card>
 )
}
