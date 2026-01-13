'use client'

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/common/locale-link";
import { SpinningGeometric, WobblingGeometric } from "@/components/ui/animated-elements";
import OptimizedVideoHero from "@/components/ui/optimized-video-hero";
import LiveActivityFeed from "@/components/ui/live-activity-feed";
import { useTranslations } from 'next-intl';
import { useCreateTask } from '@/hooks/use-create-task';

// Lazy load dialog components (only loaded when user interacts)
const AuthSlideOver = dynamic(() => import("@/components/ui/auth-slide-over"), {
  ssr: false,
  loading: () => null
});

const ReviewEnforcementDialog = dynamic(
  () => import('@/features/reviews').then(mod => ({ default: mod.ReviewEnforcementDialog })),
  { ssr: false, loading: () => null }
);
import {
 Shield,
 Star,
 Heart,
 Bell,
 CheckCircle,
 SquarePen,
 Search,
 Gift,
 HelpCircle
} from "lucide-react";

export default function HeroSection() {
 const t = useTranslations();

 const {
  handleCreateTask,
  showAuthPrompt,
  setShowAuthPrompt,
  showEnforcementDialog,
  setShowEnforcementDialog,
  blockType,
  blockingTasks
 } = useCreateTask();

 // Set professional intent before navigating to browse-tasks
 const setProfessionalIntent = () => {
  if (typeof window !== 'undefined') {
   localStorage.setItem('trudify_registration_intent', 'professional');
  }
 };

 return (
  <section className="relative overflow-hidden pt-6 pb-12 lg:py-20 z-10" style={{ contain: 'layout style' }}>
   {/* Mobile: Hero background image - Next.js Image for LCP optimization */}
   <Image
    src="/images/hero-m-3-mobile.jpg"
    alt=""
    fill
    priority
    fetchPriority="high"
    sizes="(max-width: 1024px) 50vw, 0px"
    className="lg:hidden !absolute !inset-x-0 !top-0 !h-[640px] !bottom-auto object-cover object-center"
    aria-hidden="true"
   />
   {/* Mobile: Gradient overlay on image area - fades to solid white before image ends */}
   <div
    className="lg:hidden absolute inset-x-0 top-0 h-[640px]"
    style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.85) 75%, rgba(255,255,255,1) 100%)' }}
   />
   {/* Mobile: White background for rest of section below image */}
   <div className="lg:hidden absolute inset-x-0 top-[640px] bottom-0 bg-white" />

   {/* Desktop: Cardboard background with hero overlay */}
   <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-indigo-100/80"></div>
   {/* Background Pattern */}
   <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
   
   {/* Floating Geometric Elements - Hidden on mobile for performance */}
   <SpinningGeometric
    className="hidden lg:block absolute top-16 left-8"
    size="md"
    opacity={0.35}
   />
   <SpinningGeometric
    className="hidden lg:block absolute top-40 right-20"
    size="lg"
    opacity={0.25}
    colors={{
     primary: 'from-indigo-400 to-blue-500',
     secondary: 'from-blue-400 to-cyan-400'
    }}
   />
   <WobblingGeometric
    className="hidden lg:block absolute bottom-32 right-8"
    size="md"
    opacity={0.35}
   />
   <WobblingGeometric
    className="hidden lg:block absolute bottom-16 left-16"
    size="sm"
    opacity={0.25}
    colors={{
     primary: 'from-emerald-400 to-teal-500',
     accent: 'bg-white'
    }}
   />
   
   {/* Animation Styles */}
   <style jsx global>{`
    @keyframes spin-slow {
     from { transform: rotate(12deg); }
     to { transform: rotate(372deg); }
    }
    @keyframes wobble {
     0%, 100% { transform: rotate(-12deg) scale(1); }
     25% { transform: rotate(-15deg) scale(1.05); }
     75% { transform: rotate(-9deg) scale(0.95); }
    }
    .animate-spin-slow {
     animation: spin-slow 8s linear infinite;
    }
    .animate-wobble {
     animation: wobble 4s ease-in-out infinite;
    }
   `}</style>
   
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-16 items-center">
     {/* Text Content - Order 1 on mobile, Order 1 on desktop */}
     <div className="space-y-6 lg:space-y-10 order-1">
      <div className="space-y-4 lg:space-y-6">
       {/* Chips */}
       <div className="flex flex-wrap gap-2">
        {/* #1 Badge - Desktop only (moved to subtitle on mobile) */}
        <div className="hidden lg:inline-flex items-center px-4 py-2 bg-white/70 border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow-lg">
         <Shield className="mr-2 h-4 w-4" />
         {t('landing.hero.badge')}
        </div>
        {/* How it works - Both mobile and desktop */}
        <button
         onClick={() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
         }}
         className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-full text-emerald-700 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer"
        >
         <HelpCircle className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
         {t('landing.hero.howItWorksBadge')}
        </button>
        {/* Giveaway - Both mobile and desktop */}
        <LocaleLink
         href="/giveaway"
         className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-full text-amber-700 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
         <Gift className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
         {t('landing.hero.giveawayBadge')}
        </LocaleLink>
       </div>
       <h1 className="font-bold text-slate-900 leading-[1.1] tracking-tight text-[2.5rem]">
        {t('landing.hero.title')}
       </h1>
       {/* Mobile subtitle - includes #1 message */}
       <p className="lg:hidden text-base text-slate-700 leading-relaxed font-medium">
        {t('landing.hero.badge')} — {t('landing.hero.subtitleMobile')}
       </p>
       {/* Desktop subtitle */}
       <p className="hidden lg:block text-xl lg:text-2xl text-slate-600 leading-relaxed font-light">
        {t('landing.hero.subtitle')}
       </p>
      </div>

      {/* Live Activity Feed - Social proof */}
      <LiveActivityFeed />

      {/* CTA Buttons - Shown on both mobile and desktop */}
      <div className="flex flex-col sm:flex-row gap-4">
       <Button
        size="lg"
        className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl font-semibold"
        onClick={handleCreateTask}
       >
        <SquarePen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        {t('landing.hero.getStarted')}
       </Button>
       <Button
        variant="outline"
        size="lg"
        className="group border-2 border-slate-300 text-slate-700 bg-white/70 hover:bg-white hover:border-slate-400 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl font-semibold"
        asChild
       >
        <LocaleLink href="/browse-tasks" onClick={setProfessionalIntent}>
         <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
         {t('landing.hero.browseServices')}
        </LocaleLink>
       </Button>
      </div>

      {/* Trust Indicators - Hidden on mobile */}
      <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Shield className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.verified')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.verifiedDescription')}</span>
        </div>
       </div>
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Heart className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.freeToUse')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.freeToUseDescription')}</span>
        </div>
       </div>
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Bell className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.instantNotifications')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.instantNotificationsDescription')}</span>
        </div>
       </div>
      </div>
     </div>

     {/* Hero Image/Video - Desktop only (mobile uses full-width background) */}
     <div className="hidden lg:block relative hover:scale-105 transition-transform duration-500 order-2">
      {/* Desktop Hero Video/Image with enhanced styling */}
      <div className="relative group">
       <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
       <OptimizedVideoHero
        videoSrc="/assets/hero_video_2.mp4"
        poster="/images/hero_image_1.webp"
        alt="Professional working on home repairs"
        width={800}
        height={600}
        className="relative rounded-3xl shadow-2xl w-full h-auto border-4 border-white object-cover"
        maxHeight="420px"
        desktopOnly
       />
      </div>

      {/* Enhanced Floating Stats Cards - Desktop only */}
      <div className="absolute -top-6 -left-6 bg-white/90 rounded-2xl shadow-xl p-6 border border-slate-200 hover:scale-105 transition-transform duration-300">
       <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
         <Star className="text-white h-6 w-6" />
        </div>
        <div>
         <div className="text-xl font-bold text-slate-900">{t('landing.stats.ratingValue')}</div>
         <div className="text-sm text-slate-600 font-medium whitespace-nowrap">{t('landing.stats.averageRating')}</div>
        </div>
       </div>
      </div>

      <div className="absolute -bottom-6 -right-6 bg-white/90 rounded-2xl shadow-xl p-6 border border-slate-200 hover:scale-105 transition-transform duration-300">
       <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
         <CheckCircle className="text-white h-6 w-6" />
        </div>
        <div>
         <div className="text-xl font-bold text-slate-900">{t('landing.stats.tasksValue')}</div>
         <div className="text-sm text-slate-600 font-medium whitespace-nowrap">{t('landing.stats.completedTasks')}</div>
        </div>
       </div>
      </div>
     </div>

     {/* Mobile Only: Subtitle + Trust Indicators after image - Order 3 */}
     <div className="lg:hidden space-y-6 order-3">
      {/* Subtitle - Mobile only */}
      <p className="text-lg text-slate-600 leading-relaxed font-light">
       {t('landing.hero.subtitle')}
      </p>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 gap-4">
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Shield className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.verified')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.verifiedDescription')}</span>
        </div>
       </div>
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Heart className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.freeToUse')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.freeToUseDescription')}</span>
        </div>
       </div>
       <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
         <Bell className="text-white h-5 w-5" />
        </div>
        <div className="flex flex-col">
         <span className="text-sm font-bold text-slate-800 leading-tight mb-1">{t('landing.trustIndicators.instantNotifications')}</span>
         <span className="text-xs text-slate-600 leading-snug">{t('landing.trustIndicators.instantNotificationsDescription')}</span>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Auth Slide-over */}
   <AuthSlideOver
    isOpen={showAuthPrompt}
    onClose={() => setShowAuthPrompt(false)}
    action="create-task"
   />

   {/* Review Enforcement Dialog */}
   <ReviewEnforcementDialog
    isOpen={showEnforcementDialog}
    onClose={() => setShowEnforcementDialog(false)}
    blockType={blockType}
    pendingTasks={blockingTasks}
   />
  </section>
 );
}