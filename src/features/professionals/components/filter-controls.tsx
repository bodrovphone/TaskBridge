'use client'

import { motion } from "framer-motion"
import { 
 Select,
 SelectItem,
 Input,
 Slider,
 Checkbox,
 RadioGroup,
 Radio,
 Divider
} from "@nextui-org/react"
import { TFunction } from 'i18next'
import { Star, MapPin, Briefcase, SlidersHorizontal } from "lucide-react"
import SortingPicker from "@/components/ui/sorting-picker"
import { getLocationOptions } from '@/lib/constants/locations'

interface FilterControlsProps {
 filters: any
 onFilterChange: (key: string, value: any) => void
 categorySelectItems: JSX.Element[]
 t: TFunction
}

export default function FilterControls({ filters, onFilterChange, categorySelectItems, t }: FilterControlsProps) {
 const locationOptions = getLocationOptions(t);

 return (
  <div className="space-y-8 px-1 max-h-[80vh] overflow-y-scroll scrollbar-hide">
   {/* Category Filter */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-3"
   >
    <div className="flex items-center gap-2">
     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
     <label className="text-base font-semibold text-gray-800">{t('professionals.filters.category')}</label>
    </div>
    <Select
     placeholder={t('professionals.allCategories')}
     selectedKeys={[filters.category]}
     onSelectionChange={(keys) => onFilterChange("category", Array.from(keys)[0] as string || "all")}
     className="w-full"
     size="lg"
     variant="bordered"
     classNames={{
      base: "bg-white",
      trigger: "bg-white shadow-md border-2 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all duration-300 h-14 rounded-xl",
      value: "text-gray-900 font-medium text-base",
      label: "text-gray-700",
      popoverContent: "bg-white border-2 border-gray-200 shadow-xl rounded-xl",
      listbox: "p-2"
     }}
     startContent={<div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm"></div>}
    >
     {categorySelectItems}
    </Select>
   </motion.div>

   <Divider className="bg-gray-200" />
   
   {/* Location Filter */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
    className="space-y-3"
   >
    <div className="flex items-center gap-2">
     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
     <label className="text-base font-semibold text-gray-800">{t('professionals.filters.location')}</label>
    </div>
    <Select
     placeholder={t('professionals.filters.locationPlaceholder')}
     selectedKeys={filters.location ? [filters.location] : []}
     onSelectionChange={(keys) => onFilterChange("location", Array.from(keys)[0] as string || "")}
     size="lg"
     variant="bordered"
     classNames={{
      base: "bg-white",
      trigger: "bg-white shadow-md border-2 border-gray-200 hover:border-green-400 focus:border-green-500 transition-all duration-300 h-14 rounded-xl",
      value: "text-gray-900 font-medium text-base",
      label: "text-gray-700",
      popoverContent: "bg-white border-2 border-gray-200 shadow-xl rounded-xl",
      listbox: "p-2"
     }}
     startContent={<MapPin className="text-green-500" size={18} />}
    >
     {locationOptions.map((location) => (
      <SelectItem key={location.value} value={location.value}>
       {location.emoji} {location.label}
      </SelectItem>
     ))}
    </Select>
   </motion.div>

   <Divider className="bg-gray-200" />
   
   {/* Enhanced Rating Filter */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
    className="space-y-4"
   >
    <div className="flex items-center justify-between">
     <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      <label className="text-base font-semibold text-gray-800">{t('professionals.filters.minimumRating')}</label>
     </div>
     <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
      <Star className="text-yellow-500 fill-current" size={16} />
      <span className="font-bold text-yellow-700 text-sm">
       {filters.minRating > 0 ? `${filters.minRating}+` : t('professionals.filters.any')}
      </span>
     </div>
    </div>
    <div className="px-2 py-4">
     <Slider
      size="lg"
      step={0.5}
      maxValue={5}
      minValue={0}
      value={filters.minRating}
      onChange={(value) => onFilterChange("minRating", Array.isArray(value) ? value[0] : value)}
      className="w-full"
      color="warning"
      showTooltip={true}
      tooltipProps={{
       content: `${filters.minRating} stars minimum`,
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
       { value: 0, label: t('professionals.filters.any') },
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
   </motion.div>

   <Divider className="bg-gray-200" />
   
   {/* Enhanced Gender Filter with Radio Buttons */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="space-y-4"
   >
    <div className="flex items-center gap-2">
     <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
     <label className="text-base font-semibold text-gray-800">{t('professionals.filters.genderPreference')}</label>
    </div>
    <RadioGroup
     value={filters.gender || "all"}
     onValueChange={(value) => onFilterChange("gender", value === "all" ? "" : value)}
     orientation="horizontal"
     classNames={{
      base: "flex-row gap-6",
      wrapper: "gap-6"
     }}
    >
     <Radio 
      value="all"
      classNames={{
       base: "flex items-center gap-2 max-w-none",
       wrapper: "border-2 border-gray-300 hover:border-purple-400 transition-colors",
       control: "bg-purple-500",
       label: "text-gray-700 font-medium"
      }}
     >
      <div className="flex items-center gap-2 py-2">
       <span className="text-lg">👥</span>
       <span>{t('professionals.filters.all')}</span>
      </div>
     </Radio>
     <Radio 
      value="female"
      classNames={{
       base: "flex items-center gap-2 max-w-none",
       wrapper: "border-2 border-gray-300 hover:border-purple-400 transition-colors",
       control: "bg-purple-500",
       label: "text-gray-700 font-medium"
      }}
     >
      <div className="flex items-center gap-2 py-2">
       <span className="text-lg">👩</span>
       <span>{t('professionals.gender.female')}</span>
      </div>
     </Radio>
     <Radio 
      value="male"
      classNames={{
       base: "flex items-center gap-2 max-w-none",
       wrapper: "border-2 border-gray-300 hover:border-purple-400 transition-colors",
       control: "bg-purple-500",
       label: "text-gray-700 font-medium"
      }}
     >
      <div className="flex items-center gap-2 py-2">
       <span className="text-lg">👨</span>
       <span>{t('professionals.gender.male')}</span>
      </div>
     </Radio>
    </RadioGroup>
   </motion.div>

   <Divider className="bg-gray-200" />
   
   {/* Enhanced Most Active Checkbox */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.4 }}
    className="space-y-3"
   >
    <div className="flex items-center gap-2">
     <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
     <label className="text-base font-semibold text-gray-800">{t('professionals.filters.activityLevel')}</label>
    </div>
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
     <Checkbox
      isSelected={filters.mostActive}
      onValueChange={(checked) => onFilterChange("mostActive", checked)}
      color="warning"
      size="lg"
      classNames={{
       base: "flex items-start gap-3 max-w-none",
       wrapper: "border-2 border-orange-300 hover:border-orange-400",
       icon: "text-white",
       label: "text-gray-800 font-medium text-base leading-relaxed"
      }}
     >
      <div className="space-y-1">
       <div className="flex items-center gap-2">
        <Briefcase className="text-orange-600" size={16} />
        <span className="font-semibold">{t('professionals.filters.topPerformersOnly')}</span>
       </div>
       <p className="text-sm text-gray-600 leading-relaxed">
        Show professionals with 50+ completed jobs
       </p>
      </div>
     </Checkbox>
    </div>
   </motion.div>

   <Divider className="bg-gray-200" />
   
   {/* Enhanced Sort By */}
   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.5 }}
    className="space-y-3"
   >
    <div className="flex items-center gap-2">
     <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
     <label className="text-base font-semibold text-gray-800">{t('professionals.filters.sortResultsBy')}</label>
    </div>
    <SortingPicker
     value={filters.sortBy}
     onChange={(sortBy) => onFilterChange("sortBy", sortBy)}
     className="w-full"
    />
   </motion.div>
   
   {/* Bottom padding for mobile scrolling */}
   <div className="h-4"></div>
  </div>
 );
}