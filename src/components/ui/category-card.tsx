'use client'

import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardFooter } from "@nextui-org/react";

interface CategoryCardProps {
 title: string;
 description: string;
 count: number;
 icon: LucideIcon;
 color: string;
 onClick?: () => void;
}

function CategoryCard({ 
 title, 
 description, 
 count, 
 icon: Icon, 
 color,
 onClick 
}: CategoryCardProps) {
 const { t } = useTranslation();
 
 const colorConfig = {
  blue: {
   background: "bg-blue-50 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100",
   icon: "text-blue-600 group-hover:text-blue-700",
   iconBg: "bg-blue-100/50 group-hover:bg-blue-200/70 group-hover:shadow-lg group-hover:shadow-blue-200/50"
  },
  green: {
   background: "bg-emerald-50 group-hover:bg-gradient-to-br group-hover:from-emerald-100 group-hover:to-teal-100",
   icon: "text-emerald-600 group-hover:text-emerald-700",
   iconBg: "bg-emerald-100/50 group-hover:bg-emerald-200/70 group-hover:shadow-lg group-hover:shadow-emerald-200/50"
  },
  purple: {
   background: "bg-purple-50 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-violet-100",
   icon: "text-purple-600 group-hover:text-purple-700",
   iconBg: "bg-purple-100/50 group-hover:bg-purple-200/70 group-hover:shadow-lg group-hover:shadow-purple-200/50"
  },
  orange: {
   background: "bg-orange-50 group-hover:bg-gradient-to-br group-hover:from-orange-100 group-hover:to-red-100",
   icon: "text-orange-600 group-hover:text-orange-700",
   iconBg: "bg-orange-100/50 group-hover:bg-orange-200/70 group-hover:shadow-lg group-hover:shadow-orange-200/50"
  },
 };

 const config = colorConfig[color as keyof typeof colorConfig];

 return (
  <Card 
   isPressable
   onPress={onClick}
   className={`
    group relative overflow-hidden transition-all duration-300 
    ${config.background}
    hover:scale-105 hover:shadow-xl 
    border-1 border-slate-200/50 hover:border-slate-300/70
    
   `}
  >
   <CardBody className="p-8 text-center relative z-10">
    <div className={`
     w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto 
     ${config.iconBg}
     transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
    `}>
     <Icon size={28} className={`${config.icon} transition-all duration-300 group-hover:scale-110`} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors duration-300">
     {title}
    </h3>
    <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
     {description}
    </p>
   </CardBody>
   <CardFooter className="px-8 pb-8 pt-0 justify-center">
    {count === 0 ? (
     <div className="text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
      {t('landing.categories.beFirst')}
     </div>
    ) : (
     <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
      <span className="text-lg font-bold">{count}+</span> {t('landing.categories.activeSpecialists')}
     </div>
    )}
   </CardFooter>
   
   {/* Subtle background decoration */}
   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white/40"></div>
    <div className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-white/30"></div>
   </div>
  </Card>
 );
}

CategoryCard.displayName = 'CategoryCard'

export default CategoryCard
