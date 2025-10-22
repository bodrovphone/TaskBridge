'use client'

import { LucideIcon } from "lucide-react"
import { Card, CardBody, CardFooter, Chip } from "@heroui/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"

interface Subcategory {
 label: string
 value: string
}

interface MainCategoryCardProps {
 title: string
 description: string
 icon: LucideIcon
 color: string
 subcategories: Subcategory[]
 totalCount: number
 // Optional props for customization
 onClick?: () => void // Custom click handler for the main card
 onSubcategoryClick?: (value: string) => void // Custom handler for subcategory clicks
 showSubcategories?: boolean // Whether to show subcategories (default: true)
 showFooter?: boolean // Whether to show footer (default: true)
 variant?: 'full' | 'simple' // 'full' shows everything, 'simple' is just icon+title+description
}

// Map card colors to chip colors to avoid - excluding colors that are too similar
const colorExclusions: Record<string, Array<"primary" | "secondary" | "success" | "warning" | "danger">> = {
 blue: ["primary"],          // Blue card → avoid primary (blue)
 green: ["success"],          // Green card → avoid success (green)
 purple: ["secondary"],        // Purple card → avoid secondary (purple)
 orange: ["warning", "danger"],    // Orange card → avoid warning (orange) and danger (red/orange)
 indigo: ["primary", "secondary"],   // Indigo card → avoid primary (blue) and secondary (purple)
 pink: ["danger", "secondary"],    // Pink card → avoid danger (pink/red) and secondary (purple/pink)
}

