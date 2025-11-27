'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LocaleLink } from "@/components/common/locale-link";
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname } from 'next/navigation';
import { ProfessionalCard } from '@/features/professionals';
import type { Professional } from '@/server/professionals/professional.types';
import { Users, ArrowRight } from "lucide-react";
import { useAuth } from '@/features/auth';
import AuthSlideOver from "@/components/ui/auth-slide-over";
import { extractLocaleFromPathname } from '@/lib/utils/url-locale';

interface FeaturedProfessionalsSectionProps {
 professionals: Professional[]
}

export default function FeaturedProfessionalsSection({ professionals }: FeaturedProfessionalsSectionProps) {
 const { t } = useTranslation();
 const router = useRouter();
 const pathname = usePathname();
 const currentLocale = extractLocaleFromPathname(pathname) ?? 'bg';
 const { user, profile } = useAuth();
 const isAuthenticated = !!user && !!profile;
 const [isAuthOpen, setIsAuthOpen] = useState(false);

 const handleJoinAsProfessional = () => {
  if (isAuthenticated) {
   router.push(`/${currentLocale}/profile/professional`);
  } else {
   setIsAuthOpen(true);
  }
 };

 return (
  <section id="featured-professionals" className="py-12 relative overflow-hidden">
   {/* Background */}
   <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80"></div>
   {/* Decorative elements */}
   <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-30 blur-3xl"></div>
   <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl"></div>

   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-12 space-y-6 lg:space-y-0">
     <div className="space-y-4">
      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 text-sm font-semibold">
       <Users className="mr-2 h-4 w-4" />
       {t('landing.professionals.badge', 'Top Professionals')}
      </div>
      <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
       {t('landing.professionals.title', 'Find Your Specialist')}
      </h2>
      <p className="text-xl text-slate-600 font-light">
       {t('landing.professionals.subtitle', 'Found someone you like? Suggest a task directly — no waiting, you make the first move')}
      </p>
     </div>
     <Button
      className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-xl font-semibold"
      asChild
     >
      <LocaleLink href="/professionals" className="flex items-center">
       {t('landing.professionals.viewAll', 'View All Professionals')}
       <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
      </LocaleLink>
     </Button>
    </div>

    {/* Horizontal scrollable professionals */}
    {professionals.length > 0 ? (
     <div className="overflow-x-auto overflow-y-visible py-6 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-6 items-stretch" style={{ minWidth: 'max-content' }}>
       {professionals.map((professional) => (
        <div key={professional.id} className="flex-shrink-0 w-80">
         <ProfessionalCard
          professional={professional}
          compact
          actionText={t('professionals.suggestTask', 'Suggest a task')}
         />
        </div>
       ))}
      </div>
     </div>
    ) : (
     <div className="text-center py-12 bg-white/50 rounded-2xl">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">{t('landing.professionals.noProfessionals', 'Be the first professional to join!')}</p>
      <Button className="mt-4" onClick={handleJoinAsProfessional}>
       {t('landing.cta.joinProfessionals', 'Join as Professional')}
      </Button>
     </div>
    )}
   </div>

   {/* Auth Slide-over */}
   <AuthSlideOver
    isOpen={isAuthOpen}
    onClose={() => setIsAuthOpen(false)}
    action="join-professional"
   />
  </section>
 );
}
