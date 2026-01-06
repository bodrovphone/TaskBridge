'use client'

import { LucideIcon, ArrowRight } from "lucide-react";

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
 icon: Icon,
 color,
 onClick
}: CategoryCardProps) {

 const colorConfig = {
  blue: {
   card: "from-blue-500 to-indigo-600",
   cardHover: "group-hover:from-blue-600 group-hover:to-indigo-700",
   iconBg: "bg-white/20",
   glow: "group-hover:shadow-blue-500/40",
   accent: "bg-blue-300/30"
  },
  green: {
   card: "from-emerald-500 to-teal-600",
   cardHover: "group-hover:from-emerald-600 group-hover:to-teal-700",
   iconBg: "bg-white/20",
   glow: "group-hover:shadow-emerald-500/40",
   accent: "bg-emerald-300/30"
  },
  purple: {
   card: "from-purple-500 to-violet-600",
   cardHover: "group-hover:from-purple-600 group-hover:to-violet-700",
   iconBg: "bg-white/20",
   glow: "group-hover:shadow-purple-500/40",
   accent: "bg-purple-300/30"
  },
  orange: {
   card: "from-orange-500 to-rose-600",
   cardHover: "group-hover:from-orange-600 group-hover:to-rose-700",
   iconBg: "bg-white/20",
   glow: "group-hover:shadow-orange-500/40",
   accent: "bg-orange-300/30"
  },
 };

 const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

 return (
  <button
   onClick={onClick}
   className={`
    group relative overflow-hidden rounded-2xl md:rounded-3xl
    bg-gradient-to-br ${config.card} ${config.cardHover}
    p-4 md:p-6 lg:p-8
    transition-all duration-500 ease-out
    hover:scale-[1.03] hover:-translate-y-1
    shadow-lg hover:shadow-2xl ${config.glow}
    cursor-pointer w-full text-left
   `}
  >
   {/* Decorative circles */}
   <div className={`absolute -top-8 -right-8 w-24 h-24 md:w-32 md:h-32 rounded-full ${config.accent} transition-transform duration-500 group-hover:scale-125`} />
   <div className={`absolute -bottom-6 -left-6 w-16 h-16 md:w-20 md:h-20 rounded-full ${config.accent} transition-transform duration-500 group-hover:scale-150`} />

   {/* Content */}
   <div className="relative z-10 flex flex-col h-full">
    {/* Icon */}
    <div className={`
     w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
     rounded-xl md:rounded-2xl
     ${config.iconBg}
     flex items-center justify-center
     mb-3 md:mb-4
     transition-all duration-300
     group-hover:scale-110 group-hover:rotate-3
     backdrop-blur-sm
    `}>
     <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white drop-shadow-sm" strokeWidth={2} />
    </div>

    {/* Title */}
    <h3 className="text-base md:text-lg lg:text-xl font-bold text-white leading-tight mb-2 md:mb-3 line-clamp-2">
     {title}
    </h3>

    {/* Arrow indicator */}
    <div className="mt-auto flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors duration-300">
     <span className="hidden md:inline opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-1">
      Explore
     </span>
     <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
    </div>
   </div>

   {/* Shine effect on hover */}
   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
   </div>
  </button>
 );
}

CategoryCard.displayName = 'CategoryCard'

export default CategoryCard
