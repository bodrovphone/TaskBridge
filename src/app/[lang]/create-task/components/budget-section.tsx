'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Card, CardBody } from '@nextui-org/react'
import { Wallet, Info } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface BudgetSectionProps {
 form: any
 budgetType: 'fixed' | 'range' | 'unclear' | undefined
 // eslint-disable-next-line no-unused-vars
 onBudgetTypeChange: (type: 'fixed' | 'range' | 'unclear') => void
}

export function BudgetSection({ form, budgetType, onBudgetTypeChange }: BudgetSectionProps) {
 const { t } = useTranslation()

 // Local state for input values - allows free editing without form state restrictions
 const [localBudgetMin, setLocalBudgetMin] = useState(() => {
  const formMin = form.getFieldValue('budgetMin')
  return formMin !== undefined && formMin !== null ? String(formMin) : ''
 })
 const [localBudgetMax, setLocalBudgetMax] = useState(() => {
  const formMax = form.getFieldValue('budgetMax')
  return formMax !== undefined && formMax !== null ? String(formMax) : ''
 })

 const budgetOptions = [
  {
   value: 'fixed' as const,
   title: t('createTask.budget.typeFixed', 'Fixed Price'),
   description: t('createTask.budget.fixedDesc', 'I know exactly what I want to pay'),
   radioColor: 'text-blue-500 border-blue-500',
  },
  {
   value: 'range' as const,
   title: t('createTask.budget.typeRange', 'Price Range'),
   description: t('createTask.budget.rangeDesc', 'I have a minimum and maximum budget'),
   radioColor: 'text-purple-500 border-purple-500',
  },
  {
   value: 'unclear' as const,
   title: t('createTask.budget.typeUnclear', "I'm not sure about the budget"),
   description: t('createTask.budget.unclearDesc', 'Let professionals suggest a price'),
   radioColor: 'text-gray-500 border-gray-500',
  },
 ]

 const handleBudgetTypeChange = (newType: 'fixed' | 'range' | 'unclear') => {
  // Clear budget field values and errors when switching types
  if (newType === 'unclear') {
   // Clear all budget values when "not sure" is selected
   form.setFieldValue('budgetMin', undefined)
   form.setFieldValue('budgetMax', undefined)
   setLocalBudgetMin('')
   setLocalBudgetMax('')
  } else if (newType === 'fixed') {
   // Clear min when switching to fixed
   form.setFieldValue('budgetMin', undefined)
   setLocalBudgetMin('')
  } else if (newType === 'range') {
   // Ensure both min and max are ready for input
   // Don't clear anything, just switch
  }

  // Call the parent handler
  onBudgetTypeChange(newType)
 }

 // Helper to sync local input to form state
 const syncToForm = (field: 'budgetMin' | 'budgetMax', value: string) => {
  if (value === '') {
   form.setFieldValue(field, undefined)
  } else {
   const numValue = Number(value)
   if (!isNaN(numValue)) {
    form.setFieldValue(field, numValue)
   }
  }
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
      onValueChange={(value: string) => {
       field.handleChange(value as 'fixed' | 'range' | 'unclear')
       handleBudgetTypeChange(value as 'fixed' | 'range' | 'unclear')
      }}
      className="flex flex-col gap-3"
     >
      {budgetOptions.map((option) => (
       <div
        key={option.value}
        className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
       >
        <RadioGroupItem
         value={option.value}
         id={`budget-${option.value}-radio`}
         className={`mt-1 ${option.radioColor}`}
        />
        <Label htmlFor={`budget-${option.value}-radio`} className="cursor-pointer">
         <div className="font-medium text-gray-900">{option.title}</div>
         <div className="text-sm text-gray-500">{option.description}</div>
        </Label>
       </div>
      ))}
     </RadioGroup>
    )}
   </form.Field>

   {/* Budget Input(s) - Only show if budget type is fixed or range */}
   {budgetType === 'fixed' ? (
    <form.Field
     name="budgetMax"
     validators={{
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
        type="text"
        inputMode="numeric"
        placeholder="100"
        value={localBudgetMax}
        onValueChange={(val: string) => {
         // Allow empty string and valid numbers only
         if (val === '' || /^\d*$/.test(val)) {
          setLocalBudgetMax(val)
          syncToForm('budgetMax', val)
         }
        }}
        onBlur={() => field.handleBlur()}
        startContent={<Wallet className="w-4 h-4 text-gray-400" />}
        endContent={<span className="text-gray-400">€</span>}
        isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
        errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
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
         type="text"
         inputMode="numeric"
         placeholder="50"
         value={localBudgetMin}
         onValueChange={(val: string) => {
          // Allow empty string and valid numbers only
          if (val === '' || /^\d*$/.test(val)) {
           setLocalBudgetMin(val)
           syncToForm('budgetMin', val)
          }
         }}
         onBlur={() => field.handleBlur()}
         startContent={<Wallet className="w-4 h-4 text-gray-400" />}
         endContent={<span className="text-gray-400">€</span>}
         isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
         errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
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
         type="text"
         inputMode="numeric"
         placeholder="100"
         value={localBudgetMax}
         onValueChange={(val: string) => {
          // Allow empty string and valid numbers only
          if (val === '' || /^\d*$/.test(val)) {
           setLocalBudgetMax(val)
           syncToForm('budgetMax', val)
          }
         }}
         onBlur={() => field.handleBlur()}
         startContent={<Wallet className="w-4 h-4 text-gray-400" />}
         endContent={<span className="text-gray-400">€</span>}
         isInvalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
         errorMessage={field.state.meta.isTouched && field.state.meta.errors.length > 0 && t(field.state.meta.errors[0] as string)}
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
