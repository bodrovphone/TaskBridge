'use client'

import { ReactNode } from 'react'

interface ProcessStepProps {
  number: number
  title: string
  description: string
  icon?: ReactNode
}

export function ProcessStep({ number, title, description, icon }: ProcessStepProps) {
  return (
    <div className="flex gap-4 md:gap-6">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          {icon || number}
        </div>
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

interface ProcessStepsProps {
  steps: Array<{
    title: string
    description: string
    icon?: ReactNode
  }>
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="space-y-8 md:space-y-10">
      {steps.map((step, index) => (
        <ProcessStep
          key={index}
          number={index + 1}
          title={step.title}
          description={step.description}
          icon={step.icon}
        />
      ))}
    </div>
  )
}
