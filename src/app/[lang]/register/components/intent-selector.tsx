'use client'

import { motion } from 'framer-motion'
import { Card, CardBody } from '@heroui/react'
import { Briefcase, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface IntentSelectorProps {
  value: 'professional' | 'customer'
  onChange: (intent: 'professional' | 'customer') => void
  disabled?: boolean
}

export function IntentSelector({ value, onChange, disabled }: IntentSelectorProps) {
  const t = useTranslations()

  const options = [
    {
      id: 'professional' as const,
      icon: Briefcase,
      title: t('auth.register.intentProfessional'),
      description: t('auth.register.intentProfessionalDesc'),
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'customer' as const,
      icon: Home,
      title: t('auth.register.intentCustomer'),
      description: t('auth.register.intentCustomerDesc'),
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 items-stretch auto-cols-fr">
      {options.map((option) => {
        const isSelected = value === option.id
        const Icon = option.icon

        return (
          <motion.div
            key={option.id}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className="h-full w-full"
          >
            <Card
              isPressable={!disabled}
              onPress={() => !disabled && onChange(option.id)}
              className={`
                cursor-pointer transition-all duration-300 h-full w-full
                ${isSelected
                  ? `border-2 ${option.borderColor} ${option.bgColor} shadow-lg`
                  : 'border-2 border-transparent bg-white hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <CardBody className="p-5 h-full">
                <div className="flex flex-col items-center text-center gap-3 h-full justify-between">
                  {/* Icon */}
                  <div
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      transition-all duration-300
                      ${isSelected
                        ? `bg-gradient-to-br ${option.gradient} shadow-md`
                        : 'bg-slate-100'
                      }
                    `}
                  >
                    <Icon
                      className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-500'}`}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 flex items-center">
                    <h3 className={`font-bold text-base ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                      {option.title}
                    </h3>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      transition-all duration-300
                      ${isSelected
                        ? `${option.borderColor} bg-gradient-to-br ${option.gradient}`
                        : 'border-slate-300'
                      }
                    `}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 bg-white rounded-full"
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
