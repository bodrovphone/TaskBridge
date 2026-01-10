'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/common/locale-link";
import { Logo } from "@/components/common/logo";
import AuthSlideOver from "@/components/ui/auth-slide-over";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { useIsDesktop } from '@/hooks/use-media-query';
import Image from 'next/image';
import { HeroSection, FeaturedTasksSection, FeaturedProfessionalsSection } from "./sections";
import type { Professional } from '@/server/professionals/professional.types';
import type { FeaturedTask } from '@/lib/data/featured-tasks';
import CategoryCard from '@/components/ui/category-card';
import { MAIN_CATEGORIES } from '@/features/categories';
import { useCreateTask } from '@/hooks/use-create-task';
import { ReviewEnforcementDialog } from '@/features/reviews';
import { useAuth } from '@/features/auth';

interface LandingPageProps {
  featuredTasks: FeaturedTask[]
  featuredProfessionals: Professional[]
}

// @todo REFACTORING: Continue extracting remaining sections (see ./sections/index.ts)
import {
 UserCheck,
 Shield,
 Star,
 Lock,
 Bell,
 Wallet,
 Plus,
 ArrowRight,
 Heart,
 FileText,
 Users,
 CheckCircle,
 Search
} from "lucide-react";
import { HowItWorksSection } from '@/components/content';

// Popular categories to display on landing page (ordered by expected demand in Bulgaria)
const POPULAR_CATEGORY_SLUGS = [
 'handyman',
 'cleaning-services',
 'logistics',
 'appliance-repair',
 'courier-services',
 'pet-services',
 'furniture-work',
 'tutoring',
];

