'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from 'react-i18next'
import { Handshake, Menu, Plus } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  // Authentication is currently disabled - always show non-authenticated state

  const navigation = [
    { name: t('nav.browseTasks'), href: "/browse-tasks" },
    { name: t('nav.howItWorks'), href: "/#how-it-works" },
    { name: t('nav.categories'), href: "/#categories" },
    { name: t('nav.forProfessionals'), href: "/#for-professionals" },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Handshake className="text-white" size={16} />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Trudify</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-all relative border-b-2 border-transparent hover:border-primary-500"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/create-task">
              <Button className="bg-primary-500 hover:bg-primary-700 text-white hover:text-black transition-all border-2 border-primary-500 hover:border-primary-500">
                <Plus size={16} className="mr-2" />
                {t('nav.createTask')}
              </Button>
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-gray-900 px-3 py-2 text-base font-medium transition-all border-l-4 border-transparent hover:border-l-primary-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <Link href="/create-task" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="bg-primary-500 hover:bg-primary-700 text-white hover:text-black transition-all border-2 border-primary-500 hover:border-primary-500 w-full">
                  <Plus size={16} className="mr-2" />
                  {t('nav.createTask')}
                </Button>
              </Link>
              
              {/* Language Switcher for Mobile */}
              <div className="pt-4 border-t border-gray-200">
                <div className="px-3">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}