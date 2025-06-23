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

export default function Footer() {
  const quickLinks = [
    { name: "Как работи", href: "/#how-it-works" },
    { name: "Категории услуги", href: "/#categories" },
    { name: "За специалисти", href: "/#for-professionals" },
    { name: "Сигурност", href: "/security" },
    { name: "Помощ", href: "/help" },
  ];

  const legalLinks = [
    { name: "Условия за ползване", href: "/terms" },
    { name: "Политика за поверителност", href: "/privacy" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Cookies", href: "/cookies" },
    { name: "Жалби", href: "/complaints" },
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
              <span className="ml-2 text-xl font-bold">TaskBridge</span>
              <span className="ml-1 text-sm font-medium text-primary-400">Balkans</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Свързваме хора със специалисти в цяла Балканска Европа за всякакви задачи и услуги.
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
            <h3 className="text-lg font-semibold mb-4">Бързи връзки</h3>
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
            <h3 className="text-lg font-semibold mb-4">Правна информация</h3>
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
            <h3 className="text-lg font-semibold mb-4">Контакти</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-gray-400"></i>
                <span className="text-gray-400">support@taskbridge.bg</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-gray-400"></i>
                <span className="text-gray-400">+359 2 XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-map-marker-alt text-gray-400"></i>
                <span className="text-gray-400">София, България</span>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Език</label>
              <Select defaultValue="bg">
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg">Български</SelectItem>
                  <SelectItem value="ro">Română</SelectItem>
                  <SelectItem value="sr">Српски</SelectItem>
                  <SelectItem value="mk">Македонски</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 TaskBridge Balkans. Всички права запазени.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Покрива: България • Румъния • Сърбия • С. Macedonia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
