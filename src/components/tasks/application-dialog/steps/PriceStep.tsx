'use client'

import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PriceStepProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  taskBudget?: { min?: number; max?: number }
  error?: string
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export function PriceStep({
  value,
  onChange,
  taskBudget,
  error,
  onFocus,
}: PriceStepProps) {
  const { t } = useTranslation()

  const hasBudgetRange = taskBudget && (taskBudget.min !== undefined || taskBudget.max !== undefined)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="proposedPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('application.proposedPrice')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="proposedPrice"
            placeholder={t('application.pricePlaceholder')}
            type="number"
            min="0"
            step="0.01"
            value={value === undefined ? '' : value.toString()}
            onChange={(e) => {
              const val = e.target.value
              onChange(val === '' ? undefined : parseFloat(val))
            }}
            onFocus={onFocus}
            className={cn(
              'h-14 pr-14 text-lg rounded-xl',
              error && 'border-red-500 focus:ring-red-500'
            )}
            style={{ fontSize: '18px' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold">
            BGN
          </span>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>

      {hasBudgetRange && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex items-start gap-3">
          <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              {t('application.wizard.budgetHint', "Client's budget range")}
            </p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
              {taskBudget?.min ?? 0} - {taskBudget?.max ?? 0} BGN
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('application.wizard.priceHelp', 'Enter your proposed price for completing this task. Be competitive but fair.')}
        </p>
      </div>
    </div>
  )
}

export default PriceStep
