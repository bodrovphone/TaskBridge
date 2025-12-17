'use client'

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import OptimizedVideoBackground from "@/components/ui/optimized-video-background";
import { Sparkles } from "lucide-react";

export default function BrowseTasksHeroSection() {
 const t = useTranslations();

 return (
  <OptimizedVideoBackground
   videoSrc="/assets/hero_video_1.mp4"
   fallbackGradient="from-blue-600 via-blue-700 to-emerald-600"
   overlayOpacity={0.6}
  >
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
    <motion.div
     initial={{ opacity: 0, y: 30 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.8 }}
     className="text-center text-white"
    >
     <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 bg-white/20 rounded-full"
     >
      <Sparkles className="w-5 h-5" />
      <span className="text-sm font-medium">{t('browseTasks.hero.badge')}</span>
     </motion.div>

     <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
     >
      {t('browseTasks.hero.title1')}
      <br />
      <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
       {t('browseTasks.hero.title2')}
      </span>
     </motion.h1>

     <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="text-lg sm:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 sm:mb-10 lg:mb-12 leading-relaxed"
     >
      {t('browseTasks.hero.subtitle')}
     </motion.p>
    </motion.div>
   </div>
  </OptimizedVideoBackground>
 );
}