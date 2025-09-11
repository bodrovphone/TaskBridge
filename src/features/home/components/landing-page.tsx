'use client'

import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import TaskCard from "@/components/ui/task-card";
import { LocaleLink } from "@/components/common/locale-link";
import { SpinningGeometric, WobblingGeometric } from "@/components/ui/animated-elements";
import { LogoIcon } from "@/components/common/logo";
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';
import { useIsDesktop } from '@/hooks/use-media-query';
import Image from 'next/image';
import { mockTasks } from '@/lib/mock-data';
import LandingSkeleton from "@/components/ui/landing-skeleton";
import { 
  Home, 
  Truck, 
  Heart, 
  UserCheck, 
  Shield, 
  Star, 
  Lock, 
  FileText,
  CheckCircle,
  Plus,
  Search,
  ArrowRight,
  Handshake
} from "lucide-react";

function Landing() {
  const { t, ready } = useTranslation();
  const pathname = usePathname();
  const currentLocale = extractLocaleFromPathname(pathname) ?? 'en';
  const isDesktop = useIsDesktop();
  
  // Use first 3 tasks from shared mock data for display
  const featuredTasks = mockTasks.slice(0, 3);

  const categories = [
    {
      title: t('landing.categories.home'),
      description: t('landing.categories.home.description'),
      count: 150,
      icon: Home,
      color: "blue",
      category: "home_repair"
    },
    {
      title: t('landing.categories.tech'), 
      description: t('landing.categories.tech.description'),
      count: 85,
      icon: Truck,
      color: "green", 
      category: "delivery_transport"
    },
    {
      title: t('landing.categories.personal'),
      description: t('landing.categories.personal.description'),
      count: 65,
      icon: Heart,
      color: "purple",
      category: "personal_care"
    },
    {
      title: t('landing.categories.business'),
      description: t('landing.categories.business.description'), 
      count: 45,
      icon: UserCheck,
      color: "orange",
      category: "personal_assistant"
    },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: t('landing.trustIndicators.verified'),
      description: t('landing.trustIndicators.verifiedDescription'),
      color: "bg-secondary-100 text-secondary-600",
      stat: "99.9%",
      statLabel: t('landing.trustStats.securityUptime')
    },
    {
      icon: Star,
      title: t('landing.trustIndicators.ratingSystem'),
      description: t('landing.trustIndicators.ratingSystemDescription'),
      color: "bg-blue-100 text-blue-600",
      stat: "4.8/5",
      statLabel: t('landing.trustStats.avgRating')
    },
    {
      icon: Lock,
      title: t('landing.trustIndicators.dataProtection'),
      description: t('landing.trustIndicators.dataProtectionDescription'),
      color: "bg-green-100 text-green-600",
      stat: "256-bit",
      statLabel: t('landing.trustStats.encryption')
    },
    {
      icon: FileText,
      title: t('landing.trustIndicators.contracts'),
      description: t('landing.trustIndicators.contractsDescription'), 
      color: "bg-orange-100 text-orange-600",
      stat: "GDPR",
      statLabel: t('landing.trustStats.compliance')
    },
  ];

  const customerSteps = [
    {
      step: "1",
      title: t('landing.howItWorks.customers.step1.title'),
      description: t('landing.howItWorks.customers.step1.description')
    },
    {
      step: "2", 
      title: t('landing.howItWorks.customers.step2.title'),
      description: t('landing.howItWorks.customers.step2.description')
    },
    {
      step: "3",
      title: t('landing.howItWorks.customers.step3.title'), 
      description: t('landing.howItWorks.customers.step3.description')
    },
  ];

  const professionalSteps = [
    {
      step: "1",
      title: t('landing.howItWorks.professionals.step1.title'),
      description: t('landing.howItWorks.professionals.step1.description')
    },
    {
      step: "2",
      title: t('landing.howItWorks.professionals.step2.title'), 
      description: t('landing.howItWorks.professionals.step2.description')
    },
    {
      step: "3",
      title: t('landing.howItWorks.professionals.step3.title'),
      description: t('landing.howItWorks.professionals.step3.description')
    },
  ];

  const handleCategoryClick = (category: string) => {
    window.location.href = `/browse-tasks?category=${category}`;
  };

  // Show skeleton while translations are loading
  if (!ready) {
    return <LandingSkeleton />
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/cardboard.png)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      {/* Subtle overlay for sections that need it */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px]"></div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 z-10">
        {/* Cardboard background with hero overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-blue-50/70 to-indigo-100/80 backdrop-blur-[1px]"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        
        {/* Floating Geometric Elements - Focus on Best Animations */}
        <SpinningGeometric 
          className="absolute top-16 left-8" 
          size="md" 
          opacity={0.35}
        />
        <SpinningGeometric 
          className="absolute top-40 right-20" 
          size="lg" 
          opacity={0.25}
          colors={{
            primary: 'from-indigo-400 to-blue-500',
            secondary: 'from-blue-400 to-cyan-400'
          }}
        />
        <WobblingGeometric 
          className="absolute bottom-32 right-8" 
          size="md" 
          opacity={0.35}
        />
        <WobblingGeometric 
          className="absolute bottom-16 left-16" 
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow-lg">
                  <Shield className="mr-2 h-4 w-4" />
                  Trusted by 10,000+ professionals
                </div>
                <h1 className={`font-bold text-slate-900 leading-[1.1] tracking-tight ${
                  currentLocale === 'bg' 
                    ? 'text-4xl lg:text-6xl' 
                    : 'text-5xl lg:text-7xl'
                }`}>
                  {t('landing.hero.title')}
                </h1>
                <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed font-light">
                  {t('landing.hero.subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl font-semibold"
                  asChild
                >
                  <LocaleLink href="/create-task">
                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    {t('landing.hero.getStarted')}
                  </LocaleLink>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="group border-2 border-slate-300 text-slate-700 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-400 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl font-semibold"
                  asChild
                >
                  <LocaleLink href="/browse-tasks">  
                    <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    {t('landing.hero.browseServices')}
                  </LocaleLink>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white/80 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Shield className="text-white h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{t('landing.trustIndicators.verified')}</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white/80 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Heart className="text-white h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{t('landing.trustIndicators.freeToUse')}</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 hover:bg-white/80 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Star className="text-white h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{t('landing.trustIndicators.communityReviews')}</span>
                </div>
              </div>
            </div>

            <div className="relative lg:scale-105 hover:scale-110 transition-transform duration-500">
              {/* Hero Video/Image with enhanced styling */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                {isDesktop ? (
                  <video 
                    src="/assets/hero_video_2.mp4"
                    poster="/images/hero_image_1.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative rounded-3xl shadow-2xl w-full h-auto border-4 border-white object-cover"
                    style={{ maxHeight: '600px' }}
                  >
                    <source src="/assets/hero_video_2.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image 
                    src="/images/hero_image_1.jpg"
                    alt="Professional working on home repairs" 
                    width={800}
                    height={600}
                    className="relative rounded-3xl shadow-2xl w-full h-auto border-4 border-white object-cover"
                    style={{ maxHeight: '600px' }}
                    priority
                  />
                )}
              </div>
              
              {/* Enhanced Floating Stats Cards */}
              <div className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-200 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">4.8</div>
                    <div className="text-sm text-slate-600 font-medium">{t('landing.stats.averageRating')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-slate-200 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">2,500+</div>
                    <div className="text-sm text-slate-600 font-medium">{t('landing.stats.completedTasks')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tasks */}
      <section id="browse-tasks" className="py-24 relative overflow-hidden">
        {/* Cardboard background with slate overlay */}
        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
        {/* Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-40 blur-2xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-16 space-y-6 lg:space-y-0">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 text-sm font-semibold">
                <FileText className="mr-2 h-4 w-4" />
                {t('landing.featured.badge')}
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight">{t('landing.featured.title')}</h2>
              <p className="text-xl lg:text-2xl text-slate-600 font-light">{t('landing.featured.subtitle')}</p>
            </div>
            <Button 
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
              asChild
            >
              <LocaleLink href="/browse-tasks" className="flex items-center">
                Виж всички задачи
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </LocaleLink>
            </Button>
          </div>

          {featuredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-8 pb-6" style={{ width: 'max-content' }}>
                {featuredTasks.map((task: any, index: number) => (
                  <div 
                    key={task.id} 
                    className="flex-shrink-0 w-80 hover:scale-105 transition-transform duration-300"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                      <TaskCard 
                        task={task} 
                        showApplyButton={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-slate-500 text-xl mb-6 font-light">Няма налични задачи в момента.</p>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold" asChild>
                <LocaleLink href="/create-task" className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Публикувай първата задача
                </LocaleLink>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section id="categories" className="py-16 relative">
        {/* Section overlay for better contrast */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t('landing.categories.title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.categories.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.category}
                title={category.title}
                description={category.description}
                count={category.count}
                icon={category.icon}
                color={category.color}
                onClick={() => handleCategoryClick(category.category)}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="ghost" className="text-slate-800 hover:text-slate-900 font-semibold text-lg">
              {t('landing.categories.viewAll')} <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Features Section */}
      <section className="py-20 relative overflow-hidden z-10">
        {/* Section overlay for trust section */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/50 backdrop-blur-[1px]"></div>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary-200 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-200 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-16">
            <div className="flex justify-center mb-6">
              <LogoIcon size="xl" className="hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent tracking-tight">{t('landing.trustSection.title', 'Built on Trust')}</h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
              {t('landing.trustSection.subtitle', 'Your security and satisfaction are our top priorities')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature, index) => (
              <div key={feature.title} className="group relative">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 h-full flex flex-col">
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
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-8 shadow-2xl group animate-pulse">
                <Handshake className="text-white h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              <h3 className="text-4xl lg:text-7xl font-bold mb-8 leading-[1.1] bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent tracking-tight">
                {t('landing.cta.title', 'Ready to Get Started?')}
              </h3>
              <p className="text-xl lg:text-3xl text-blue-100 mb-12 max-w-5xl mx-auto leading-relaxed font-light">
                {t('landing.cta.subtitle', 'Join thousands of satisfied customers and professionals on TaskBridge')}
              </p>
              
              {/* Enhanced Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
                <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">2,500+</div>
                  <div className="text-blue-200 text-sm lg:text-base font-semibold">{t('landing.cta.stats.completedTasks', 'Completed Tasks')}</div>
                </div>
                <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">850+</div>
                  <div className="text-blue-200 text-sm lg:text-base font-semibold">{t('landing.cta.stats.activeSpecialists', 'Active Specialists')}</div>
                </div>
                <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">4.8★</div>
                  <div className="text-blue-200 text-sm lg:text-base font-semibold">{t('landing.cta.stats.averageRating', 'Average Rating')}</div>
                </div>
                <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">50+</div>
                  <div className="text-blue-200 text-sm lg:text-base font-semibold">{t('landing.cta.stats.contractTemplates', 'Contract Templates')}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <Button 
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 px-10 py-6 text-xl font-bold rounded-2xl border border-blue-400"
                  asChild
                >
                  <LocaleLink href="/create-task" className="flex items-center gap-3">
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                    {t('landing.cta.postTask', 'Post Your Task')}
                  </LocaleLink>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="group border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 px-10 py-6 text-xl font-bold rounded-2xl"
                  asChild
                >
                  <LocaleLink href="/professionals" className="flex items-center gap-3">
                    <UserCheck className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    {t('landing.cta.joinProfessionals', 'Join as Professional')}
                  </LocaleLink>
                </Button>
              </div>
              
              <p className="text-blue-200/80 text-lg font-medium">
                <Lock className="inline h-5 w-5 mr-2" />
                {t('landing.cta.freeToJoin', 'Free to join, no setup fees')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Cardboard background with subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-slate-50/70 backdrop-blur-[1px]"></div>
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>
        
        {/* Reusable animated elements in different section */}
        <SpinningGeometric 
          className="absolute top-20 right-12" 
          size="sm" 
          opacity={0.15}
          colors={{
            primary: 'from-orange-400 to-red-500',
            secondary: 'from-red-400 to-pink-400'
          }}
        />
        <WobblingGeometric 
          className="absolute bottom-20 left-12" 
          size="sm" 
          opacity={0.15}
          colors={{
            primary: 'from-green-400 to-emerald-500',
            accent: 'bg-yellow-300'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold">
              <ArrowRight className="mr-2 h-4 w-4" />
              Simple Process
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight">{t('landing.howItWorks.title')}</h2>
            <p className="text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto font-light leading-relaxed">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          {/* For Customers */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('landing.howItWorks.forCustomers')}</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {customerSteps.map((step, index) => (
                <div key={step.step} className="group text-center hover:transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-8">
                    {/* Connection line */}
                    {index < customerSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 z-0"></div>
                    )}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-300 transform rotate-3 group-hover:rotate-0">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">{step.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* For Professionals */}
          <div>
            <div className="text-center mb-16">
              <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{t('landing.howItWorks.forProfessionals')}</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {professionalSteps.map((step, index) => (
                <div key={step.step} className="group text-center hover:transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-8">
                    {/* Connection line */}
                    {index < professionalSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-teal-300 z-0"></div>
                    )}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-shadow duration-300 transform -rotate-3 group-hover:rotate-0">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">{step.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative">
        {/* Section overlay for testimonials */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/50 backdrop-blur-[1px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">{t('landing.testimonials.title', 'What Our Users Say')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.testimonials.subtitle', 'Real experiences from our community of customers and professionals')}
            </p>
          </div>

          {/* Customer Testimonials */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.customers.title', 'Happy Customers')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer1.name', 'Ivan Petrov')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer1.location', 'Sofia, Bulgaria')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer1.quote', 'Found the perfect handyman for my apartment renovation. Great service and fair prices!')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer2.name', 'Maria Dimitrova')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer2.location', 'Plovdiv, Bulgaria')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer2.quote', 'The platform made it so easy to find reliable professionals. Highly recommend!')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-50" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Happy customer"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.customers.customer3.name', 'Stefan Georgiev')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.customers.customer3.location', 'Varna, Bulgaria')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.customers.customer3.quote', 'Quick response times and quality work. This platform saves me so much time!')}"</p>
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
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('landing.testimonials.professionals.title', 'Trusted Professionals')}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Professional"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro1.name', 'Dimitar Ivanov')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro1.profession', 'Handyman')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro1.quote', 'Great platform to find new clients. The verification process builds trust.')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <Star size={16} fill="currentColor" className="opacity-60" />
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Professional"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro2.name', 'Elena Petrova')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro2.profession', 'House Cleaner')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro2.quote', 'I love the flexibility and steady stream of work. Payments are always on time.')}"</p>
                <div className="flex text-yellow-400 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Image 
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face&auto=format&q=80" 
                    alt="Professional"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t('landing.testimonials.professionals.pro3.name', 'Georgi Todorov')}</div>
                    <div className="text-sm text-gray-500">{t('landing.testimonials.professionals.pro3.profession', 'Delivery Driver')}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 flex-grow">"{t('landing.testimonials.professionals.pro3.quote', 'TaskBridge helped me grow my delivery business. Great support team!')}"</p>
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

    </div>
  );
}

Landing.displayName = 'LandingPage';

export default Landing;