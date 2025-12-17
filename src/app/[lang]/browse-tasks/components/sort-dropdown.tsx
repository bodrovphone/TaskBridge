'use client'

import { useTranslations } from 'next-intl'
import { Select, SelectItem } from '@nextui-org/react'
import { ArrowUpDown } from 'lucide-react'
import type { TaskSortOption } from '@/server/tasks/task.query-types'

interface SortDropdownProps {
  value: TaskSortOption
  onChange: (value: TaskSortOption) => void
}

const SORT_OPTIONS: Array<{ value: TaskSortOption; labelKey: string; label: string }> = [
  { value: 'newest', labelKey: 'browseTasks.sort.newest', label: 'Newest First' },
  { value: 'urgent', labelKey: 'browseTasks.sort.urgent', label: 'Urgent First' },
  { value: 'budget_high', labelKey: 'browseTasks.sort.budgetHigh', label: 'Highest Budget' },
  { value: 'budget_low', labelKey: 'browseTasks.sort.budgetLow', label: 'Lowest Budget' },
  { value: 'deadline', labelKey: 'browseTasks.sort.deadline', label: 'Ending Soon' },
]

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const t = useTranslations()

  return (
    <Select
      label={t('browseTasks.filters.sortBy')}
      placeholder={t('browseTasks.filters.sortBy')}
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as TaskSortOption
        onChange(selected)
      }}
      startContent={<ArrowUpDown className="w-4 h-4 text-gray-400" />}
      classNames={{
        base: 'w-full md:w-64',
        trigger: 'h-12',
      }}
    >
      {SORT_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {t(option.labelKey)}
        </SelectItem>
      ))}
    </Select>
  )
}
