import { Link } from "wouter";
import { Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  
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
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Handshake className="text-white" size={16} />
              </div>
              <span className="ml-2 text-xl font-bold">Trudify</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.company.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal.title')}</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400 mb-3">{t('footer.contact.subtitle')}</p>
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-gray-400"></i>
                <a href="mailto:support@trudify.com" className="text-gray-400 hover:text-white transition-colors">
                  support@trudify.com
                </a>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">{t('footer.language.label')}</label>
              <Select defaultValue="bg">
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg">Български</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