function Landing({ featuredTasks, featuredProfessionals }: LandingPageProps) {
 const t = useTranslations();
 const pathname = usePathname();
 const router = useRouter();
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'bg';
 const isDesktop = useIsDesktop();
 const [isAuthSlideOverOpen, setIsAuthSlideOverOpen] = useState(false);
 const { user, profile } = useAuth();
 const isAuthenticated = !!user && !!profile;

 // Handler for "Join as Professional" button
 const handleJoinAsProfessional = useCallback(() => {
  if (isAuthenticated) {
   // Navigate to professional profile page
   router.push(`/${currentLocale}/profile/professional`);
  } else {
   // Store professional intent for post-registration flow
   // This enables: signup → profile onboarding → browse tasks
   if (typeof window !== 'undefined') {
    localStorage.setItem('trudify_registration_intent', 'professional');
   }
   // Open auth slideover for unauthenticated users
   setIsAuthSlideOverOpen(true);
  }
 }, [isAuthenticated, router, currentLocale]);

 // Use create task hook for auth checking and review enforcement
 const {
  handleCreateTask,
  showAuthPrompt,
  setShowAuthPrompt,
  showEnforcementDialog,
  setShowEnforcementDialog,
  blockType,
  blockingTasks,
  handleReviewTask
 } = useCreateTask();

 // Handle smooth scrolling to hash anchor on page load
 useEffect(() => {
  const hash = window.location.hash;
  if (hash) {
   // Small delay to ensure page is fully rendered
   setTimeout(() => {
    const id = hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
   }, 100);
  }
 }, []);

 // Get popular categories from centralized MAIN_CATEGORIES
 const popularCategories = useMemo(() => {
  // Map color values to what CategoryCard supports (blue, green, purple, orange)
  const colorMap: Record<string, string> = {
   'blue': 'blue',
   'green': 'green',
   'purple': 'purple',
   'orange': 'orange',
   'pink': 'purple',
   'indigo': 'blue',
  };

  return POPULAR_CATEGORY_SLUGS
   .map(slug => MAIN_CATEGORIES.find(cat => cat.slug === slug))
   .filter((cat): cat is NonNullable<typeof cat> => cat !== undefined)
   .map(cat => ({
    slug: cat.slug,
    title: t(`${cat.translationKey}.title`),
    description: t(`${cat.translationKey}.description`),
    icon: cat.icon,
    color: colorMap[cat.color] || 'blue',
   }));
 }, [t]);

 const trustFeatures = [
  {
   icon: Shield,
   title: t('landing.trustIndicators.verified'),
   description: t('landing.trustIndicators.verifiedDescription'),
   color: "bg-secondary-100 text-secondary-600",
   stat: "✓",
   statLabel: t('landing.trustStats.verified')
  },
  {
   icon: Heart,
   title: t('landing.trustIndicators.freeToUse'),
   description: t('landing.trustIndicators.freeToUseDescription'),
   color: "bg-pink-100 text-pink-600",
   stat: "€0",
   statLabel: t('landing.trustStats.noFees')
  },
  {
   icon: Bell,
   title: t('landing.trustIndicators.instantNotifications'),
   description: t('landing.trustIndicators.instantNotificationsDescription'),
   color: "bg-green-100 text-green-600",
   stat: "⚡",
   statLabel: t('landing.trustStats.instant')
  },
  {
   icon: Wallet,
   title: t('landing.trustIndicators.youreInControl'),
   description: t('landing.trustIndicators.youreInControlDescription'),
   color: "bg-orange-100 text-orange-600",
   stat: "✓",
   statLabel: t('landing.trustStats.yourChoice')
  },
 ];


 const handleCategoryClick = (category: string) => {
  router.push(`/${currentLocale}/browse-tasks?category=${category}`);
 };


 return (
  <div 
   className="min-h-screen relative"
   style={{
    backgroundImage: 'url(/images/cardboard.webp)',
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto'
   }}
  >
   {/* Subtle overlay for sections that need it */}
   <div className="absolute inset-0 bg-white/30 "></div>
   
   <HeroSection />

   <FeaturedTasksSection tasks={featuredTasks} />

   <FeaturedProfessionalsSection professionals={featuredProfessionals} />

   {/* Popular Categories */}
   <section id="categories" className="py-12 md:py-20 relative overflow-hidden">
    {/* Background with subtle gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/90 via-white/80 to-blue-50/70"></div>

    {/* Decorative elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
     <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
     <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     {/* Section header */}
     <div className="text-center space-y-4 mb-10 md:mb-14">
      <div className="inline-flex items-center px-4 py-2 bg-white/80 border border-slate-200 rounded-full text-slate-600 text-sm font-medium shadow-sm">
       <Search className="mr-2 h-4 w-4 text-blue-500" />
       {t('landing.categories.subtitle')}
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 bg-clip-text text-transparent tracking-tight pb-1">
       {t('landing.categories.title')}
      </h2>
     </div>

     {/* Category grid */}
     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6">
      {popularCategories.map((category) => (
       <CategoryCard
        key={category.slug}
        title={category.title}
        description={category.description}
        icon={category.icon}
        color={category.color}
        count={0}
        onClick={() => handleCategoryClick(category.slug)}
       />
      ))}
     </div>

     {/* CTA Button */}
     <div className="text-center mt-10 md:mt-14">
      <Button
       variant="outline"
       size="lg"
       className="group border-2 border-slate-300 text-slate-700 bg-white/80 hover:bg-white hover:border-blue-400 hover:text-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-8 py-6 h-auto rounded-xl font-semibold text-base"
       asChild
      >
       <LocaleLink href="/categories">
        {t('landing.categories.viewAll')}
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
       </LocaleLink>
      </Button>
     </div>
    </div>
   </section>

   {/* Testimonials */}
   <section id="testimonials" className="py-10 md:py-20 relative">
    {/* Section overlay for testimonials */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/50 "></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">{t('landing.testimonials.title')}</h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
       {t('landing.testimonials.subtitle')}
      </p>
     </div>

     {/* Customer Testimonials */}
     <div className="mb-16">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.customers.title')}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Happy customer"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer1.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer1.location')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer1.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
        </div>
       </div>

       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Happy customer"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer2.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer2.location')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer2.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(4)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
         <Star size={16} fill="currentColor" className="opacity-50" />
        </div>
       </div>

       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Happy customer"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer3.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer3.location')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer3.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(4)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
         <Star size={16} fill="currentColor" className="opacity-75" />
        </div>
       </div>
      </div>
     </div>

     {/* Professional Testimonials */}
     <div className="mb-16">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.professionals.title')}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Professional"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro1.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro1.profession')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro1.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(4)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
         <Star size={16} fill="currentColor" className="opacity-60" />
        </div>
       </div>

       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Professional"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro2.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro2.profession')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro2.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
        </div>
       </div>

       <div className="bg-white/95 rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
        <div className="flex items-center mb-4">
         <Image
          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face&auto=format&q=80"
          alt="Professional"
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover mr-4"
         />
         <div>
          <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro3.name')}</div>
          <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro3.profession')}</div>
         </div>
        </div>
        <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro3.quote')}"</p>
        <div className="flex text-yellow-400 mt-auto">
         {[...Array(4)].map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
         ))}
         <Star size={16} fill="currentColor" className="opacity-40" />
        </div>
       </div>
      </div>
     </div>
    </div>
   </section>

   {/* How It Works */}
   <section id="how-it-works" className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center space-y-6 mb-16">
      <div className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-blue-300 text-sm font-semibold">
       <ArrowRight className="mr-2 h-4 w-4" />
       {t('landing.howItWorks.badge')}
      </div>
      <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">{t('landing.howItWorks.title')}</h2>
      <p className="text-xl lg:text-2xl text-slate-400 max-w-4xl mx-auto font-light leading-relaxed">
       {t('landing.howItWorks.subtitle')}
      </p>
     </div>

     {/* For Customers */}
     <div className="mb-20">
      <div className="text-center mb-10">
       <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">{t('landing.howItWorks.forCustomers')}</h3>
       <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full"></div>
      </div>
      <HowItWorksSection
       compact
       colorPreset="customers"
       steps={[
        {
         number: '01',
         title: t('landing.howItWorks.customers.step1.title'),
         description: t('landing.howItWorks.customers.step1.description'),
         badge: t('forCustomers.howItWorks.step1.badge'),
         icon: FileText,
        },
        {
         number: '02',
         title: t('landing.howItWorks.customers.step2.title'),
         description: t('landing.howItWorks.customers.step2.description'),
         badge: t('forCustomers.howItWorks.step2.badge'),
         icon: Users,
        },
        {
         number: '03',
         title: t('landing.howItWorks.customers.step3.title'),
         description: t('landing.howItWorks.customers.step3.description'),
         badge: t('forCustomers.howItWorks.step3.badge'),
         icon: CheckCircle,
        },
       ]}
      />
      <div className="mt-8 text-center">
       <LocaleLink
        href="/for-customers#video-guides"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
       >
        {t('landing.howItWorks.customersLearnMore')}
        <ArrowRight className="ml-2 h-5 w-5" />
       </LocaleLink>
      </div>
     </div>

     {/* For Professionals */}
     <div>
      <div className="text-center mb-10">
       <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">{t('landing.howItWorks.forProfessionals')}</h3>
       <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-amber-500 mx-auto rounded-full"></div>
      </div>
      <HowItWorksSection
       compact
       colorPreset="professionals"
       steps={[
        {
         number: '01',
         title: t('landing.howItWorks.professionals.step1.title'),
         description: t('landing.howItWorks.professionals.step1.description'),
         badge: `2 ${t('common.minutes')}`,
         icon: FileText,
        },
        {
         number: '02',
         title: t('landing.howItWorks.professionals.step2.title'),
         description: t('landing.howItWorks.professionals.step2.description'),
         badge: t('forProfessionals.howItWorks.step2.badge'),
         icon: Bell,
        },
        {
         number: '03',
         title: t('landing.howItWorks.professionals.step3.title'),
         description: t('landing.howItWorks.professionals.step3.description'),
         badge: t('forProfessionals.howItWorks.step3.badge'),
         icon: Search,
        },
       ]}
      />
      <div className="mt-8 text-center">
       <LocaleLink
        href="/for-professionals#video-guides"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-amber-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
       >
        {t('landing.howItWorks.professionalsLearnMore')}
        <ArrowRight className="ml-2 h-5 w-5" />
       </LocaleLink>
      </div>
     </div>
    </div>
   </section>

   {/* Trust Features Section */}
   <section className="py-20 relative overflow-hidden z-10">
    {/* Section overlay for trust section */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/50 "></div>
    {/* Background decoration */}
    <div className="absolute inset-0 opacity-10">
     <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full blur-xl"></div>
     <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full blur-xl"></div>
     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full blur-3xl"></div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
     <div className="text-center space-y-6 mb-16">
      <div className="flex justify-center mb-6">
       <Logo size="xl" variant="gradient" className="hover:scale-110 transition-transform duration-300" />
      </div>
      <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent tracking-tight pb-2">{t('landing.trustSection.title')}</h2>
      <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
       {t('landing.trustSection.subtitle')}
      </p>
     </div>

     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {trustFeatures.map((feature, index) => (
       <div key={feature.title} className="group relative">
        <div className="bg-white/95 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 h-full flex flex-col">
         <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <feature.icon size={36} />
         </div>
         <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
         <p className="text-gray-600 text-center leading-relaxed flex-grow mb-6">{feature.description}</p>

         {/* Individual stat for each card */}
         <div className="text-center mt-auto">
          <div className="text-2xl font-bold text-blue-600">{feature.stat}</div>
          <div className="text-sm text-gray-500">{feature.statLabel}</div>
         </div>

         {/* Feature number badge */}
         <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">{index + 1}</span>
         </div>
        </div>
       </div>
      ))}
     </div>

     {/* Ready to Get Started Section */}
     <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 lg:p-20 border border-slate-700 mt-20 shadow-2xl">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0">
       <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20"></div>
       <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20"></div>
       <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative text-center">
       <div className="inline-flex items-center justify-center mb-8 group animate-pulse">
        <Image
         src="/images/logo/trudify-logo-128.svg"
         alt="Trudify"
         width={96}
         height={96}
         className="group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
        />
       </div>

       <h3 className="text-4xl lg:text-7xl font-bold mb-8 leading-[1.1] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
        {t('landing.cta.title')}
       </h3>
       <p className="text-xl lg:text-3xl text-blue-100 mb-12 max-w-5xl mx-auto leading-relaxed font-light">
        {t('landing.cta.subtitle')}
       </p>

       {/* Enhanced Stats Row */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-16 max-w-5xl mx-auto px-2 sm:px-0">
        <div className="group text-center bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
         <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{t('landing.cta.stats.completedTasksValue')}</div>
         <div className="text-blue-200 text-xs sm:text-sm lg:text-base font-semibold leading-tight">{t('landing.cta.stats.completedTasks')}</div>
        </div>
        <div className="group text-center bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
         <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">{t('landing.cta.stats.activeSpecialistsValue')}</div>
         <div className="text-blue-200 text-xs sm:text-sm lg:text-base font-semibold leading-tight">{t('landing.cta.stats.activeSpecialists')}</div>
        </div>
        <div className="group text-center bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
         <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">{t('landing.cta.stats.averageRatingValue')}</div>
         <div className="text-blue-200 text-xs sm:text-sm lg:text-base font-semibold leading-tight">{t('landing.cta.stats.averageRating')}</div>
        </div>
        <div className="group text-center bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
         <div className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{t('landing.cta.stats.contractTemplatesValue')}</div>
         <div className="text-blue-200 text-xs sm:text-sm lg:text-base font-semibold leading-tight">{t('landing.cta.stats.contractTemplates')}</div>
        </div>
       </div>

       <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 px-4 sm:px-0">
        <Button
         size="lg"
         className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-xl font-bold rounded-2xl border border-blue-400"
         onClick={handleCreateTask}
        >
         <Plus className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
         {t('landing.cta.postTask')}
        </Button>
        <Button
         size="lg"
         variant="outline"
         className="group w-full sm:w-auto border-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-xl font-bold rounded-2xl"
         onClick={handleJoinAsProfessional}
        >
         <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
         {t('landing.cta.joinProfessionals')}
        </Button>
       </div>

       <p className="text-blue-200/80 text-lg font-medium">
        <Lock className="inline h-5 w-5 mr-2" />
        {t('landing.cta.freeToJoin')}
       </p>
      </div>
     </div>
    </div>
   </section>

   {/* Auth Slide-over for "Join as Professional" */}
   <AuthSlideOver
    isOpen={isAuthSlideOverOpen}
    onClose={() => setIsAuthSlideOverOpen(false)}
    action="join-professional"
   />

   {/* Auth Slide-over for "Create Task" (non-authenticated users) */}
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
    onReviewTask={handleReviewTask}
   />
  </div>
 );
}

Landing.displayName = 'LandingPage';

export default Landing;