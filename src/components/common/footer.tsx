'use client'

import { Mail, Shield, Star, Award, Heart, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { LocaleLink } from "./locale-link";
import { extractLocaleFromPathname } from "@/lib/utils/url-locale";

function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentLocale = extractLocaleFromPathname(pathname) ?? 'en';
  
  const quickLinks = [
    { name: t('footer.quickLinks.howItWorks'), href: "/#how-it-works" },
    { name: t('footer.quickLinks.categories'), href: "/#categories" },
    { name: t('footer.quickLinks.forProfessionals'), href: "/#for-professionals" },
    { name: t('footer.quickLinks.security'), href: "/security" },
    { name: t('footer.quickLinks.help'), href: "/help" },
  ];

  const legalLinks = [
    { name: t('footer.legal.terms'), href: "/terms" },
    { name: t('footer.legal.privacy'), href: "/privacy" },
    { name: t('footer.legal.gdpr'), href: "/gdpr" },
    { name: t('footer.legal.cookies'), href: "/cookies" },
    { name: t('footer.legal.complaints'), href: "/complaints" },
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg relative">
                  <Handshake className="text-white" size={24} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-sm"></div>
                </div>
                <span className="text-2xl font-bold text-white">Trudify</span>
              </div>
              <p className="text-slate-300 text-base leading-relaxed max-w-md">
                {t('footer.company.description')}
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-slate-300">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-full">
                  <Award className="h-4 w-4 text-green-400" />
                  <span className="text-slate-300">Verified Platform</span>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex items-center gap-3 text-slate-300">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Get in touch</p>
                  <a 
                    href="mailto:support@obodsoft.com" 
                    className="text-slate-200 hover:text-blue-400 transition-colors font-medium"
                  >
                    support@obodsoft.com
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">{t('footer.quickLinks.title')}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <LocaleLink 
                      href={link.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors group flex items-center gap-2"
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
              <h3 className="text-lg font-bold mb-6 text-white">{t('footer.legal.title')}</h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <LocaleLink 
                      href={link.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors group flex items-center gap-2"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.name}
                      </span>
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          
          {/* Language & Stats */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">{t('footer.language.label')}</h3>
              <LanguageSwitcher />
            </div>
            
            {/* Quick Stats */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Platform Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-blue-400 font-bold">50K+</div>
                  <div className="text-slate-400 text-xs">{t('landing.stats.completedTasks')}</div>
                </div>
                <div className="text-center">
                  <div className="text-indigo-400 font-bold">15K+</div>
                  <div className="text-slate-400 text-xs">{t('landing.categories.activeSpecialists')}</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold">4.9</div>
                  <div className="text-slate-400 text-xs">{t('landing.stats.averageRating')}</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">99.9%</div>
                  <div className="text-slate-400 text-xs">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Heart className="h-4 w-4 text-red-400" />
              <span>© 2025 Obod Soft LTD. All rights reserved.</span>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-slate-800/50 hover:bg-blue-600/20 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-slate-800/50 hover:bg-blue-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-slate-800/50 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-slate-800/50 hover:bg-blue-700/20 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <div className="w-4 h-4 bg-blue-700 rounded"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

Footer.displayName = 'Footer';

export default Footer;
