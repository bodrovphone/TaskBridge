'use client'

import { Mail, Shield, Star, Award, Heart } from "lucide-react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from "next/navigation";
import { LocaleLink } from "./locale-link";
import { LANGUAGE_CONFIG } from "@/lib/constants/locales";
import { FlagIcon } from "@/components/ui/flag-icon";
import { extractLocaleFromPathname, replaceLocaleInPathname } from "@/lib/utils/url-locale";
import { saveUserLocalePreference } from "@/lib/utils/client-locale";
import { updateUserLanguagePreference } from "@/lib/utils/update-user-language";
import { useAuth } from "@/features/auth";
import { SocialLinks } from "@/components/ui/social-icons";

function Footer() {
 const t = useTranslations();
 const pathname = usePathname();
 const router = useRouter();
 const { authenticatedFetch } = useAuth();

 // Check if we're on the index/landing page for smart category linking
 const lang = pathname.split('/')[1] || 'bg';
 const isIndexPage = pathname === `/${lang}` || pathname === `/${lang}/`;
 const categoriesHref = isIndexPage ? "/#categories" : "/categories";

 const quickLinks = [
  { name: t('footer.quickLinks.howItWorks'), href: "/#how-it-works" },
  { name: t('footer.quickLinks.categories'), href: categoriesHref },
  { name: t('footer.quickLinks.forProfessionals'), href: "/for-professionals" },
  { name: t('footer.quickLinks.forCustomers'), href: "/for-customers" },
  { name: t('footer.quickLinks.browseTasks'), href: "/browse-tasks" },
  { name: t('footer.quickLinks.createTask'), href: "/create-task" },
  { name: t('footer.quickLinks.about'), href: "/about" },
  { name: t('footer.quickLinks.faq'), href: "/faq" },
  { name: t('footer.quickLinks.testimonials'), href: "/testimonials" },
  { name: t('footer.quickLinks.blog'), href: "/blog" },
 ];

 const legalLinks = [
  { name: t('footer.legal.terms'), href: "/terms" },
  { name: t('footer.legal.privacy'), href: "/privacy" },
 ];

 return (
  <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
   {/* Background Elements */}
   <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
   <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
   <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-3xl"></div>
   
   <div className="relative">
    {/* Main Footer Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
     {/* Company Info - Full Width on Mobile */}
     <div className="mb-12 col-span-full">
      <div className="flex items-center gap-3 mb-4">
       <Image
        src="/images/logo/trudify-logo-64.svg"
        alt="Trudify"
        width={48}
        height={48}
        className="w-12 h-12 sm:w-16 sm:h-16"
       />
       <span className="text-xl sm:text-2xl font-bold text-white">Trudify</span>
      </div>
      <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-4">
       {t('footer.company.description')}
      </p>

      {/* Trust Indicators */}
      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
       <div className="flex items-center gap-2 bg-slate-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
        <span className="text-slate-300">SSL Secured</span>
       </div>
       <div className="flex items-center gap-2 bg-slate-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
        <span className="text-slate-300">4.9/5 Rating</span>
       </div>
       <div className="flex items-center gap-2 bg-slate-800/50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full">
        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        <span className="text-slate-300">Verified Platform</span>
       </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-3 text-slate-300 mb-6">
       <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
        <Mail className="h-5 w-5 text-white" />
       </div>
       <div>
        <p className="text-xs sm:text-sm text-slate-400">{t('footer.contact.subtitle')}</p>
        <a
         href="mailto:support@trudify.com"
         className="text-sm sm:text-base text-slate-200 hover:text-blue-400 transition-colors font-medium"
        >
         support@trudify.com
        </a>
       </div>
      </div>

      {/* Social Links */}
      <div>
       <p className="text-sm text-slate-400 mb-3">{t('footer.social.followUs')}</p>
       <SocialLinks variant="footer" iconSize={18} />
      </div>
     </div>

     {/* Two Column Layout for Links */}
     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
      {/* Quick Links */}
      <div>
       <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white">{t('footer.quickLinks.title')}</h3>
       <ul className="space-y-2 sm:space-y-3">
        {quickLinks.map((link) => (
         <li key={link.name}>
          <LocaleLink
           href={link.href}
           className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors group flex items-center gap-2"
          >
           <span className="group-hover:translate-x-1 transition-transform">
            {link.name}
           </span>
          </LocaleLink>
         </li>
        ))}
       </ul>
      </div>

      {/* Legal */}
      <div>
       <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-white">{t('footer.legal.title')}</h3>
       <ul className="space-y-2 sm:space-y-3">
        {legalLinks.map((link) => (
         <li key={link.name}>
          <LocaleLink
           href={link.href}
           className="text-xs sm:text-sm text-slate-400 hover:text-blue-400 transition-colors group flex items-center gap-2"
          >
           <span className="group-hover:translate-x-1 transition-transform">
            {link.name}
           </span>
          </LocaleLink>
         </li>
        ))}
       </ul>
      </div>

      {/* Language Selector */}
      <div className="col-span-2 md:col-span-1">
       <h3 className="text-base sm:text-lg font-bold mb-4 text-white">{t('footer.language.label')}</h3>
       <div className="flex items-center gap-3">
        {Object.values(LANGUAGE_CONFIG).map((language) => {
         const isActive = extractLocaleFromPathname(pathname) === language.code;

         const handleLanguageChange = async () => {
          if (isActive) return;

          try {
           // Save user preference for future visits (cookie + localStorage)
           saveUserLocalePreference(language.code);

           // Update authenticated user's profile language preference (silently fails if not logged in)
           await updateUserLanguagePreference(language.code, authenticatedFetch);

           // Navigate to new locale URL (next-intl handles locale via URL)
           const newPath = replaceLocaleInPathname(pathname, language.code);
           router.push(newPath);
          } catch (error) {
           console.error('Failed to change language:', error);
          }
         };

         return (
          <button
           key={language.code}
           onClick={handleLanguageChange}
           className={`
            p-1.5 transition-all duration-200 rounded-md
            ${isActive
             ? 'scale-110 opacity-100 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900'
             : 'opacity-50 hover:opacity-100 hover:scale-105'
            }
           `}
           aria-label={`Switch to ${language.name}`}
           title={language.name}
          >
           <FlagIcon locale={language.code} size={28} />
          </button>
         );
        })}
       </div>
      </div>
     </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-slate-700/50">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
       <Heart className="h-4 w-4 text-red-400" />
       <span>© 2025 Trudify. All rights reserved.</span>
      </div>
     </div>
    </div>
   </div>
  </footer>
 );
}

Footer.displayName = 'Footer';

export default Footer;
