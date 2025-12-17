'use client'

import { Slider } from "@nextui-org/react"
import { Star } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'

interface CompactRatingSliderProps {
 value: number
 onChange: (value: number) => void
 className?: string
}

export default function CompactRatingSlider({ value, onChange, className = "" }: CompactRatingSliderProps) {
 const [isOpen, setIsOpen] = useState(false)
 const t = useTranslations()

 const getRatingText = (rating: number) => {
  if (rating === 0) return t('professionals.filters.anyRating')
  if (rating === 5) return t('professionals.filters.fiveStarsOnly')
  return `${rating}+ stars`
 }

 const handleSliderChange = (newValue: number | number[]) => {
  const rating = Array.isArray(newValue) ? newValue[0] : newValue
  onChange(rating)
 }

 return (
  <Popover open={isOpen} onOpenChange={setIsOpen}>
   <PopoverTrigger asChild>
    <Button
     variant="outline"
     className={`h-12 px-4 bg-white shadow-lg border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 transition-all duration-300 rounded-xl min-w-[160px] ${className}`}
    >
     <div className="flex items-center gap-2">
      <Star className="text-yellow-500 fill-current" size={18} />
      <span className="font-medium text-gray-900">
       {getRatingText(value)}
      </span>
      <motion.div
       animate={{ rotate: isOpen ? 180 : 0 }}
       transition={{ duration: 0.2 }}
       className="text-gray-400"
      >
       ▼
      </motion.div>
     </div>
    </Button>
   </PopoverTrigger>
   
   <PopoverContent 
    className="w-80 p-0 bg-white border-2 border-gray-200 shadow-xl rounded-xl" 
    align="center"
    side="bottom"
    sideOffset={8}
   >
    <div className="p-6">
     {/* Header */}
     <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
       <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
       <h3 className="text-base font-semibold text-gray-800">{t('professionals.filters.minimumRating')}</h3>
      </div>
      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
       <Star className="text-yellow-500 fill-current" size={16} />
       <span className="font-bold text-yellow-700 text-sm">
        {value > 0 ? `${value}+` : t('professionals.filters.anyShort')}
       </span>
      </div>
     </div>

     {/* Slider */}
     <div className="px-2 py-4">
      <Slider
       size="lg"
       step={0.5}
       maxValue={5}
       minValue={0}
       value={value}
       onChange={handleSliderChange}
       className="w-full"
       color="warning"
       showTooltip={true}
       tooltipProps={{
        content: `${value > 0 ? value : t('professionals.filters.anyShort')} stars minimum`,
        className: "bg-yellow-500 text-white font-medium rounded-lg shadow-lg",
        placement: "top"
       }}
       classNames={{
        base: "max-w-full",
        track: "h-2 bg-gray-200 rounded-full",
        filler: "bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full",
        thumb: "w-6 h-6 bg-white border-4 border-yellow-500 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110",
        mark: "bg-gray-300",
        label: "text-sm font-medium text-gray-600"
       }}
       marks={[
        { value: 0, label: t('professionals.filters.anyShort') },
        { value: 2.5, label: "2.5" },
        { value: 4, label: "4.0" },
        { value: 5, label: "5.0" },
       ]}
       renderThumb={(props) => (
        <div
         {...props}
         className="group p-1 top-1/2 bg-white border-4 border-yellow-500 rounded-full cursor-grab data-[dragging=true]:cursor-grabbing shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
         <Star className="w-3 h-3 text-yellow-500 fill-current" />
        </div>
       )}
      />
     </div>

     {/* Quick Actions */}
     <div className="flex items-center gap-2 mt-4">
      <button
       onClick={() => onChange(0)}
       className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
      >
       {t('professionals.filters.clear')}
      </button>
      <button
       onClick={() => onChange(4)}
       className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
      >
       {t('professionals.filters.fourPlusStars')}
      </button>
      <button
       onClick={() => onChange(5)}
       className="px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
      >
       {t('professionals.filters.fiveStarsOnly')}
      </button>
     </div>

     {/* Description */}
     <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
      <p className="text-xs text-yellow-800">
       {value === 0 && t('professionals.filters.showProfessionalsWithAnyRating')}
       {value > 0 && value < 5 && t('professionals.filters.showProfessionalsWithRating', { rating: value })}
       {value === 5 && t('professionals.filters.showPerfectRating')}
      </p>
     </div>
    </div>
   </PopoverContent>
  </Popover>
 )
}