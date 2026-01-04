import { ArrowDown, ArrowRight, LucideIcon } from 'lucide-react'

export interface HowItWorksStep {
  number: string
  title: string
  description: string
  badge?: string
  icon?: LucideIcon
}

// Color presets for different use cases
export type ColorPreset = 'professionals' | 'customers' | 'blue-gradient'

const COLOR_CONFIGS = {
  professionals: [
    { bg: 'bg-blue-500', glow: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/30', text: 'text-blue-400', arrow: 'text-purple-500' },
    { bg: 'bg-purple-500', glow: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/30', text: 'text-purple-400', arrow: 'text-emerald-500' },
    { bg: 'bg-emerald-500', glow: 'from-emerald-600 to-emerald-400', shadow: 'shadow-emerald-500/30', text: 'text-emerald-400', arrow: 'text-amber-500' },
    { bg: 'bg-amber-500', glow: 'from-amber-600 to-amber-400', shadow: 'shadow-amber-500/30', text: 'text-amber-400', arrow: '' },
  ],
  customers: [
    { bg: 'bg-blue-500', glow: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/30', text: 'text-blue-400', arrow: 'text-emerald-500' },
    { bg: 'bg-emerald-500', glow: 'from-emerald-600 to-emerald-400', shadow: 'shadow-emerald-500/30', text: 'text-emerald-400', arrow: 'text-amber-500' },
    { bg: 'bg-amber-500', glow: 'from-amber-600 to-amber-400', shadow: 'shadow-amber-500/30', text: 'text-amber-400', arrow: '' },
  ],
  'blue-gradient': [
    { bg: 'bg-blue-500', glow: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-500/30', text: 'text-blue-400', arrow: 'text-indigo-500' },
    { bg: 'bg-indigo-500', glow: 'from-indigo-600 to-indigo-400', shadow: 'shadow-indigo-500/30', text: 'text-indigo-400', arrow: 'text-purple-500' },
    { bg: 'bg-purple-500', glow: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-500/30', text: 'text-purple-400', arrow: '' },
  ],
}

interface HowItWorksSectionProps {
  title?: string
  subtitle?: string
  steps: HowItWorksStep[]
  colorPreset?: ColorPreset
  className?: string
  /** Compact mode: just the steps, no section wrapper (for embedding in other sections) */
  compact?: boolean
}

export function HowItWorksSection({
  title,
  subtitle,
  steps,
  colorPreset = 'professionals',
  className = '',
  compact = false,
}: HowItWorksSectionProps) {
  const colors = COLOR_CONFIGS[colorPreset]

  // Ensure we have enough colors for all steps (cycle if needed)
  const getColor = (index: number) => colors[index % colors.length]

  // Render just the steps (for compact/embedded mode)
  const stepsContent = (
    <div className="relative">
          {/* Mobile/Tablet vertical flow layout */}
          <div className="lg:hidden flex flex-col gap-4">
            {steps.map((step, index) => {
              const color = getColor(index)
              const isLast = index === steps.length - 1

              return (
                <div key={step.number}>
                  {/* Step Card */}
                  <div className="relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-r ${color.glow} rounded-2xl opacity-25 group-hover:opacity-40 blur transition duration-300`} />
                    <div className="relative bg-slate-800/95 rounded-2xl p-6 border border-slate-700/50">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl ${color.bg} text-white font-bold text-xl shadow-lg ${color.shadow}`}>
                          {step.number}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {step.title}
                          </h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {step.description}
                          </p>
                          {step.badge && step.icon && (
                            <div className={`mt-2 flex items-center ${color.text} text-sm font-medium`}>
                              <step.icon className="w-4 h-4 mr-2" />
                              {step.badge}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow (not on last item) */}
                  {!isLast && (
                    <div className="flex justify-center py-2">
                      <ArrowDown className={`w-6 h-6 ${color.arrow}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop horizontal flow layout */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:gap-6">
            {steps.map((step, index) => {
              const color = getColor(index)
              const isLast = index === steps.length - 1

              return (
                <div key={step.number} className="contents">
                  {/* Step Card */}
                  <div className="relative group flex-1 max-w-[280px]">
                    <div className={`absolute -inset-1 bg-gradient-to-r ${color.glow} rounded-2xl opacity-25 group-hover:opacity-40 blur transition duration-300`} />
                    <div className="relative bg-slate-800/95 rounded-2xl p-6 h-full border border-slate-700/50">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color.bg} text-white font-bold text-xl mb-4 shadow-lg ${color.shadow}`}>
                        {step.number}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      {step.badge && step.icon && (
                        <div className={`mt-3 flex items-center ${color.text} text-sm font-medium`}>
                          <step.icon className="w-4 h-4 mr-2" />
                          {step.badge}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow (not on last item) */}
                  {!isLast && (
                    <div className="flex-shrink-0">
                      <ArrowRight className={`w-8 h-8 ${color.arrow}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
  )

  // Compact mode: just return the steps
  if (compact) {
    return <div className={className}>{stepsContent}</div>
  }

  // Full section mode
  return (
    <section className={`py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-400 text-lg">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {stepsContent}
      </div>
    </section>
  )
}

export default HowItWorksSection
