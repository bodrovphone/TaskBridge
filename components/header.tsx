'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from 'react-i18next'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Handshake, Menu, Plus, User } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const isAuthenticated = !!session
  const user = session?.user

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
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/create-task">
                  <Button className="bg-primary-500 hover:bg-primary-600">
                    <Plus size={16} className="mr-2" />
                    {t('nav.createTask')}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback>
                          {user?.name?.[0] || user?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Button variant="ghost" onClick={() => signIn('replit')}>
                  {t('login')}
                </Button>
                <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => signIn('replit')}>
                  {t('signup')}
                </Button>
              </>
            )}
            {isAuthenticated && <LanguageSwitcher />}
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
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      {t('nav.profile')}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      signOut()
                    }}
                  >
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      signIn('replit')
                    }}
                  >
                    {t('login')}
                  </Button>
                  <Button 
                    className="bg-primary-500 hover:bg-primary-600 w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      signIn('replit')
                    }}
                  >
                    {t('signup')}
                  </Button>
                </>
              )}
              
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