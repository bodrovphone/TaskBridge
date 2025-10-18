'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StarRatingPickerProps {
 value: number
 onChange: (rating: number) => void
 className?: string
}

export default function StarRatingPicker({ value, onChange, className = "" }: StarRatingPickerProps) {
 const [hoveredStar, setHoveredStar] = useState<number | null>(null)
 const [isOpen, setIsOpen] = useState(false)
 const { t } = useTranslation()

 const handleStarClick = (rating: number) => {
  onChange(rating)
  setIsOpen(false)
 }

 const handleClear = () => {
  onChange(0)
  setIsOpen(false)
 }

 const getRatingText = (rating: number) => {
  if (rating === 0) return t('professionals.filters.anyRating')
  if (rating === 5) return t('professionals.filters.fiveStarsOnly')
  return `${rating}+ stars`
 }

 const getStarDisplay = (starIndex: number, currentRating: number, hovered: number | null) => {
  const displayRating = hovered !== null ? hovered : currentRating
  return starIndex <= displayRating
 }

 return (
  <Popover open={isOpen} onOpenChange={setIsOpen}>
   <PopoverTrigger asChild>
    <Button
     variant="outline"
     className={`h-12 px-4 bg-white shadow-lg border-2 border-gray-200 hover:border-yellow-400 focus:border-yellow-500 transition-all duration-300 rounded-xl ${className}`}
    >
     <div className="flex items-center gap-2">
      <Star className="text-yellow-500 fill-current" size={18} />
      <span className="font-medium text-gray-900">
       {getRatingText(value)}
      </span>
      <motion.div
       animate={{ rotate: isOpen ? 180 : 0 }}
       transition={{ duration: 0.2 }}
      >
       ▼
      </motion.div>
     </div>
    </Button>
   </PopoverTrigger>
   
   <PopoverContent 
    className="w-80 p-0 bg-white border-2 border-gray-200 shadow-xl rounded-xl" 
    align="start"
    side="bottom"
    sideOffset={8}
   >
    <div className="p-6">
     {/* Header */}
     <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('professionals.filters.selectMinimumRating')}</h3>
      <p className="text-sm text-gray-600">Choose the minimum star rating for professionals</p>
     </div>

     {/* Clear/Any Rating Option */}
     <div className="mb-6">
      <motion.button
       whileHover={{ scale: 1.02 }}
       whileTap={{ scale: 0.98 }}
       onClick={handleClear}
       className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
        value === 0 
         ? 'border-blue-400 bg-blue-50 text-blue-700' 
         : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
       }`}
      >
       <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
         <span className="text-gray-500 text-sm">∞</span>
        </div>
        <div className="text-left">
         <div className="font-semibold">{t('professionals.filters.anyRating')}</div>
         <div className="text-xs opacity-75">Show all professionals</div>
        </div>
       </div>
      </motion.button>
     </div>

     {/* Star Rating Options */}
     <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((rating) => (
       <motion.button
        key={rating}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleStarClick(rating)}
        onMouseEnter={() => setHoveredStar(rating)}
        onMouseLeave={() => setHoveredStar(null)}
        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
         value === rating 
          ? 'border-yellow-400 bg-yellow-50' 
          : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-25'
        }`}
       >
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
          {/* Stars */}
          <div className="flex items-center gap-0.5">
           {[1, 2, 3, 4, 5].map((starIndex) => (
            <motion.div
             key={starIndex}
             animate={{ 
              scale: getStarDisplay(starIndex, rating, hoveredStar) ? 1.1 : 1,
              rotate: getStarDisplay(starIndex, rating, hoveredStar) ? 0 : 0
             }}
             transition={{ duration: 0.1 }}
            >
             <Star 
              size={16}
              className={
               getStarDisplay(starIndex, rating, hoveredStar)
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
              }
             />
            </motion.div>
           ))}
          </div>
          
          {/* Text */}
          <div className="text-left">
           <div className="font-semibold text-gray-900">
            {rating === 5 ? '5 stars only' : `${rating}+ stars`}
           </div>
           <div className="text-xs text-gray-500">
            {rating === 5 
             ? 'Perfect ratings only' 
             : `At least ${rating} star${rating > 1 ? 's' : ''}`
            }
           </div>
          </div>
         </div>

         {/* Checkmark for selected */}
         <AnimatePresence>
          {value === rating && (
           <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
           >
            <span className="text-white text-xs font-bold">✓</span>
           </motion.div>
          )}
         </AnimatePresence>
        </div>
       </motion.button>
      ))}
     </div>

     {/* Current Selection Summary */}
     {value > 0 && (
      <motion.div 
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
      >
       <div className="flex items-center gap-2">
        <Star className="text-yellow-600 fill-current" size={16} />
        <span className="text-sm font-semibold text-yellow-800">
         Showing professionals with {getRatingText(value).toLowerCase()}
        </span>
       </div>
      </motion.div>
     )}
    </div>
   </PopoverContent>
  </Popover>
 )
}