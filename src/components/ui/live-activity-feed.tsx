'use client'

import { useState, useEffect, memo } from 'react'
import { useTranslations } from 'next-intl'

// Names per locale
const NAMES: Record<string, string[]> = {
  bg: ['Георги', 'Иван', 'Петър', 'Мартин', 'Мария', 'Елена', 'Петя', 'Силвия'],
  en: ['George', 'Ivan', 'Peter', 'Martin', 'Maria', 'Elena', 'Petya', 'Sylvia'],
  ru: ['Георгий', 'Иван', 'Пётр', 'Мартин', 'Мария', 'Елена', 'Петя', 'Сильвия'],
  ua: ['Георгій', 'Іван', 'Петро', 'Мартін', 'Марія', 'Олена', 'Петра', 'Сільвія'],
}

const CITIES: Record<string, string[]> = {
  bg: ['София', 'Пловдив', 'Варна', 'Бургас'],
  en: ['Sofia', 'Plovdiv', 'Varna', 'Burgas'],
  ru: ['София', 'Пловдив', 'Варна', 'Бургас'],
  ua: ['Софія', 'Пловдив', 'Варна', 'Бургас'],
}

type ActivityType = 'posted' | 'offers' | 'completed'

interface Activity {
  type: ActivityType
  nameIndex: number
  taskKey: string
  cityIndex: number
  count: number
}

// Task translation keys
const TASK_KEYS = [
  'activityFeed.tasks.cleaning',
  'activityFeed.tasks.furniture',
  'activityFeed.tasks.moving',
  'activityFeed.tasks.repair',
  'activityFeed.tasks.dogWalking',
  'activityFeed.tasks.delivery',
  'activityFeed.tasks.assembly',
]

// Pre-generate pool with indices
const POOL: Activity[] = Array.from({ length: 15 }, (_, i) => ({
  type: (['posted', 'offers', 'completed'] as ActivityType[])[i % 3],
  nameIndex: i % 8,
  taskKey: TASK_KEYS[i % TASK_KEYS.length],
  cityIndex: i % 4,
  count: 2 + (i % 4),
}))

function LiveActivityFeed() {
  const t = useTranslations()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [isRotating, setIsRotating] = useState(false)

  // Detect locale from translation
  const locale = t('common.locale') || 'bg'
  const names = NAMES[locale] || NAMES.bg
  const cities = CITIES[locale] || CITIES.bg

  // Start rotating after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsRotating(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  // Rotate when active
  useEffect(() => {
    if (!isRotating) return

    const interval = 5000 + (index % 3) * 800

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % POOL.length)
        setVisible(true)
      }, 250)
    }, interval)

    return () => clearTimeout(timer)
  }, [isRotating, index])

  const activity = POOL[index]
  const name = names[activity.nameIndex]
  const city = cities[activity.cityIndex]
  const task = t(activity.taskKey)

  let content
  if (activity.type === 'offers') {
    content = (
      <>
        <span className="font-semibold">{name}</span>
        <span className="text-slate-500"> {t('activityFeed.receivedOffers', { count: activity.count })}</span>
        <span className="text-slate-400"> · {city}</span>
      </>
    )
  } else {
    const verb = activity.type === 'posted'
      ? t('activityFeed.lookingFor')
      : t('activityFeed.completed')
    content = (
      <>
        <span className="font-semibold">{name}</span>
        <span className="text-slate-500"> {verb} </span>
        <span className="font-medium">{task}</span>
        <span className="text-slate-400"> · {city}</span>
      </>
    )
  }

  return (
    <div
      className="h-7 flex items-center justify-start sm:justify-center overflow-hidden"
      aria-live="polite"
    >
      <div
        className={`
          inline-flex items-center gap-1.5
          px-3 py-1
          bg-white/70 border border-slate-200/80 rounded-full
          text-xs sm:text-sm text-slate-700
          transition-opacity duration-200
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="truncate">{content}</span>
      </div>
    </div>
  )
}

export default memo(LiveActivityFeed)
