'use client'

import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react'
import { Grid3X3, ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  value?: string
  onChange: (value?: string) => void
}

const TASK_CATEGORIES = [
  { value: 'home_repair', labelKey: 'taskCard.category.home_repair', label: 'Home Repair', icon: '🏠' },
  { value: 'delivery_transport', labelKey: 'taskCard.category.delivery_transport', label: 'Delivery & Transport', icon: '🚚' },
  { value: 'personal_care', labelKey: 'taskCard.category.personal_care', label: 'Personal Care', icon: '🐕' },
  { value: 'personal_assistant', labelKey: 'taskCard.category.personal_assistant', label: 'Personal Assistant', icon: '👤' },
  { value: 'learning_fitness', labelKey: 'taskCard.category.learning_fitness', label: 'Learning & Fitness', icon: '🎓' },
  { value: 'other', labelKey: 'taskCard.category.other', label: 'Other', icon: '📦' },
]

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { t } = useTranslation()

  const selectedCategory = TASK_CATEGORIES.find(cat => cat.value === value)

  const handleSelect = (categoryValue: string) => {
    if (value === categoryValue) {
      onChange(undefined) // Deselect if clicking same category
    } else {
      onChange(categoryValue)
    }
  }

  const getDisplayText = () => {
    if (!value) return t('browseTasks.filters.category', 'Category')
    return `${selectedCategory?.icon} ${t(selectedCategory?.labelKey || '', selectedCategory?.label || '')}`
  }

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          variant={value ? 'flat' : 'bordered'}
          color={value ? 'primary' : 'default'}
          startContent={<Grid3X3 className="w-4 h-4" />}
          endContent={<ChevronDown className="w-4 h-4" />}
          className="justify-between"
        >
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2">
        <div className="space-y-1">
          {TASK_CATEGORIES.map((category) => {
            const isSelected = value === category.value

            return (
              <Button
                key={category.value}
                variant={isSelected ? 'flat' : 'light'}
                color={isSelected ? 'primary' : 'default'}
                className="w-full justify-start"
                startContent={<span className="text-lg">{category.icon}</span>}
                onPress={() => handleSelect(category.value)}
              >
                {t(category.labelKey, category.label)}
              </Button>
            )
          })}

          {value && (
            <>
              <div className="border-t border-divider my-2" />
              <Button
                variant="light"
                color="default"
                className="w-full justify-start text-danger"
                onPress={() => onChange(undefined)}
              >
                {t('browseTasks.filters.clear', 'Clear')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