function MainCategoryCard({
 title,
 description,
 icon: Icon,
 color,
 subcategories,
 totalCount,
 onClick,
 onSubcategoryClick,
 showSubcategories = true,
 showFooter = true,
 variant = 'full'
}: MainCategoryCardProps) {
 const { t } = useTranslation()
 const router = useRouter()
 const params = useParams()
 const lang = params?.lang as string || 'en'

 const colorConfig = {
  blue: {
   background: "bg-blue-50/80 hover:bg-gradient-to-br hover:from-blue-100 hover:to-indigo-100",
   border: "border-blue-200/50 hover:border-blue-300/70",
   icon: "text-blue-600",
   iconBg: "bg-blue-100/50 group-hover:bg-blue-200/70 group-hover:shadow-lg group-hover:shadow-blue-200/50"
  },
  green: {
   background: "bg-emerald-50/80 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100",
   border: "border-emerald-200/50 hover:border-emerald-300/70",
   icon: "text-emerald-600",
   iconBg: "bg-emerald-100/50 group-hover:bg-emerald-200/70 group-hover:shadow-lg group-hover:shadow-emerald-200/50"
  },
  purple: {
   background: "bg-purple-50/80 hover:bg-gradient-to-br hover:from-purple-100 hover:to-violet-100",
   border: "border-purple-200/50 hover:border-purple-300/70",
   icon: "text-purple-600",
   iconBg: "bg-purple-100/50 group-hover:bg-purple-200/70 group-hover:shadow-lg group-hover:shadow-purple-200/50"
  },
  orange: {
   background: "bg-orange-50/80 hover:bg-gradient-to-br hover:from-orange-100 hover:to-red-100",
   border: "border-orange-200/50 hover:border-orange-300/70",
   icon: "text-orange-600",
   iconBg: "bg-orange-100/50 group-hover:bg-orange-200/70 group-hover:shadow-lg group-hover:shadow-orange-200/50"
  },
  indigo: {
   background: "bg-indigo-50/80 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-blue-100",
   border: "border-indigo-200/50 hover:border-indigo-300/70",
   icon: "text-indigo-600",
   iconBg: "bg-indigo-100/50 group-hover:bg-indigo-200/70 group-hover:shadow-lg group-hover:shadow-indigo-200/50"
  },
  pink: {
   background: "bg-pink-50/80 hover:bg-gradient-to-br hover:from-pink-100 hover:to-rose-100",
   border: "border-pink-200/50 hover:border-pink-300/70",
   icon: "text-pink-600",
   iconBg: "bg-pink-100/50 group-hover:bg-pink-200/70 group-hover:shadow-lg group-hover:shadow-pink-200/50"
  },
 }

 const config = colorConfig[color as keyof typeof colorConfig]

 // Generate random chip colors, avoiding the parent card's color(s)
 const chipColors = useMemo(() => {
  const allColors: Array<"primary" | "secondary" | "success" | "warning" | "danger"> = [
   "primary",
   "secondary",
   "success",
   "warning",
   "danger"
  ]

  // Remove colors that are too similar to parent card
  const excludedColors = colorExclusions[color] || []
  const availableColors = allColors.filter(c => !excludedColors.includes(c))

  // Assign random colors to each subcategory
  return subcategories.map(() => {
   const randomIndex = Math.floor(Math.random() * availableColors.length)
   return availableColors[randomIndex]
  })
 }, [subcategories, color])

 const handleSubcategoryClick = (subcategoryValue: string) => {
  if (onSubcategoryClick) {
   onSubcategoryClick(subcategoryValue)
  } else {
   router.push(`/${lang}/professionals?category=${subcategoryValue}`)
  }
 }

 const handleCardClick = () => {
  if (onClick) {
   onClick()
  }
 }

 return (
  <Card
   isPressable={!!onClick}
   onPress={onClick ? handleCardClick : undefined}
   className={`
    w-full h-full
    group relative overflow-hidden transition-all duration-300
    ${config.background}
    hover:scale-[1.02] hover:shadow-2xl
    border-2 ${config.border}
    ${onClick ? 'cursor-pointer' : ''}
   `}
  >
   <CardBody className={variant === 'simple' ? 'p-6 min-h-[200px] flex items-center justify-center' : 'p-6'}>
    {variant === 'simple' ? (
     /* Simple centered layout for selection */
     <div className="flex flex-col items-center text-center">
      <div className={`
       w-16 h-16 rounded-xl flex items-center justify-center mb-4
       ${config.iconBg}
       transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
      `}>
       <Icon size={32} className={`${config.icon} transition-all duration-300`} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-slate-800 transition-colors">
       {title}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
       {description}
      </p>
     </div>
    ) : (
     /* Full layout with side-by-side header */
     <>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
       <div className={`
        w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
        ${config.iconBg}
        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
       `}>
        <Icon size={24} className={`${config.icon} transition-all duration-300`} />
       </div>
       <div className="flex-1">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
         {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
         {description}
        </p>
       </div>
      </div>

      {/* Subcategories */}
      {showSubcategories && subcategories.length > 0 && (
       <div className="flex flex-wrap gap-2 mt-4">
        {subcategories.map((subcategory, index) => (
         <Chip
          key={subcategory.value}
          color={chipColors[index]}
          variant="bordered"
          size="md"
          className="cursor-pointer hover:scale-105 transition-transform font-semibold"
          onClick={(e) => {
           e.stopPropagation()
           handleSubcategoryClick(subcategory.value)
          }}
         >
          {subcategory.label}
         </Chip>
        ))}
       </div>
      )}
     </>
    )}
   </CardBody>

   {showFooter && (
    <CardFooter className="px-6 pb-6 pt-0 justify-between border-t border-slate-200/50">
     {totalCount === 0 ? (
      <div className="text-sm font-bold text-blue-600">
       {t('landing.categories.beFirst')}
      </div>
     ) : (
      <div className="text-sm font-semibold text-slate-700">
       <span className="text-lg font-bold text-slate-900">{totalCount}+</span> {t('landing.categories.specialists')}
      </div>
     )}
     <button
      onClick={() => handleSubcategoryClick(subcategories[0]?.value || '')}
      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
     >
      {t('landing.categories.viewAll')} →
     </button>
    </CardFooter>
   )}

   {/* Subtle background decoration */}
   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white/40"></div>
    <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-white/30"></div>
   </div>
  </Card>
 )
}

MainCategoryCard.displayName = 'MainCategoryCard'

export default MainCategoryCard
