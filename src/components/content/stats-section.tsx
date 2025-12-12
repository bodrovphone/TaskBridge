'use client'

interface Stat {
  value: string
  label: string
}

interface StatsSectionProps {
  stats: Stat[]
  className?: string
}

export function StatsSection({ stats, className = '' }: StatsSectionProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
            {stat.value}
          </div>
          <div className="text-gray-600 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
